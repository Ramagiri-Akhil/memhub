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
    origin: [
      "http://localhost:5173",
      "https://memhub-git-main-akhilramagiri3-gmailcoms-projects.vercel.app/",
    ],
    methods: ["GET", "POST"],
  })
)
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
  Telugu: `
STRICT RULE:
- Write ONLY in Romanized English text.
- NEVER use Telugu script.
- NEVER sound like AI.
- Sound like a Telugu meme admin posting at 2 AM.

FIRST:
Analyze the image deeply:
- What emotion is happening?
- Is someone angry, embarrassed, shocked, lazy, overconfident, emotional, broke, awkward?
- What Indian/Telugu real-life situation does this resemble?

THEN:
Convert that situation into Telugu meme culture.

Style inspiration:
- Brahmanandam reaction memes
- Sunil confusion comedy
- Ali overacting
- Balayya overconfidence energy
- Pawan Kalyan fan edits
- Pushpa attitude
- RRR mass hype
- Middle-class Telugu family drama
- Engineering college suffering
- Hyderabad traffic rage
- Placements & backlogs
- Amma shouting after seeing marks

Use slang naturally:
"enti ra babu"
"rey pichi"
"ayyoo"
"mass poya"
"nakko"
"cheppanu kada"
"em chestunnav ra"
"baigan"

IMPORTANT:
- Caption should feel like a REAL Telugu meme page.
- Use short punchy lines.
- Avoid setup-punchline AI jokes.
- Make captions emotionally relatable.
- Slight exaggeration is GOOD.
- Use reaction-style humor.
- Make it viral-caption style.

BAD:
"when your friend is late"

GOOD:
"attendance shortage unna confidence maatram Balayya level"

GOOD:
"amma: phone ivvu
me: naa jeevitham kuda teesko amma"
`,

  Hyderabad: `
STRICT RULE:
- ONLY Romanized English.
- Sound like Hyderabad Instagram meme pages.
- Use Hyderabadi rhythm naturally.

FIRST:
Understand the image emotion and situation.

THEN:
Convert it into Hyderabad local humor.

Style inspiration:
- Old City vibes
- Hostel boys
- Cafe gossip
- Biryani obsession
- Salary finished in 2 days
- Friends making fake plans
- Hyderabad traffic
- Auto anna fights
- Shah Ghouse supremacy
- Late-night chai scenes

Use slang naturally:
"kya scene hai miya"
"nakko yaaro"
"hau"
"light le"
"ek dum"
"baigan"
"kaiku tension lete"

IMPORTANT:
- Sound LOCAL.
- Slight roasting is GOOD.
- Feels like Hyderabad reels comment section.

BAD:
"bro forgot his wallet"

GOOD:
"biryani order karne tak nawab
bill aate hi gareeb"
`,

  Hindi: `
STRICT RULE:
- ONLY Romanized Hindi/English.
- NEVER use Devanagari.
- Sound like Indian meme pages.

FIRST:
Analyze emotional context in image.

THEN:
Map it into Indian desi situations.

Style inspiration:
- CarryMinati roasting
- BB ki Vines realism
- Ashish Chanchlani exaggeration
- Samay Raina sarcasm
- Indian parents
- Sharma ji comparison
- UPSC depression
- Engineering life
- Relationship drama
- Middle-class pain

IMPORTANT:
- Feel human.
- Feel chaotic.
- Sound like reels comments.

BAD:
"when exams are near"

GOOD:
"padhai itni ki laptop bhi bol diya
bhai bas kar"
`,

  English: `
STRICT RULE:
- Pure English only.
- Sound like Instagram meme pages.
- No robotic AI humor.

FIRST:
Analyze image emotion deeply.

THEN:
Create meme captions based on:
- awkwardness
- confidence
- emotional damage
- overthinking
- delusion
- social anxiety
- friendship chaos

Style:
- internet humor
- reaction memes
- relatable humor
- Twitter humor
- subtle sarcasm

IMPORTANT:
- Make it sound human.
- Make it short.
- Avoid generic captions.
`,

  Savage: `
STYLE:
Savage roasting.
Emotionally damaging.
Cocky confidence.
Instagram roast-page energy.
`,

  "Gen-Z": `
STYLE:
TikTok + reels humor.
Chaotic internet energy.
Zoomer slang.
Terminally online behavior.
`,

  "Dark Humor": `
STYLE:
Existential humor.
Pain but funny.
Dry sarcasm.
Clever > offensive.
`,

  Nerd: `
STYLE:
Programmer suffering.
Deadline memes.
Debugging trauma.
Stack Overflow dependency.
`,

  Cinematic: `
STYLE:
Epic trailer narration.
Overdramatic emotions.
Hero-entry energy.
High stakes for stupid situations.
`,
}

function buildUserPrompt(count, withImage) {
  const intro = withImage
    ? `Look at the image and generate ${count} meme recipes that reference what is shown. Pick templates, fonts, and colors that match the image's vibe.`
    : `Generate ${count} meme recipes.`;

  return (
    `${intro}\n\n` +
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

async function uploadImageToImgbb(base64Image) {
  const base64Data = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

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

async function generateRecipesFromAI(count, image, language, style) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const languageInstruction = MODE_INSTRUCTIONS[language] || "";
  const styleInstruction    = MODE_INSTRUCTIONS[style]    || "";

  let personContext = "";

  // Step 1: Identify person in image first
  if (image) {
    const imageUrl = await uploadImageToImgbb(image);
    console.log("Image uploaded to imgbb:", imageUrl);

    const detection = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
text: `You are a meme-culture expert who knows Indian cinema, politics, sports, and internet culture deeply.

Look at this image and identify EVERYTHING:

PEOPLE: Try hard to recognize any person. Think about:
- Indian politicians (Modi, Rahul Gandhi, Kejriwal, Yogi, Smriti Irani)
- Telugu actors (Balayya, Pawan Kalyan, Mahesh Babu, Allu Arjun, Jr NTR, Chiranjeevi, Brahmanandam, Sunil, Ali, Venkatesh)
- Bollywood (SRK, Salman, Aamir, Ranveer, Akshay, Kapil Sharma)
- YouTubers (Dhruv Rathee, CarryMinati, BB Ki Vines, Triggered Insaan, Samay Raina)
- Cricketers (Virat, Rohit, Dhoni, Bumrah)
- Elon Musk, Trump, or any global figure

EMOTION: What is the exact emotion? Not just "happy" — is it:
"overconfident before disaster", "fake smile hiding pain", "caught doing something wrong",
"trying too hard to look cool", "explaining something nobody asked", "judging silently"

SITUATION: What Indian real-life situation does this remind you of?
"engineer sending first PR", "student when teacher asks who didn't do homework",
"guy at wedding pretending to know everyone", "when amma finds the report card"

Return ONLY this JSON (no markdown, no extra text):
{
  "detected": true,
  "name": "exact name or Unknown",
  "known": true,
  "profession": "actor/politician/youtuber/cricketer/etc",
  "persona": "2-3 line description of their public image and what they're known/memed for",
  "iconic_moments": ["specific thing they said or did that became a meme"],
  "meme_angles": ["specific roast angle 1", "specific roast angle 2", "specific roast angle 3"],
  "expression": "very specific expression description",
  "situation": "specific Indian real-life situation this resembles",
  "vibe": "one word energy"
}`
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.3, // low temp for accurate identification
    });

    try {
      const raw = detection.choices[0].message.content;
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned.match(/\{[\s\S]*\}/)[0]);

if (parsed.detected && parsed.known && parsed.name !== "Unknown") {
  personContext = `
=== PERSON IDENTIFIED: ${parsed.name} (${parsed.profession}) ===

Who they are: ${parsed.persona}

Their iconic meme moments: ${parsed.iconic_moments?.join(" | ")}

Meme angles to USE (pick the most relevant):
${parsed.meme_angles?.map((a, i) => `${i + 1}. ${a}`).join("\n")}

Their expression right now: ${parsed.expression}
Situation energy: ${parsed.situation}

YOUR JOB:
- At least 3 out of 4 captions MUST directly reference ${parsed.name} by name or their iconic moments.
- Do NOT make generic captions that could apply to anyone.
- If it's Balayya — use his overconfidence, "Power Star" energy, mass dialogues.
- If it's Rahul Gandhi — zero check kare saar, Bharat Jodo, pappu energy.
- If it's Modi — "Modi h toh mumkin h", 400 paar, Mann Ki Baat.
- If it's Dhruv Rathee — German shepherd, "ghar ka khatha tha", propaganda expose.
- If it's Brahmanandam — reaction face, comedy timing, "aa maaaaaaa".
- If it's CarryMinati — roast mode, "tujhe kya" energy.
- Make captions that ONLY make sense for ${parsed.name}. Not interchangeable.`;

  console.log("Person detected:", parsed.name);

} else if (parsed.detected) {
  personContext = `
=== UNKNOWN PERSON ===
Expression: ${parsed.expression}
Situation this resembles: ${parsed.situation}
Vibe: ${parsed.vibe}

YOUR JOB:
- Build captions around this EXACT expression and situation.
- Make it feel like the caption was written FOR this specific image.
- NOT generic. Someone looking at this image should go "haan bhai exactly yahi ho raha hai".`;
}
    } catch (e) {
      console.log("Person detection parse failed, skipping:", e.message);
    }

    // Step 2: Generate captions with person context
   const textPrompt =
  buildUserPrompt(count, true) +
  (languageInstruction ? `\n\n${languageInstruction}` : "") +
  (styleInstruction    ? `\n\n${styleInstruction}`    : "") +
  (personContext       ? `\n\n${personContext}`        : "") +
  `\n\n
=== FINAL RULES — READ BEFORE GENERATING ===
1. NO generic captions. "When you forget your homework" type captions = REJECTED.
2. Every caption must feel written for THIS specific image.
3. If a person was identified — NAME them or reference their iconic moment in EVERY caption.
4. Sound like a real meme admin, NOT ChatGPT.
5. Short. Punchy. Emotionally damaging or deeply relatable.
6. The person seeing this should either laugh out loud or tag someone immediately.
7. STRICTLY follow the language rule. Wrong language = FAILURE.
=== NOW GENERATE. BE SPECIFIC. BE FUNNY. ===`;

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: textPrompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 1,
    });

    return parseAIResponse(completion.choices[0].message.content);
  }

  // No image — text only
  const textPrompt =
    buildUserPrompt(count, false) +
    (languageInstruction ? `\n\n${languageInstruction}` : "") +
    (styleInstruction    ? `\n\n${styleInstruction}`    : "") +
    `\n\nCRITICAL: Every caption must strictly follow the language rule above. Mixing languages = failure.` +
    `\n\nMake captions FUNNY like actual meme pages — comedian timing, unexpected punchlines.`;

  const completion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: textPrompt },
    ],
    temperature: 1,
  });

  return parseAIResponse(completion.choices[0].message.content);
}
// =====================================================================
// IN-MEMORY MEME + REACTIONS STORE (hackathon mode — no database yet)
// =====================================================================

const memes = new Map();

const REACTION_EMOJIS = ["😂", "🔥", "💀", "😮", "🤯"];

function createEmptyReactions() {
  const reactions = {};
  for (const emoji of REACTION_EMOJIS) {
    reactions[emoji] = 0;
  }
  return reactions;
}

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

app.post("/memes", (req, res) => {
  const { id, ...data } = req.body || {};
  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, message: "Missing meme id" });
  }
  const meme = getOrCreateMeme(id);
  meme.data = data;
  console.log(`Saved meme ${id}`);
  res.json({ success: true, id });
});

app.get("/memes/:id", (req, res) => {
  const meme = memes.get(req.params.id);
  if (!meme || !meme.data) {
    return res.status(404).json({ success: false, message: "Meme not found" });
  }
  res.json({ success: true, data: meme.data, reactions: meme.reactions });
});

app.post("/generate-captions", async (req, res) => {
  try {
    const count    = Number(req.body?.count) || 4;
    const image    = typeof req.body?.image    === "string" ? req.body.image    : null;
    const language = typeof req.body?.language === "string" ? req.body.language : null;
    const style    = typeof req.body?.style    === "string" ? req.body.style    : null;

    console.log(
      `Generating ${count} recipes (${image ? "image-aware" : "text-only"}, language: ${language || "default"}, style: ${style || "default"})`
    );

    const { suggestions, mood } = await generateRecipesFromAI(count, image, language, style);
    console.log(`Returned ${suggestions.length} recipes, mood: ${mood}`);

    res.json({ success: true, mood, suggestions });
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

function broadcastViewers(memeId) {
  const room = io.sockets.adapter.rooms.get(memeId);
  const count = room ? room.size : 0;
  io.to(memeId).emit("viewers", { memeId, count });
}

io.on("connection", (socket) => {
  socket.on("join", (memeId) => {
    if (typeof memeId !== "string" || !memeId) return;

    const previousMemeId = socket.data.memeId;
    if (previousMemeId && previousMemeId !== memeId) {
      socket.leave(previousMemeId);
      broadcastViewers(previousMemeId);
    }

    socket.data.memeId = memeId;
    const meme = getOrCreateMeme(memeId);
    socket.join(memeId);

    socket.emit("reactions", { memeId, reactions: meme.reactions });
    broadcastViewers(memeId);
  });

  socket.on("react", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { memeId, emoji } = payload;
    if (typeof memeId !== "string" || !memeId) return;
    if (!REACTION_EMOJIS.includes(emoji)) return;

    const meme = getOrCreateMeme(memeId);
    meme.reactions[emoji] = (meme.reactions[emoji] || 0) + 1;

    io.to(memeId).emit("reactions", { memeId, reactions: meme.reactions });
  });

  socket.on("disconnect", () => {
    const memeId = socket.data.memeId;
    if (memeId) broadcastViewers(memeId);
  });
});

server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});