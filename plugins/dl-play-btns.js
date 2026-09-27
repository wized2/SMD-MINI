const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

// ── API config ──────────────────────────────────────────
const GiftedApiKey = process.env.GIFTED_API_KEY || "_0u5aff45,_0l1876s8qc";
const GiftedTechApi = process.env.GIFTED_API_BASE || "https://api.giftedtech.co.ke";

// ── Helpers ─────────────────────────────────────────────
function extractButtonId(msg) {
    if (!msg) return null;
    if (msg.templateButtonReplyMessage?.selectedId) return msg.templateButtonReplyMessage.selectedId;
    if (msg.buttonsResponseMessage?.selectedButtonId) return msg.buttonsResponseMessage.selectedButtonId;
    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
        return msg.listResponseMessage.singleSelectReply.selectedRowId;
    if (msg.interactiveResponseMessage) {
        const nf = msg.interactiveResponseMessage.nativeFlowResponseMessage;
        if (nf?.paramsJson) {
            try { const p = JSON.parse(nf.paramsJson); if (p.id) return p.id; } catch { }
        }
        return msg.interactiveResponseMessage.buttonId || null;
    }
    return null;
}

const isValidBuffer = (buf) => Buffer.isBuffer(buf) && buf.length > 10240;

async function gmdBuffer(url, timeout = 30000) {
    try {
        const res = await axios.get(url, { responseType: "arraybuffer", timeout });
        return Buffer.from(res.data);
    } catch { return null; }
}

async function queryAPI(query, endpoints, timeout = 20000) {
    const attempts = endpoints.map(endpoint => {
        const apiUrl = `${GiftedTechApi}/api/download/${endpoint}?apikey=${GiftedApiKey}&url=${encodeURIComponent(query)}`;
        return axios.get(apiUrl, { timeout })
            .then(res => {
                if (res.data?.success && res.data?.result?.download_url)
                    return { success: true, data: res.data, endpoint, download_url: res.data.result.download_url };
                throw new Error(`${endpoint}: no download_url`);
            });
    });
    try { return await Promise.any(attempts); }
    catch { return { success: false, error: "All endpoints failed" }; }
}

const audioEndpoints = ["ytmp3v2", "ytaudio", "yta", "ytmp3", "savetubemp3", "savemp3"];
const videoEndpoints = ["ytmp4v2", "ytvideo", "ytv", "ytmp4", "savetubemp4", "savemp4"];

// ── MAIN PLAY COMMAND (DUAL MODE: BUTTONS OR NUMBER REPLY) ──
cmd({
    pattern: "play",
    alias: ["play2"],
    category: "download",
    react: "🎵",
    desc: "Download audio/video from YouTube (Buttons or 1-4 reply)",
    filename: __filename,
},
    async (conn, mek, m, { from, q, reply, react, isCreator, pushName }) => {
        if (!q) {
            await m.react("❌");
            return reply("*Please provide a song or video name!*\n\nExample: `.play Believer Imagine Dragons`");
        }

        try {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos?.length) return reply("*No results found.*");
            const vid = search.videos[0];

            await m.react("⏳");

            // Fetch both audio and video simultaneously
            const [audioResult, videoResult] = await Promise.all([
                queryAPI(vid.url, audioEndpoints),
                queryAPI(vid.url, videoEndpoints)
            ]);

            // Download both formats
            let audioBuffer = null, videoBuffer = null;

            if (audioResult.success) {
                audioBuffer = await gmdBuffer(audioResult.download_url);
                if (!isValidBuffer(audioBuffer)) {
                    const retry = await queryAPI(vid.url, audioEndpoints.filter(e => e !== audioResult.endpoint));
                    if (retry.success) audioBuffer = await gmdBuffer(retry.download_url);
                }
            }

            if (videoResult.success) {
                videoBuffer = await gmdBuffer(videoResult.download_url);
                if (!isValidBuffer(videoBuffer)) {
                    const retry = await queryAPI(vid.url, videoEndpoints.filter(e => e !== videoResult.endpoint));
                    if (retry.success) videoBuffer = await gmdBuffer(retry.download_url);
                }
            }

            if (!isValidBuffer(audioBuffer) && !isValidBuffer(videoBuffer)) {
                await m.react("❌");
                return reply("*Failed to fetch downloads. Please try again later.*");
            }

            const dateNow = Date.now();
            const uniqueId = `${vid.videoId || vid.id || "x"}_${dateNow}`;

            // Prepare format availability
            const hasAudio = isValidBuffer(audioBuffer);
            const hasVideo = isValidBuffer(videoBuffer);

            // ──────────────────────────────────────────────────────────
            // MESSAGE TEXT (common for both modes)
            // ──────────────────────────────────────────────────────────
            const caption = `🎵 *${vid.title}* 🎵\n\n` +
                `👤 *Channel:* ${vid.author.name}\n` +
                `⏱️ *Duration:* ${vid.timestamp}\n` +
                `👁️ *Views:* ${vid.views.toLocaleString()}\n` +
                `📅 *Uploaded:* ${vid.ago || "Unknown"}\n\n` +
                `📊 *Available:* ${hasAudio ? "✅ Audio" : "❌ Audio"} | ${hasVideo ? "✅ Video" : "❌ Video"}\n\n` +
                `*Select format:*\n` +
                `${hasAudio ? "1️⃣ Audio (mp3)\n2️⃣ Audio Document (mp3)\n" : ""}` +
                `${hasVideo ? "3️⃣ Video (mp4)\n4️⃣ Video Document (mp4)" : ""}`;

            // ──────────────────────────────────────────────────────────
            // CHECK IF BUTTONS ARE SUPPORTED (via config or environment)
            // ──────────────────────────────────────────────────────────
            const useButtons = process.env.USE_BUTTONS === "true" || global.useButtons === true || false;
            
            if (useButtons) {
                // ─── BUTTONS MODE ──────────────────────────────────────
                try {
                    const { sendButtons } = require("gifted-btns");
                    const buttons = [];
                    if (hasAudio) {
                        buttons.push({ id: `audio_${uniqueId}`, text: "1️⃣ Audio" });
                        buttons.push({ id: `audiodoc_${uniqueId}`, text: "2️⃣ Audio Doc" });
                    }
                    if (hasVideo) {
                        buttons.push({ id: `video_${uniqueId}`, text: "3️⃣ Video" });
                        buttons.push({ id: `videodoc_${uniqueId}`, text: "4️⃣ Video Doc" });
                    }

                    await sendButtons(conn, from, {
                        text: caption,
                        footer: `> *_POWERED BY TEAM-BANDAHEALI_*`,
                        image: { url: vid.thumbnail },
                        buttons: buttons.concat([{
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({ display_text: "📺 Watch on YouTube", url: vid.url })
                        }])
                    });

                    // Setup button response handler
                    const handleButtonResponse = async ({ messages }) => {
                        const msg = messages?.[0];
                        if (!msg?.message) return;
                        const btnId = extractButtonId(msg.message);
                        if (!btnId) return;
                        if (msg.key?.remoteJid !== from) return;
                        if (!btnId.includes(dateNow.toString())) return;

                        await m.react("⏳");

                        try {
                            if (btnId.startsWith("audio_") && hasAudio) {
                                await conn.sendMessage(from, {
                                    audio: audioBuffer,
                                    mimetype: "audio/mpeg",
                                    ptt: false
                                }, { quoted: msg });
                                await m.react("✅");
                            }
                            else if (btnId.startsWith("audiodoc_") && hasAudio) {
                                await conn.sendMessage(from, {
                                    document: audioBuffer,
                                    mimetype: "audio/mpeg",
                                    fileName: `${vid.title.replace(/[^\w\s.-]/gi, "")}.mp3`,
                                    caption: `🎵 ${vid.title}\n👤 ${vid.author.name}`
                                }, { quoted: msg });
                                await m.react("✅");
                            }
                            else if (btnId.startsWith("video_") && hasVideo) {
                                const sizeMB = videoBuffer.length / (1024 * 1024);
                                if (sizeMB > 16) {
                                    await conn.sendMessage(from, {
                                        text: `⚠️ *Video is ${sizeMB.toFixed(1)}MB*\nWhatsApp limit is 16MB.\nUse *"Video Doc"* option.`
                                    }, { quoted: msg });
                                } else {
                                    await conn.sendMessage(from, {
                                        video: videoBuffer,
                                        mimetype: "video/mp4",
                                        caption: `🎥 ${vid.title}`
                                    }, { quoted: msg });
                                }
                                await m.react("✅");
                            }
                            else if (btnId.startsWith("videodoc_") && hasVideo) {
                                await conn.sendMessage(from, {
                                    document: videoBuffer,
                                    mimetype: "video/mp4",
                                    fileName: `${vid.title.replace(/[^\w\s.-]/gi, "")}.mp4`,
                                    caption: `🎥 ${vid.title}\n👤 ${vid.author.name}`
                                }, { quoted: msg });
                                await m.react("✅");
                            }
                        } catch (e) {
                            console.error("[BUTTON ERROR]", e.message);
                            await m.react("❌");
                        }
                        conn.ev.off("messages.upsert", handleButtonResponse);
                        if (conn.activeHandler === handleButtonResponse) conn.activeHandler = null;
                    };

                    if (conn.activeHandler) conn.ev.off("messages.upsert", conn.activeHandler);
                    conn.activeHandler = handleButtonResponse;
                    conn.ev.on("messages.upsert", handleButtonResponse);

                    setTimeout(() => {
                        conn.ev.off("messages.upsert", handleButtonResponse);
                        if (conn.activeHandler === handleButtonResponse) conn.activeHandler = null;
                    }, 300000);

                } catch (btnErr) {
                    console.log("[BUTTONS FAILED, FALLBACK TO REPLY MODE]", btnErr.message);
                    await reply(caption + `\n\n⚠️ *Buttons not supported!* Reply with 1/2/3/4`);
                    await handleNumberReply();
                }
            } else {
                // ─── NUMBER REPLY MODE ──────────────────────────────────
                await conn.sendMessage(from, {
                    image: { url: vid.thumbnail },
                    caption: caption,
                    footer: "> *_POWERED BY TEAM-BANDAHEALI_*"
                }, { quoted: m });
                await handleNumberReply();
            }

            // ─── COMMON NUMBER REPLY HANDLER ────────────────────────────
            async function handleNumberReply() {
                const filter = (response) => {
                    const body = response.message?.conversation || response.message?.extendedTextMessage?.text;
                    const num = parseInt(body);
                    return body && !isNaN(num) && num >= 1 && num <= 4;
                };

                const collect = async () => {
                    return new Promise((resolve) => {
                        const handler = async ({ messages }) => {
                            const msg = messages?.[0];
                            if (!msg?.message) return;
                            if (msg.key?.remoteJid !== from) return;
                            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                            const num = parseInt(body);
                            if (num >= 1 && num <= 4) {
                                conn.ev.off("messages.upsert", handler);
                                resolve({ num, msg });
                            }
                        };
                        conn.ev.on("messages.upsert", handler);
                        setTimeout(() => {
                            conn.ev.off("messages.upsert", handler);
                            resolve(null);
                        }, 60000);
                    });
                };

                const response = await collect();
                if (!response) {
                    return reply("*⏰ Timeout! Please send the command again.*");
                }

                const { num, msg: responseMsg } = response;
                await m.react("⏳");

                try {
                    if (num === 1 && hasAudio) {
                        await conn.sendMessage(from, {
                            audio: audioBuffer,
                            mimetype: "audio/mpeg",
                            ptt: false
                        }, { quoted: responseMsg });
                        await m.react("✅");
                    }
                    else if (num === 2 && hasAudio) {
                        await conn.sendMessage(from, {
                            document: audioBuffer,
                            mimetype: "audio/mpeg",
                            fileName: `${vid.title.replace(/[^\w\s.-]/gi, "")}.mp3`,
                            caption: `🎵 ${vid.title}\n👤 ${vid.author.name}`
                        }, { quoted: responseMsg });
                        await m.react("✅");
                    }
                    else if (num === 3 && hasVideo) {
                        const sizeMB = videoBuffer.length / (1024 * 1024);
                        if (sizeMB > 16) {
                            await conn.sendMessage(from, {
                                text: `⚠️ *Video is ${sizeMB.toFixed(1)}MB*\nUse option *4 (Video Doc)* for larger files.`
                            }, { quoted: responseMsg });
                        } else {
                            await conn.sendMessage(from, {
                                video: videoBuffer,
                                mimetype: "video/mp4",
                                caption: `🎥 ${vid.title}`
                            }, { quoted: responseMsg });
                        }
                        await m.react("✅");
                    }
                    else if (num === 4 && hasVideo) {
                        await conn.sendMessage(from, {
                            document: videoBuffer,
                            mimetype: "video/mp4",
                            fileName: `${vid.title.replace(/[^\w\s.-]/gi, "")}.mp4`,
                            caption: `🎥 ${vid.title}\n👤 ${vid.author.name}`
                        }, { quoted: responseMsg });
                        await m.react("✅");
                    }
                    else {
                        await conn.sendMessage(from, { text: "❌ *Invalid option or format not available.*" }, { quoted: responseMsg });
                    }
                } catch (e) {
                    console.error("[REPLY MODE ERROR]", e.message);
                    await m.react("❌");
                }
            }

        } catch (e) {
            console.error("[PLAY ERROR]", e);
            await m.react("❌");
            reply("*Something went wrong. Please try again.*");
        }
    });
