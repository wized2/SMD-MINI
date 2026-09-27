// ================= CORE MODULES =================
const fs = require("fs");
const fsExtra = require("fs-extra");
const os = require("os");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { exec } = require("child_process");

// ================= EXTERNAL LIBRARIES =================
const axios = require("axios");
const fetch = require("node-fetch");
const FormData = require("form-data");
const yts = require("yt-search");
const webp = require("node-webpmux");

const { Sticker, createSticker, StickerTypes } =
  require("wa-sticker-formatter");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

const googleTTS = require("google-tts-api");

// ================= PROJECT MODULES =================
const { bandah, cmd } = require("../command");
const config = require("../config");
const converter = require("../data/converter");

let downloadContentFromMessage;

async function loadBaileys() {
    const b = await import("@whiskeysockets/baileys");
    downloadContentFromMessage = b.downloadContentFromMessage;  
}
loadBaileys();
//const fs = require("fs");

const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require("../lib/functions");

const {
  fetchGif,
  fetchImage,
  gifToSticker
} = require("../lib/sticker-utils");

const { videoToWebp } = require("../lib/video-utils");

const { audioEditor } = require("../lib/audioEditor");

const {
  googleTTSVoice,
  elevenTTSVoice,
  convertCurrency
} = require("../lib/mediaServices");


//const { uploadFile, getWhatsAppMediaInfo } = require("../lib/uploader");

// CDN Configuration
//const CUSTOM_CDN_URL = "https://TEAM-BANDAHEALI-pair.koyeb.app/quick-upload";
// ==============================
// UTILITY FUNCTIONS
// ==============================

// LID to Phone Number conversion function
async function lidToPhone(conn, lid) {
    try {
        const pn = await conn.signalRepository.lidMapping.getPNForLID(lid);
        if (pn) return cleanPN(pn);
        
        if (lid.includes(':')) {
            return lid.split(':')[1].split('@')[0];
        } else {
            return lid.split('@')[0];
        }
    } catch {
        if (lid.includes(':')) {
            return lid.split(':')[1].split('@')[0];
        } else {
            return lid.split('@')[0];
        }
    }
}

async function downloadMedia(msg) {
    const type = msg.mtype.replace('Message', '');
    const stream = await downloadContentFromMessage(msg.msg, type);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
}

function cleanPN(number) {
    return number.replace(/[^0-9]/g, '');
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload to temporary CDN function


// Fetch YouTube thumbnail
async function fetchThumbnail(query) {
    try {
        const search = await yts(query);
        const video = search.videos.length > 0 ? search.videos[0] : null;
        return video ? video.thumbnail : "https://i.ibb.co/0t9y7jk/music.png";
    } catch {
        return "https://i.ibb.co/0t9y7jk/music.png";
    }
}

// ==============================
// FILE & MEDIA COMMANDS
// ==============================

bandah({
  pattern: "tts",
  desc: "Convert text to speech (Urdu & English auto-detect, WhatsApp playable voice)",
  category: "convert",
  react: "🔊",
  filename: __filename
},
async (conn, mek, m, { from, q, reply, args }) => {
  try {
    if (!q) return reply("❌ Please provide text. Example: `.tts hello` or `.tts ur aap kaise hain`");

    // Detect Urdu or English automatically
    let lang = "en";
    const urduRegex = /[اآءؤئبتثجچحخدذرزسشصضطظعغفقکگلمنوهی]|(kaise|kesay|hain|ap|tum|mera|aap)/i;
    if (urduRegex.test(q) || args[0] === "ur" || args[0] === "urdu") lang = "ur";

    // Generate Google TTS URL
    const ttsUrl = googleTTS.getAudioUrl(q, {
      lang,
      slow: false,
      host: "https://translate.google.com"
    });

    // Download MP3 audio
    const res = await axios.get(ttsUrl, { responseType: "arraybuffer" });
    fs.writeFileSync("./tts_input.mp3", Buffer.from(res.data));

    // Convert MP3 → OGG (Opus format, WhatsApp compatible)
    const outputFile = "./tts_output.ogg";
    await new Promise((resolve, reject) => {
      exec(
        `${ffmpegPath} -y -i ./tts_input.mp3 -ar 48000 -ac 1 -c:a libopus ${outputFile}`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    // Send as WhatsApp voice note
    await conn.sendMessage(from, {
      audio: fs.readFileSync(outputFile),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
    }, { quoted: mek });

    // Cleanup
    fs.unlinkSync("./tts_input.mp3");
    fs.unlinkSync(outputFile);

  } catch (err) {
    console.error(err);
    reply(`⚠️ Error generating voice: ${err.message}`);
  }
});


const ELEVEN_API_KEY = "sk_fc8a25e476f955e779f07dba2af16e24444a1f5ae399baeb";


const VOICES = {
  male: "21m00Tcm4TlvDq8ikWAM", 
  female: "EXAVITQu4vr4xnSDxMaL"
};

bandah({
  pattern: "tts2",
  desc: "Convert text to speech (male/female, WhatsApp playable realistic voice)",
  category: "convert",
  react: "🎤",
  filename: __filename
},
async (conn, mek, m, { from, q, reply, args }) => {
  try {
    if (!q) return reply("❌ Please provide text. Example: `.tts2 male hello` or `.tts2 female aap kaise hain`");

    let gender = "male";
    let text = q;
    if (args[0] && ["male","female"].includes(args[0].toLowerCase())) {
      gender = args[0].toLowerCase();
      text = args.slice(1).join(" ");
      if (!text) return reply("❌ Please provide the text after specifying male/female.");
    }

    const voice_id = VOICES[gender];
    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      { text, voice_settings: { stability: 0.7, similarity_boost: 0.7 } },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer"
      }
    );

    fs.writeFileSync("./tts_input.mp3", Buffer.from(ttsResponse.data));

    const outputFile = "./tts_output.ogg";
    await new Promise((resolve, reject) => {
      exec(
        `${ffmpegPath} -y -i ./tts_input.mp3 -ar 48000 -ac 1 -c:a libopus -b:a 64k ${outputFile}`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    await conn.sendMessage(from, {
      audio: fs.readFileSync(outputFile),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
    }, { quoted: mek });

    fs.unlinkSync("./tts_input.mp3");
    fs.unlinkSync(outputFile);

  } catch (err) {
    console.error(err);
    reply(`⚠️ Error generating voice ${err.message}`);
  }
});

//convercranse
const BASE_URL = "https://v6.exchangerate-api.com/v6";
const API_KEY = "6546c765c816c0f27f37900a";


bandah({
    pattern: "currency",
    react: "💵",
    alias: ["crn"],
    desc: "Convert money from one currency to another currency",
    category: "convert",
    use: ".currency amount fromCurrency toCurrency (e.g: .convert 100 USD EUR)",
    filename: __filename,
}, async (conn, mek, msg, { from, reply, args }) => {
    try {
        if (args.length !== 3) {
            return reply("❌ Invalid format! Use: .currency amount fromCurrency toCurrency\nExample: .convert 100 USD EUR");
        }

        const amount = parseFloat(args[0]);
        const fromCurrency = args[1].toUpperCase();
        const toCurrency = args[2].toUpperCase();

        if (isNaN(amount)) {
            return reply("❌ Please provide a valid amount!");
        }

        const response = await axios.get(`${BASE_URL}/${API_KEY}/latest/${fromCurrency}`);
        
        if (response.data.result === "error") {
            throw new Error(response.data["error-type"]);
        }

        const rates = response.data.conversion_rates;

        if (!rates[toCurrency]) {
            return reply("❌ Invalid target currency code! Please use valid currency codes like USD, EUR, GBP, etc.");
        }

        const convertedAmount = (amount * rates[toCurrency]).toFixed(2);
        const formattedAmount = new Intl.NumberFormat().format(amount);
        const formattedResult = new Intl.NumberFormat().format(convertedAmount);

        const message = `*🌐 TEAM-BANDAHEALI CURRENCY CONVERSION 💵*\n\n` +
            `*💡 From:* ${formattedAmount} ${fromCurrency}\n` +
            `*🏷️ To:* ${formattedResult} ${toCurrency}\n` +
            `*🚦 Rate:* 1 ${fromCurrency} = ${rates[toCurrency]} ${toCurrency}\n\n` +
            `_⏰ Last Updated: ${response.data.time_last_update_utc}_`;

        reply(message);

    } catch (error) {
        console.error("Currency conversion error:", error);
        
        if (error.message === "unsupported-code") {
            reply("❌ Invalid currency code! Please use valid currency codes like USD, EUR, GBP, etc.");
        } else if (error.message === "malformed-request") {
            reply("❌ Invalid API request format. Please try again.");
        } else if (error.message === "invalid-key") {
            reply("❌ API key validation failed. Please contact the administrator.");
        } else if (error.message === "inactive-account") {
            reply("❌ API account is not active. Please contact the administrator.");
        } else if (error.message === "quota-reached") {
            reply("❌ API quota has been reached. Please try again later.");
        } else {
            reply("❌ Failed to convert currency. Please try again later.");
        }
    }
});

bandah({
    pattern: 'sticker2img',
    alias: ['stoimg', 's2i'],
    desc: 'Convert stickers to images',
    category: 'convert',
    react: '🖼️',
    filename: __filename
}, async (client, match, message, { from }) => {

    const quoted = match?.quoted;

    // Validate input
    if (!quoted) {
        return await client.sendMessage(from, {
            text: "✨ *Sticker Converter*\n\nPlease reply to a sticker message.\n\nExample: `.convert` (reply to a sticker)"
        }, { quoted: message });
    }

    if (quoted.mtype !== 'stickerMessage') {
        return await client.sendMessage(from, { 
            text: "❌ Only sticker messages can be converted" 
        }, { quoted: message });
    }

    // Processing message
    await client.sendMessage(from, { 
        text: "🔄 Converting sticker to image..." 
    }, { quoted: message });

    try {
        const stickerBuffer = await quoted.download();
        const imageBuffer = await converter.convertStickerToImage(stickerBuffer);

        // Send final image
        await client.sendMessage(from, {
            image: imageBuffer,
            mimetype: "image/png",
            caption: "> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇᴅɪᴛʜ-ᴍᴅ"
        }, { quoted: message });

    } catch (error) {
        console.error("Sticker conversion error:", error);
        await client.sendMessage(from, { 
            text: "❌ Please try with a different sticker."
        }, { quoted: message });
    }

});

bandah({
    pattern: 'sticker',
    alias: ['take', 'stake'],
    desc: 'Create a sticker from an image or sticker',
    category: 'sticker',
    use: '<reply image>',
    filename: __filename
}, async (client, match, message, { from }) => {

    const quoted = match?.quoted;

    if (!quoted) {
        return await client.sendMessage(from, {
            text: "*📌 Please reply to an image to make a sticker.*"
        }, { quoted: message });
    }

    if (!['imageMessage', 'stickerMessage'].includes(quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "❌ Only images or existing stickers can be converted."
        }, { quoted: message });
    }

    // Sticker pack name
    const pack = config.STICKER_NAME || "SMD-MINI";

    await client.sendMessage(from, {
        text: "🔄 Creating your sticker..."
    }, { quoted: message });

    try {
        const media = await quoted.download();

        const sticker = new Sticker(media, {
            pack: pack,
            author: "SMD-MINI",
            type: StickerTypes.FULL,
            categories: ["🤩", "🔥"],
            id: crypto.randomUUID(),
            quality: 75,
            background: "transparent"
        });

        const buffer = await sticker.toBuffer();

        await client.sendMessage(from, {
            sticker: buffer
        }, { quoted: message });

    } catch (err) {
        console.error("Sticker Error:", err);
        await client.sendMessage(from, {
            text: "❌ Something went wrong while creating the sticker."
        }, { quoted: message });
    }

});


// 🎵 Convert to MP3
bandah({
    pattern: 'tomp3',
    desc: 'Convert video/audio to MP3',
    category: 'converter',
    react: '🎵',
    filename: __filename
}, async (client, match, message, { from }) => {

    if (!match.quoted)
        return client.sendMessage(from, { text: "🔊 *Reply to a video or audio message*" }, { quoted: message });

    if (!['videoMessage', 'audioMessage'].includes(match.quoted.mtype))
        return client.sendMessage(from, { text: "❌ Only video/audio supported" }, { quoted: message });
        
            if (match.quoted.seconds > 400) {
        return await client.sendMessage(from, {
            text: "⏱️ Media too long (max 5 minutes)"
        }, { quoted: message });
    }

    await client.sendMessage(from, { text: "🔄 Converting to MP3..." }, { quoted: message });

    try {
       const buffer = await message.quoted.download();
      //  const buffer = await downloadMedia(match.quoted);
        const ext = match.quoted.mimetype?.includes('video') ? 'mp4' : 'm4a';

        const audio = await converter.toAudio(buffer, ext);

        await client.sendMessage(from, {
            audio,
            mimetype: 'audio/mpeg'
        }, { quoted: message });

    } catch (e) {
        console.error('tomp3 error:', e.message);
        await client.sendMessage(from, { text: "❌ MP3 conversion failed" }, { quoted: message });
    }
});

bandah({
    pattern: 'toptt',
    desc: 'Convert video/audio to voice note',
    category: 'converter',
    react: '🎙️',
    filename: __filename
}, async (client, match, message, { from }) => {

    if (!match.quoted)
        return client.sendMessage(from, { text: "🔊 *Reply to a video or audio message*" }, { quoted: message });

    if (!['videoMessage', 'audioMessage'].includes(match.quoted.mtype))
        return client.sendMessage(from, { text: "❌ Only video/audio supported" }, { quoted: message });

            if (match.quoted.seconds > 400) {
        return await client.sendMessage(from, {
            text: "⏱️ Media too long (max 5 minutes)"
        }, { quoted: message });
    }


    await client.sendMessage(from, { text: "🔄 Converting to voice note..." }, { quoted: message });

    try {
        const buffer = await message.quoted.download();
        //const buffer = await downloadMedia(match.quoted);
        const ext = match.quoted.mimetype?.includes('video') ? 'mp4' : 'm4a';

        const ptt = await converter.toPTT(buffer, ext);

        await client.sendMessage(from, {
            audio: ptt,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: message });

    } catch (e) {
        console.error('toptt error:', e.message);
        await client.sendMessage(from, { text: "❌ Voice note conversion failed" }, { quoted: message });
    }
});



/*
bandah({
    pattern: "attp",
    desc: "Convert text to a GIF sticker.",
    react: "✨",
    category: "others",
    use: ".attp HI",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("*Please provide text!*");

        const gifBuffer = await fetchGif(`https://api-fix.onrender.com/api/maker/attp?text=${encodeURIComponent(args[0])}`);
        const stickerBuffer = await gifToSticker(gifBuffer);

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
    } catch (error) {
        reply(`❌ ${error.message}`);
    }
});
*/


bandah(
  {
    pattern: 'gif',
    alias: ['gsticker', 'g2s', 'gs', 'v2s', 'vs'],
    desc: 'Convert GIF/Video to a sticker.',
    category: 'convert',
    use: '<reply media or URL>',
    filename: __filename,
  },
  async (conn, mek, m, { quoted, args, reply }) => {
    try {
      if (!mek.quoted) {
        return reply('*Reply to a video or GIF to convert it to a sticker!*');
      }

      const mime = mek.quoted.mtype;
      if (!['videoMessage', 'imageMessage'].includes(mime)) {
        return reply('*Please reply to a valid video or GIF.*');
      }

      // 📥 Download media
      const media = await mek.quoted.download();

      // 🔄 Convert to WebP
      const webpBuffer = await videoToWebp(media);

      // 🎨 Create sticker
      const sticker = new Sticker(webpBuffer, {
        pack: 'TEAM-BANDAHEALI',          // ✅ HARD CODED
        author: 'TEAM-BANDAHEALI',        // ✅ OPTIONAL BUT NICE
        type: StickerTypes.FULL,
        categories: ['🤩', '🎉'],
        id: 'SMD-MINI-gif',
        quality: 75,
        background: 'transparent',
      });

      // 📤 Send sticker
      const stickerBuffer = await sticker.toBuffer();
      return conn.sendMessage(
        mek.chat,
        { sticker: stickerBuffer },
        { quoted: mek }
      );

    } catch (error) {
      console.error('[GIF STICKER ERROR]', error);
      reply(`❌ An error occurred: ${error.message}`);
    }
  }
);


const stylishText = (text) => {
    return text
        .replace(/a/g, '𝗔').replace(/b/g, '𝗕').replace(/c/g, '𝗖')
        .replace(/d/g, '𝗗').replace(/e/g, '𝗘').replace(/f/g, '𝗙')
        .replace(/g/g, '𝗚').replace(/h/g, '𝗛').replace(/i/g, '𝗜')
        .replace(/j/g, '𝗝').replace(/k/g, '𝗞').replace(/l/g, '𝗟')
        .replace(/m/g, '𝗠').replace(/n/g, '𝗡').replace(/o/g, '𝗢')
        .replace(/p/g, '𝗣').replace(/q/g, '𝗤').replace(/r/g, '𝗥')
        .replace(/s/g, '𝗦').replace(/t/g, '𝗧').replace(/u/g, '𝗨')
        .replace(/v/g, '𝗩').replace(/w/g, '𝗪').replace(/x/g, '𝗫')
        .replace(/y/g, '𝗬').replace(/z/g, '𝗭')
        .replace(/A/g, '𝗔').replace(/B/g, '𝗕').replace(/C/g, '𝗖')
        .replace(/D/g, '𝗗').replace(/E/g, '𝗘').replace(/F/g, '𝗙')
        .replace(/G/g, '𝗚').replace(/H/g, '𝗛').replace(/I/g, '𝗜')
        .replace(/J/g, '𝗝').replace(/K/g, '𝗞').replace(/L/g, '𝗟')
        .replace(/M/g, '𝗠').replace(/N/g, '𝗡').replace(/O/g, '𝗢')
        .replace(/P/g, '𝗣').replace(/Q/g, '𝗤').replace(/R/g, '𝗥')
        .replace(/S/g, '𝗦').replace(/T/g, '𝗧').replace(/U/g, '𝗨')
        .replace(/V/g, '𝗩').replace(/W/g, '𝗪').replace(/X/g, '𝗫')
        .replace(/Y/g, '𝗬').replace(/Z/g, '𝗭');
};

bandah({
    pattern: "attp",
    desc: "Convert text to a GIF sticker.",
    react: "🪀",
    category: "convert",
    use: ".attp HI",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args.length) return reply("*Please provide text!*");

        const text = args.join(" ");
        const styledText = stylishText(text);

        // API call with proper URL encoding
        const gifBuffer = await fetchGif(`https://api.nexoracle.com/image-creating/attp?apikey=2f9b02060a600d6c88&text=${encodeURIComponent(styledText)}`);
        const stickerBuffer = await gifToSticker(gifBuffer);

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
    } catch (error) {
        reply(`❌ ${error.message}`);
    }
});


// Helper function to handle audio processing
async function processAudioEffect(client, message, effectName, effectDisplayName) {
    const from = message.from;
    
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "*🔊 Reply to an audio/video message*"
        }, { quoted: message });
    }

    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
        const audio = await audioEditor[effectName](buffer, ext);

        await client.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error('Error:', e);
        await client.sendMessage(from, {
            text: `❌ Failed to apply ${effectDisplayName} effect: ${e.message}`
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
}

// ========== ORIGINAL EFFECTS (UPDATED) ==========

bandah({
    pattern: 'deep',
    desc: 'Make audio sound deeper',
    category: 'convert',
    react: '🗣️',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'deep', 'deep');
});

bandah({
    pattern: 'smooth',
    desc: 'Smooth out audio',
    category: 'convert',
    react: '🌀',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'smooth', 'smooth');
});

bandah({
    pattern: 'fat',
    desc: 'Make audio sound fat/bassy',
    category: 'convert',
    react: '🍔',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'fat', 'fat');
});

bandah({
    pattern: 'tupai',
    desc: 'Special tupai effect',
    category: 'convert',
    react: '🐿️',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'tupai', 'tupai');
});

bandah({
    pattern: 'blown',
    desc: 'Make audio sound blown out',
    category: 'convert',
    react: '💥',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'blown', 'blown');
});

bandah({
    pattern: 'radio',
    desc: 'Make audio sound like old radio',
    category: 'convert',
    react: '📻',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'radio', 'radio');
});

bandah({
    pattern: 'robot',
    desc: 'Make audio sound robotic',
    category: 'convert',
    react: '🤖',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'robot', 'robot');
});

bandah({
    pattern: 'chipmunk',
    desc: 'Make audio sound high-pitched',
    category: 'convert',
    react: '🐿️',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'chipmunk', 'chipmunk');
});

bandah({
    pattern: 'nightcore',
    desc: 'Apply nightcore effect',
    category: 'convert',
    react: '🎶',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'nightcore', 'nightcore');
});

bandah({
    pattern: 'earrape',
    desc: 'Max volume (use with caution)',
    category: 'convert',
    react: '📢',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'earrape', 'earrape');
});

bandah({
    pattern: 'bass',
    desc: 'Add heavy bass boost to audio',
    category: 'convert',
    react: '🔊',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'bass', 'bass');
});

bandah({
    pattern: 'reverse',
    desc: 'Reverse audio',
    category: 'convert',
    react: '⏪',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'reverse', 'reverse');
});

bandah({
    pattern: 'slow',
    desc: 'Slow down audio',
    category: 'convert',
    react: '🐌',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'slow', 'slow');
});

bandah({
    pattern: 'fast',
    desc: 'Speed up audio',
    category: 'convert',
    react: '⚡',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'fast', 'fast');
});

bandah({
    pattern: 'baby',
    desc: 'Make audio sound like a baby',
    category: 'convert',
    react: '👶',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'baby', 'baby');
});

bandah({
    pattern: 'demon',
    desc: 'Make audio sound demonic',
    category: 'convert',
    react: '👹',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'demon', 'demon');
});

// ========== NEW ENHANCED EFFECTS ==========

bandah({
    pattern: 'echo',
    desc: 'Add echo effect to audio',
    category: 'convert',
    react: '📢',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'echo', 'echo');
});

bandah({
    pattern: 'reverb',
    desc: 'Add reverb effect to audio',
    category: 'convert',
    react: '🏛️',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'reverb', 'reverb');
});

bandah({
    pattern: 'flanger',
    desc: 'Add flanger effect to audio',
    category: 'convert',
    react: '🎛️',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'flanger', 'flanger');
});

bandah({
    pattern: 'vibrato',
    desc: 'Add vibrato effect to audio',
    category: 'convert',
    react: '🎵',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'vibrato', 'vibrato');
});

bandah({
    pattern: 'telephone',
    desc: 'Make audio sound like telephone',
    category: 'convert',
    react: '📞',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'telephone', 'telephone');
});

bandah({
    pattern: 'chorus',
    desc: 'Add chorus effect to audio',
    category: 'convert',
    react: '👥',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'chorus', 'chorus');
});

bandah({
    pattern: 'phaser',
    desc: 'Add phaser effect to audio',
    category: 'convert',
    react: '🌊',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'phaser', 'phaser');
});

// ========== UTILITY EFFECTS ==========

bandah({
    pattern: 'normalize',
    desc: 'Normalize audio volume',
    category: 'convert',
    react: '⚖️',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'normalize', 'normalize');
});

bandah({
    pattern: 'fade',
    desc: 'Add fade in/out effect to audio',
    category: 'convert',
    react: '🎭',
    filename: __filename
}, async (client, match, message) => {
    await processAudioEffect(client, message, 'fade', 'fade');
});

// ========== ADVANCED FEATURES ==========

bandah({
    pattern: 'batch',
    desc: 'Apply multiple effects sequentially\nUsage: .batch effect1,effect2,effect3',
    category: 'convert',
    react: '🔄',
    filename: __filename
}, async (client, match, message, { from }) => {
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "*🔊 Reply to an audio/video message*"
        }, { quoted: message });
    }

    const effects = match ? match.split(',').map(e => e.trim().toLowerCase()) : [];
    
    if (effects.length === 0) {
        return await client.sendMessage(from, {
            text: `*🎛️ Usage: .batch effect1,effect2,effect3*\n\n*Available effects:*\n${audioEditor.getAvailableEffects().join(', ')}\n\n*Example:* .batch bass,echo,reverb`
        }, { quoted: message });
    }

    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
        
        const audio = await audioEditor.processBatch(buffer, ext, effects);

        await client.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: message });
        
        await client.sendMessage(from, { 
            text: `✅ Successfully applied: ${effects.join(' → ')}`
        }, { quoted: message });
        
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error('Error:', e);
        await client.sendMessage(from, {
            text: `❌ Batch processing failed: ${e.message}`
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
});

bandah({
    pattern: 'preset',
    desc: 'Apply preset audio configuration\nAvailable: radio, professional, podcast',
    category: 'convert',
    react: '🎚️',
    filename: __filename
}, async (client, match, message, { from }) => {
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "*🔊 Reply to an audio/video message*"
        }, { quoted: message });
    }

    const presetName = match ? match.trim().toLowerCase() : '';
    const availablePresets = audioEditor.getAvailablePresets();
    
    if (!presetName || !availablePresets.includes(presetName)) {
        return await client.sendMessage(from, {
            text: `*🎚️ Available Presets:*\n${availablePresets.map(p => `• ${p}`).join('\n')}\n\n*Usage:* .preset ${availablePresets[0]}`
        }, { quoted: message });
    }

    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
        const audio = await audioEditor.applyPreset(buffer, ext, presetName);

        await client.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error('Error:', e);
        await client.sendMessage(from, {
            text: `❌ Failed to apply ${presetName} preset: ${e.message}`
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
});

bandah({
    pattern: 'audioinfo',
    desc: 'Get information about audio file',
    category: 'convert',
    react: 'ℹ️',
    filename: __filename
}, async (client, match, message, { from }) => {
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "*🔊 Reply to an audio/video message*"
        }, { quoted: message });
    }

    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
        const info = await audioEditor.getAudioInfo(buffer, ext);

        const stream = info.streams?.[0];
        const format = info.format;
        
        let infoText = `*🎵 Audio Information*\n\n`;
        infoText += `*Duration:* ${format.duration ? Math.round(parseFloat(format.duration)) + 's' : 'Unknown'}\n`;
        infoText += `*Size:* ${(format.size / 1024 / 1024).toFixed(2)} MB\n`;
        infoText += `*Format:* ${format.format_name || 'Unknown'}\n`;
        
        if (stream) {
            infoText += `*Codec:* ${stream.codec_name || 'Unknown'}\n`;
            infoText += `*Sample Rate:* ${stream.sample_rate ? stream.sample_rate + ' Hz' : 'Unknown'}\n`;
            infoText += `*Channels:* ${stream.channels || 'Unknown'}\n`;
            infoText += `*Bitrate:* ${stream.bit_rate ? Math.round(parseInt(stream.bit_rate) / 1000) + ' kbps' : 'Unknown'}\n`;
        }

        await client.sendMessage(from, {
            text: infoText
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error('Error:', e);
        await client.sendMessage(from, {
            text: "❌ Failed to get audio information"
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
});

bandah({
    pattern: 'audioeffects',
    desc: 'Show all available audio effects',
    category: 'convert',
    react: '🎛️',
    filename: __filename
}, async (client, match, message, { from }) => {
    const effects = audioEditor.getAvailableEffects();
    const presets = audioEditor.getAvailablePresets();
    
    let text = `*🎛️ Available Audio Effects*\n\n`;
    text += `*Basic Effects (${effects.length}):*\n`;
    text += `┌ ${effects.slice(0, 9).join(', ')}\n`;
    text += `├ ${effects.slice(9, 18).join(', ')}\n`;
    text += `└ ${effects.slice(18).join(', ')}\n\n`;
    
    text += `*Presets:*\n`;
    text += `└ ${presets.join(', ')}\n\n`;
    
    text += `*Usage:*\n`;
    text += `• Reply to audio with .effectname\n`;
    text += `• Apply multiple: .batch bass,echo,reverb\n`;
    text += `• Use preset: .preset radio`;

    await client.sendMessage(from, {
        text: text
    }, { quoted: message });
});

// ========== AUDIO CONVERSION ==========

bandah({
    pattern: 'convert',
    desc: 'Convert audio to different format\nUsage: .convert mp3 (or wav, ogg, m4a)',
    category: 'convert',
    react: '🔄',
    filename: __filename
}, async (client, match, message, { from }) => {
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "*🔊 Reply to an audio/video message*"
        }, { quoted: message });
    }

    const targetFormat = match ? match.trim().toLowerCase() : 'mp3';
    const supportedFormats = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
    
    if (!supportedFormats.includes(targetFormat)) {
        return await client.sendMessage(from, {
            text: `*❌ Unsupported format*\n\n*Supported formats:* ${supportedFormats.join(', ')}\n\n*Usage:* .convert mp3`
        }, { quoted: message });
    }

    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
        const audio = await audioEditor.convertFormat(buffer, ext, targetFormat);

        const mimetypes = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'm4a': 'audio/mp4',
            'aac': 'audio/aac'
        };

        await client.sendMessage(from, {
            audio: audio,
            mimetype: mimetypes[targetFormat] || 'audio/mpeg'
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error('Error:', e);
        await client.sendMessage(from, {
            text: `❌ Failed to convert to ${targetFormat}: ${e.message}`
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
});

bandah({
    pattern: 'trim',
    desc: 'Trim audio\nUsage: .trim start duration (in seconds)',
    category: 'convert',
    react: '✂️',
    filename: __filename
}, async (client, match, message, { from }) => {
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "*🔊 Reply to an audio/video message*"
        }, { quoted: message });
    }

    const args = match ? match.split(' ') : [];
    const startTime = parseInt(args[0]) || 0;
    const duration = parseInt(args[1]) || 30;

    if (startTime < 0 || duration <= 0) {
        return await client.sendMessage(from, {
            text: "*❌ Invalid time parameters*\n\n*Usage:* .trim start duration\n*Example:* .trim 10 30 (starts at 10s, 30s duration)"
        }, { quoted: message });
    }

    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
        const audio = await audioEditor.trimAudio(buffer, ext, startTime, duration);

        await client.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: message });
        
        await client.sendMessage(from, {
            text: `✅ Trimmed audio: ${startTime}s to ${startTime + duration}s`
        }, { quoted: message });
        
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error('Error:', e);
        await client.sendMessage(from, {
            text: `❌ Failed to trim audio: ${e.message}`
        }, { quoted: message });
        await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
});

bandah({
  pattern: "url2",
  alias: ["catbox", "catboxurl", "upload2"],
  react: "🖇",
  desc: "Upload media to Catbox",
  category: "convert",
  use: ".url2 (reply to media)",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";

    if (!mime) return reply("❌ Reply to an image/video/audio file!");

    // Reaction start
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // Download media
    const buffer = await quoted.download();
    if (!buffer) throw "Failed to download media.";

    // Auto extension
    let ext = ".bin";
    if (mime.includes("image/jpeg")) ext = ".jpg";
    else if (mime.includes("image/png")) ext = ".png";
    else if (mime.includes("video")) ext = ".mp4";
    else if (mime.includes("audio/mpeg")) ext = ".mp3";
    else if (mime.includes("audio")) ext = ".ogg";

    const fileName = `catbox_${Date.now()}${ext}`;
    const tempPath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tempPath, buffer);

    // Create form for Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempPath));

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    fs.unlinkSync(tempPath);

    if (!res.data || !res.data.startsWith("https://")) {
      throw "Catbox upload failed!";
    }

    const url = res.data;

    // Detect media type name
    let type = "File";
    if (mime.includes("image")) type = "Image";
    else if (mime.includes("video")) type = "Video";
    else if (mime.includes("audio")) type = "Audio";

    // Success reaction
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    await reply(
      `*${type} Uploaded to Catbox!* 🐱📤\n\n` +
      `📁 *Name:* ${fileName}\n` +
      `📏 *Size:* ${formatBytes(buffer.length)}\n` +
      `🔗 *URL:* ${url}\n\n` +
      `> Powered by TEAM-BANDAHEALI`
    );

  } catch (err) {
    console.error("CATBOX ERROR:", err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    reply(`❌ Error: ${err.message || err}`);
  }
});

bandah({
  pattern: "url",
  alias: ["imageurl", "imgurl", "cdnurl"],
  react: "🖇",
  desc: "Convert media to direct CDN URL",
  category: "convert",
  use: ".url (reply to media)",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";

    if (!mime) {
      return reply("❌ Reply to *image/video/audio* to upload!");
    }

    // Start reaction
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // Download media
    const mediaBuffer = await quoted.download();
    if (!mediaBuffer) throw new Error("Failed to download media.");

    // Detect extension
    let extension = "";
    if (mime.includes("image/jpeg")) extension = ".jpg";
    else if (mime.includes("image/png")) extension = ".png";
    else if (mime.includes("video")) extension = ".mp4";
    else if (mime.includes("audio")) extension = ".mp3";
    else extension = ".bin"; // fallback

    const timestamp = Date.now();
    const fileName = `uploaded_${timestamp}${extension}`;

    // Create temp file
    const tempFilePath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Create FormData
    const form = new FormData();
    form.append("file", fs.createReadStream(tempFilePath), fileName);

    // Upload to private CDN
    const uploadUrl = `https://bandaheali-cdn.koyeb.app/quick-upload`;

    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      timeout: 30000
    });

    // Remove temp file
    fs.unlinkSync(tempFilePath);

    if (!response.data.success || !response.data.url) {
      throw new Error(response.data.error || "Upload failed");
    }

    const url = response.data.url;

    // Determine type label
    let mediaType = "File";
    if (mime.includes("image")) mediaType = "Image";
    else if (mime.includes("video")) mediaType = "Video";
    else if (mime.includes("audio")) mediaType = "Audio";

    // Send success reaction
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    // Final reply
    await reply(
      `*${mediaType} Uploaded Successfully!*\n\n` +
      `📁 *Name:* ${fileName}\n` +
      `📏 *Size:* ${formatBytes(mediaBuffer.length)}\n` +
      `🔗 *CDN URL:* ${url}\n\n` +
      `> 🚀 Powered by ${config.BOT_NAME}`
    );

  } catch (error) {
    console.error("URL2 ERROR:", error);

    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });

    await reply(`❌ Upload Failed: ${error.message || error}`);
  }
});

async function uploadToCatbox(filePath) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fs.createReadStream(filePath));

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form
  });

  if (!res.ok) throw new Error(`Catbox upload failed: ${res.status}`);
  return await res.text();
}

/**
 * Fetch YouTube thumbnail for given query
 */
async function fetchThumbnail(query) {
  try {
    const search = await yts(query);
    const video = search.videos.length > 0 ? search.videos[0] : null;
    return video ? video.thumbnail : "https://i.ibb.co/0t9y7jk/music.png";
  } catch {
    return "https://i.ibb.co/0t9y7jk/music.png";
  }
}

// ────────────────────────────────
// Command Definition
// ────────────────────────────────
bandah({
  pattern: "whatmusic",
  alias: ["whatsong"],
  react: "🎵",
  desc: "Identify a song from audio/voice message",
  category: "tools",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  let tempFile = null;

  try {
    // React: processing
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    // Get quoted or main message
    const target = m.quoted ? m.quoted : m;
    const mime = (target.msg || target).mimetype || "";

    if (!mime.includes("audio")) {
      return reply("⚠️ Reply to an *audio/voice message* with `.whatmusic`");
    }

    // Download audio
    const audioBuffer = await target.download();
    if (!audioBuffer || audioBuffer.length === 0) {
      return reply("❌ Failed to download audio.");
    }

    // Save temp file properly
    tempFile = path.join(__dirname, "../tmp/", `${Date.now()}.mp3`);
    fs.mkdirSync(path.dirname(tempFile), { recursive: true });
    fs.writeFileSync(tempFile, audioBuffer);

    // Upload to Catbox
    const fileUrl = await uploadToCatbox(tempFile);

    // Call NEW API
    const apiUrl = `https://api.zenzxz.my.id/tools/whatmusic?url=${encodeURIComponent(fileUrl)}`;
    const apiRes = await fetch(apiUrl);

    if (!apiRes.ok) return reply(`❌ API Error: ${apiRes.status}`);

    const json = await apiRes.json();

    if (!json.success || !json.data?.title) {
      return reply("❌ Song could not be recognized.");
    }

    const title = json.data.title;
    const artists = json.data.artists;

    // Try to fetch thumbnail
    const thumbnail = await fetchThumbnail(`${title} ${artists}`);

    // Send result
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: `
╔══ 🎶 *WHAT MUSIC?* 🎶 ══╗

🎼 *Title:*  ${title}
🎤 *Artist:* ${artists}

🔗 *Audio Source:*  
${fileUrl}

✨ Powered by *SMD-MINI* ⚡
╚════════════════════════════╝
`
    }, { quoted: mek });

    // React success
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (err) {
    console.error("WHATMUSIC ERROR:", err);
    reply(`❌ Error: ${err.message || err}`);

    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });

  } finally {
    if (tempFile) {
      try { fs.unlinkSync(tempFile); } catch {}
    }
  }
});

// ==============================
// TEXT & URL COMMANDS
// ==============================

// 🔗 Shorten URL
bandah({
    pattern: "shorten",
    alias: ["shorturl", "urlshort"],
    react: "🔗",
    desc: "Shorten long URLs",
    category: "tools",
    use: ".shorten <url>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a URL to shorten\nExample: .shorten https://example.com/very-long-url");

        // Remove any protocol prefixes for validation
        let url = q.trim();
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return reply("❌ Invalid URL format. Please provide a valid URL.");
        }

        await reply("⏳ Shortening URL...");

        // Use TinyURL API
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        
        if (response.data && response.data.startsWith('https://tinyurl.com/')) {
            await reply(`✅ *URL Shortened Successfully!*\n\n🔗 *Original:* ${url}\n\n🔗 *Shortened:* ${response.data}\n\n_Powered by TinyURL_`);
        } else {
            throw new Error('Shortening failed');
        }

    } catch (error) {
        console.error("URL Shorten Error:", error);
        reply("❌ Failed to shorten URL. Please try again with a different URL.");
    }
});

// 📝 Base64 Encode
bandah({
    pattern: "base64",
    alias: ["b64encode"],
    react: "📝",
    desc: "Encode text to Base64",
    category: "tools",
    use: ".base64 <text> or reply to message",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, quoted }) => {
    try {
        const input = q || (quoted && quoted.text);
        
        if (!input) {
            return reply("❌ Please provide text to encode or reply to a message\nExample: .base64 hello world");
        }

        const encoded = Buffer.from(input).toString('base64');
        
        await reply(`✅ *Base64 Encoded*\n\n*Input:* ${input}\n\n*Encoded:*\n\`\`\`${encoded}\`\`\``);

    } catch (error) {
        console.error("Base64 Encode Error:", error);
        reply("❌ Failed to encode text to Base64.");
    }
});

// 📝 Base64 Decode
bandah({
    pattern: "unbase64",
    alias: ["b64decode", "decode64"],
    react: "📝",
    desc: "Decode Base64 text",
    category: "tools",
    use: ".unbase64 <base64 text> or reply to message",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, quoted }) => {
    try {
        const input = q || (quoted && quoted.text);
        
        if (!input) {
            return reply("❌ Please provide Base64 text to decode or reply to a message\nExample: .unbase64 aGVsbG8gd29ybGQ=");
        }

        // Validate if it's proper base64
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(input)) {
            return reply("❌ Invalid Base64 format. Please provide valid Base64 encoded text.");
        }

        const decoded = Buffer.from(input, 'base64').toString('utf8');
        
        await reply(`✅ *Base64 Decoded*\n\n*Input:* ${input}\n\n*Decoded:*\n\`\`\`${decoded}\`\`\``);

    } catch (error) {
        console.error("Base64 Decode Error:", error);
        reply("❌ Failed to decode Base64 text. Please check if the input is valid Base64.");
    }
});

// 📦 GZIP Compress
bandah({
    pattern: "gzip",
    desc: "Compress text using Gzip",
    category: "tools",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { q, reply, quoted }) => {
    try {
        const input = q || (quoted && quoted.text);
        if (!input) return reply("⚠️ Reply to some text or provide text to compress!");

        const compressed = zlib.gzipSync(input);
        const base64 = compressed.toString("base64");

        return reply("✅ *Gzip Compressed (Base64 Encoded):*\n```" + base64 + "```");
    } catch (e) {
        return reply("❌ Error: " + e.message);
    }
});

// 📂 GUNZIP Decompress
bandah({
    pattern: "gunzip",
    desc: "Decompress Gzip text (Base64 Encoded)",
    category: "tools",
    react: "📂",
    filename: __filename
}, async (conn, mek, m, { q, reply, quoted }) => {
    try {
        const input = q || (quoted && quoted.text);
        if (!input) return reply("⚠️ Reply to compressed base64 gzip text!");

        const buffer = Buffer.from(input, "base64");
        const decompressed = zlib.gunzipSync(buffer).toString();

        return reply("✅ *Gunzip Decompressed Data:*\n```" + decompressed + "```");
    } catch (e) {
        return reply("❌ Failed to decompress! " + e.message);
    }
});

// ==============================
// INFORMATION COMMANDS
// ==============================

// 📦 NPM Package Info
bandah({
    pattern: "npm",
    alias: ["npmpkg", "npminfo"],
    desc: "Get NPM package info",
    category: "tools",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("⚡ Please provide a package name!\nExample: .npm axios");

        let url = `https://registry.npmjs.org/${encodeURIComponent(q)}`;
        let { data } = await axios.get(url);

        let latestVersion = data["dist-tags"]?.latest || "unknown";
        let pkgInfo = data.versions[latestVersion] || {};

        let response = `📦 *NPM Package Info*\n\n🔹 *Name:* ${data.name}\n🔹 *Latest Version:* ${latestVersion}\n🔹 *Author:* ${pkgInfo.author?.name || "Unknown"}\n🔹 *Homepage:* ${pkgInfo.homepage || "N/A"}\n\n⚡ Powered by ${config.BOT_NAME}`;

        await reply(response);

    } catch (e) {
        console.error("NPM Command Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// 🎶 iTunes Music Info
bandah({
    pattern: "itunes",
    alias: ["musicinfo"],
    desc: "Search music info from iTunes",
    category: "tools",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❗ *Please enter song name*\nExample: .itunes Alone Alan Walker");

        let res = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(`API request failed with status ${res.status}`);

        let json = await res.json();
        if (!json || !json.name) return reply("❌ Song not found. Try another name.");

        let songInfo = `*🎵 Song Information*\n\n• *Name:* ${json.name}\n• *Artist:* ${json.artist}\n• *Album:* ${json.album}\n• *Release Date:* ${json.release_date}\n• *Price:* ${json.price} 💲\n• *Length:* ${json.length} ⏳\n• *Genre:* ${json.genre}`;

        await conn.sendMessage(from, {
            image: { url: json.thumbnail },
            caption: songInfo,
            contextInfo: {
                externalAdReply: {
                    title: `${config.BOT_NAME}`,
                    body: `${json.name} – ${json.artist}`,
                    thumbnailUrl: json.thumbnail,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: json.url
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("⚠ Error fetching iTunes info.");
    }
});

// ==============================
// OTHER UTILITY COMMANDS
// ==============================

// 📧 Temporary Email
bandah({
    pattern: "tempmail",
    desc: "Generate a temporary email address",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const API_KEY = "prince";
        const res = await axios.get(`https://api.princetechn.com/api/tempmail/generate?apikey=${API_KEY}`);
        const data = res.data;

        if (!data.success) return reply("❌ Failed to generate temp mail.");

        const email = data.result.email;
        const msg = `📧 *Temporary Email Generated*\n\n✉️ Email: \`${email}\`\n\n⏳ Auto expires in 10 minutes!\n\n> ⚡ Powered by ${config.BOT_NAME}`;

        await reply(msg);

    } catch (e) {
        console.error("TempMail Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// 📬 Check Email Inbox
bandah({
    pattern: "checkmail",
    desc: "Check inbox of a temporary email",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const email = q || "";
        if (!email) return reply("❌ Please provide the temp email.\nExample: `.checkmail example@tempmail.com`");

        const API_KEY = "prince";
        const res = await axios.get(`https://api.princetechn.com/api/tempmail/inbox?apikey=${API_KEY}&email=${encodeURIComponent(email)}`);
        const data = res.data;

        if (!data.success) return reply("❌ Failed to fetch inbox.");

        let msg = "";
        if (data.message) {
            msg = `📬 *Inbox Status*\n\n${data.message}\n\n> ⚡ Powered by ${config.BOT_NAME}`;
        } else if (data.result && data.result.length > 0) {
            msg = `📩 *Inbox Messages*:\n\n`;
            data.result.forEach((mail, i) => {
                msg += `💌 *${i + 1}.* From: ${mail.from}\n📌 Subject: ${mail.subject}\n📅 Date: ${mail.date}\n\n`;
            });
            msg += `> ⚡ Powered by ${config.BOT_NAME}`;
        } else {
            msg = "📭 No emails found yet.";
        }

        await reply(msg);

    } catch (e) {
        console.error("CheckMail Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// 🌐 Website Screenshot
bandah({
    pattern: "screenshot",
    react: "🌐",
    alias: ["ss", "ssweb"],
    desc: "Capture a full-page screenshot of a website",
    category: "tools",
    use: ".screenshot <url>",
    filename: __filename,
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const url = q;
        if (!url) return reply("❌ Please provide a URL\nExample: .screenshot https://google.com");
        if (!url.startsWith("http")) return reply("❌ URL must start with http:// or https://");

        const loadingMsg = await reply("🔄 Starting screenshot capture...\n✦ Please wait...");

        await sleep(2000);

        await conn.sendMessage(from, {
            image: { url: `https://image.thum.io/get/fullpage/${url}` },
            caption: "- 🖼️ *Screenshot Generated*\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇᴅɪᴛʜ-ᴍᴅ 🔮"
        }, { quoted: m });

    } catch (error) {
        console.error("Error:", error);
        reply("❌ Failed to capture screenshot\n✦ Please try again later");
    }
});


bandah({
    pattern: "fetch",
    alias: ["get", "urlfetch", "axios"],
    desc: "Fetch any public URL using axios and return the response data.",
    category: "tools",
    react: "🌐",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a URL.\nExample: `.fetch https://api.github.com`");

        // Basic URL fix
        let url = q.trim();
        if (!url.startsWith("http")) url = "https://" + url;

        // 🟦 React: Processing
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Axios call
        const res = await axios.get(url, { validateStatus: () => true });

        const type = typeof res.data;

        // JSON Output
        if (type === "object") {
            return reply(
                "📘 **JSON Response:**\n\n```json\n" +
                JSON.stringify(res.data, null, 2) +
                "\n```"
            );
        }

        // Text Response
        if (type === "string") {
            if (res.data.length > 3500)
                return reply("⚠️ Response too large to send here.");

            return reply(
                "📄 **Text Response:**\n\n" +
                res.data
            );
        }

        // Unsupported data
        return reply("❌ Unsupported content type (probably binary/media).");

    } catch (err) {
        console.error(err);

        return reply("❌ Unable to fetch URL.\nPlease check the link or try again later.");
    }
});


bandah({
  pattern: "imei",
  alias: ["imeiinfo", "imei-check"],
  desc: "Check mobile details by IMEI number.",
  react: "📱",
  category: "tools",
  use: ".imei <IMEI_Number>",
  filename: __filename
}, async (conn, m, store, { q, reply }) => {
  try {
    if (!q) return reply("📟 Please provide a valid IMEI number.\nExample: *.imei 357609264XXXXXX*");

    // Fetch data from API
    const response = await axios.get(`https://api.nekolabs.my.id/tools/imei-info?imei=${q}`);
    const data = response.data;

    if (!data.status || !data.result || !data.result.result) {
      return reply("❌ Unable to fetch IMEI info. Please check the IMEI number.");
    }

    const info = data.result.result;
    const header = info.header;
    const items = info.items;

    // Format IMEI details
    let msg = `📱 *EDITH IMEI DEVICE Information 🛜*\n\n`;
    msg += `*Brand:* ${header.brand}\n`;
    msg += `*Model:* ${header.model}\n`;
    msg += `*IMEI:* ${header.imei}\n\n`;

    // Loop through sections
    let currentSection = "";
    for (let item of items) {
      if (item.role === "header") {
        currentSection = `\n🔹 *${item.title.toUpperCase()}*\n`;
        msg += currentSection;
      } else if (item.role === "item") {
        msg += `• *${item.title.trim()}* : ${item.content}\n`;
      } else if (item.role === "button") {
        msg += `🔗 *${item.title}* → ${item.content}\n`;
      } else if (item.role === "group") {
        for (let sub of item.items) {
          msg += `➡️ *${sub.title}* → ${sub.content}\n`;
        }
      }
    }

    // Add last section link
    msg += `\n🌐 *Full Specs:* ${items.find(i => i.title === "Full device specification")?.content || 'N/A'}`;

    // Send result with image
    await conn.sendMessage(m.chat, {
      image: { url: header.photo },
      caption: msg
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply("❌ Error fetching IMEI info. Please try again later.");
  }
});


bandah({
    pattern: "proxy",
    desc: "Get random proxy server",
    category: "tools",
    react: "🌐",
    filename: __filename
}, async (conn, m, { reply }) => {
    try {
        // ⏳ Reaction
        await conn.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        })

        const { data } = await axios.get(
            'https://zelapioffciall.koyeb.app/random/proxy',
            { timeout: 15000 }
        )

        if (!data || !data.status || !data.proxy) {
            return reply('❌ *Invalid API response*')
        }

        const p = data.proxy

        const msg = `
✅ *PROXY FOUND SUCCESSFULLY! SMD*

📍 *IP Address:* ${p.ip}
🚪 *Port:* ${p.port}
🌍 *Country:* ${p.country || '-'}
🏢 *Organization:* ${p.org || '-'}
⚡ *Latency:* ${p.latency || '-'} ms
🕵️ *Anonymity:* ${p.anonymity || '-'}
🔗 *Full Address:* ${p.full}
        `.trim()

        await reply(msg)

    } catch (err) {
        console.error(err)
        reply(`❌ *Failed to fetch proxy*\n\n${err.message}`)
    } finally {
        // remove reaction
        await conn.sendMessage(m.chat, {
            react: { text: '', key: m.key }
        })
    }
})



/* ===================== TRANSLATE ===================== */

bandah({
  pattern: "translate",
  alias: ["tr", "tl"],
  react: "🌐",
  desc: "Translate text (language at end)",
  category: "tools",
  filename: __filename
},
async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) {
      return reply(
        "❌ Usage:\n" +
        ".tr Hello world ur\n" +
        ".tr I love you arabic"
      );
    }

    const parts = q.trim().split(" ");
    const lang = parts.pop().toLowerCase();
    const text = parts.join(" ");

    if (!text) return reply("⚠️ Text missing.");

    const url = `https://api.popcat.xyz/v2/translate?to=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(url);

    if (!data?.message?.translated) {
      return reply("❌ Translation failed.");
    }

    const msg = `
🌐 *Language:* ${lang.toUpperCase()}

📖 *Original:*
${text}

🔁 *Translated:*
${data.message.translated}

✨ SMD-MINI
`;

    reply(msg.trim());

  } catch (e) {
    console.error("[TRANSLATE CMD ERROR]", e.message);
    reply("❌ Translation error.");
  }
});

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
            ? `https://pps.whatsapp.net${metadata.preview}`
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
