const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Server: SocketIOServer } = require("socket.io");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json({ limit: "10mb" }));

const PORT = 5000;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

const ALLOWED_MOODS = [
  "cinematic",
  "chaotic",
  "wholesome",
  "dark",
  "reaction",
  "funny",
];

const ALLOWED_TEMPLATES = [
  "classic",
  "headline",
  "banner",
  "demotivator",
  "comic",
  "cinematic",
];

const ALLOWED_FONTS = ["bowlby", "impact", "anton", "comic", "cinematic"];

const SYSTEM_PROMPT =
  "You are a meme art director. You generate complete meme recipes — each one with a template, captions, and visual style suggestions matched to the image (if provided) and the requested humor mode. " +
  "You also classify the overall mood as one of: cinematic, chaotic, wholesome, dark, reaction, funny.";

const MODE_INSTRUCTIONS = {
  Savage:
    "Style: SAVAGE. Be brutal, roast-style, biting. Cutting honesty with no mercy.",
  "Gen-Z":
    "Style: GEN-Z. Use Gen-Z internet slang naturally (bestie, lowkey, no cap, real, slay, fr).",
  "Dark Humor":
    "Style: DARK HUMOR. Lean morbid, existential, gallows humor. Clever and dry.",
  Nerd:
    "Style: NERD. Reference programming, tech, sci-fi, D&D, math. Inside jokes for developers and geeks.",
  Cinematic:
    "Style: CINEMATIC. Dramatic, epic, movie-trailer voice. Big stakes, slow-motion energy.",
};

function getModeInstruction(mode) {
  return MODE_INSTRUCTIONS[mode] || "";
}

function buildUserPrompt(count, withImage, mode) {
  const intro = withImage
    ? `Look at the image and generate ${count} meme recipes that reference what is shown. Pick templates, fonts, and colors that match the image's vibe.`
    : `Generate ${count} meme recipes.`;

  const styleLine = getModeInstruction(mode);

  return (
    `${intro}\n\n` +
    (styleLine ? `${styleLine}\n\n` : "") +
    `Available templates (pick the best fit for each recipe — vary across suggestions):\n` +
    `  - classic:      top + bottom Impact captions\n` +
    `  - headline:     single bold line at the top\n` +
    `  - banner:       single bottom line on a black banner\n` +
    `  - demotivator:  movie-poster black frame with single bottom caption\n` +
    `  - comic:        Comic Sans, wholesome vibe\n` +
    `  - cinematic:    serif text with letterbox effect\n\n` +
    `Available fonts: bowlby, impact, anton, comic, cinematic\n` +
    `Colors: any 6-digit hex code (e.g. "#ffffff").\n\n` +
    `Also classify the overall vibe as one of: cinematic, chaotic, wholesome, dark, reaction, funny.\n\n` +
    `Respond with ONLY a JSON object. No markdown, no commentary.\n\n` +
    `Format:\n` +
    `{\n` +
    `  "mood": "...",\n` +
    `  "suggestions": [\n` +
    `    {\n` +
    `      "template": "...",\n` +
    `      "captions": { "top": "...", "bottom": "..." },\n` +
    `      "font": "...",\n` +
    `      "color": "#......",\n` +
    `      "outline": true,\n` +
    `      "glow": false,\n` +
    `      "shadow": true,\n` +
    `      "bold": false,\n` +
    `      "positions": { "top": "5%", "bottom": "5%" }\n` +
    `    }\n` +
    `  ]\n` +
    `}\n\n` +
    `"positions" is optional — only include it if you want to override the template defaults. ` +
    `Keep each caption line under 60 characters.`
  );
}

// -------------------- Validation helpers --------------------

function isValidHex(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isPercent(value) {
  return typeof value === "string" && /^\d+(\.\d+)?%$/.test(value);
}

function normalizeMood(value) {
  if (typeof value !== "string") return "reaction";
  const lower = value.toLowerCase().trim();
  return ALLOWED_MOODS.includes(lower) ? lower : "reaction";
}

function sanitizeCaptions(value) {
  if (!value || typeof value !== "object") return null;
  const top = typeof value.top === "string" ? value.top.trim() : "";
  const bottom = typeof value.bottom === "string" ? value.bottom.trim() : "";
  if (!top && !bottom) return null;
  return { top, bottom };
}

function sanitizePositions(value) {
  if (!value || typeof value !== "object") return null;
  const result = {};
  if (isPercent(value.top)) result.top = { top: value.top };
  if (isPercent(value.bottom)) result.bottom = { bottom: value.bottom };
  return Object.keys(result).length > 0 ? result : null;
}

// Turns one raw suggestion from the LLM into a clean, validated recipe.
// Returns null if the suggestion can't be salvaged.
function normalizeSuggestion(raw) {
  if (!raw || typeof raw !== "object") return null;

  const captions = sanitizeCaptions(raw.captions);
  if (!captions) return null;

  const templateValue =
    typeof raw.template === "string" ? raw.template.toLowerCase().trim() : "";
  const template = ALLOWED_TEMPLATES.includes(templateValue)
    ? templateValue
    : "classic";

  const fontValue =
    typeof raw.font === "string" ? raw.font.toLowerCase().trim() : "";
  const font = ALLOWED_FONTS.includes(fontValue) ? fontValue : null;

  const color = isValidHex(raw.color) ? raw.color : null;

  const styles = {
    outline: typeof raw.outline === "boolean" ? raw.outline : null,
    glow: typeof raw.glow === "boolean" ? raw.glow : null,
    shadow: typeof raw.shadow === "boolean" ? raw.shadow : null,
    bold: typeof raw.bold === "boolean" ? raw.bold : null,
  };

  const positions = sanitizePositions(raw.positions);

  return { template, captions, font, color, styles, positions };
}

function parseAIResponse(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  let parsed;
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      parsed = JSON.parse(objMatch[0]);
    } catch (e) {
      parsed = null;
    }
  }

  if (!parsed) {
    throw new Error("AI response did not contain a JSON object.");
  }

  const mood = normalizeMood(parsed.mood);

  // Prefer the new "suggestions" array. Fall back to "captions" if an older
  // response shape sneaks through (defensive — keep the route working).
  const rawList = Array.isArray(parsed.suggestions)
    ? parsed.suggestions
    : Array.isArray(parsed.captions)
    ? parsed.captions.map((c) => ({
        template: "classic",
        captions: c && typeof c === "object" ? c : null,
      }))
    : [];

  const suggestions = rawList.map(normalizeSuggestion).filter(Boolean);

  if (suggestions.length === 0) {
    throw new Error("AI response did not include any valid meme recipes.");
  }

  return { mood, suggestions };
}

function buildUserMessage(count, image, mode) {
  const text = buildUserPrompt(count, Boolean(image), mode);
  if (image) {
    return {
      role: "user",
      content: [
        { type: "text", text },
        { type: "image_url", image_url: { url: image } },
      ],
    };
  }
  return { role: "user", content: text };
}

async function generateRecipesFromAI(count, image, mode) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in .env file.");
  }

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        buildUserMessage(count, image, mode),
      ],
      temperature: 0.9,
      max_tokens: 800,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://memhub-git-main-akhilramagiri3-gmailcoms-projects.vercel.app",
        "X-Title": "AI Meme Generator",
      },
      timeout: 45000,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("AI response was empty.");
  }
  return parseAIResponse(text);
}

// =====================================================================
// IN-MEMORY MEME + REACTIONS STORE (hackathon mode — no database yet)
// =====================================================================

// Map<memeId, { id, data, reactions }>
const memes = new Map();

const REACTION_EMOJIS = ["😂", "🔥", "💀", "😮", "🤯"];

function createEmptyReactions() {
  const reactions = {};
  for (const emoji of REACTION_EMOJIS) {
    reactions[emoji] = 0;
  }
  return reactions;
}

// Get the meme entry if it exists, otherwise create a blank one with
// zeroed reactions. Used both by HTTP routes and socket handlers so they
// always operate on the same record.
function getOrCreateMeme(id) {
  let meme = memes.get(id);
  if (!meme) {
    meme = { id, data: null, reactions: createEmptyReactions() };
    memes.set(id, meme);
  }
  return meme;
}

app.get("/", (req, res) => {
  res.json({ message: "Backend running 🚀", memes: memes.size });
});

// Save meme data (called when the creator clicks Share Link).
app.post("/memes", (req, res) => {
  const { id, ...data } = req.body || {};
  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Missing meme id" });
  }

  const meme = getOrCreateMeme(id);
  meme.data = data;

  console.log(`Saved meme ${id}`);
  res.json({ success: true, id });
});

// Load meme data + current reactions (called by MemeViewer on mount).
app.get("/memes/:id", (req, res) => {
  const meme = memes.get(req.params.id);
  if (!meme || !meme.data) {
    return res
      .status(404)
      .json({ success: false, message: "Meme not found" });
  }
  res.json({
    success: true,
    data: meme.data,
    reactions: meme.reactions,
  });
});

app.post("/generate-captions", async (req, res) => {
  try {
    const count = Number(req.body?.count) || 4;
    const image = typeof req.body?.image === "string" ? req.body.image : null;
    const mode = typeof req.body?.mode === "string" ? req.body.mode : null;

    console.log(
      `Generating ${count} recipes (${image ? "image-aware" : "text-only"}, style: ${mode || "default"})`
    );

    const { suggestions, mood } = await generateRecipesFromAI(
      count,
      image,
      mode
    );
    console.log(`Returned ${suggestions.length} recipes, mood: ${mood}`);

    res.json({
      success: true,
      mood,
      suggestions,
    });
  } catch (error) {
    console.error("generate-captions failed:", error.message);
    const apiError = error.response?.data?.error?.message;
    res.status(500).json({
      success: false,
      message: apiError || error.message || "Something went wrong",
    });
  }
});

// =====================================================================
// HTTP + Socket.IO server
// =====================================================================

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Count how many sockets are currently in a meme's room and broadcast it.
function broadcastViewers(memeId) {
  const room = io.sockets.adapter.rooms.get(memeId);
  const count = room ? room.size : 0;
  io.to(memeId).emit("viewers", { memeId, count });
}

io.on("connection", (socket) => {
  // Client joins a meme room so it can receive live reaction updates.
  socket.on("join", (memeId) => {
    if (typeof memeId !== "string" || !memeId) return;

    // If this socket was already watching a different meme, leave that
    // room first and update its viewer count.
    const previousMemeId = socket.data.memeId;
    if (previousMemeId && previousMemeId !== memeId) {
      socket.leave(previousMemeId);
      broadcastViewers(previousMemeId);
    }

    socket.data.memeId = memeId;
    const meme = getOrCreateMeme(memeId);
    socket.join(memeId);

    // Send the current counts to the newcomer immediately.
    socket.emit("reactions", {
      memeId,
      reactions: meme.reactions,
    });

    // Update viewer count for everyone in the room (including newcomer).
    broadcastViewers(memeId);
  });

  // Client clicked a reaction emoji.
  socket.on("react", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { memeId, emoji } = payload;
    if (typeof memeId !== "string" || !memeId) return;
    if (!REACTION_EMOJIS.includes(emoji)) return;

    const meme = getOrCreateMeme(memeId);
    meme.reactions[emoji] = (meme.reactions[emoji] || 0) + 1;

    // Broadcast the new counts to every viewer in that meme's room.
    io.to(memeId).emit("reactions", {
      memeId,
      reactions: meme.reactions,
    });
  });

  // When a socket disconnects, the room size drops by 1 — let everyone
  // remaining in the room know.
  socket.on("disconnect", () => {
    const memeId = socket.data.memeId;
    if (memeId) broadcastViewers(memeId);
  });
});

server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
  console.log(
    `OpenRouter API key: ${process.env.OPENROUTER_API_KEY ? "loaded ✓" : "MISSING ✗ (check backend/.env)"}`
  );
  console.log(`OpenRouter model:   ${MODEL}`);
});
