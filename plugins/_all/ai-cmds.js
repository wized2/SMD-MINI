const axios = require("axios");
const { cmd } = require("../command");
const fs = require("fs");
const { getUserConfigFromMongoDB } = require("../lib/database");

cmd({
  pattern: "think",
  alias: ["ai2", "copilot"],
  react: "🧠",
  desc: "Ask anything from Copilot Think AI",
  category: "ai",
  use: ".think <question>",
  filename: __filename
},
async (conn, mek, m, { text, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
  const botname = botConfig.BOT_NAME || "SMD-MINI";
  const caption = botConfig.CAPTION || "POWERED BY TEAM-BAMDAHEALI";
  
    if (!text) {
    
      return reply(
        "❌ Sawal likho bhai 🤔\n\nExample:\n.think Siapa presiden indonesia sekarang?"
      );
    }

    const apiUrl = `https://api.deline.web.id/ai/copilot-think?text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    // ✅ NEW STRUCTURE HANDLE
    if (!data || data.status !== true || !data.result || !data.result.text) {
      return reply("❌ AI se response nahi mila, baad mein try karo.");
    }

    let message = `🤖 *${botname} AI*\n\n`;
    message += `${data.result.text}\n\n`;

    // 📚 Citations handle
    if (Array.isArray(data.result.citations) && data.result.citations.length > 0) {
      message += `📌 *Sources:*\n`;
      data.result.citations.forEach((cite, index) => {
        message += `${index + 1}. ${cite.title}\n🔗 ${cite.url}\n\n`;
      });
    }

    message += `*✨${caption}*`;

    await reply(message);

  } catch (err) {
    console.error("❌ Copilot Think Error:", err);
    reply("❌ Error aa gaya AI se reply lete waqt.");
  }
});


cmd({
  pattern: "copilot",
  alias: ["copilot", "copilot", "copilot"],
  react: "🤖",
  desc: "Ask anything from AI",
  category: "ai",
  use: ".ai <question>",
  filename: __filename
},
async (conn, mek, m, { text, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
  const botname = botConfig.BOT_NAME || "SMD-MINI";
  const caption = botConfig.CAPTION || "POWERED BY TEAM-BAMDAHEALI";
    if (!text) {
      return reply("❌ Bhai sawal to likho 🤔\n\nExample:\n.copilot Assalam o Alaikum");
    }

    const apiUrl = `https://api.deline.web.id/ai/copilot?text=${encodeURIComponent(text)}`;

    const { data } = await axios.get(apiUrl);

    // ✅ NEW RESPONSE STRUCTURE
    if (!data || data.status !== true || !data.result) {
      return reply("❌ AI se response nahi mila, baad mein try karo.");
    }

    const aiReply = data.result; // 👈 NEW FIELD

    await reply(aiReply);

  } catch (err) {
    console.error("❌ AI Error:", err);
    reply("❌ Error aa gaya AI se reply lete waqt.");
  }
});

cmd({
  pattern: "ai",
  alias: ["ask", "chat"],
  react: "🤖",
  desc: "Ask anything from AI",
  category: "ai",
  use: ".ai <question>",
  filename: __filename
},
async (conn, mek, m, { text, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
  const botname = botConfig.BOT_NAME || "SMD-MINI";
  const caption = botConfig.CAPTION || "POWERED BY TEAM-BAMDAHEALI";
    if (!text) {
      return reply(
        "❌ Bhai sawal to likho 🤔\n\nExample:\n.ai Assalam o Alaikum"
      );
    }

    const apiUrl = `https://api.princetechn.com/api/ai/ai?apikey=prince&q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    // ✅ RESPONSE STRUCTURE HANDLE
    if (!data || data.success !== true || !data.result) {
      return reply("❌ AI se response nahi mila, baad mein try karo.");
    }

    const aiReply = `🤖 *${botname} AI*\n\n${data.result}\n\n✨ *${caption}*`;

    await reply(aiReply);

  } catch (err) {
    console.error("❌ AI Error:", err);
    reply("❌ Error aa gaya AI se reply lete waqt.");
  }
});

cmd({
  pattern: "aichat",
  alias: ["longai", "ptchat"],
  react: "📘",
  desc: "Ask detailed questions from AI",
  category: "ai",
  use: ".aichat <question>",
  filename: __filename
},
async (conn, mek, m, { text, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
  const botname = botConfig.BOT_NAME || "SMD-MINI";
  const caption = botConfig.CAPTION || "POWERED BY TEAM-BAMDAHEALI";
    if (!text) {
      return reply(
        "❌ Sawal likho bhai 🤔\n\nExample:\n.aichat Pakistan independence day"
      );
    }

    const apiUrl = `https://api.princetechn.com/api/ai/chat?apikey=prince&q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    // ✅ RESPONSE STRUCTURE HANDLE
    if (!data || data.success !== true || !data.result) {
      return reply("❌ AI se response nahi mila, baad mein try karo.");
    }

    let message = `🤖 *${botname} AI*\n\n`;
    message += `${data.result}\n\n`;
    message += `✨ *${caption}*`;

    await reply(message);

  } catch (err) {
    console.error("❌ AI Chat Error:", err);
    reply("❌ Error aa gaya AI se reply lete waqt.");
  }
});

cmd({
  pattern: "g4mini",
  alias: ["gptmini", "mini4o"],
  react: "✨",
  desc: "Chat with GPT-4o Mini AI",
  category: "ai",
  use: ".g4mini <question>",
  filename: __filename
},
async (conn, mek, m, { text, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
  const botname = botConfig.BOT_NAME || "SMD-MINI";
  const caption = botConfig.CAPTION || "POWERED BY TEAM-BAMDAHEALI";
    if (!text) {
      return reply(
        "❌ Bhai sawal likho 🤔\n\nExample:\n.g4mini Kesay ho mere jaan"
      );
    }

    const apiUrl = `https://api.princetechn.com/api/ai/gpt4o-mini?apikey=prince&q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    // ✅ RESPONSE STRUCTURE HANDLE
    if (!data || data.success !== true || !data.result) {
      return reply("❌ AI se response nahi mila, baad mein try karo.");
    }

    const message =
      `🤖 *${botname} AI*\n\n` +
      `${data.result}\n\n` +
      `*✨${caption}*`;

    await reply(message);

  } catch (err) {
    console.error("❌ GPT-4o Mini Error:", err);
    reply("❌ Error aa gaya AI se reply lete waqt.");
  }
});

cmd({
  pattern: "openaiinfo",
  alias: ["oaai", "ptopenai"],
  react: "🌦️",
  desc: "Get detailed AI responses via OpenAI",
  category: "ai",
  use: ".openaiinfo <question>",
  filename: __filename
},
async (conn, mek, m, { text, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!text) {
      return reply(
        "❌ Bhai sawal likho 🤔\n\nExample:\n.openaiinfo Lahore Pakistan weather details"
      );
    }

    const apiUrl =
      `https://api.princetechn.com/api/ai/openai?apikey=prince&q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    // ✅ RESPONSE STRUCTURE HANDLE
    if (!data || data.success !== true || !data.result) {
      return reply("❌ AI se response nahi mila, baad mein try karo.");
    }

    let message = `🤖 *${botname} AI*\n\n`;
    message += `${data.result}\n\n`;
    message += `*✨${caption}*`;

    await reply(message);

  } catch (err) {
    console.error("❌ OpenAI Error:", err);
    reply("❌ Error aa gaya AI se reply lete waqt.");
  }
});
