const sharp = require("sharp");
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server: SocketIOServer } = require("socket.io");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json({ limit: "10mb" }));

const PORT = 5000;


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
  "You are an expert meme creator. " +
  "You understand Telugu memes, Hindi memes, Hyderabadi slang, Gen-Z humor, savage memes, dark humor, cinematic memes and Indian internet culture. " +
  "Analyze uploaded images carefully and generate highly funny meme captions matching the image context naturally.";

const MODE_INSTRUCTIONS = {
  Hyderabad:
  "Use Hyderabadi slang, biryani jokes, local Hyderabad meme style and funny expressions.",

Telugu:
  "Generate Telugu meme captions using Telugu meme culture, dialogues like 'entra idi', 'rey', 'ayyoo', 'mass'.",

Hindi:
  "Generate Hindi meme captions using Bollywood humor, Indian relatable jokes and desi sarcasm.",
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

async function uploadImageToImgbb(base64Image) {
  const base64Data = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

  // Convert to JPEG regardless of input format (avif, webp, png, etc.)
  const inputBuffer = Buffer.from(base64Data, "base64");
  const jpegBuffer = await sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  const jpegBase64 = jpegBuffer.toString("base64");

  const params = new URLSearchParams();
  params.append("key", process.env.IMGBB_API_KEY);
  params.append("image", jpegBase64);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: params,
  });

  const data = await response.json();
  if (!data.success) throw new Error("imgbb upload failed: " + JSON.stringify(data));
  return data.data.url;
}

async function generateRecipesFromAI(count, image, mode) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const textPrompt =
    buildUserPrompt(count, Boolean(image), mode) +
    `\n\nIMPORTANT — Indian meme culture rules:
- Reference real Indian situations: UPSC grind, engineering college, board exams,
  Indian parents, jugaad, "log kya kahenge", chai, arranged marriage, power cuts,
  cricket wins/losses, Bollywood dialogues, auto-rickshaw bargaining, hostel mess food.
- Use Hinglish naturally: "bhai", "yaar", "arre", "bas kar", "kya scene hai",
  "thoda adjust karo", "chill maar", "bindaas", "ekdum mast".
- Telugu/Hyderabadi flavour: "entra", "rey", "ayyoo", "babu", "mass", "pataas".
- Feel like real Indian meme pages: Sarcasm, Being Indian, Subtle Curry Traits.
- Avoid generic western meme formats. Make it hurt or heal like only desi memes can.`;

  let userContent;

  if (image) {
    const imageUrl = await uploadImageToImgbb(image);
    console.log("Image uploaded to imgbb:", imageUrl);
    userContent = [
      { type: "text", text: textPrompt },
      { type: "image_url", image_url: { url: imageUrl } },
    ];
  } else {
    userContent = textPrompt;
  }

  const completion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    temperature: 1,
  });

  const text = completion.choices[0].message.content;
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

});