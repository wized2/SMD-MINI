const axios = require('axios');
const fetch = require("node-fetch");
const { bandah } = require('../command');
const config = require('../config');
const yts = require("yt-search");
const { getUserConfigFromMongoDB } = require("../lib/database");

// ==============================
// SEARCH COMMANDS
// ==============================

// 📖 Dictionary Definition
bandah({
    pattern: "define",
    desc: "Get the definition of a word",
    react: "🔍",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        if (!q) return reply("📖 *Dictionary Search*\n\nPlease provide a word to define.\n\n*Usage:* .define [word]");

        const word = q.trim();
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        const response = await axios.get(url);
        const definitionData = response.data[0];

        const definition = definitionData.meanings[0].definitions[0].definition;
        const example = definitionData.meanings[0].definitions[0].example || 'No example available';
        const synonyms = definitionData.meanings[0].definitions[0].synonyms.join(', ') || 'No synonyms available';
        const phonetics = definitionData.phonetics[0]?.text || 'No phonetics available';
        const audio = definitionData.phonetics[0]?.audio || null;

        const wordInfo = `📖 *Word Definition*\n\n` +
                        `🔤 *Word:* ${definitionData.word}\n` +
                        `🗣️ *Pronunciation:* ${phonetics}\n` +
                        `📚 *Definition:* ${definition}\n` +
                        `💡 *Example:* ${example}\n` +
                        `📝 *Synonyms:* ${synonyms}\n\n` +
                        `${botConfig.CAPTION}`;

        if (audio) {
            await conn.sendMessage(from, { 
                audio: { url: audio }, 
                mimetype: 'audio/mpeg' 
            }, { quoted: mek });
        }

        return reply(wordInfo);
    } catch (e) {
        console.error("Dictionary Error:", e);
        if (e.response && e.response.status === 404) {
            return reply("❌ *Word not found.* Please check the spelling and try again.");
        }
        return reply("❌ An error occurred while fetching the definition. Please try again.");
    }
});

// 🖥️ GitHub User Stalk
bandah({
    pattern: "gitstalk",
    desc: "Fetch detailed GitHub user profile",
    category: "search",
    react: "🖥️",
    filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const username = q || args[0];
        if (!username) {
            return reply("🖥️ *GitHub Stalk*\n\nPlease provide a GitHub username.\n\n*Usage:* .gitstalk [username]");
        }

        const apiUrl = `https://api.github.com/users/${username}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        const userInfo = `👤 *GitHub Profile*\n\n` +
                        `🔹 *Username:* ${data.name || data.login}\n` +
                        `🔗 *Profile:* ${data.html_url}\n` +
                        `📝 *Bio:* ${data.bio || 'Not available'}\n` +
                        `🏙️ *Location:* ${data.location || 'Unknown'}\n` +
                        `📊 *Public Repos:* ${data.public_repos}\n` +
                        `👥 *Followers:* ${data.followers} | Following: ${data.following}\n` +
                        `📅 *Created:* ${new Date(data.created_at).toDateString()}\n` +
                        `🔭 *Public Gists:* ${data.public_gists}\n\n` +
                        `${botConfig.CAPTION}`;

        await conn.sendMessage(from, {
            image: { url: data.avatar_url },
            caption: userInfo
        }, { quoted: mek });

    } catch (e) {
        console.error("GitHub Stalk Error:", e);
        if (e.response && e.response.status === 404) {
            return reply("❌ *User not found.* Please check the username and try again.");
        }
        reply(`❌ Error: ${e.response?.data?.message || e.message}`);
    }
});

// 🎬 Movie Information
bandah({
    pattern: "movie",
    desc: "Fetch detailed information about a movie",
    category: "search",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const movieName = q || args.join(' ');
        if (!movieName) {
            return reply("🎬 *Movie Search*\n\nPlease provide a movie name.\n\n*Usage:* .movie [movie name]");
        }

        const apiUrl = `https://delirius-apiofc.vercel.app/search/movie?query=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl);

        const data = response.data;
        if (!data.status || !data.data.length) {
            return reply("❌ *Movie not found.* Please try a different movie name.");
        }

        const movie = data.data[0];
        const downloadLink = `https://delirius-apiofc.vercel.app/download/movie?id=${movie.id}`;

        const movieInfo = `🎬 *Movie Information*\n\n` +
                         `🎥 *Title:* ${movie.title}\n` +
                         `🗓️ *Release Date:* ${movie.release_date}\n` +
                         `⭐ *Rating:* ${movie.vote_average}/10\n` +
                         `👥 *Votes:* ${movie.vote_count}\n` +
                         `🌍 *Language:* ${movie.original_language}\n` +
                         `📝 *Overview:* ${movie.overview}\n` +
                         `⬇️ *Download:* ${downloadLink}\n\n` +
                         `${botConfig.CAPTION}`;

        const imageUrl = movie.image || config.ALIVE_IMG;

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: movieInfo
        }, { quoted: mek });

    } catch (e) {
        console.error("Movie Search Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// 📁 GitHub Repository Info
bandah({
    pattern: "srepo",
    desc: "Fetch information about a GitHub repository",
    category: "search",
    react: "🍃",
    filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const repoName = q || args.join(" ");
        if (!repoName) {
            return reply("📁 *GitHub Repository*\n\nPlease provide a repository in format: owner/repo\n\n*Usage:* .srepo [owner/repo]");
        }

        const apiUrl = `https://api.github.com/repos/${repoName}`;
        const { data } = await axios.get(apiUrl);

        const responseMsg = `📁 *GitHub Repository Info*\n\n` +
                          `📌 *Name:* ${data.name}\n` +
                          `🔗 *URL:* ${data.html_url}\n` +
                          `📝 *Description:* ${data.description || "No description"}\n` +
                          `⭐ *Stars:* ${data.stargazers_count}\n` +
                          `🍴 *Forks:* ${data.forks_count}\n` +
                          `👤 *Owner:* ${data.owner.login}\n` +
                          `📅 *Created:* ${new Date(data.created_at).toLocaleDateString()}\n\n` +
                          `${botConfig.CAPTION}`;

        await conn.sendMessage(from, { text: responseMsg }, { quoted: mek });

    } catch (error) {
        console.error("GitHub Repo Error:", error);
        if (error.response?.status === 404) {
            return reply("❌ *Repository not found.* Please check the format: owner/repo");
        }
        reply(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
});

// 🎵 Spotify Search
bandah({
    pattern: "spotifysearch",
    alias: ["spotifysrch", "spsearch"],
    desc: "Search for Spotify tracks",
    react: '🎵',
    category: 'search',
    filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const query = q || args.join(" ");
        if (!query) {
            return reply("🎵 *Spotify Search*\n\nPlease provide a search query.\n\n*Usage:* .spotifysearch [song/artist]");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
        
        const response = await fetch(`https://api.diioffc.web.id/api/search/spotify?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data || !data.status || !data.result || data.result.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ No results found. Please try a different search term.");
        }

        const results = data.result.slice(0, 5); // Limit to 5 results

        for (const track of results) {
            const message = `🎶 *Spotify Track*\n\n` +
                          `🎵 *Title:* ${track.trackName}\n` +
                          `👤 *Artist:* ${track.artistName}\n` +
                          `#️⃣ *Track No:* ${track.trackNumber}\n` +
                          `🔗 *URL:* ${track.externalUrl}\n\n` +
                          `${botConfig.CAPTION}`;

            await reply(message);
        }

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error("Spotify Search Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ An error occurred while searching Spotify. Please try again.");
    }
});

// 📱 TikTok Search
bandah({
    pattern: "tiks",
    alias: ["tiktoks", "tiktoksearch"],
    desc: "Search for TikTok videos",
    react: '📱',
    category: 'search',
    filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const query = q || args.join(" ");
        if (!query) {
            return reply("📱 *TikTok Search*\n\nPlease provide a search query.\n\n*Usage:* .tiks [search term]");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const searchParams = new URLSearchParams({
            keywords: query,
            count: '5',
            cursor: '0',
            HD: '1'
        });

        const response = await axios.post("https://tikwm.com/api/feed/search", searchParams, {
            headers: {
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
                'Cookie': "current_language=en",
                'User-Agent': "Mozilla/5.0"
            }
        });

        const videos = response.data?.data?.videos;
        if (!videos || videos.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ No videos found. Please try a different search term.");
        }

        const results = videos.slice(0, 3); // Limit to 3 videos

        for (const video of results) {
            const message = `📱 *TikTok Video*\n\n` +
                          `🎬 *Title:* ${video.title || "No description"}\n` +
                          `👤 *Author:* ${video.author?.nickname || 'Unknown'}\n` +
                          `⏱️ *Duration:* ${video.duration || 'Unknown'}s\n` +
                          `▶️ *Plays:* ${video.stats?.playCount || '0'}\n` +
                          `❤️ *Likes:* ${video.stats?.diggCount || '0'}\n\n` +
                          `${botConfig.CAPTION}`;

            if (video.play) {
                await conn.sendMessage(from, {
                    video: { url: video.play }, 
                    caption: message
                }, { quoted: mek });
            } else {
                await reply(`❌ Could not load video: "${video.title}"`);
            }
        }

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error("TikTok Search Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ An error occurred while searching TikTok. Please try again.");
    }
});

// 🔎 YouTube Search
bandah({
    pattern: "yts",
    alias: ["ytsearch"],
    desc: "Search and get details from YouTube",
    react: "🔎",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        if (!q) return reply("🔎 *YouTube Search*\n\nPlease provide a search query.\n\n*Usage:* .yts [search term]");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const search = await yts(q);
        
        if (!search.videos || search.videos.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ No videos found. Please try a different search term.");
        }

        let message = `🔎 *YouTube Search Results*\n\n`;
        
        // Show top 5 results
        search.videos.slice(0, 5).forEach((video, index) => {
            message += `*${index + 1}. ${video.title}*\n`;
            message += `🔗 ${video.url}\n`;
            message += `⏱️ ${video.timestamp || 'N/A'}\n`;
            message += `👁️ ${video.views} views\n\n`;
        });

        message += `${botConfig.CAPTION}`;

        await conn.sendMessage(from, { text: message }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("YouTube Search Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ An error occurred while searching YouTube. Please try again.");
    }
});

// 🌐 Google Search (Additional Command)
bandah({
    pattern: "google",
    alias: ["search"],
    desc: "Search the web using Google",
    react: "🌐",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        if (!q) return reply("🌐 *Google Search*\n\nPlease provide a search query.\n\n*Usage:* .google [search term]");

        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
        
        await reply(`🔍 *Google Search Results*\n\n*Query:* ${q}\n\n*Search URL:* ${searchUrl}\n\n${botConfig.CAPTION}`);

    } catch (e) {
        console.error("Google Search Error:", e);
        reply("❌ An error occurred while processing your search.");
    }
});
