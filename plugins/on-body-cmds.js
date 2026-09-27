// plugins/autodl.js - Complete CJS Version with Debug Toggle

const { cmd } = require('../command.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const converter = require('../data/converter.js');
const fetch = require('node-fetch');
const { getUserConfigFromMongoDB } = require("../lib/database");

// ================= DEBUG TOGGLE =================
let debug = false; // Set to false to disable debug logs

// Debug function
const debugLog = (feature, message, data = null) => {
    if (!debug) return;
    const timestamp = new Date().toLocaleTimeString();
    if (data) {
        console.log(`[DEBUG][${timestamp}][${feature}] ${message}`, data);
    } else {
        console.log(`[DEBUG][${timestamp}][${feature}] ${message}`);
    }
};

const debugError = (feature, error) => {
    console.error(`[ERROR][${feature}]`, error);
};

// Platform URLs and their APIs - Using new APIs
const platforms = {
    youtube: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-_]{11})/i,
        api: "https://jawad-tech.vercel.app/download/ytdl",
        method: "video"
    },
    facebook: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i,
        api: "https://jawad-tech.vercel.app/downloader",
        method: "video"
    },
    instagram: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(instagram\.com|instagr\.am)\/[^\s]+/i,
        api: "https://api-aswin-sparky.koyeb.app/api/downloader/igdl",
        method: "media"
    },
    tiktok: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com)\/[^\s]+/i,
        method: "video"
    },
    pinterest: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(pinterest\.com|pin\.it)\/[^\s]+/i,
        api: "https://jawad-tech.vercel.app/download/pinterest",
        method: "media"
    }
};

// Create caption for downloads
const createCaption = (sarkar) => {
    return `> *_⏳️ © ${sarkar} Auto Downloader✅️_*`;
};

// Handle API-based downloads
async function handleInstagram(client, from, url, caption, message) {
    debugLog('Instagram', 'Starting download', { url });
    try {
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        debugLog('Instagram', 'Calling API', { apiUrl });
        
        const response = await axios.get(apiUrl);
        debugLog('Instagram', 'API Response received', { status: response.data?.status });

        if (!response.data?.status || !response.data.data?.length) {
            throw new Error("Failed to fetch Instagram media");
        }
        
        const mediaData = response.data.data;
        debugLog('Instagram', 'Media items found', { count: mediaData.length });

        for (const item of mediaData) {
            const mediaType = item.type === 'video' ? 'video' : 'image';
            debugLog('Instagram', `Sending ${mediaType}`, { url: item.url });
            
            await client.sendMessage(from, {
                [mediaType]: { url: item.url },
                caption: caption
            }, { quoted: message });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        debugLog('Instagram', 'Download completed successfully');
        return;
    } catch (error) {
        debugError('Instagram', error);
        throw error;
    }
}

// TikTok handler using multiple APIs
async function handleTikTok(client, from, url, caption, message) {
    debugLog('TikTok', 'Starting download', { url });
    try {
        let videoUrl;

        // Try First API
        try {
            debugLog('TikTok', 'Trying API 1');
            const api1 = `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`;
            const res1 = await axios.get(api1);
            const data1 = res1.data;

            if (data1?.status && data1?.result) {
                videoUrl = data1.result;
                debugLog('TikTok', 'API 1 successful');
            } else {
                throw new Error("First API failed");
            }
        } catch (api1Error) {
            debugLog('TikTok', 'API 1 failed, trying API 2');
            // Try Second API
            try {
                const api2 = `https://jawad-tech.vercel.app/download/ttdl?url=${encodeURIComponent(url)}`;
                const res2 = await axios.get(api2);
                const data2 = res2.data;

                if (data2?.status && data2?.result) {
                    videoUrl = data2.result;
                    debugLog('TikTok', 'API 2 successful');
                } else {
                    throw new Error("Second API also failed");
                }
            } catch (api2Error) {
                debugLog('TikTok', 'API 2 failed, trying API 3');
                // Try Third API as fallback
                const api3 = `https://api.deline.web.id/downloader/tiktok?url=${encodeURIComponent(url)}`;
                const res3 = await axios.get(api3);
                const data3 = res3.data;
                
                if (!data3?.status || !data3?.result?.download) {
                    throw new Error("All TikTok APIs failed");
                }
                videoUrl = data3.result.download;
                debugLog('TikTok', 'API 3 successful');
            }
        }

        if (!videoUrl) {
            throw new Error("No video URL found");
        }

        debugLog('TikTok', 'Sending video', { videoUrl });
        await client.sendMessage(from, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: caption
        }, { quoted: message });
        
        debugLog('TikTok', 'Download completed successfully');
        return;
    } catch (error) {
        debugError('TikTok', error);
        throw error;
    }
}

// YouTube handler
async function handleYouTube(client, from, url, caption, message) {
    debugLog('YouTube', 'Starting download', { url });
    try {
        const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`;
        debugLog('YouTube', 'Calling API', { apiUrl });
        
        const response = await axios.get(apiUrl);
        debugLog('YouTube', 'API Response', { status: response.data?.status });

        if (!response.data?.status || !response.data.result?.mp4) {
            throw new Error("Failed to fetch YouTube video");
        }
        
        debugLog('YouTube', 'Sending video');
        await client.sendMessage(from, {
            video: { url: response.data.result.mp4 },
            caption: caption
        }, { quoted: message });
        
        debugLog('YouTube', 'Download completed successfully');
        return;
    } catch (error) {
        debugError('YouTube', error);
        throw error;
    }
}

// Facebook handler
async function handleFacebook(client, from, url, caption, message) {
    debugLog('Facebook', 'Starting download', { url });
    try {
        const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(url)}`;
        debugLog('Facebook', 'Calling API', { apiUrl });
        
        const response = await axios.get(apiUrl);
        debugLog('Facebook', 'API Response', { status: response.data?.status });

        if (!response.data?.status || !response.data.result?.length) {
            throw new Error("Failed to fetch Facebook video");
        }
        
        const video = response.data.result.find(v => v.quality === "HD") || 
                     response.data.result.find(v => v.quality === "SD");
                     
        if (!video?.url) {
            throw new Error("No video URL found");
        }
        
        debugLog('Facebook', 'Sending video', { quality: video.quality });
        await client.sendMessage(from, {
            video: { url: video.url },
            caption: caption
        }, { quoted: message });
        
        debugLog('Facebook', 'Download completed successfully');
        return;
    } catch (error) {
        debugError('Facebook', error);
        throw error;
    }
}

// Pinterest handler
async function handlePinterest(client, from, url, caption, message) {
    debugLog('Pinterest', 'Starting download', { url });
    try {
        const apiUrl = `https://jawad-tech.vercel.app/download/pinterest?url=${encodeURIComponent(url)}`;
        debugLog('Pinterest', 'Calling API', { apiUrl });
        
        const response = await axios.get(apiUrl);
        debugLog('Pinterest', 'API Response', { status: response.data?.status });

        if (!response.data?.status || !response.data.result?.url) {
            throw new Error("Failed to fetch Pinterest media");
        }
        
        const isVideo = response.data.result.type === 'video';
        debugLog('Pinterest', `Sending ${isVideo ? 'video' : 'image'}`);
        
        await client.sendMessage(from, {
            [isVideo ? 'video' : 'image']: { url: response.data.result.url },
            caption: caption
        }, { quoted: message });
        
        debugLog('Pinterest', 'Download completed successfully');
        return;
    } catch (error) {
        debugError('Pinterest', error);
        throw error;
    }
}

// Handle API-based downloads dispatcher
async function handleApiDownload(client, from, url, platformType, caption, message) {
    debugLog('Dispatcher', `Handling ${platformType} download`);
    try {
        switch (platformType) {
            case "instagram":
                return await handleInstagram(client, from, url, caption, message);
            case "tiktok":
                return await handleTikTok(client, from, url, caption, message);
            case "youtube":
                return await handleYouTube(client, from, url, caption, message);
            case "facebook":
                return await handleFacebook(client, from, url, caption, message);
            case "pinterest":
                return await handlePinterest(client, from, url, caption, message);
            default:
                throw new Error("Unsupported platform");
        }
    } catch (error) {
        debugError('Dispatcher', error);
        throw error;
    }
}

// ================= AUTO DOWNLOADER =================
cmd({
    'on': "body"
}, async (client, message, store, {
    from,
    body,
    isGroup,
    isCreator,
    reply
}) => {
    debugLog('AutoDownloader', 'Triggered', { body: body?.substring(0, 50) });
    try {
        const bot = client.user.id.split(":")[0];
        const config = await getUserConfigFromMongoDB(bot);
        const sarkar = config?.BOT_NAME || "SMD-MiNi";
        
        debugLog('AutoDownloader', 'Config loaded', { 
            autoDownload: config?.AUTO_DOWNLOAD,
            isGroup, 
            isCreator 
        });
        
        // Check AUTO_DOWNLOADER config
        if (config?.AUTO_DOWNLOAD === "true") {
            debugLog('AutoDownloader', 'Mode: All');
        } 
        else if (config?.AUTO_DOWNLOAD === "inbox") {
            if (isGroup) {
                debugLog('AutoDownloader', 'Skipped: Inbox only mode but message in group');
                return;
            }
            debugLog('AutoDownloader', 'Mode: Inbox only');
        } 
        else if (config.AUTO_DOWNLOAD === "group") {
            if (!isGroup) {
                debugLog('AutoDownloader', 'Skipped: Group only mode but message in inbox');
                return;
            }
            debugLog('AutoDownloader', 'Mode: Group only');
        } 
        else if (config.AUTO_DOWNLOAD === "owner") {
            if (!isCreator) {
                debugLog('AutoDownloader', 'Skipped: Owner only mode but not owner');
                return;
            }
            debugLog('AutoDownloader', 'Mode: Owner only');
        } 
        else {
            debugLog('AutoDownloader', 'Disabled: AUTO_DOWNLOAD =', config?.AUTO_DOWNLOAD);
            return;
        }
        
        // Check if message contains any platform URL
        let matchedPlatform = null;
        let matchedUrl = null;
        for (const [platform, data] of Object.entries(platforms)) {
            const match = body.match(data.pattern);
            if (match) {
                matchedPlatform = platform;
                matchedUrl = match[0];
                debugLog('AutoDownloader', `Matched platform: ${platform}`, { url: matchedUrl });
                break;
            }
        }
        
        // Skip if no platform matched
        if (!matchedPlatform || !matchedUrl) {
            debugLog('AutoDownloader', 'No platform matched');
            return;
        }

        const caption = createCaption(sarkar);
        debugLog('AutoDownloader', 'Starting download process');
        
        // Show processing reaction
        await client.sendMessage(from, { react: { text: '⏳', key: message.key } });

        try {
            await handleApiDownload(client, from, matchedUrl, matchedPlatform, caption, message);
            await client.sendMessage(from, { react: { text: '✅', key: message.key } });
            debugLog('AutoDownloader', 'Download successful');
        } catch (apiError) {
            debugError('AutoDownloader', apiError);
            await client.sendMessage(from, { react: { text: '❌', key: message.key } });
        }

    } catch (error) {
        debugError('AutoDownloader', error);
    }
});

// ================= ANTI BAD WORDS =================
cmd({
    on: "body",
    filename: __filename
}, async (conn, mek, m, {
    from,
    body,
    sender,
    isGroup,
    reply,
    isAdmins,
    isBotAdmins,
    isCreator
}) => {
    debugLog('AntiBad', 'Triggered', { body: body?.substring(0, 30) });
    try {
        const bot = conn.user.id.split(":")[0];
        const config = await getUserConfigFromMongoDB(bot);
        
        debugLog('AntiBad', 'Config check', { 
            isGroup, 
            antiBad: config?.ANTI_BAD,
            hasBody: !!body 
        });
        
        // Basic conditions
        if (!isGroup || !body) {
            debugLog('AntiBad', 'Skipped: Not group or no body');
            return;
        }
        if (config?.ANTI_BAD !== "true") {
            debugLog('AntiBad', 'Skipped: ANTI_BAD not enabled');
            return;
        }
        if (isAdmins && !isBotAdmins) {
            debugLog('AntiBad', 'Skipped: No bot admin rights');
            return;
        }
        
        // Bad words list
        const badWords = [
            "sexy", "sex", "xxx", "fuck",
            "kiss", "lips", "lun",
            "chutiya", "gando",
            "pakaya", "huththa", "mia"
        ];

        const text = body.toLowerCase();
        const detected = badWords.some(word => text.includes(word));

        if (!detected) {
            debugLog('AntiBad', 'No bad words detected');
            return;
        }

        debugLog('AntiBad', 'Bad word detected!', { text, sender });
        
        // Delete message
        try {
            await conn.sendMessage(from, { delete: m.key });
            debugLog('AntiBad', 'Message deleted');
        } catch (e) {
            debugError('AntiBad', e);
        }

        // Warning message
        const userNumber = sender.split("@")[0];
        const warnMsg =
            `〔 🚫 BAD WORD DETECTED 〕\n\n` +
            `@${userNumber} Warning! Bad language is not allowed.`;

        try {
            await conn.sendMessage(from, {
                text: warnMsg,
                mentions: [sender]
            });
            debugLog('AntiBad', 'Warning sent');
        } catch (e) {
            debugError('AntiBad', e);
        }

    } catch (err) {
        debugError('AntiBad', err);
    }
});

// ================= MENTION REPLY WITH VOICE =================
const voiceClips = [
    'https://files.catbox.moe/pw4yuu.mp3',
    'https://files.catbox.moe/tuueyw.mp3',
    'https://files.catbox.moe/q56rza.mp3',
    'https://files.catbox.moe/ldrebe.mp3',
    'https://files.catbox.moe/cpjqjd.mp3',
    'https://files.catbox.moe/v5c4fd.mp3',
    'https://files.catbox.moe/naub62.mp3',
    'https://files.catbox.moe/ez7wvh.mp3',
    'https://files.catbox.moe/3ruryr.mp3',
    'https://files.catbox.moe/vxfry5.mp3',
    'https://files.catbox.moe/hk2fjw.mp3',
    'https://files.catbox.moe/pvymqf.mp3',
    'https://files.catbox.moe/md2jm5.mp3',
    'https://files.catbox.moe/ypx92a.mp3',
    'https://files.catbox.moe/7tv2do.mp3',
    'https://files.catbox.moe/sr8k3y.mp3'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

cmd(
    { on: "body" },
    async (conn, m, store, { isGroup, from, sender }) => {
        debugLog('MentionReply', 'Triggered');
        try {
            const bot = conn.user.id.split(":")[0];
            const config = await getUserConfigFromMongoDB(bot);
            
            debugLog('MentionReply', 'Config loaded', { 
                mentionReply: config.MENTION_REPLY,
                isGroup 
            });
            
            // Get bot's number correctly
            const botNumber = bot + "@s.whatsapp.net";
            debugLog('MentionReply', 'Bot Number', { botNumber });
            
            // Ignore self messages
            if (m.key?.fromMe) {
                debugLog('MentionReply', 'Skipped: Self message');
                return;
            }
            
            // Config check
            if (config.MENTION_REPLY !== 'true') {
                debugLog('MentionReply', 'Skipped: Feature disabled');
                return;
            }
            
            // Only groups
            if (!isGroup) {
                debugLog('MentionReply', 'Skipped: Not a group');
                return;
            }
            
            // Get mentioned JIDs
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || 
                             m.message?.buttonsResponseMessage?.selectedDisplayName ||
                             [];
            
            debugLog('MentionReply', 'Mentions', { mentioned, count: mentioned.length });
            
            // Check if bot is mentioned
            let botMentioned = false;
            
            if (mentioned && mentioned.length > 0) {
                botMentioned = mentioned.some(jid => {
                    const mentionedNum = jid.split("@")[0];
                    const botNum = botNumber.split("@")[0];
                    const botLid = conn.user.lid.split(":")[0] + "@lid";
                    const isMatch = mentionedNum === botNum;
                    if (isMatch) debugLog('MentionReply', 'Bot found in mentions', { jid });
                    return isMatch;
                });
            }
            
            // Also check if message starts with @botnumber
            const body = m.message?.conversation || 
                        m.message?.extendedTextMessage?.text || 
                        "";
            
            if (body && body.includes(`@${botNumber.split("@")[0]}`)) {
                botMentioned = true;
                debugLog('MentionReply', 'Bot found in message text');
            }
            
            if (!botMentioned) {
                debugLog('MentionReply', 'Bot not mentioned');
                return;
            }
            
            debugLog('MentionReply', 'Bot mentioned! Sending response');
            
            const chatId = m.chat || from;
            
            // Send recording presence
            await conn.sendPresenceUpdate('recording', chatId);
            debugLog('MentionReply', 'Recording presence sent');
            
            // Select random voice clip
            const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
            debugLog('MentionReply', 'Selected clip', { randomClip });
            
            // Fetch audio
            const audioResponse = await fetch(randomClip);
            if (!audioResponse.ok) {
                debugLog('MentionReply', 'Audio fetch failed', { status: audioResponse.status });
                return;
            }
            
            const arrayBuffer = await audioResponse.arrayBuffer();
            const audioBuffer = Buffer.from(arrayBuffer);
            debugLog('MentionReply', 'Audio downloaded', { size: audioBuffer.length });
            
            // Delay before sending
            await delay(3000);
            debugLog('MentionReply', 'Delay completed');
            
            // Convert to PTT
            const pttAudio = await converter.toPTT(audioBuffer, 'mp3');
            if (!pttAudio) {
                debugLog('MentionReply', 'PTT conversion failed');
                return;
            }
            
            debugLog('MentionReply', 'PTT conversion successful');
            
            // Send voice message
            await conn.sendMessage(
                chatId,
                {
                    audio: pttAudio,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    contextInfo: {
                        externalAdReply: {
                            title: config.BOT_NAME || "SMD-MiNi",
                            body: "Hanji Kisne Yad Kia",
                            thumbnailUrl: "https://files.catbox.moe/pw4yuu.jpg",
                            sourceUrl: "https://whatsapp.com/channel/0029Vb6aq4cCHDygiEqJZl0S",
                            mediaType: 1,
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                },
                { quoted: m }
            );
            
            debugLog('MentionReply', 'Voice message sent successfully');
            
        } catch (err) {
            debugError('MentionReply', err);
        }
    }
);

// ================= HELPER FUNCTION =================
const normalize = (text) => text?.toLowerCase().trim();

// ================= AUTO REPLY =================
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isMe, isDev, reply }) => {
    debugLog('AutoReply', 'Triggered', { body: body?.substring(0, 30) });
    try {
        const bot = conn.user.id.split(":")[0];
        const config = await getUserConfigFromMongoDB(bot);
        
        debugLog('AutoReply', 'Config check', { 
            autoReply: config.AUTO_REPLY,
            isMe, 
            isDev 
        });
        
        if (config.AUTO_REPLY !== "true") {
            debugLog('AutoReply', 'Skipped: Feature disabled');
            return;
        }
        if (isMe) return
        if (isDev) return
        if (!body) {
            debugLog('AutoReply', 'Skipped: No body');
            return;

        }
        const filePath = path.join(__dirname, '../lib/autoreply.json');
        debugLog('AutoReply', 'Looking for file', { filePath });
        
        if (!fs.existsSync(filePath)) {
            debugLog('AutoReply', 'File not found');
            return;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const msg = normalize(body);
        
        debugLog('AutoReply', 'Keywords found', { count: Object.keys(data).length });

        let matched = false;
        for (const key in data) {
            if (msg === normalize(key)) {
                debugLog('AutoReply', 'Match found', { key, reply: data[key] });
                await conn.sendMessage(from, { text: data[key] }, { quoted: mek });
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            debugLog('AutoReply', 'No match found');
        }

    } catch (err) {
        debugError('AutoReply', err);
    }
});

// ================= AUTO STICKER =================
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isMe, isDev }) => {
    debugLog('AutoSticker', 'Triggered', { body: body?.substring(0, 30) });
    try {
        const bot = conn.user.id.split(":")[0];
        const config = await getUserConfigFromMongoDB(bot);
        
        debugLog('AutoSticker', 'Config check', { 
            autoSticker: config.AUTO_STICKER,
            isMe, 
            isDev 
        });
        
        if (config.AUTO_STICKER !== "true") {
            debugLog('AutoSticker', 'Skipped: Feature disabled');
            return;
        }
        if (isMe) {
            debugLog('AutoSticker', 'Skipped: Self message');
            return;
        }
        if (isDev) {
            debugLog('AutoSticker', 'Skipped: Dev message');
            return;
        }
        if (!body) {
            debugLog('AutoSticker', 'Skipped: No body');
            return;
        }
        
        const filePath = path.join(__dirname, '../lib/autosticker.json');
        debugLog('AutoSticker', 'Looking for file', { filePath });
        
        if (!fs.existsSync(filePath)) {
            debugLog('AutoSticker', 'File not found');
            return;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const msg = normalize(body);
        
        debugLog('AutoSticker', 'Sticker keywords found', { count: Object.keys(data).length });

        let matched = false;
        for (const key in data) {
            if (msg === normalize(key)) {
                debugLog('AutoSticker', 'Match found', { key, sticker: data[key] });
                const stickerPath = path.join(__dirname, '../lib/autosticker/', data[key]);

                if (!fs.existsSync(stickerPath)) {
                    debugLog('AutoSticker', 'Sticker file missing', { stickerPath });
                    return;
                }

                const buffer = fs.readFileSync(stickerPath);
                debugLog('AutoSticker', 'Sending sticker', { size: buffer.length });
                
                await conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            debugLog('AutoSticker', 'No match found');
        }

    } catch (err) {
        debugError('AutoSticker', err);
    }
});

console.log('[PLUGIN] Auto Downloader, Anti Bad Words, Mention Reply, Auto Reply & Auto Sticker loaded (CJS)');
console.log(`[DEBUG] Debug mode is ${debug ? 'ENABLED' : 'DISABLED'}`);
