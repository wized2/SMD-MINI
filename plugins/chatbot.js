require("dotenv").config();

const axios = require('axios');
const mongoose = require('mongoose');
const { cmd } = require('../command');
const config = require("../config");
const { getUserConfigFromMongoDB } = require("../lib/database");
// ================== MONGO (OPTIONAL) ==================

const MONGO_URI = process.env.DATABASE_URL;

let isMongoConnected = false;
let connecting = false;

async function connectMongo() {
  if (!MONGO_URI) return; // skip if not set
  if (isMongoConnected || connecting) return;
  connecting = true;

  try {
    await mongoose.connect(MONGO_URI);
    isMongoConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("Mongo error:", err?.message || err);
  } finally {
    connecting = false;
  }
}

// ================== TEMP MEMORY ==================

const chatMemory = new Map();

function saveMessage(chatId, message) {
  if (!chatMemory.has(chatId)) {
    chatMemory.set(chatId, []);
  }

  const data = chatMemory.get(chatId);
  data.push(message);

  // limit memory
  if (data.length > 20) {
    data.shift();
  }

  chatMemory.set(chatId, data);

  // auto delete after 30 sec
  setTimeout(() => {
    chatMemory.delete(chatId);
  }, 30000);
}

function getMessages(chatId) {
  return chatMemory.get(chatId) || [];
}

// ================== MAIN AI ==================

cmd({
  on: "body"
}, async (conn, m, store, { from, body, reply }) => {
  try {
    if (!body || m.key.fromMe) return;
    const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
    // ================= CONFIG =================
    const mode = botConfig.CHATBOT || "off";
    const prefix = botConfig.PREFIX || "." || "," || "*";
 const botname = botConfig.BOT_NAME || "SMD-MINI";
    const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";
    const isGroup = from.endsWith("@g.us");
    const isInbox = !isGroup;

    if (mode === "off") return;
    if (mode === "inbox" && isGroup) return;
    if (mode === "groups" && isInbox) return;

    if (body.startsWith(prefix)) return;

    // ================= CHAT ID =================

    const botNumber = conn.user.id.split(":")[0];
    const senderId = m.key.participant || m.key.remoteJid;

    const chatId = isGroup
      ? `${botNumber}_${from}_${senderId}`
      : `${botNumber}_${senderId}`;

    // ================= SAVE USER =================

    saveMessage(chatId, body);

    const messages = getMessages(chatId);

    // ================= PROMPT =================

    const systemPrompt = `
You are ${botname}, created by ${ownername}.

Rules:
- Reply in same language & tone
- Human-like replies
- Short responses
- Funny → funny
- Rude → savage (not abusive)
- Islamic → respectful
`;

    const formatted = messages.map((msg, i) =>
      i % 2 === 0 ? `User: ${msg}` : `AI: ${msg}`
    );

    const promptText = `
${systemPrompt}

Conversation:
${formatted.join("\n")}

AI:
`;

    // ================= API =================

    const url = `https://apiskeith.vercel.app/ai/claudeai?q=${encodeURIComponent(promptText)}`;

    await conn.sendPresenceUpdate("composing", from);

    const { data } = await axios.get(url);

    if (data?.status && data?.result) {
      const aiReply = data.result;

      saveMessage(chatId, aiReply);

      await conn.sendMessage(from, { text: aiReply }, { quoted: m });
    } else {
      reply("⚠️ AI response error");
    }

  } catch (err) {
    console.error("AI ERROR:", err?.message || err);
    reply("❌ API error, try later");
  }
});
