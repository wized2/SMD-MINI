// Purane require ko replace karo is se:
const crypto = require('crypto');
const fs = require('fs');
const http = require("http");
const https = require("https");
const axios = require("axios");
const { cmd, bandah } = require("../command");
const cheerio = require('cheerio');
const yts = require('yt-search');
const { updateUserConfigInMongoDB, getUserConfigFromMongoDB } = require('../lib/database');

// Create keep-alive agents
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const UA = "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36";

// ========== GLOBAL CONSTANTS ==========
const TIMEOUT = 20000; // Global timeout

// Create axios instance with global config
const api = axios.create({
    timeout: TIMEOUT,
    httpAgent: httpAgent,
    httpsAgent: httpsAgent
});

// ========== UTILITY FUNCTIONS ==========
const isValidUrl = (url) => {
    return /^https?:\/\/.+/i.test(url);
};

const getFileNameFromUrl = (url) => {
    try {
        return decodeURIComponent(url.split("/").pop().split("?")[0]);
    } catch {
        return "file.zip";
    }
};

const getVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
};

// ========== APK Download Command ==========
cmd({
    pattern: "apk",
    desc: "dl from mod",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!q) {
            return reply("❌ Please provide an apk name to search.");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
        const response = await api.get(apiUrl);
        const data = response.data;

        if (!data || !data.datalist || !data.datalist.list.length) {
            return reply("⚠️ No results found for the given app name.");
        }

        const app = data.datalist.list[0];
        const appSize = (app.size / 1048576).toFixed(2); // Convert bytes to MB

        const caption = `*Apk Downloader*\n┃ 📦 *Name:* ${app.name}\n┃ 🏋 *Size:* ${appSize} MB\n┃ 📦 *Package:* ${app.package}\n┃ 📅 *Updated On:* ${app.updated}\n┃ 👨‍💻 *Developer:* ${app.developer.name}\n╰━━━━━━━━━━━━━━━┈⊷\n🔗 *${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;

        await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

        await conn.sendMessage(from, {
            document: { url: app.file.path_alt },
            fileName: `${app.name}.apk`,
            mimetype: "application/vnd.android.package-archive",
            caption: caption
        }, { quoted: m });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("APK Error:", error);
        reply("❌ An error occurred while fetching the APK. Please try again.");
    }
});

// ========== Facebook Download Command ==========
cmd({
    pattern: "fb",
    alias: ["facebook"],
    desc: "Download Facebook videos (HD only)",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!q) return reply("📌 Please provide a Facebook video link.");
        if (!q.includes("facebook.com")) return reply("❌ Invalid Facebook link.");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(q)}`;
        const { data } = await api.get(apiUrl);

        if (!data.status || !data.data || !data.data.high) {
            return reply("❌ Failed to fetch Facebook video. Try another link.");
        }

        const { title, thumbnail, high } = data.data;

        const caption = `🎬 *Facebook Video Downloader*\n\n📖 *Title:* ${title}\n\n🔰 *${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;

        await conn.sendMessage(from, {
            video: { url: high },
            caption: caption,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("Facebook HD Downloader Error:", e);
        reply(`❌ Error occurred: ${e.message}`);
    }
});

// ========== GitHub Clone Command ==========
cmd({
    pattern: "gitclone",
    alias: ["clone", "repo"],
    desc: "Clone any GitHub repo as ZIP",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("*❌ Please provide GitHub repo link!*");
        if (!q.includes("github.com")) return reply("*❌ Only GitHub repo links allowed!*");

        let repo = q.replace(".git", "");
        let name = repo.split("/").pop();
        let zipUrl = repo + "/archive/refs/heads/main.zip";

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const res = await api.get(zipUrl, { responseType: 'arraybuffer' });
        const filePath = `./${name}.zip`;
        
        fs.writeFileSync(filePath, res.data);

        await conn.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'application/zip',
            fileName: `${name}.zip`
        }, { quoted: mek });

        fs.unlinkSync(filePath);
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("GitClone Error:", err);
        reply("*❌ Failed to clone repo! Make sure repo is public & has main branch.*");
    }
});

// ========== Google Drive Download Command ==========
cmd({
    pattern: "gdrive",
    alias: ["gdrivedownload", "gdownloader"],
    desc: "Download files from Google Drive.",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        const gdriveUrl = args[0];
        
        if (!gdriveUrl || !gdriveUrl.includes("drive.google.com")) {
            return reply("❌ Please provide a valid Google Drive URL.\nExample: `.gdrive https://drive.google.com/file/...`");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const api = `https://api.nexoracle.com/downloader/gdrive?apikey=free_key@maher_apis&url=${encodeURIComponent(gdriveUrl)}`;
        const { data } = await api.get(api);

        if (!data || data.status !== 200 || !data.result || !data.result.downloadUrl) {
            return reply("⚠️ Failed to fetch Google Drive file. Please check the link or try again later.");
        }

        const { downloadUrl, fileName, fileSize, mimetype } = data.result;
        const caption = `📥 *GOOGLE DRIVE DOWNLOAD*\n──────────────────\n📄 *Name:* ${fileName}\n📦 *Size:* ${fileSize}\n⚙️ *MIME:* ${mimetype}\n──────────────────\n> © ${botConfig.CAPTION || "Team-Bandaheali"}* ⚡\n> 👑 DEVELOPER Team-Bandaheali`;

        if (mimetype.startsWith("image/")) {
            await conn.sendMessage(from, {
                image: { url: downloadUrl },
                caption,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363175375282051@newsletter",
                        newsletterName: botConfig.BOT_NAME || "TEAM-BANDAHEALI",
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        } else if (mimetype.startsWith("video/")) {
            await conn.sendMessage(from, {
                video: { url: downloadUrl },
                caption,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363175375282051@newsletter",
                        newsletterName: botConfig.BOT_NAME || "TEAM-BANDAHEALI",
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        } else if (mimetype.startsWith("audio/")) {
            await conn.sendMessage(from, {
                audio: { url: downloadUrl },
                mimetype: mimetype,
                ptt: false,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363175375282051@newsletter",
                        newsletterName: botConfig.BOT_NAME || "TEAM-BANDAHEALI",
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                document: { url: downloadUrl },
                mimetype: mimetype || "application/octet-stream",
                fileName: fileName || "file",
                caption,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363175375282051@newsletter",
                        newsletterName: botConfig.BOT_NAME || "TEAM-BANDAHEALI",
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("Error in gdrive cmd:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
});

// ========== Google Drive 2 Command ==========
cmd({
    pattern: "gdrive2",
    alias: ["gdrivedownload2", "gdownloader2"],
    desc: "Download files from Google Drive.",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        const gdriveUrl = args[0];
        
        if (!gdriveUrl || !gdriveUrl.includes("drive.google.com")) {
            return reply("❌ Please provide a valid Google Drive URL.\nExample: `.gdrive https://drive.google.com/file/...`");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const apiUrl = `https://backend1.tioo.eu.org/api/downloader/gdrive?url=${encodeURIComponent(gdriveUrl)}`;
        const { data } = await api.get(apiUrl);

        if (!data || data.success !== true || !data.data || !data.data.downloadUrl) {
            return reply("⚠️ Failed to fetch Google Drive file. Please check the link or try again later.");
        }

        const downloadUrl = data.data.downloadUrl;
        const fileName = data.data.filename || "file";
        const fileSize = data.data.filesize || "Unknown";
        const mimetype = "application/octet-stream";

        const caption = `📥 *GOOGLE DRIVE DOWNLOAD*\n──────────────────\n📄 *Name:* ${fileName}\n📦 *Size:* ${fileSize}\n⚙️ *MIME:* ${mimetype}\n──────────────────\n> © ${botConfig.CAPTION || "Team-Bandaheali"}`;

        await conn.sendMessage(from, {
            document: { url: downloadUrl },
            mimetype: mimetype,
            fileName: fileName,
            caption,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363175375282051@newsletter",
                    newsletterName: botConfig.BOT_NAME || "TEAM-BANDAHEALI",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("Error in gdrive2 cmd:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
});

// ========== MediaFire Command ==========
cmd({
    pattern: "mediafire",
    alias: ["mfire"],
    desc: "Download any file from MediaFire.",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!q) return reply("❌ Please provide a valid MediaFire link.");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const apiUrl = `https://backend1.tioo.eu.org/api/downloader/mediafire?url=${encodeURIComponent(q)}`;
        const { data } = await api.get(apiUrl);

        if (!data || data.status !== true || !data.url) {
            return reply("⚠️ Failed to fetch MediaFire file. Please check the link or try again later.");
        }

        const name = data.filename;
        const size = data.filesizeH || data.filesize;
        const date = data.upload_date;
        const mime = data.mimetype || "application/octet-stream";
        const link = data.url;

        await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

        const caption = `*🛡️ MEDIAFIRE DL 🛡️*\n─────────────────────\n📄 *Name:* ${name}\n📦 *Size:* ${size}\n🕒 *Uploaded:* ${date}\n⚙️ *MIME:* ${mime}\n─────────────────────\n📥 *${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;

        if (mime.startsWith("image/")) {
            await conn.sendMessage(from, {
                image: { url: link },
                caption
            }, { quoted: m });
        } else if (mime.startsWith("video/")) {
            await conn.sendMessage(from, {
                video: { url: link },
                caption
            }, { quoted: m });
        } else if (mime.startsWith("audio/")) {
            await conn.sendMessage(from, {
                audio: { url: link },
                mimetype: mime,
                ptt: false
            }, { quoted: m });
        } else {
            await conn.sendMessage(from, {
                document: { url: link },
                mimetype: mime,
                fileName: name,
                caption
            }, { quoted: m });
        }

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("Error in mediafire cmd:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});

// ========== TikTok Command ==========
cmd({
    pattern: "tiktok",
    alias: ["tt", "tiktokdl"],
    desc: "Download TikTok video & audio",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!args[0]) {
            return reply("❌ *TikTok link do bhai*\n\nExample:\n.tiktok https://vm.tiktok.com/xxxx");
        }

        const url = args[0];
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${encodeURIComponent(url)}`;

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        
        const res = await api.get(apiUrl);
        const data = res.data;

        if (!data.status) {
            return reply("❌ *Download failed!*");
        }

        const video = data.data.video;
        const audio = data.data.audio;
        const title = data.data.title || "TikTok Video";
        const author = data.data.author.nickname;

        const caption = `🎵 *TIKTOK DOWNLOADER*\n\n👤 Author: ${author}\n📝 Title: ${title}\n\n⚡ *${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;

        await conn.sendMessage(from, {
            video: { url: video },
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, {
            audio: { url: audio },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: `${author}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("TikTok Error:", e);
        reply("❌ *Error aa gaya! Thori dair baad try karo*");
    }
});

// ========== TikTok Scraper Function ==========
async function tiktok(url) {
    try {
        const r = await api.post(
            "https://savetik.co/api/ajaxSearch",
            new URLSearchParams({ q: url, lang: "id" }).toString(),
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                    origin: "https://savetik.co",
                    referer: "https://savetik.co/id",
                }
            }
        );

        if (!r.data?.data) {
            return { status: false, msg: "No data from Savetik" };
        }

        const $ = cheerio.load(r.data.data);

        const mp4 = $('.dl-action a')
            .filter((i, el) => $(el).text().includes("MP4") && !$(el).text().includes("HD"))
            .attr("href");

        const mp4_hd = $('.dl-action a')
            .filter((i, el) => $(el).text().includes("HD"))
            .attr("href");

        const mp3 = $('.dl-action a')
            .filter((i, el) => $(el).text().toLowerCase().includes("mp3"))
            .attr("href");

        return {
            status: true,
            title: $("h3").first().text().trim() || "TikTok Media",
            mp4,
            mp4_hd,
            mp3,
        };
    } catch (e) {
        return { status: false, msg: e.message };
    }
}

// ========== TikTok 2 Command ==========
cmd({
    pattern: "tiktok2",
    alias: ["tt2", "ttdl2"],
    desc: "Download TikTok video",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!text) return reply("❌ Usage:\n.tiktok2 <tiktok url>");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        
        const res = await tiktok(text);
        if (!res.status) return reply("❌ " + res.msg);

        if (!res.mp4 && !res.mp4_hd) {
            return reply("❌ Video not found");
        }

        await conn.sendMessage(from, {
            video: { url: res.mp4_hd || res.mp4 },
            caption: `🎬 TikTok MEGA\n© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}`,
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
        
    } catch (err) {
        console.error("TikTok2 Error:", err);
        reply("❌ Video download failed");
    }
});

// ========== TikTok MP3 Command ==========
cmd({
    pattern: "ttmp3",
    alias: ["tiktokmp3"],
    desc: "Download TikTok mp3 audio",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply("❌ Usage:\n.ttmp3 <tiktok url>");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const res = await tiktok(text);
        if (!res.status) return reply("❌ " + res.msg);

        if (!res.mp3) {
            return reply("❌ MP3 not available for this video");
        }

        await conn.sendMessage(from, {
            audio: { url: res.mp3 },
            mimetype: "audio/mpeg",
            fileName: `${res.title}.mp3`,
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
        
    } catch (err) {
        console.error("TTMP3 Error:", err);
        reply("❌ MP3 download failed");
    }
});

// ========== Instagram Command ==========
cmd({
    pattern: "insta",
    alias: ["Instagram", "instadl"],
    desc: "Download Instagram video with audio",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!args[0]) {
            return reply("❌ *Instagram link do bhai*\n\nExample:\n.insta https://www.instagram.com/reel/xxxx");
        }

        const igUrl = args[0];
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(igUrl)}`;

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        
        const res = await api.get(apiUrl);
        const json = res.data;

        if (!json.status || !json.data || json.data.length === 0) {
            return reply("❌ *Media nahi mili!*");
        }

        const caption = `📸 *INSTAGRAM DOWNLOADER*\n\n⚡ *${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;

        for (let media of json.data) {
            if (media.type === "video") {
                await conn.sendMessage(from, {
                    video: { url: media.url },
                    caption: caption
                }, { quoted: mek });

                await conn.sendMessage(from, {
                    audio: { url: media.url },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: "Instagram-Audio.mp3"
                }, { quoted: mek });
            } else if (media.type === "image") {
                await conn.sendMessage(from, {
                    image: { url: media.url },
                    caption: caption
                }, { quoted: mek });
            }
        }

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("Insta Error:", err);
        reply("❌ *Error aa gaya! Baad mein try karo*");
    }
});

// ========== Instagram 3 Command ==========
cmd({
    pattern: "insta3",
    alias: ["Instagram3", "instadl3"],
    desc: "Download Instagram video with audio",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!args[0]) {
            return reply("❌ *Instagram link do bhai*\n\nExample:\n.insta https://www.instagram.com/reel/xxxx");
        }

        const igUrl = args[0];
        const apiUrl = `https://backend1.tioo.eu.org/api/downloader/igdl?url=${encodeURIComponent(igUrl)}`;

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const res = await api.get(apiUrl);
        const data = res.data;

        if (!Array.isArray(data) || !data[0] || !data[0].status) {
            return reply("❌ *Media nahi mili!*");
        }

        const media = data[0];
        const caption = `📸 *INSTAGRAM DOWNLOADER V3*\n\n⚡ *${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;

        await conn.sendMessage(from, {
            video: { url: media.url },
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, {
            audio: { url: media.url },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: "Instagram-Audio.mp3"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("Insta3 Error:", err);
        reply("❌ *Error aa gaya! Baad mein try karo*");
    }
});

// ========== Instagram Scraper Function ==========
async function indown(url) {
    try {
        const get = await api.get("https://indown.io/en1", {
            headers: { "User-Agent": UA }
        });

        const cookies = (get.headers["set-cookie"] || [])
            .map(v => v.split(";")[0])
            .join("; ");

        const $ = cheerio.load(get.data);
        const token = $('input[name="_token"]').val();
        if (!token) return null;

        const post = await api.post(
            "https://indown.io/download",
            new URLSearchParams({
                referer: "https://indown.io/en1",
                locale: "en",
                _token: token,
                link: url,
                p: "i"
            }).toString(),
            {
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    origin: "https://indown.io",
                    referer: "https://indown.io/en1",
                    cookie: cookies,
                    "user-agent": UA
                }
            }
        );

        const $$ = cheerio.load(post.data);
        const videos = [];
        const audios = [];

        $$("video source[src], video[src], a[href]").each((_, e) => {
            let v = $$(e).attr("src") || $$(e).attr("href");
            if (!v) return;

            if (v.includes("indown.io/fetch")) {
                try {
                    v = decodeURIComponent(new URL(v).searchParams.get("url"));
                } catch {}
            }

            if (/cdninstagram\.com|fbcdn\.net/.test(v)) {
                if (v.includes(".mp4")) videos.push(v);
                if (v.includes(".mp3") || v.includes("audio")) audios.push(v);
            }
        });

        return {
            video: videos[0] || null,
            audio: audios[0] || null
        };
    } catch (e) {
        console.log("[IG SCRAPER ERROR]", e.message);
        return null;
    }
}

// ========== Instagram 2 Command ==========
cmd({
    pattern: "insta2",
    alias: ["ig2", "igdl2"],
    desc: "Download Instagram video",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        const url = args[0];
        
        if (!url) return reply("❌ Usage:\n.insta2 <instagram url>");
        if (!url.includes("instagram.com")) return reply("❌ Invalid Instagram URL");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const res = await indown(url);
        if (!res || !res.video) return reply("⚠️ Video fetch nahi ho saka.");

        await conn.sendMessage(from, {
            video: { url: res.video },
            caption: `👨‍💻 Instagram Video\n© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("[IG VIDEO CMD]", err);
        reply("❌ Video download failed");
    }
});

// ========== Instagram MP3 Command ==========
cmd({
    pattern: "instamp3",
    alias: ["igmp3", "igaudio"],
    desc: "Download Instagram audio (MP3)",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const url = args[0];
        if (!url) return reply("❌ Usage:\n.instamp3 <instagram url>");
        if (!url.includes("instagram.com")) return reply("❌ Invalid Instagram URL");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const res = await indown(url);
        if (!res || !res.video) return reply("❌ Audio extract nahi ho saka");

        await conn.sendMessage(from, {
            audio: { url: res.video },
            mimetype: "audio/mpeg",
            fileName: "instagram.mp3"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("[IG MP3 CMD]", err);
        reply("❌ Audio download failed");
    }
});

// ========== SnackVideo Command ==========
cmd({
    pattern: "snackdl",
    alias: ["snack", "snackvideo"],
    desc: "Download SnackVideo video",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!args[0]) {
            return reply("❌ *SnackVideo link do bhai*\n\nExample:\n.snackvideo https://s.snackvideo.com/p/xxxx");
        }

        const snackUrl = args[0];
        const apiUrl = `https://backend1.tioo.eu.org/api/downloader/snackvideo?url=${encodeURIComponent(snackUrl)}`;

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const res = await api.get(apiUrl);
        const data = res.data;

        if (!data || data.status !== true || !data.videoUrl) {
            return reply("❌ *Media nahi mili!*");
        }

        const caption = `*SNACK•VIDEO DL*\n\n© *${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;

        await conn.sendMessage(from, {
            video: { url: data.videoUrl },
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("SnackDL Error:", err);
        reply("❌ *Error aa gaya! Baad mein try karo*");
    }
});

// ========== Wallpaper Command ==========
cmd({
    pattern: "wallpaper",
    alias: ["randomwall", "rwall"],
    desc: "Download random wallpapers based on keywords.",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        const query = args.join(" ") || "random";
        const apiUrl = `https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=${encodeURIComponent(query)}`;

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        
        const { data } = await api.get(apiUrl);
        
        if (data.status && data.imgUrl) {
            const caption = `🌌 *Random Wallpaper: ${query}*\n\n> *© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;
            await conn.sendMessage(from, { image: { url: data.imgUrl }, caption }, { quoted: m });
            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
        } else {
            reply(`❌ No wallpaper found for *"${query}"*.`);
        }
    } catch (error) {
        console.error("Wallpaper Error:", error);
        reply("❌ An error occurred while fetching the wallpaper. Please try again.");
    }
});

// ========== Twitter Command ==========
cmd({
    pattern: "twitter",
    alias: ["tw", "xdl"],
    desc: "Download Twitter / X video",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!text) {
            return reply(`❌ *Example:*\n.twitter https://x.com/...`);
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const body = new URLSearchParams({
            q: text,
            lang: 'id',
            cftoken: ''
        }).toString();

        const { data } = await api.post(
            'https://savetwitter.net/api/ajaxSearch',
            body,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Origin': 'https://savetwitter.net',
                    'Referer': 'https://savetwitter.net/id3'
                }
            }
        );

        const html = data?.data;
        if (!html) return reply('❌ *Video data fetch failed*');

        const title = html.match(/<h3>(.*?)<\/h3>/)?.[1]?.trim() || 'Twitter Video';
        const duration = html.match(/<p>(\d+:\d+)<\/p>/)?.[1] || '-';
        const thumbnail = html.match(/<img src="([^"]+)"/)?.[1];
        const videos = [...html.matchAll(/href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)".*?MP4\s*\(([^)]+)\)/g)].map(v => ({
            url: v[1],
            quality: v[2]
        }));

        if (!videos.length) {
            return reply('❌ *No MP4 video found*');
        }

        const best = videos[0];
        let caption = `*🐦 Twitter / X Downloader*\n\n`;
        caption += `*📌 Title:* ${title}\n`;
        caption += `*⏱️ Duration:* ${duration}\n`;
        caption += `*🎞️ Quality:* ${best.quality}\n\n`;
        caption += `*© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`;

        let thumbBuffer = null;
        if (thumbnail) {
            try {
                const thumbRes = await api.get(thumbnail, { responseType: 'arraybuffer' });
                thumbBuffer = thumbRes.data;
            } catch {}
        }

        await conn.sendMessage(from, {
            video: { url: best.url },
            caption,
            jpegThumbnail: thumbBuffer
        }, { quoted: m });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error("Twitter Error:", err);
        reply(`❌ *Error while downloading*\n\n${err.message}`);
    }
});

// ========== Threads Command ==========
cmd({
    pattern: "threads",
    alias: ["th", "thdl"],
    desc: "Download Threads videos/images",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        const THREADS_API = "https://backend1.tioo.eu.org/threads?url=";
        const query = args.join(" ").trim();

        if (!query) {
            return reply("🧵 *THREADS DOWNLOADER*\n\nUsage:\n• `.threads threads-link`\n\nExample:\n`.threads https://www.threads.net/@user/post/...`");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const { data } = await api.get(THREADS_API + encodeURIComponent(query));

        if (!data || !data.status) {
            return reply("❌ Media not found.");
        }

        const type = data.type;
        const mediaUrl = data.video;

        if (!mediaUrl) {
            return reply("❌ No downloadable media found.");
        }

        await conn.sendMessage(from, {
            image: { url: mediaUrl },
            caption: `🧵 *THREADS DOWNLOAD*\n\n📦 *Type:* ${type.toUpperCase()}\n\n━━━━━━━━━━━━━━\n${botConfig.CAPTION || "Powered by Team-Bandaheali"}`
        }, { quoted: mek });

        if (type === "video") {
            await conn.sendMessage(from, {
                video: { url: mediaUrl },
                mimetype: "video/mp4"
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                image: { url: mediaUrl }
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("THREADS ERROR:", err.message);
        reply("❌ *Download failed*\nPlease check the Threads link and try again.");
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
});

// ========== Spotify Constants ==========
const SPOTIFY_SEARCH = "https://api.giftedtech.co.ke/api/search/spotifysearch";
const SPOTIFY_API1 = "https://api.giftedtech.co.ke/api/download/spotifydl";
const SPOTIFY_API2 = "https://api.giftedtech.co.ke/api/download/spotifydlv2";
const SPOTIFY_KEY = "gifted";

function cleanName(name) {
    return name.replace(/[\\/:*?"<>|]/g, "").slice(0, 60);
}

function isSpotifyLink(q) {
    return q.includes("open.spotify.com/track/");
}

async function spotifySearch(query) {
    try {
        const apiUrl = `${SPOTIFY_SEARCH}?apikey=${SPOTIFY_KEY}&query=` + encodeURIComponent(query);
        const { data } = await api.get(apiUrl);
        if (!data?.success || !data?.results?.length) return null;
        return data.results[0];
    } catch (e) {
        console.log("[SPOTIFY SEARCH ERROR]", e.message);
        return null;
    }
}

async function spotifyApi1(url) {
    try {
        const apiUrl = `${SPOTIFY_API1}?apikey=${SPOTIFY_KEY}&url=` + encodeURIComponent(url);
        const { data } = await api.get(apiUrl);
        if (!data?.success || !data?.result?.download_url) return null;
        return {
            title: data.result.title,
            artist: "Unknown",
            thumb: data.result.thumbnail,
            dl: data.result.download_url
        };
    } catch (e) {
        console.log("[SPOTIFY API1 ERROR]", e.message);
        return null;
    }
}

async function spotifyApi2(url) {
    try {
        const apiUrl = `${SPOTIFY_API2}?apikey=${SPOTIFY_KEY}&url=` + encodeURIComponent(url);
        const { data } = await api.get(apiUrl);
        if (!data?.success || !data?.result?.download_url) return null;
        return {
            title: data.result.title,
            artist: data.result.artist || "Unknown",
            thumb: data.result.thumbnail,
            dl: data.result.download_url
        };
    } catch (e) {
        console.log("[SPOTIFY API2 ERROR]", e.message);
        return null;
    }
}

async function spotifyDownload(url) {
    let res = await spotifyApi1(url);
    if (res) return res;
    res = await spotifyApi2(url);
    if (res) return res;
    return null;
}

// ========== Spotify Command ==========
cmd({
    pattern: "spotify",
    alias: ["spot", "spdl"],
    desc: "Download Spotify song (Search + Multi API)",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        const q = args.join(" ");
        
        if (!q) return reply("❌ Song name ya Spotify link do\n\nExample:\n.spotify tu aa milo");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        let trackUrl;
        let searchData = null;

        if (!isSpotifyLink(q)) {
            searchData = await spotifySearch(q);
            if (!searchData) return reply("❌ Song search nahi ho saka.");
            trackUrl = searchData.url;
        } else {
            trackUrl = q.split("?")[0];
        }

        const data = await spotifyDownload(trackUrl);
        if (!data) return reply("❌ Dono APIs fail ho gaye. Baad me try karo.");

        const fileName = cleanName(data.title) + ".mp3";
        const thumb = data.thumb || searchData?.thumbnail;

        if (thumb) {
            await conn.sendMessage(from, {
                image: { url: thumb },
                caption: `🎵 *${data.title}*\n👤 ${data.artist || searchData?.artist || "Unknown"}\n\nDownloading...\n© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}`
            }, { quoted: mek });
        }

        await conn.sendMessage(from, {
            audio: { url: data.dl },
            mimetype: "audio/mpeg",
            fileName,
            caption: `🎵 *${data.title}*\n👤 ${data.artist || searchData?.artist || "Unknown"}\n\n© Team-Bandaheali`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("[SPOTIFY CMD ERROR]", err);
        reply("❌ Spotify download failed.");
    }
});

// ========== MP4 Command ==========
cmd({
    pattern: "mp4",
    alias: ["video", "ytmp4"],
    desc: "Download YouTube video (MP4)",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!q) return await reply("🎞️ Please provide a YouTube video name or URL!\n\nExample: `video tum hi ho`");

        let url = q;
        let videoInfo = null;

        if (q.startsWith('http://') || q.startsWith('https://')) {
            if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
                return await reply("❌ Please provide a valid YouTube URL!");
            }
            const videoId = getVideoId(q);
            if (!videoId) return await reply("❌ Invalid YouTube URL!");
            const searchFromUrl = await yts({ videoId });
            videoInfo = searchFromUrl;
        } else {
            const search = await yts(q);
            videoInfo = search.videos[0];
            if (!videoInfo) return await reply("❌ No video results found!");
            url = videoInfo.url;
        }

        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `*📹 VIDEO DOWNLOADER*\n\n🎞️ *Title* ${videoInfo.title}\n📺 *Channel* ${videoInfo.author.name}\n🕒 *Duration* ${videoInfo.timestamp}\n\n*Status* Downloading Video...\n\n*© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`
        }, { quoted: mek });

        const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`;
        const { data } = await api.get(apiUrl);

        if (!data?.status || !data?.result?.mp4) {
            return await reply("❌ Failed to fetch download link! Try again later.");
        }

        const vid = data.result;

        await conn.sendMessage(from, {
            video: { url: vid.mp4 },
            caption: `🎞️ *${vid.title}*\n\n*© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in command:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ========== YouTube Stream Function ==========
const CDNS = [
    "cdn406.savetube.vip",
    "cdn405.savetube.vip",
    "cdn404.savetube.vip",
    "cdn403.savetube.vip",
    "cdn402.savetube.vip",
    "cdn401.savetube.vip",
    "cdn400.savetube.vip"
];

const SECRET_KEY = Buffer.from("C5D58EF67A7584E4A29F6C35BBC4EB12", "hex");

const ytHeaders = {
    "content-type": "application/json",
    "origin": "https://ytube.savetube.me",
    "referer": "https://ytube.savetube.me/",
    "user-agent": "Mozilla/5.0"
};

function decryptData(enc) {
    const buf = Buffer.from(enc.replace(/\s/g, ""), "base64");
    const iv = buf.subarray(0, 16);
    const data = buf.subarray(16);
    const decipher = crypto.createDecipheriv("aes-128-cbc", SECRET_KEY, iv);
    return JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString());
}

async function fastSearch(query) {
    const res = await yts(query);
    if (!res.videos.length) throw "No results found";
    return res.videos[0].url;
}

async function ytdlStream(url, type, quality) {
    const id = getVideoId(url);
    if (!id) throw new Error("Invalid YouTube URL");

    let lastError;

    for (const CDN of CDNS) {
        try {
            const infoRes = await api.post(
                `https://${CDN}/v2/info`,
                { url: `https://youtube.com/watch?v=${id}` },
                { headers: ytHeaders }
            );

            if (!infoRes.data?.status) throw new Error("Failed to fetch video info");

            const info = decryptData(infoRes.data.data);

            const dlRes = await api.post(
                `https://${CDN}/download`,
                {
                    id: info.id,
                    key: info.key,
                    downloadType: type,
                    quality: String(quality)
                },
                { headers: ytHeaders }
            );

            const link = dlRes.data?.data?.downloadUrl;
            if (!link) throw new Error("Download link not found");

            return {
                title: info.title,
                duration: info.duration,
                thumbnail: info.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                streamUrl: link
            };
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError || new Error("All CDN servers failed");
}

// ========== MP3 Command ==========
cmd({
    pattern: "mp3",
    alias: ["audio", "song"],
    desc: "Download YouTube audio",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!args[0]) return reply("❌ Song name ya YouTube link do!");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        
        let query = args.join(" ");

        if (!query.includes("youtu")) {
            query = await fastSearch(query);
        }

        const data = await ytdlStream(query, "audio", "192");

        await conn.sendMessage(from, {
            audio: { url: data.streamUrl },
            mimetype: "audio/mpeg",
            ptt: false,
            caption: `🎧 *${botConfig.BOT_NAME || "TEAM-BANDAHEALI"} Mp3 Downloader*\n\n🎵 *Title:* ${data.title}\n🕒 *Duration:* ${data.duration}\n\n*${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`,
            contextInfo: {
                externalAdReply: {
                    title: data.title,
                    body: "YouTube MP3",
                    thumbnailUrl: data.thumbnail,
                    mediaType: 2,
                    sourceUrl: query
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("MP3 Error:", e);
        reply("❌ Error: " + e.message);
    }
});

// ========== Drama Command ==========
cmd({
    pattern: "drama",
    alias: ["drama3", "drama2"],
    desc: "Download YouTube video (MP4)",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!q) return await reply("🎞️ Please provide a YouTube video name or URL!\n\nExample: `video tum hi ho`");

        let url = q;
        let videoInfo = null;

        if (q.startsWith('http://') || q.startsWith('https://')) {
            if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
                return await reply("❌ Please provide a valid YouTube URL!");
            }
            const videoId = getVideoId(q);
            if (!videoId) return await reply("❌ Invalid YouTube URL!");
            const searchFromUrl = await yts({ videoId });
            videoInfo = searchFromUrl;
        } else {
            const search = await yts(q);
            videoInfo = search.videos[0];
            if (!videoInfo) return await reply("❌ No video results found!");
            url = videoInfo.url;
        }

        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `*📹 VIDEO DOWNLOADER*\n\n🎞️ *Title* ${videoInfo.title}\n📺 *Channel* ${videoInfo.author.name}\n🕒 *Duration* ${videoInfo.timestamp}\n\n*Status* Downloading Video...\n\n*© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`
        }, { quoted: mek });

        const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`;
        const { data } = await api.get(apiUrl);

        if (!data?.status || !data?.result?.mp4) {
            return await reply("❌ Failed to fetch download link! Try again later.");
        }

        const vid = data.result;

        await conn.sendMessage(from, {
            document: { url: vid.mp4 },
            mimetype: "video/mp4",
            fileName: `${vid.title}.mp4`,
            caption: `📄 *${vid.title}*\n\n*© ${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in command:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ========== Play Audio Command ==========
cmd({
    pattern: "playaudio",
    desc: "Send direct audio from URL",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const url = args[0];

        if (!url || !isValidUrl(url)) return reply("❌ Usage:\n.playaudio <direct audio url>");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        await conn.sendMessage(from, {
            audio: { url },
            mimetype: "audio/mpeg",
            ptt: false
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("PLAYAUDIO ERROR:", e);
        reply("❌ Audio send failed.");
    }
});

// ========== Play Video Command ==========
cmd({
    pattern: "playvideo",
    desc: "Send direct video from URL",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const url = args[0];

        if (!url || !isValidUrl(url)) return reply("❌ Usage:\n.playvideo <direct video url>");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        await conn.sendMessage(from, {
            video: { url },
            mimetype: "video/mp4"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("PLAYVIDEO ERROR:", e);
        reply("❌ Video send failed.");
    }
});

// ========== Audio Doc Command ==========
cmd({
    pattern: "audiodoc",
    desc: "Send audio as document from URL",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const url = args[0];

        if (!url || !isValidUrl(url)) return reply("❌ Usage:\n.audiodoc <direct audio url>");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        await conn.sendMessage(from, {
            document: { url },
            mimetype: "audio/mpeg",
            fileName: "audio.mp3"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("AUDIODOC ERROR:", e);
        reply("❌ Audio document send failed.");
    }
});

// ========== Video Doc Command ==========
cmd({
    pattern: "videodoc",
    desc: "Send video as document from URL",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const url = args[0];

        if (!url || !isValidUrl(url)) return reply("❌ Usage:\n.videodoc <direct video url>");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        await conn.sendMessage(from, {
            document: { url },
            mimetype: "video/mp4",
            fileName: "video.mp4"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("VIDEODOC ERROR:", e);
        reply("❌ Video document send failed.");
    }
});

// ========== ZIP Download Command ==========
cmd({
    pattern: "zipdl",
    alias: ["zip", "filedl", "downfile"],
    desc: "Download ZIP / RAR / File from direct URL",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const url = args[0];

        if (!url || !isValidUrl(url)) return reply("❌ Usage:\n.zipdl <direct file url>");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const fileName = getFileNameFromUrl(url);

        await conn.sendMessage(from, {
            document: { url },
            mimetype: "application/octet-stream",
            fileName: fileName,
            caption: `📦 *File Downloader*\n\n📄 ${fileName}\n\n© Team-Bandaheali`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("ZIPDL ERROR:", e);
        reply("❌ File download failed.");
    }
});

// ========== Style Map for Play Command ==========
const styleMap = {
    'A': 'α', 'B': 'в', 'C': '¢', 'D': '∂', 'E': 'є', 'F': 'f', 'G': 'g', 'H': 'н', 'I': 'ι',
    'J': 'נ', 'K': 'к', 'L': 'ℓ', 'M': 'м', 'N': 'и', 'O': 'σ', 'P': 'ρ', 'Q': 'q', 'R': 'я',
    'S': 'ѕ', 'T': 'т', 'U': 'υ', 'V': 'ν', 'W': 'ω', 'X': 'χ', 'Y': 'у', 'Z': 'z',
    'a': 'α', 'b': 'в', 'c': '¢', 'd': '∂', 'e': 'є', 'f': 'f', 'g': 'g', 'h': 'н', 'i': 'ι',
    'j': 'נ', 'k': 'к', 'l': 'ℓ', 'm': 'м', 'n': 'и', 'o': 'σ', 'p': 'ρ', 'q': 'q', 'r': 'я',
    's': 'ѕ', 't': 'т', 'u': 'υ', 'v': 'ν', 'w': 'ω', 'x': 'χ', 'y': 'у', 'z': 'z',
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    ' ': ' ', '-': '-', '_': '_', '.': '.', '@': '@'
};

const toStyledText = (text) => {
    return text.split('').map(c => styleMap[c] || c).join('');
};
/*
// ========== Play Command ==========
cmd({
    pattern: "play",
    alias: ["yt", "ytdl"],
    desc: "Download YouTube song or video",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        
        if (!q) return await reply("🎶 Please provide a YouTube video name or link.\n\nExample:\n`.play Alone - Alan Walker`");

        let video = null;
        
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            const videoId = q.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
            const results = await yts({ videoId: videoId ? videoId[1] : q });
            video = results;
        } else {
            const search = await yts(q);
            if (!search.videos || !search.videos.length) return await reply("❌ No results found.");
            video = search.videos[0];
        }

        const caption = `*╭┈───〔 ${toStyledText(`${botConfig.BOT_NAME || "TEAM-BANDAHEALI"} YT Downloader`)} 〕┈───⊷*\n*├▢ 🎬 ${toStyledText('Title:')}* ${video.title}\n*├▢ 📺 ${toStyledText('Channel:')}* ${video.author.name}\n*├▢ ⏰ ${toStyledText('Duration:')}* ${video.timestamp}\n*╰───────────────────⊷*\n*╭───⬡ ${toStyledText('Select Format')} ⬡───*\n*┋ ⬡ 1.* 🎧 ${toStyledText('Audio (MP3)')}\n*┋ ⬡ 2.* 📹 ${toStyledText('Video (MP4)')}\n*╰───────────────────⊷*\n\n> ${toStyledText('Please Reply With 1 or 2')}`;

        const sent = await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption
        }, { quoted: mek });

        const msgId = sent.key.id;
        let listenerActive = true;
        
        const timer = setTimeout(() => {
            listenerActive = false;
            conn.ev.off("messages.upsert", messageHandler);
        }, 120000);

        const messageHandler = async (msgData) => {
            if (!listenerActive) return;
            
            const received = msgData.messages[0];
            if (!received.message) return;

            const text = received.message.conversation || received.message.extendedTextMessage?.text;
            const sender = received.key.remoteJid;
            const replyToBot = received.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;

            if (replyToBot && sender === from) {
                clearTimeout(timer);
                listenerActive = false;
                conn.ev.off("messages.upsert", messageHandler);
                
                await conn.sendMessage(sender, { react: { text: '⬇️', key: received.key } });

                if (text === "1" || text === "2") {
                    const type = text === "1" ? "mp3" : "mp4";

                    if (type === "mp3") {
                        const apiUrl = `https://apiskeith.vercel.app/download/audio?url=${encodeURIComponent(video.url)}`;
                        const { data } = await api.get(apiUrl);
                        console.log("data = ", data);

                        if (!data?.status || !data?.result) {
                            return await conn.sendMessage(sender, { text: "❌ Audio download failed, please try again later." }, { quoted: received });
                        }

                        await conn.sendMessage(sender, {
                            audio: { url: data.result },
                            mimetype: "audio/mpeg",
                            ptt: false
                        }, { quoted: received });

                    } else {
                        const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}`;
                        const { data } = await api.get(apiUrl);

                        if (!data?.status || !data?.result || !data.result.mp4) {
                            return await conn.sendMessage(sender, { text: "❌ Video download failed, please try again later." }, { quoted: received });
                        }

                        await conn.sendMessage(sender, {
                            video: { url: data.result.mp4 },
                            caption: `🎬 *${video.title}*\n\n> *${botConfig.CAPTION || "Powered by Team-Bandaheali"}*`
                        }, { quoted: received });
                    }

                    await conn.sendMessage(sender, { react: { text: '✅', key: received.key } });
                } else {
                    await conn.sendMessage(sender, {
                        text: `❌ *Invalid selection!*\nPlease reply with:\n1️⃣ for Audio (MP3)\n2️⃣ for Video (MP4)`
                    }, { quoted: received });
                }
            }
        };

        conn.ev.on("messages.upsert", messageHandler);

    } catch (e) {
        console.error("Play Command Error:", e);
        await reply(`❌ Error: ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
*/

// ✅ SMD-MiNi Pinterest Downloader (Improved Version)

cmd({
    pattern: "pinterest",
    alias: ["pin", "pindl"],
    desc: "Download Pinterest media",
    category: "download",
    react: "📌",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot);
        const botname = botConfig.BOT_NAME || "SMD-MINI";
const botCaption = botConfig.CAPTION || "POWERED BY TEAM-BANDAHEALI";

        // ❗ URL check
        if (!q) {
            return await reply("📌 Please provide a Pinterest link.");
        }

        // ❗ Validate Pinterest URL
        if (!q.includes("pinterest.com") && !q.includes("pin.it")) {
            return await reply("❌ Invalid Pinterest URL.\nExample:\n.pinterest https://pin.it/xxxx");
        }

        // ⏳ Processing react
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        // 🌐 API Request
        const api = `https://jawad-tech.vercel.app/download/pinterest?url=${encodeURIComponent(q)}`;
        const response = await axios.get(api);

        const data = response.data;

        if (!data?.status || !data?.result?.url) {
            return await reply("❌ Failed to fetch media. Try another link.");
        }

        const result = data.result;
        const isVideo = result.type === "video";

        // ✨ New Clean Caption Style
        const caption = `
📌 *Pinterest Downloader*

📝 Title : ${result.title || "No title"}
🎞 Type  : ${isVideo ? "Video" : "Image"}
⚡ Quality : HD

> ${botCaption}🚀
`;

        // 📤 Send Media
        await conn.sendMessage(
            from,
            {
                document: { url: result.url },
                mimetype: isVideo ? "video/mp4" : "image/jpeg",
                fileName: isVideo
                    ? "SMD-MiNi-Pinterest.mp4"
                    : "SMD-MiNi-Pinterest.jpg",
                caption
            },
            { quoted: mek }
        );

        // ✅ Success react
        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {

        console.error("Pinterest Download Error:", err);

        await reply("⚠️ Error downloading media. Please try again.");

        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
    }
});
