// plugins/font.js - CJS Version
const { cmd } = require('../command.js');
const { allFonts, convertText } = require('../lib/fonts.js');
const config = require('../config.js');
const { getUserConfigFromMongoDB } = require("../lib/database");


// Generate all font commands dynamically
for (let i = 0; i < allFonts.length; i++) {
  const fontNumber = i + 1;
  
  cmd({
    pattern: `font${fontNumber}`,
    alias: [`f${fontNumber}`],
    react: "✍️",
    desc: `Apply font style #${fontNumber}`,
    category: "tools",
    use: `.font${fontNumber} <text>`,
    filename: __filename
  }, async (conn, m, store, { from, q, reply }) => {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) {
      return reply(
        `╭━━━❰ *✨ FONT #${fontNumber} ✨* ❱━━━╮\n` +
        `┃ 📝 *Usage:* .font${fontNumber} <text>\n` +
        `┃ 📌 *Example:* .font${fontNumber} Hello\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }
    
    const converted = convertText(q, allFonts[i]);
    
    const result = 
      `╭━━━❰ *✨ FONT #${fontNumber} ✨* ❱━━━╮\n` +
      `┃ 📝 *Original:* ${q}\n` +
      `┃ 🔤 *Converted:*\n` +
      `┃ ${converted}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `✨ *${botConfig.BOT_NAME}*`;
    
    await reply(result);
  });
}

// Main font command - shows all fonts
cmd({
  pattern: "font",
  alias: ["fancy", "stylish", "textstyle", "fonts"],
  react: "✍️",
  desc: "Convert text into all available fancy fonts",
  category: "tools",
  use: ".font <text>",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) {
      return reply(
        `╭━━━❰ *✨ FANCY FONTS ✨* ❱━━━╮\n` +
        `┃ 📝 *Usage:* .font <text>\n` +
        `┃ 📌 *Example:* .font Hello World\n` +
        `┃ 🔢 *Total Fonts:* ${allFonts.length}\n` +
        `┃ 💡 *Tip:* Use .font1 - .font${allFonts.length}\n` +
        `┃     for individual styles!\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━╯\n` +
        `✨ *${botConfig.BOT_NAME}*`
      );
    }

    let resultText = 
      `╭━━━❰ *✨ FANCY FONTS ✨* ❱━━━╮\n` +
      `┃ 📝 *Text:* ${q}\n` +
      `┃ 🔢 *Available Fonts:* ${allFonts.length}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
    
    let count = 0;
    for (let i = 0; i < allFonts.length; i++) {
      const converted = convertText(q, allFonts[i]);
      if (converted !== q) {
        count++;
        resultText += `*${count}.* ${converted}\n`;
      }
    }
    
    resultText += `\n╭━━━━━━━━━━━━━━━━━━━━━━╮\n` +
                  `┃ ✨ *${botConfig.BOT_NAME}* ✨ ┃\n` +
                  `╰━━━━━━━━━━━━━━━━━━━━━━╯`;

    // Split into multiple messages if too long
    if (resultText.length > 64000) {
      const chunks = resultText.match(/[\s\S]{1,64000}/g) || [];
      for (const chunk of chunks) {
        await conn.sendMessage(from, { text: chunk }, { quoted: m });
      }
    } else {
      await conn.sendMessage(from, { text: resultText }, { quoted: m });
    }

  } catch (error) {
    console.error("❌ Error in font command:", error);
    reply("⚠️ An error occurred while converting fonts. Please try again.");
  }
});
