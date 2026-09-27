// plugins/tools.js - CJS Version
const { cmd } = require('../command.js');
const config = require('../config.js');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require('path');
//const { getUserConfigFromMongoDB } = require("../lib/database");

// Helper function to upload to Uguu
async function uploadToUguu(buffer, mimeType) {
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('image/gif')) extension = '.gif';
    else if (mimeType.includes('image/webp')) extension = '.webp';
    else extension = '.jpg';

    const tempFilePath = path.join(os.tmpdir(), `temp_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, buffer);

    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFilePath), `image${extension}`);

    try {
        const uploadResponse = await axios.post("https://uguu.se/upload.php", form, {
            headers: form.getHeaders()
        });

        const imageUrl = uploadResponse.data.files?.[0]?.url;
        fs.unlinkSync(tempFilePath);

        if (!imageUrl) throw "Failed to upload image to Uguu";
        return imageUrl;
    } catch (error) {
        fs.unlinkSync(tempFilePath);
        throw error;
    }
}

// Helper function for image processing commands
async function processImageCommand(conn, mek, m, from, reply, resolusi, commandName, emoji) {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        
        if (!/image/.test(mime)) {
            return reply(
                `╭━━━❰ *⚠️ ERROR* ❱━━━╮\n` +
                `┃ 📸 *Please reply to an image*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        
        const apiUrl = `https://api.nexray.web.id/tools/upscale?url=${encodedUrl}&resolusi=${resolusi}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        
        await conn.sendMessage(from, { 
            image: Buffer.from(response.data), 
            caption: 
                `╭━━━❰ *✅ SUCCESS* ❱━━━╮\n` +
                `┃ 🖼️ *${commandName}*\n` +
                `┃ 📊 *Resolution:* ${resolusi}\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯\n` +
                `✨ *${config.BOT_NAME}*`
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        reply(`╭━━━❰ *❌ ERROR* ❱━━━╮\n┃ ${e.message}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`);
    }
}

// Generic image processing helper
async function processGenericImage(conn, mek, m, from, reply, endpoint, commandName, emoji) {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        
        if (!/image/.test(mime)) {
            return reply(
                `╭━━━❰ *⚠️ ERROR* ❱━━━╮\n` +
                `┃ 📸 *Please reply to an image*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        
        const apiUrl = `https://api.nexray.web.id/tools/${endpoint}?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        
        await conn.sendMessage(from, { 
            image: Buffer.from(response.data), 
            caption: 
                `╭━━━❰ *✅ SUCCESS* ❱━━━╮\n` +
                `┃ 🖼️ *${commandName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯\n` +
                `✨ *${config.BOT_NAME}*`
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        reply(`╭━━━❰ *❌ ERROR* ❱━━━╮\n┃ ${e.message}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`);
    }
}

// ==================== UPSCALE COMMANDS (1-16) ====================
for (let i = 1; i <= 16; i++) {
    cmd({
        pattern: `upscale${i}`,
        alias: [`hd${i}`],
        desc: `Upscale image with resolution ${i}`,
        category: "tools",
        react: "🔼",
        filename: __filename,
    }, async (conn, mek, m, { from, reply }) => {
        await processImageCommand(conn, mek, m, from, reply, i, "Image Upscaled", "🔼");
    });
}

// ==================== UNBLUR COMMAND ====================
cmd({
    pattern: "unblur",
    alias: ["sharpen", "deblur"],
    desc: "Remove blur from image",
    category: "tools",
    react: "✨",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processGenericImage(conn, mek, m, from, reply, "unblur", "Image Unblurred", "✨");
});

// ==================== BLUR COMMAND ====================
cmd({
    pattern: "blurface",
    alias: ["blur"],
    desc: "Apply blur effect to image",
    category: "tools",
    react: "🌫️",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processGenericImage(conn, mek, m, from, reply, "blurface", "Blur Effect Applied", "🌫️");
});

// ==================== REMOVE BG COMMANDS ====================
cmd({
    pattern: "removebg",
    alias: ["nobg1", "rmbg1", "nobg"],
    desc: "Remove background from image (v1)",
    category: "tools",
    react: "🎨",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processGenericImage(conn, mek, m, from, reply, "removebg", "Background Removed", "🎨");
});

cmd({
    pattern: "removebg2",
    alias: ["nobg2", "rmbg2"],
    desc: "Remove background from image (v2)",
    category: "tools",
    react: "🎨",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processGenericImage(conn, mek, m, from, reply, "v1/removebg", "Background Removed v2", "🎨");
});

// ==================== REMINI COMMAND ====================
cmd({
    pattern: "remini",
    alias: ["hdremini", "enhancehd"],
    desc: "Enhance image quality using Remini",
    category: "tools",
    react: "🌟",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processGenericImage(conn, mek, m, from, reply, "remini", "Remini Enhanced", "🌟");
});

// ==================== ENHANCE COMMANDS ====================
const enhanceResolutions = [1, 4, 8, 16];
for (const res of enhanceResolutions) {
    cmd({
        pattern: `enhance${res}`,
        alias: [`enh${res}`],
        desc: `Enhance image with resolution ${res}`,
        category: "tools",
        react: "🔆",
        filename: __filename,
    }, async (conn, mek, m, { from, reply }) => {
        try {
            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || '';
            
            if (!/image/.test(mime)) {
                return reply(
                    `╭━━━❰ *⚠️ ERROR* ❱━━━╮\n` +
                    `┃ 📸 *Please reply to an image*\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━╯`
                );
            }
            
            await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
            
            const mediaBuffer = await q.download();
            const imageUrl = await uploadToUguu(mediaBuffer, mime);
            const encodedUrl = encodeURIComponent(imageUrl);
            
            const apiUrl = `https://api.nexray.web.id/tools/enhancer?url=${encodedUrl}&resolusi=${res}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            
            await conn.sendMessage(from, { 
                image: Buffer.from(response.data), 
                caption: 
                    `╭━━━❰ *✅ SUCCESS* ❱━━━╮\n` +
                    `┃ 🖼️ *Image Enhanced*\n` +
                    `┃ 📊 *Resolution:* ${res}\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━╯\n` +
                    `✨ *${config.BOT_NAME}*`
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        } catch (e) {
            reply(`╭━━━❰ *❌ ERROR* ❱━━━╮\n┃ ${e.message}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`);
        }
    });
}

// ==================== COLORIZE COMMAND ====================
cmd({
    pattern: "colorize",
    alias: ["color", "addcolor", "colour"],
    desc: "Add color to black and white images",
    category: "tools",
    react: "🌈",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processGenericImage(conn, mek, m, from, reply, "colorize", "Image Colorized", "🌈");
});
