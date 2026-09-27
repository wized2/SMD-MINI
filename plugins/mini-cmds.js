
const { cmd } = require('../command.js');
const axios = require('axios');

//const __filename = __filename;

cmd({
    pattern: "smd",
    alias: ["mini", "pair", "freebot"],
    react: "🔐",
    desc: "Get pairing code for SMD-MiNi bot",
    category: "owner",
    use: ".smd 923XXXXXXXXX",
    filename: __filename
}, async (conn, mek, m, { q, senderNumber, reply }) => {

    try {

        // number extract
        const phoneNumber = q
            ? q.trim().replace(/[^0-9]/g, '')
            : senderNumber.replace(/[^0-9]/g, '');

        // validation
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return reply(
                "❌ *Invalid number!*\n\nExample:\n.smd 923XXXXXXXXX"
            );
        }

        // API request
        const res = await axios.get(
            `https://team-bandaheali.vercel.app/api/connect?number=${encodeURIComponent(phoneNumber)}`
        );

        const data = res.data;

        if (!data || !data.success || !data.code) {
            return reply("⚠️ Pairing code generate nahi ho saka. Dobara try karein.");
        }

        const pairingCode = data.code;

        // styled response
        await reply(
`╭───〔 *SMD-MiNi PAIRING CORE GENERATED* 〕
│
│ 📱 *Number:* ${phoneNumber}
│ 🔑 *Code:* ${pairingCode}
│
╰───────────────`
        );

        // optional resend clean code
        await new Promise(resolve => setTimeout(resolve, 1500));

        await reply(`${pairingCode}`);

    } catch (err) {
        console.error("Pair command error:", err);
        reply("❌ Pairing server se connection fail ho gaya. Baad me try karein.");
    }
});

cmd({
    pattern: "chreact",
    alias: ["channelreact"],
    desc: "React to channel message via API",
    category: "owner",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, isOwner }) => {

try {

if (!isOwner) return reply("❌ Only owner can use this command.");

if (!q) {
return reply(
`❌ Example:

.chreact https://whatsapp.com/channel/0029VbBsIrxInlqRYU6gbE2X/379 🤣,👨‍💻,⏳️`
);
}

// split link + emojis
const args = q.split(" ");
const link = args[0];
const emojis = args.slice(1).join("");

if (!emojis)
return reply("❌ Emojis missing.\nExample: 🤣,🔥,❤️");

// extract invite code + msg id
const match = link.match(/channel\/([A-Za-z0-9]+)\/(\d+)/);

if (!match)
return reply("❌ Invalid channel link.");

const inviteCode = match[1];
const messageId = match[2];

// metadata fetch
const meta = await conn.newsletterMetadata("invite", inviteCode);

if (!meta?.id)
return reply("❌ Newsletter metadata fetch failed.");

const newsletterJid = meta.id;

// fire API call WITHOUT waiting response
axios.get(
`https://team-bandaheali.vercel.app/api/chreact?newsletter=${newsletterJid}&message=${messageId}&emojis=${encodeURIComponent(emojis)}`
).catch(() => {});

// instant success reply
return reply(
`✅ Reactions sent successfully

📡 Channel: ${meta.name || "Unknown"}
🆔 Message: ${messageId}
🎭 Emojis: ${emojis}`
);

} catch (err) {

console.log("CHREACT ERROR:", err?.response?.data || err.message);

reply("❌ Error sending reactions.");

}

});
/*
cmd({
  pattern: "newsletter",
  alias: ["newsletter", "chid"],
  react: "📡",
  desc: "Get WhatsApp Channel newsletter preview",
  category: "tools",
  filename: __filename
}, async (conn, mek, m, {
  from,
  q,
  reply
}) => {
  try {
    if (!q) {
      return reply("❎ WhatsApp channel link do.\n\nExample:\n.newsletter https://whatsapp.com/channel/xxxx");
    }

    const match = q.match(/whatsapp\.com\/channel\/([\w-]+)/);
    if (!match) {
      return reply("⚠️ Invalid channel link.");
    }

    const inviteId = match[1];

    let metadata;
    try {
      metadata = await conn.newsletterMetadata("invite", inviteId);
    } catch {
      return reply("❌ Channel fetch failed.");
    }

    if (!metadata?.id) {
      return reply("❌ Channel not found.");
    }

    // 🔥 ONLY CHANNEL ID (copyable)
    const text =
`${metadata.id}`;

    // preview card (link hidden from text)
    await conn.sendMessage(from, {
      text,
      contextInfo: {
        externalAdReply: {
          title: "WhatsApp Channel",
          body: "View channel newsletter",
          previewType: "PHOTO",
          thumbnailUrl: metadata.preview
            ? `https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg`
            : undefined,
          sourceUrl: `https://whatsapp.com/channel/${inviteId}` // only for preview
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error("Newsletter error:", err);
    reply("⚠️ Unexpected error.");
  }
});
*/

cmd({
  pattern: "sessions",
  alias: ["sess", "serverstats"],
  desc: "Show total running sessions from SMD-MiNi servers",
  category: "info",
  react: "📊",
  filename: __filename
}, async (conn, mek, m, { reply, isDev }) => {

  try {

    if (!isDev) return;

    const res = await axios.get("https://team-bandaheali.vercel.app/api/sessions");
    const data = res.data;

    if (!data || !data.total) {
      return reply("❌ Session data fetch nahi ho saka.");
    }

    let text = `╭───〔 *SMD-MiNi SESSION MONITOR* 〕\n`;
    text += `│\n`;
    text += `│ 🧠 *Total Active Sessions:* ${data.total}\n`;
    text += `│\n`;
    text += `│ 🖥️ *Server Breakdown:*\n`;

    if (data.servers && data.servers.length > 0) {

      data.servers.forEach((srv, i) => {
        text += `│\n│ ${i + 1}. ${srv.name}\n`;
        text += `│    └ Sessions: ${srv.sessions}\n`;
      });

    } else {
      text += `│ No active servers found.\n`;
    }

    text += `│\n╰───────────────`;

    await reply(text);

  } catch (err) {

    console.log("Sessions command error:", err);
    reply("⚠️ Session server se data fetch karne me error aa gaya.");

  }
});
