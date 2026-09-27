const { cmd, bandah, commands } = require("../command");
const config = require("../config");
const moment = require("moment-timezone");
const os = require("os");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const { runtime } = require('../lib/functions');
//const { getUserConfigFromMongoDB } = "../lib/database";
const { updateUserConfigInMongoDB, getUserConfigFromMongoDB } = require('../lib/database');
// Common variables
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
let botStartTime = Date.now();
const ALIVE_IMG = config.BOT_IMAGE || `https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg`;
const OWNER_PATH = path.join(__dirname, "../assets/sudo.json");

// Font system
let fontCounter = 0;
const fontStyles = ['bold', 'monospace', 'italic', 'bold-italic'];
const fontMaps = {
   'bold': {
        a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶', j: '𝗷', k: '𝗸', l: '𝗹',
        m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅',
        y: '𝘆', z: '𝘇', A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝',
        K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩',
        W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭', "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", 
        "8": "𝟴", "9": "𝟵", "0": "𝟬"
    },
    'monospace': {
        a: '𝚊', b: '𝚋', c: '𝚌', d: '𝚍', e: '𝚎', f: '𝚏', g: '𝚐', h: '𝚑', i: '𝚒', j: '𝚓', k: '𝚔', l: '𝚕',
        m: '𝚖', n: '𝚗', o: '𝚘', p: '𝚙', q: '𝚚', r: '𝚛', s: '𝚜', t: '𝚝', u: '𝚞', v: '𝚟', w: '𝚠', x: '𝚡',
        y: '𝚢', z: '𝚣', A: '𝙰', B: '𝙱', C: '𝙲', D: '𝙳', E: '𝙴', F: '𝙵', G: '𝙶', H: '𝙷', I: '𝙸', J: '𝙹',
        K: '𝙺', L: '𝙻', M: '𝙼', N: '𝙽', O: '𝙾', P: '𝙿', Q: '𝚀', R: '𝚁', S: '𝚂', T: '𝚃', U: '𝚄', V: '𝚅',
        W: '𝚆', X: '𝚇', Y: '𝚈', Z: '𝚉', "1": "𝟷", "2": "𝟸", "3": "𝟹", "4": "𝟺", "5": "𝟻", "6": "𝟼", "7": "𝟽", 
        "8": "𝟾", "9": "𝟿", "0": "𝟶"
    },
   
    'italic': {
        a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨', h: '𝘩', i: '𝘪', j: '𝘫', k: '𝘬', l: '𝘭',
        m: '𝘮', n: '𝘯', o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳', s: '𝘴', t: '𝘵', u: '𝘶', v: '𝘷', w: '𝘸', x: '𝘹',
        y: '𝘺', z: '𝘻', A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎', H: '𝘏', I: '𝘐', J: '𝘑',
        K: '𝘒', L: '𝘓', M: '𝘔', N: '𝘕', O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙', S: '𝘚', T: '𝘛', U: '𝘜', V: '𝘝',
        W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡'
    },
    'bold-italic': {
        a: '𝙖', b: '𝙗', c: '𝙘', d: '𝙙', e: '𝙚', f: '𝙛', g: '𝙜', h: '𝙝', i: '𝙞', j: '𝙟', k: '𝙠', l: '𝙡',
        m: '𝙢', n: '𝙣', o: '𝙤', p: '𝙥', q: '𝙦', r: '𝙧', s: '𝙨', t: '𝙩', u: '𝙪', v: '𝙫', w: '𝙬', x: '𝙭',
        y: '𝙮', z: '𝙯', A: '𝘼', B: '𝘽', C: '𝘾', D: '𝘿', E: '𝙀', F: '𝙁', G: '𝙂', H: '𝙃', I: '𝙄', J: '𝙅',
        K: '𝙆', L: '𝙇', M: '𝙈', N: '𝙉', O: '𝙊', P: '𝙋', Q: '𝙌', R: '𝙍', S: '𝙎', T: '𝙏', U: '𝙐', V: '𝙑',
        W: '𝙒', X: '𝙓', Y: '𝙔', Z: '𝙕'
    }
    
};

// Common functions
function getNextFont() {
    const font = fontStyles[fontCounter % fontStyles.length];
    fontCounter++;
    return font;
}

function convertText(txt, fontStyle) {
    if (!txt || typeof txt !== 'string') return '';
    const map = fontMaps[fontStyle] || fontMaps.bold;
    return txt.split('').map(c => map[c] || c).join('');
}

function getHarareTime() {
    return new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Karachi',
        hour12: true,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
}

async function getBotVersion() {
    try {
        if (!config.REPO) return 'SuperSonic';
        const repoUrl = config.REPO;
        const rawUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/package.json';
        const { data } = await axios.get(rawUrl);
        return data.version || 'SuperSonic';
    } catch (error) {
        console.error("Version check error:", error);
        return 'SuperSonic';
    }
}

function fancy(txt) {
    const currentFont = fontStyles[(fontCounter - 1) % fontStyles.length];
    return convertText(txt, currentFont);
}

// Helper function for command display with prefix logic
function getCommandDisplay(commandPattern) {
    if (config.PREFIX === 'null') {
        return commandPattern;
    }
    return `${config.PREFIX}${commandPattern}`;
}

function generateCategorySection(categoryName, commandsList) {
    if (!commandsList || !commandsList.length) return '';
    
    const currentFont = fontStyles[(fontCounter - 1) % fontStyles.length];
    
    let section = `*💙 ${convertText(categoryName.toUpperCase(), currentFont)} 💚*\n\n╭─────────────···◈\n`;
    
    commandsList.forEach(bandah => {
        if (bandah.pattern) {
            const commandDisplay = getCommandDisplay(bandah.pattern);
            section += `*┋* *⬡ ${convertText(commandDisplay, currentFont)}*\n`;
        }
    });
    
    section += `╰─────────────╶╶···◈\n\n`;
    return section;
}

// Common DJ object creator
function createDJObject(m, customName = null) {
    return {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            remoteJid: 'status@broadcast'
        },
        message: {
            contactMessage: {
                displayName: customName || config.BOT_NAME,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${config.BOT_NAME};;;\nFN:${config.BOT_NAME}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Bandaheali\nEND:VCARD`
            }
        }
    };
}

// Helper functions for ban/sudo system
const ensureOwnerFile = () => {
    if (!fs.existsSync(OWNER_PATH)) {
        fs.writeFileSync(OWNER_PATH, JSON.stringify([]));
    }
};

const getTargetUser = (m, args) => {
    return m.mentionedJid?.[0] 
        || (m.quoted?.sender ?? null)
        || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");
};

// ============================ COMMANDS START HERE ============================

bandah({
  pattern: "alive",
  alias: ["live"],
  desc: "Alive status with newsletter + external ad + audio",
  category: "main",
  react: "🕋",
  filename: __filename
}, async (conn, mek, m, { from }) => {
  try {
      
      const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot)
const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        const caption = botConfig.CAPTION || "POWERED BY TEAM-BANDAHEALI";
    // ⏳ UPTIME
    const runtimeMs = Date.now() - botStartTime;
    const days = Math.floor(runtimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((runtimeMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((runtimeMs / (1000 * 60)) % 60);
    const seconds = Math.floor((runtimeMs / 1000) % 60);

    const uptime = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;

    const audioUrl = "https://bandaheali-cdn.koyeb.app/bandaheali/alive.mp3";
    const thumbUrl = "https://bandaheali-cdn.koyeb.app/media/bot_1767321466701.jpg";

    await conn.sendMessage(
      from,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: false,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,

          // 📰 Newsletter style
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.NEWSLETTER_JID,
            newsletterName: botname,
            serverMessageId: 143
          },

          // 📢 External Ad with thumbnail
          externalAdReply: {
            title: "🕋 Recite Durood Shareef",
            body: `⚡ ${uptime}`,
            mediaType: 1,
            thumbnailUrl: thumbUrl, // ✅ THUMBNAIL ADDED
            sourceUrl: config.REPO || "https://github.com/iTx-Sarkar",
            showAdAttribution: true,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: mek }
    );

  } catch (err) {
    console.error("❌ Alive cmd error:", err);
  }
});
// Alive Command


bandah({
  pattern: "up",
  alias: ["uptime"],
  use: ".up",
  desc: "Show bot uptime (one-line)",
  category: "system",
  filename: __filename
},
async (conn, mek, m, { reply }) => {
  try {
const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot);
      const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        const caption = botConfig.CAPTION || "POWERED BY TEAM-BANDAHEALI";
    await m.react("⏳");

    const t = process.uptime();
    const d = Math.floor(t / 86400);
    const h = Math.floor((t % 86400) / 3600);
    const min = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);

    await reply(
`⚡ _${botname}_ ➜ ${d}ᴅ ${h}ʜ ${min}ᴍ ${s}ˢ`
    );

    await m.react("✅");
  } catch (e) {
    await reply("❌ 𝑼𝒑𝒕𝒊𝒎𝒆 𝒏𝒐𝒕 𝒂𝒗𝒂𝒊𝒍𝒂𝒃𝒍𝒆.");
  }
});


// Alive2 Command
bandah({
  pattern: "alive2",
  alias: ["status2", "online2"],
  desc: "Check bot is alive or not",
  category: "main",
  react: "⚡",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
      const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot);
      const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        const caption = botConfig.CAPTION || "POWERED BY TEAM-BANDAHEALI";
    const voiceClips = [
      "https://cdn.ironman.my.id/i/7p5plg.mp4",
      "https://cdn.ironman.my.id/i/l4dyvg.mp4",
      "https://cdn.ironman.my.id/i/4z93dg.mp4",
      "https://cdn.ironman.my.id/i/m9gwk0.mp4",
      "https://cdn.ironman.my.id/i/gr1jjc.mp4",
      "https://cdn.ironman.my.id/i/lbr8of.mp4",
      "https://cdn.ironman.my.id/i/0z95mz.mp4",
      "https://cdn.ironman.my.id/i/rldpwy.mp4",
      "https://cdn.ironman.my.id/i/lz2z87.mp4",
      "https://cdn.ironman.my.id/i/gg5jct.mp4",
      "https://cdn.ironman.my.id/i/0gup65.mp4",
      "https://cdn.ironman.my.id/i/8mrocq.mp4",
      "https://cdn.ironman.my.id/i/xf29k2.mp4",
      "https://cdn.ironman.my.id/i/aof4z4.mp4",
      "https://cdn.ironman.my.id/i/1ulm61.mp4",
      "https://cdn.ironman.my.id/i/88x93o.mp4",
      "https://files.catbox.moe/bat4dt.mp3",
      "https://files.catbox.moe/nugg7o.mp3",
      "https://files.catbox.moe/fcqzmk.mp3",
      "https://files.catbox.moe/tqzlfl.mp3",
      "https://files.catbox.moe/w94n86.mp3",
      "https://files.catbox.moe/cuk967.mp3",
      "https://files.catbox.moe/7ajubx.mp3",
      "https://files.catbox.moe/2fi10f.mp3",
      "https://files.catbox.moe/78isfb.mp3",
      "https://files.catbox.moe/lcrt4a.mp3"
    ];
    const rClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

    // Load thumbnail
    const thumbnailRes = await axios.get(menuimg || "https://cdn.inprnt.com/thumbs/5d/0b/5d0b7faa113233d7c2a49cd8dbb80ea5@2x.jpg", {
      responseType: 'arraybuffer'
    });
    const thumbnailBuffer = Buffer.from(thumbnailRes.data, 'binary');

    await conn.sendMessage(from, {
      audio: { url: rClip },
      mimetype: 'audio/mp4',
      ptt: false,
      waveform: [99, 0, 99, 0, 99],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: `${botname} IS ONLINE`,
          body: `${caption}`,
          mediaType: 1,
          renderLargerThumbnail: false,
          thumbnail: thumbnailBuffer,
          mediaUrl: "https://cdn.inprnt.com/thumbs/5d/0b/5d0b7faa113233d7c2a49cd8dbb80ea5@2x.jpg",
          sourceUrl: "https://wa.me/message/TEWHI2YV6JZKI1",
          showAdAttribution: true
        }
      }
    }, { quoted: createDJObject(m, botConfig.OWNER_NAME) });

  } catch (e) {
    console.error("Alive Error:", e);
    reply(`An error occurred: ${e.message}`);
  }
});

// Menu System
function createCategoryMenu(category, categoryDisplayName) {
    bandah({
        pattern: `${category}menu`,
        desc: `Show ${categoryDisplayName} commands`,
        alias: [`${category}help`, `${category}commands`],
        category: "main",
        react: "📁",
        filename: __filename
    }, 
    async (conn, mek, m, { from, pushname, reply }) => {
        try {
const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot);
            await conn.sendPresenceUpdate('composing', from);

            const version = await getBotVersion();
            const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        
            
            // Filter commands for specific category
            const categoryCommands = commands.filter(bandah => 
                bandah.pattern && 
                bandah.category && 
                bandah.category.toLowerCase() === category.toLowerCase() &&
                !bandah.hideCommand
            );

            if (categoryCommands.length === 0) {
                return reply(`❌ No commands found in *${categoryDisplayName}* category.`);
            }

            const metaIconBuffer = await axios.get(menuimg, {
                responseType: "arraybuffer"
            }).then(res => Buffer.from(res.data, "binary"));

            const fake = {
                key: {
                    remoteJid: "status@broadcast",
                    fromMe: false,
                    id: "ABCD1234",
                    participant: "0@s.whatsapp.net"
                },
                message: {
                    contactMessage: {
                        displayName: ownername,
                        vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:Meta AI\nTEL;type=CELL:+13135550002\nEND:VCARD",
                        jpegThumbnail: metaIconBuffer
                    }
                }
            };

            let menuContent = `
       \`\`\`${categoryDisplayName.toUpperCase()} MENU\`\`\`
    
⟣──────────────────⟢
▧ *𝙊𝙒𝙉𝙀𝙍* : *${ownername} (🇵🇰)*
▧ *𝗠𝗢𝗗𝗘* : *${mode}* 
▧ *𝗣𝗥𝗘𝗙𝗜𝗫* : *${prefix}*
▧ *𝗩𝗘𝗥𝗦𝗜𝗢𝗡* : *${version}* 
▧ *𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗬* : *${categoryDisplayName}*
▧ *𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦* : ${categoryCommands.length}
⟣──────────────────⟢

> ${categoryDisplayName.toUpperCase()} - COMMANDS

⟣──────────────────⟢
${readMore}

${generateCategorySection(categoryDisplayName, categoryCommands)}

*━━━━━━━━━━━━━━━━━━━━*⁠⁠⁠⁠
> 𝙐𝙨𝙚 *${prefix}menu* 𝙛𝙤𝙧 𝙛𝙪𝙡𝙡 𝙢𝙚𝙣𝙪
*━━━━━━━━━━━━━━━━━━━━━*
`;

            
            
            await conn.sendMessage(
                from,
                {
                    image: { url: menuimg },
                    caption: menuContent,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: config.NEWSLETTER_JID,
                            newsletterName: botname,
                            serverMessageId: 143
                        }
                    }
                },
                { quoted: fake }
            );

            await conn.sendPresenceUpdate('paused', from);
            
        } catch (e) {
            console.error(`${category} Menu Error:`, e);
            reply(`❌ Error generating ${categoryDisplayName} menu: ${e.message}`);
        }
    });
}

// Create menu commands for all categories
createCategoryMenu("tools", "Tools");
createCategoryMenu("main", "Main");
createCategoryMenu("bug", "Bug");
createCategoryMenu("download", "Download");
createCategoryMenu("random", "Random");
createCategoryMenu("fun", "Fun");
createCategoryMenu("owner", "Owner");
createCategoryMenu("group", "Group");
createCategoryMenu("search", "Search");
createCategoryMenu("converter", "Converter");
createCategoryMenu("islamic", "Islamic");
createCategoryMenu("ai", "AI");
createCategoryMenu("settings", "SETTINGS");

// Main Menu Command
bandah({
    pattern: "menu3",
    desc: "edith menu with rotating fonts",
    alias: ["help3", "commands3"],
    category: "main",
    react: "✅",
    filename: __filename
}, 
async (conn, mek, m, { from, pushname, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot)
    
    const getAudio = await axios.get("https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/menu/audio.json");

const audioUrl = getAudio.data[Math.floor(Math.random() * getAudio.data.length)];

        await conn.sendPresenceUpdate('composing', from);

        // Get current font for this menu call
        const currentFont = getNextFont();
        const version = await getBotVersion();
        const totalCommands = commands.filter(bandah => bandah.pattern).length;
        const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        

        const ai = {
            key: {
                remoteJid: "status@broadcast",
                fromMe: false,
                participant: "13135550002@s.whatsapp.net"
            },
            message: {
                contactMessage: {
                    displayName: ownername,
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta AI
TEL;type=CELL;type=VOICE;waid=13135550002:+1 3135550002
END:VCARD`
                }
            }
        };

        const metaIconBuffer = await axios.get(menuimg, {
            responseType: "arraybuffer"
        }).then(res => Buffer.from(res.data, "binary"));

        const fake = {
            key: {
                remoteJid: "status@broadcast",
                fromMe: false,
                id: "ABCD1234",
                participant: "0@s.whatsapp.net"
            },
            message: {
                contactMessage: {
                    displayName: ownername,
                    vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:Meta AI\nTEL;type=CELL:+13135550002\nEND:VCARD",
                    jpegThumbnail: metaIconBuffer
                }
            }
        };

        // Filter valid commands
        const validCommands = commands.filter(bandah => 
            bandah.pattern && 
            bandah.category && 
            bandah.category.toLowerCase() !== 'menu' &&
            !bandah.hideCommand
        );

        // Group commands by category
        const categories = {};
        validCommands.forEach(bandah => {
            const category = bandah.category.toLowerCase();
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(bandah);
        });

        // Generate menu sections with current font
        let menuSections = '';
        Object.entries(categories)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([category, cmds]) => {
                let section = `*💙 ${convertText(category.toUpperCase(), currentFont)} 💚*\n\n╭─────────────···◈\n`;
                
                cmds.forEach(bandah => {
                    if (bandah.pattern) {
                        const commandDisplay = getCommandDisplay(bandah.pattern);
                        section += `*┋⬡ ${convertText(commandDisplay, currentFont)}*\n`;
                    }
                });
                
                section += `╰─────────────╶╶···◈\n\n`;
                menuSections += section;
            });

        // Create menu with current rotating font
        let dec = `
\`\`\`${convertText(botname, currentFont)}\`\`\`

${convertText('⟣──────────────────⟢', currentFont)}
${convertText('▧', currentFont)} *${convertText('OWNER', currentFont)}* : *${ownername} (🇵🇰)*
${convertText('▧', currentFont)} *${convertText('MODE', currentFont)}* : *${mode}* 
${convertText('▧', currentFont)} *${convertText('PREFIX', currentFont)}* : *${prefix}*
${convertText('▧', currentFont)} *${convertText('RAM', currentFont)}* : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB 
${convertText('▧', currentFont)} *${convertText('VERSION', currentFont)}* : *${version}* 
${convertText('▧', currentFont)} *${convertText('UPTIME', currentFont)}* : ${runtime(process.uptime())} 
${convertText('▧', currentFont)} *${convertText('COMMANDS', currentFont)}* : ${totalCommands}
${convertText('⟣──────────────────⟢', currentFont)}

> ${convertText(`${botname} + IS + THE + BEST`, currentFont)}

${convertText('⟣──────────────────⟢', currentFont)}
${readMore}

${menuSections}

*${convertText('━━━━━━━━━━━━━━━━━━━━', currentFont)}*⁠⁠⁠⁠
> ${convertText(`${ownername} The Destroyer`, currentFont)}
*${convertText('━━━━━━━━━━━━━━━━━━━━━', currentFont)}*

🎨 ${convertText('Font Style', currentFont)}: ${currentFont.toUpperCase()}
`;

        
        await conn.sendMessage(
            from,
            {
                image: { url: menuimg },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.NEWSLETTER_JID,
                        newsletterName: convertText(botname, currentFont),
                        serverMessageId: 143
                    }
                }
            },
            { quoted: ai }
        );
        
        await conn.sendMessage(
    from,
    {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false,
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER_JID,
                newsletterName: convertText(botname, currentFont),
                serverMessageId: 143
            }
        }
    },
    { quoted: ai }
);

        await conn.sendPresenceUpdate('paused', from);
        
    } catch (e) {
        console.error('Menu Error:', e);
        reply(`❌ Error generating menu: ${e.message}`);
    }
});

// Password Generator
bandah({
    pattern: "gpass",
    desc: "Generate a strong password.",
    category: "main",
    react: "🔐",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const length = args[0] ? parseInt(args[0]) : 12;
        if (isNaN(length) || length < 8) {
            return reply('Please provide a valid length for the password (Minimum 08 Characters).');
        }

        const generatePassword = (len) => {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
            let password = '';
            for (let i = 0; i < len; i++) {
                const randomIndex = crypto.randomInt(0, charset.length);
                password += charset[randomIndex];
            }
            return password;
        };

        const password = generatePassword(length);
        const message = `🔐 *Your Strong Password* 🔐\n\nPlease find your generated password below`;

        // Send initial notification message
        await conn.sendMessage(from, { text: message }, { quoted: mek });

        // Send the password in a separate message
        await conn.sendMessage(from, { text: password }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error generating password🤕: ${e.message}`);
    }
});

// List Command
bandah({
  pattern: "menu",
  alias: ["m", "men"],
  use: '.menu',
  desc: "Show all bot commands",
  category: "main",
  react: "🐍",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
      const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot);
      const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        
    const totalCommands = commands.length;
    const date = moment().tz("Asia/Karachi").format("dddd, DD MMMM YYYY");

    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    // Menu header
    let menuText = `
*╭┄┄✪ ${botname} ✪┄┄⊷*
*┃❂┬┄✯✯✯✯✯✯✯✯*
*┃❂┊ Owner:* ${ownername}
*┃❂┊ Baileys:* Mᴜʟᴛɪ Dᴇᴠɪᴄᴇ
*┃❂┊ Date:* ${date}
*┃❂┊ Type:* Nᴏᴅᴇᴊs
*┃❂┊ Runtime:* ${uptime(process.uptime())}
*┃❂┊ Prefix:* ${prefix}
*┃❂┊ Mode:* ${mode}
*┃❂┊ Ram:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
*┃❂┊ Total Commands:* ${totalCommands}
*┃❂┊ Status:* *Oɴʟɪɴᴇ*
*┃❂┊ Version:* 1.0.0
*┃❂┴┄✯✯✯✯✯✯✯✯*
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊷*
`;

    // Categories aur commands grouping
    let category = {};
    for (let bandah of commands) {
      if (!bandah.category) continue;
      if (!category[bandah.category]) category[bandah.category] = [];
      category[bandah.category].push(bandah);
    }

    const keys = Object.keys(category).sort();
    for (let k of keys) {
      menuText += `\n\n*╭┈┈┄❂ ${k.toUpperCase()} ❂┄┄┄◈*`;
      const cmds = category[k].filter(c => c.pattern).sort((a, b) => a.pattern.localeCompare(b.pattern));
      cmds.forEach((bandah) => {
        const commandDisplay = getCommandDisplay(bandah.pattern);
        menuText += `\n*┋⬡ ${commandDisplay}*    `;
      });
      menuText += `\n*╰┄┄┄┄┄┈┈┈┈┄┄┄◈*`;
    }

    // Send menu
    await conn.sendMessage(from, {
      image: { url: `${menuimg}` },
      caption: menuText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: config.NEWSLETTER_JID,
          newsletterName: botname,
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});

// Allmenu Command with Baileys
let proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia;

async function loadBaileys() {
    const b = await import("@whiskeysockets/baileys");
    proto = b.proto;
    generateWAMessageFromContent = b.generateWAMessageFromContent;
    prepareWAMessageMedia = b.prepareWAMessageMedia;
}

loadBaileys();

bandah({
  pattern: "allmenu",
  react: "🤭",
  alias: ["commands"],
  desc: "Get bot's command list.",
  filename: __filename
},
async(conn, mek, m, { from, quoted, q, reply }) => {
  try {
const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot);
      const botname = botConfig.BOT_NAME || "smd-mini";
    let hostname;
    if (os.hostname().length == 12) hostname = 'replit';
    else if (os.hostname().length == 36) hostname = 'heroku';
    else if (os.hostname().length == 8) hostname = 'koyeb';
    else hostname = os.hostname();

    const monspace = '```';
    const monspacenew = '`';
    
    // Reset font counter for each menu call
    fontCounter = 0;
    
    const cap = convertText(botConfig.CAPTION, getNextFont());
    var vajiralod = [
      "LOADING [⬛⬛⬜⬜⬜⬜]",
      "LOADING [⬛⬛⬛⬜⬜⬜]",
      "LOADING [⬛⬛⬛⬛⬜⬜]",
      "LOADING [⬛⬛⬛⬛⬛⬜]",
      "LOADING [⬛⬛⬛⬛⬛⬛]",
      "`COMPLETED ✅`"
    ];

    let { key } = await conn.sendMessage(from, { text: '`MENU BY RASHID THE DEVIL`' });
    for (let i = 0; i < vajiralod.length; i++) {
      await conn.sendMessage(from, { text: vajiralod[i], edit: key });
    }

    const category = q.trim().toUpperCase();
    
    // Fancy watermark with rotating font
    const wm = `> ${convertText(botConfig.CAPTION, getNextFont())}`;

    function buildMenu(cat, title) {
      // Get different fonts for title and commands
      const titleFont = getNextFont();
      const commandFont = getNextFont();
      
      // Convert title and build menu
      const fancyTitle = convertText(title.toUpperCase(), titleFont);
      
      let menu = `${convertText(`⌬≡≡≡≡≡≡≡${category} ${fancyTitle} COMMAND LIST ≡≡≡≡≡≡⌬`, getNextFont())}\n\n`;
      
      for (let i = 0; i < commands.length; i++) {
        if (commands[i].category === cat && !commands[i].dontAddCommandList) {
          const commandDisplay = getCommandDisplay(commands[i].pattern);
          const fancyCommand = convertText(commandDisplay, commandFont);
          menu += `• ${fancyCommand}\n`;
        }
      }
      
      const totalCommands = commands.filter(bandah => bandah.category === cat).length;
      const fancyTotal = convertText(`⭓ Total Commands List ${category}:`, getNextFont());
      const fancyCount = convertText(totalCommands.toString(), getNextFont());
      
      menu += `\n${fancyTotal} ${fancyCount}\n\n${wm}`;
      return menu;
    }

    const menus = [
      buildMenu('download', 'download'),
      buildMenu('owner', 'owner'),
      buildMenu('group', 'group'),
      buildMenu('search', 'search'),
      buildMenu('convert', 'convert'),
      buildMenu('main', 'main'),
      buildMenu('bug', 'bug'),
      buildMenu('editing', 'editing'),
      buildMenu('ai', 'ai'),
      buildMenu('anime', 'anime'),
      buildMenu('islamic', 'islamic'),
      buildMenu('fun', 'fun'),
      buildMenu('game', 'game'),
      buildMenu('tools', 'tools'),
      buildMenu('privacy', 'privacy'),
      buildMenu('settings', 'settings'),
    ];

    const cards = [];
    for (const menu of menus) {
      const preparedMedia = await prepareWAMessageMedia({ image: { url: botConfig.MENU_IMG } }, { upload: conn.waUploadToServer });
      const card = {
        header: proto.Message.InteractiveMessage.Header.create({
          ...preparedMedia,
          title: menu,
          gifPlayback: true,
          subtitle: convertText(`botname COMMANDS LIST`, getNextFont()),
          hasMediaAttachment: false
        }),
        body: { text: '' },
        nativeFlowMessage: {}
      };
      cards.push(card);
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: '' },
            carouselMessage: {
              cards,
              messageVersion: 1
            },
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER_JID,
                newsletterName: convertText(botname, getNextFont()),
                serverMessageId: 143
              }
            }
          }
        }
      }
    }, { quoted: m });

    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.log(e);
    reply(`❌ Error occurred in cmdmenu.\n\n${e.message}`);
  }
});

// Owner Command
bandah({
    pattern: "owner",
    react: "✅", 
    desc: "Get owner number",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
    try {
const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot)
      const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        const ownerNumber = botConfig.OWNER_NUMBER || "923253617422";

        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName}\n` +  
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\n` + 
                      'END:VCARD';

        // Send the vCard
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        });

        // Send the owner contact message with image
        await conn.sendMessage(from, {
            image: { url: botConfig.MENU_IMG},
            caption: `╭━━〔 *${botname}* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *Here Is The Owner Details*
┃◈┃• *Name* - ${ownername}
┃◈┃• *Number* ${ownerNumber}
┃◈┃• *Version*: 5.0.0 Beta
┃◈└───────────┈⊷
╰──────────────┈⊷
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇᴅɪᴛʜ ᴍᴅ`,
            contextInfo: {
                mentionedJid: [`${ownerNumber.replace('+', '')}@s.whatsapp.net`], 
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER_JID,
                    newsletterName: botname,
                    serverMessageId: 143
                }            
            }
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply(`An error occurred: ${error.message}`);
    }
});

// Ping Command - WITH REACTIONS RESTORED
bandah({
    pattern: "ping",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
const bot = conn.user.id.split(":")[0];
      const botConfig = await getUserConfigFromMongoDB(bot);
      const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        
        const start = new Date().getTime();
        
        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        // Ensure reaction and text emojis are different
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction - RESTORED
        await conn.sendMessage(from, {
            react: { text: reactionEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        const text = `
\`\`\`𝐏๏፝֟ƞ̽g ${responseTime.toFixed(2)}𝐌s ${textEmoji}\`\`\`
        `;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER_JID,
                    newsletterName: botname,
                    serverMessageId: 143
                }
            }
        }, { quoted: createDJObject(m) });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});


// Repo Command for SMD-MINI
bandah({
    pattern: "repo",
    alias: ["sc", "script", "repository"],
    desc: "Get SMD-MINI repository information and deployment links.",
    react: "📂",
    category: "main",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        const ownername = botConfig.OWNER_NAME || "TEAM-BANDAHEALI";        const botname = botConfig.BOT_NAME || "SMD-MINI";
        const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg"
        const mode = botConfig.MODE || "public";
        const prefix = botConfig.PREFIX || ".";
        
        // Repository details - UPDATE THESE WHEN REPO IS AVAILABLE
        const repoInfo = {
            name: "SMD-MINI",
            owner: "iTx-Sarkar",
            url: "https://github.com/iTx-Sarkar/SMD-MINI",
            description: "Mini version of SMD WhatsApp Bot",
            stars: "⭐ Star on GitHub",
            forks: "🍴 Fork to deploy"
        };

        // Deployment links
        const deployUrl = "https://team-bandaheali.vercel.app";
        const pairCmd = ".pair";

        const caption = `🛠️ *SMD-MINI REPOSITORY*

╭━━〔 📦 REPO INFO 〕━━┈⊷
┃◈ 📁 *Name:* ${repoInfo.name}
┃◈ 👤 *Owner:* ${repoInfo.owner}
┃◈ 🔗 *URL:* ${repoInfo.url}
┃◈ 📝 *Desc:* ${repoInfo.description}
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 🚀 DEPLOYMENT 〕━━┈⊷
┃◈ 🌐 *Deploy Here:* 
┃◈    ${deployUrl}
┃◈ 
┃◈ 🔐 *Get Pair Code:* 
┃◈    Use ${pairCmd} command
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 ⭐ SUPPORT 〕━━┈⊷
┃◈ Don't forget to:
┃◈ • ⭐ Star the repository
┃◈ • 🍴 Fork the project
┃◈ • 📢 Share with friends
╰━━━━━━━━━━━━━━┈⊷

> © POWERED BY ${botname}`;

        // Send with image
        await conn.sendMessage(from, {
            image: { url: botConfig.MENU_IMG || 'https://bandaheali-cdn.koyeb.app/edith/alive.jpg' },
            caption: caption,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER_JID,
                    newsletterName: botname,
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "🚀 Deploy SMD-MINI Now",
                    body: "⭐ Star ⭐ | 🍴 Fork 🍴",
                    mediaType: 1,
                    thumbnailUrl: menuimg,
                    sourceUrl: repoInfo.url,
                    showAdAttribution: true
                }
            }
        }, { quoted: createDJObject(m, botname) });

        // Send audio for extra engagement (optional)
        try {
            const audioResponse = await axios.get("https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/menu/audio.json");
            const audioUrl = audioResponse.data[Math.floor(Math.random() * audioResponse.data.length)];
            
            await conn.sendMessage(from, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.NEWSLETTER_JID,
                        newsletterName: botname,
                        serverMessageId: 143
                    }
                }
            }, { quoted: createDJObject(m) });
        } catch (audioError) {
            console.log("Audio not sent:", audioError.message);
        }

    } catch (error) {
        console.error("Error in repo command:", error);
        reply(`❌ Repo cmd error: ${error.message}`);
    }
});

