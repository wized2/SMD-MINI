const axios = require("axios");
const { cmd, bandah } = require("../command");
const { getUserConfigFromMongoDB } = require("../lib/database");

async function fetchTikTok30(query) {
    try {
        const params = new URLSearchParams({
            keywords: query,
            count: "30",
            cursor: "0",
            HD: "1"
        });

        const res = await axios.post(
            "https://tikwm.com/api/feed/search",
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Cookie": "current_language=en",
                    "User-Agent": "Mozilla/5.0"
                }
            }
        );

        const vids = res.data?.data?.videos || [];
        return vids.slice(0, 30);

    } catch (err) {
        console.log(err);
        return [];
    }
}


cmd({
    pattern: "animevideo",
    alias: ["ranime", "avideo"],
    use: "animevideo",
    desc: "Send random anime video from Json-Data",
    category: "fun",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        // JSON URL
        const url = "https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/AnimeVideos.json";
        
        // Reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Fetch JSON
        const { data } = await axios.get(url);

        if (!data || !data.result || !Array.isArray(data.result)) {
            return reply("❌ JSON response invalid hai!");
        }

        // Pick random video
        const randomVideo = data.result[Math.floor(Math.random() * data.result.length)];

        // Send reaction update
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send video
        await conn.sendMessage(from, {
            video: { url: randomVideo },
            caption: `✨ *Random Anime Video*\n\n${botConfig.CAPTION}`,
            mimetype: "video/mp4",
        });

    } catch (e) {
        console.log(e);
        reply("⚠ Error: Video fetch nahi hua!");
    }
});



cmd({
    pattern: "asupan",
    alias: ["rasupan", "girlvideo", "gv"],
    use: "asupan",
    desc: "Send random Asupan video",
    category: "fun",
    react: "🔥",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        // Raw GitHub file URL
        const jsonUrl = "https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/Asupan.json";

        // Loading reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Fetch JSON data
        const { data } = await axios.get(jsonUrl);

        // Validate array
        if (!Array.isArray(data)) {
            return reply("❌ JSON array format invalid!");
        }

        // Random pick
        const randomVideo = data[Math.floor(Math.random() * data.length)];

        // Done reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send video
        await conn.sendMessage(from, {
            video: { url: randomVideo },
            caption: `🔥 *Random Asupan Video*\n\n${botConfig.CAPTION}`,
            mimetype: "video/mp4",
        });

    } catch (err) {
        console.log(err);
        reply("⚠ Error: Asupan video fetch nahi hua!");
    }
});



cmd({
    pattern: "jokerimg",
    alias: ["rjoker", "jokerpic"],
    use: "jokerimg",
    desc: "Send random Joker image",
    category: "random",
    react: "🃏",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const jsonUrl = "https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/Joker.json";

        // Initial reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Fetch JSON
        const { data } = await axios.get(jsonUrl);

        if (!Array.isArray(data)) {
            return reply("❌ JSON format invalid!");
        }

        // Random pick
        const pick = data[Math.floor(Math.random() * data.length)];

        if (!pick.url) {
            return reply("❌ JSON object missing URL!");
        }

        // Done reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send image
        await conn.sendMessage(from, {
            image: { url: pick.url },
            caption: `🃏 *Random Joker Image*\n\n${botConfig.CAPTION}`
        });

    } catch (err) {
        console.log(err);
        reply("⚠ Error: Joker image fetch nahi hua!");
    }
});




cmd({
    pattern: "loli",
    alias: ["rloli", "lolipic"],
    use: "loli",
    desc: "Send random loli image",
    category: "anime",
    react: "🌸",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const jsonUrl = "https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/Loli.json";

        // Loading reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Fetch JSON
        const { data } = await axios.get(jsonUrl);

        // Validate structure
        if (!data || !Array.isArray(data.result)) {
            return reply("❌ JSON format invalid!");
        }

        // Random pick
        const randomImg = data.result[Math.floor(Math.random() * data.result.length)];

        // Done reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send image
        await conn.sendMessage(from, {
            image: { url: randomImg },
            caption: `🌸 *Random Loli Image*\n\n${botConfig.CAPTION}`
        });

    } catch (err) {
        console.error(err);
        reply("⚠ Error: Loli image fetch nahi hua!");
    }
});



cmd({
    pattern: "naruto",
    alias: ["rnaruto", "narutovid"],
    use: "naruto",
    desc: "Send random Naruto video",
    category: "anime",
    react: "🍥",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const jsonUrl = "https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/Naruto.json";

        // Initial reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Fetch JSON
        const { data } = await axios.get(jsonUrl);

        if (!data || !Array.isArray(data.result)) {
            return reply("❌ Naruto JSON format invalid!");
        }

        // Random video
        const randomVid = data.result[Math.floor(Math.random() * data.result.length)];

        // Final reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send video
        await conn.sendMessage(from, {
            video: { url: randomVid },
            caption: `🍥 *Random Naruto Video*\n\n${botConfig.CAPTION}`,
            mimetype: "video/mp4"
        });

    } catch (err) {
        console.error(err);
        reply("⚠ Error: Naruto video fetch nahi hua!");
    }
});




cmd({
    pattern: "sts",
    alias: ["srilanka", "slvideo", "rst"],
    use: "sts",
    desc: "Send random Sri Lankan video",
    category: "fun",
    react: "🇱🇰",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };

        const jsonUrl = "https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/Sts.json";

        // Initial reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Fetch data
        const { data } = await axios.get(jsonUrl);

        // Validate structure
        if (!data || !Array.isArray(data.result)) {
            return reply("❌ Sts.json format invalid hai!");
        }

        // Get random video
        const randomVid = data.result[Math.floor(Math.random() * data.result.length)];

        // Success reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send video
        await conn.sendMessage(from, {
            video: { url: randomVid },
            caption: ` *Random Video*\n\n${botConfig.CAPTION}`,
            mimetype: "video/mp4"
        });

    } catch (err) {
        console.error(err);
        reply("⚠ Error: STS video fetch nahi ho saka!");
    }
});




cmd({
    pattern: "demonslayer",
    alias: ["rds", "dsclip", "dsvideo"],
    use: "demonslayer",
    desc: "Send random Demon Slayer video",
    category: "anime",
    react: "⚔️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const jsonUrl = "https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/demonSlayer.json";

        // Initial react
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Fetch JSON
        const { data } = await axios.get(jsonUrl);

        if (!data || !Array.isArray(data.result)) {
            return reply("❌ demonSlayer.json format invalid!");
        }

        // Random video
        const randomVid = data.result[Math.floor(Math.random() * data.result.length)];

        // Success react
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send video
        await conn.sendMessage(from, {
            video: { url: randomVid },
            caption: `⚔️ *Random Demon Slayer Clip*\n\n${botConfig.CAPTION}`,
            mimetype: "video/mp4"
        });

    } catch (err) {
        console.error(err);
        reply("⚠ Error: Demon Slayer video fetch nahi hua!");
    }
});




cmd({
    pattern: "onepiece",
    alias: ["opvid", "rop", "onep"],
    use: "onepiece",
    desc: "Send random One Piece video",
    category: "anime",
    react: "🏴‍☠️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const jsonUrl = "https://raw.githubusercontent.com/iTx-Sarkar/Json-Data/refs/heads/main/onePiece.json";

        // Loading reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Fetch JSON
        const { data } = await axios.get(jsonUrl);

        // Validate structure
        if (!data || !Array.isArray(data.result)) {
            return reply("❌ onePiece.json format invalid!");
        }

        // Pick random URL
        const randomVid = data.result[Math.floor(Math.random() * data.result.length)];

        // Done reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send video
        await conn.sendMessage(from, {
            video: { url: randomVid },
            caption: `🏴‍☠️ *Random One Piece Clip*\n\n${botConfig.CAPTION}`,
            mimetype: "video/mp4"
        });

    } catch (err) {
        console.error(err);
        reply("⚠ Error: One Piece video fetch nahi hua!");
    }
});

cmd({
    pattern: "pakistani",
    category: "random",
    desc: "Random Pakistani TikTok video",
    react: "🇵🇰",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Pakistan status video",
            "Pakistani status 2026",
            "Islamic status Pakistan",
            "Ramadan status Pakistan",
            "Jumma Mubarak status",
            "Eid Mubarak status Pakistan",
            "Pakistan independence day status",
            "14 August Pakistan status",
            "Pakistan love status",
            "Pakistan sad status",
            "Pakistan motivational status",
            "Pakistan Islamic reminder",
            "Pakistan poetry status",
            "Urdu status Pakistan",
            "Pakistan morning status",
            "Pakistan attitude status",
            "Pakistani girl status",
            "Pakistan cricket status",
            "Karachi street food",
            "Lahore food street"
        ];

        // random select
        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);

        if (list.length === 0) return reply("No status videos found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        await conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `🇵🇰 *Random Pakistani Video*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Pakistani video fetch nahi hua!");
    }
});

cmd({
    pattern: "sadshayari",
    alias: ["sadsh"],
    category: "random",
    desc: "Random Urdu Sad Shayari video",
    react: "😢",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Urdu sad shayari",
            "Dard bhari shayari",
            "Bewafa shayari",
            "Todha dil shayari",
            "Tanhai shayari",
            "Judai shayari",
            "Sad urdu poetry",
            "Rone wali shayari",
            "Gham e dil",
            "Ishq mein dard",
            "Aansoo shayari",
            "Bichadna shayari",
            "Dard e dil",
            "Mayoos shayari",
            "Udaas shayari",
            "Dil toot gaya",
            "Mohabbat mein dard",
            "Firaq shayari",
            "Sad status video",
            "Heartbroken shayari"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No sad shayari found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        await conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `😢 *Random Sad Urdu Shayari*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Sad shayari fetch nahi hui!");
    }
});

cmd({
    pattern: "happyshayari",
    alias: ["hsh"],
    category: "random",
    desc: "Random Happy Urdu Shayari video",
    react: "😊",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Urdu happy shayari",
            "Khushi shayari",
            "Muskurahat shayari",
            "Positive urdu poetry",
            "Zindagi shayari",
            "Umeed shayari",
            "Pyar bhari shayari",
            "Dosti shayari",
            "Happy life status",
            "Celebration shayari",
            "Khushiyan shayari",
            "Jeet shayari",
            "Kamyabi shayari",
            "Aansu khushi ke",
            "Hasna shayari",
            "Good vibes urdu",
            "Motivational urdu",
            "Morning happiness",
            "Smile shayari",
            "Happy moments"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No happy shayari found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        await conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `😊 *Random Happy Urdu Shayari*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Happy shayari fetch nahi hui!");
    }
});

cmd({
    pattern: "lovevideo",
    category: "random",
    desc: "Random Urdu Love video",
    react: "❤️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Urdu love shayari",
            "Pyar bhari shayari",
            "Mohabbat shayari",
            "Ishq shayari",
            "Love status urdu",
            "Romantic urdu video",
            "Dil ki baat",
            "Pyar ka izhaar",
            "Mohabbat bhari video",
            "Love poetry urdu",
            "Aashiq shayari",
            "Sanam shayari",
            "Meri jaan status",
            "Hubby love status",
            "Baby love status",
            "Cute love video",
            "Pyar mohabbat",
            "Dard e mohabbat",
            "Ishq murshid",
            "Soniye status"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No love video found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        await conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `❤️ *Random Love Shayari*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Love video fetch nahi hua!");
    }
});

cmd({
    pattern: "romantic",
    alias: ["romanticvideo"],
    category: "random",
    desc: "Random Romantic Urdu video",
    react: "💞",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Romantic urdu shayari",
            "Ishq romantic video",
            "Mohabbat romantic",
            "Pyar bhari video",
            "Romantic couple status",
            "Love romantic video",
            "Urdu romantic poetry",
            "Romantic scene",
            "Cute romantic video",
            "Aashiq mizaj",
            "Dil ki dhadkan",
            "Muskurate raho",
            "Tum mere ho",
            "Sanam teri kasam",
            "Sajni status",
            "Mera mahi",
            "Soni lagdi",
            "Gal sun ja",
            "Tera mera rishta",
            "Bewajah status"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No romantic videos found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        await conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `💞 *Random Romantic Urdu Video*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Romantic video fetch nahi hua!");
    }
});

cmd({
    pattern: "abdullahzareem",
    alias: ["zareem"],
    category: "random",
    desc: "Random Abdullah Zareem poetry video",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Abdullah Zareem poetry",
            "Abdullah Zareem new",
            "Zareem sad poetry",
            "Abdullah Zareem viral",
            "Zareem status video",
            "Abdullah Zareem voice",
            "Zareem dard bhari",
            "Abdullah Zaream",
            "Zareem quotes",
            "Abdullah Zareem shayari",
            "Zareem latest video",
            "Abdullah Zareem 2026",
            "Zareem trending",
            "Abdullah Zareem speech",
            "Zareem emotional"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No Zareem poetry found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `📝 *Abdullah Zareem – Random Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Zareem poetry fetch nahi hui!");
    }
});

cmd({
    pattern: "tehzeebhafi",
    alias: ["hafi"],
    category: "random",
    desc: "Random Tehzeeb Hafi poetry video",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Tehzeeb Hafi poetry",
            "Tehzeeb Hafi new",
            "Hafi sad poetry",
            "Tehzeeb Hafi viral",
            "Hafi status video",
            "Tehzeeb Hafi shayari",
            "Hafi latest",
            "Tehzeeb Hafi 2026",
            "Hafi dard",
            "Tehzeeb Hafi quotes",
            "Hafi romantic",
            "Tehzeeb Hafi voice",
            "Hafi trending",
            "Tehzeeb Hafi emotional",
            "Hafi poetry status"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No Hafi poetry found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `📜 *Tehzeeb Hafi – Random Shayari*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Hafi poetry fetch nahi hui!");
    }
});

cmd({
    pattern: "jaunelia",
    alias: ["jonelia","elia"],
    category: "random",
    desc: "Random Jaun Elia poetry video",
    react: "🖤",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Jaun Elia shayari",
            "Jaun Elia poetry",
            "Jaun Elia sad",
            "Jaun Elia voice",
            "Jaun Elia quotes",
            "Jaun Elia new",
            "Jaun Elia viral",
            "Jaun Elia status",
            "Jaun Elia 2026",
            "Jaun Elia dard",
            "Jaun Elia famous",
            "Jaun Elia rekhta",
            "Jaun Elia video",
            "Jaun Elia love",
            "Jaun Elia philosophy"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No Jaun Elia videos found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `🖤 *Jaun Elia – Random Shayari*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Jaun Elia fetch nahi hua!");
    }
});

cmd({
    pattern: "ahmedfaraz",
    alias: ["faraz"],
    category: "random",
    desc: "Random Ahmed Faraz poetry video",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Ahmed Faraz poetry",
            "Ahmed Faraz shayari",
            "Faraz sad poetry",
            "Ahmed Faraz voice",
            "Ahmed Faraz viral",
            "Faraz status",
            "Ahmed Faraz new",
            "Ahmed Faraz 2026",
            "Faraz love poetry",
            "Ahmed Faraz famous",
            "Faraz rekhta",
            "Ahmed Faraz dard",
            "Faraz quotes",
            "Ahmed Faraz ghazal",
            "Faraz romantic"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No Faraz poetry found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `✨ *Ahmed Faraz – Random Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Faraz poetry fetch nahi hui!");
    }
});

cmd({
    pattern: "faiz",
    alias: ["faizahmedfaiz"],
    category: "random",
    desc: "Random Faiz Ahmed Faiz poetry video",
    react: "🌙",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Faiz Ahmed Faiz poetry",
            "Faiz Ahmed Faiz shayari",
            "Faiz sad poetry",
            "Faiz Ahmed Faiz voice",
            "Faiz viral",
            "Faiz status",
            "Faiz Ahmed Faiz new",
            "Faiz 2026",
            "Faiz love poetry",
            "Faiz famous poetry",
            "Faiz rekhta",
            "Faiz dard",
            "Faiz quotes",
            "Faiz ghazal",
            "Faiz revolution"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (list.length === 0) return reply("No Faiz poetry found.");

        const vid = list[Math.floor(Math.random() * list.length)];

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `🌙 *Faiz Ahmed Faiz – Random Shayari*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Faiz poetry fetch nahi hui!");
    }
});

cmd({
    pattern: "wasif",
    alias: ["wasifaliwasif"],
    category: "random",
    desc: "Random Wasif Ali Wasif poetry",
    react: "📘",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Wasif Ali Wasif poetry",
            "Wasif Ali Wasif quotes",
            "Wasif Ali Wasif voice",
            "Wasif Ali Wasif viral",
            "Wasif status",
            "Wasif Ali Wasif new",
            "Wasif 2026",
            "Wasif wisdom",
            "Wasif Ali Wasif famous",
            "Wasif rekhta",
            "Wasif dard",
            "Wasif motivational",
            "Wasif lectures",
            "Wasif Ali Wasif bayan",
            "Wasif teachings"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (!list.length) return reply("No Wasif poetry found.");

        const vid = list[Math.floor(Math.random() * list.length)];
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `📘 *Wasif Ali Wasif Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Wasif poetry fetch nahi hui!");
    }
});

cmd({
    pattern: "iqbal",
    alias: ["allamaiqbal"],
    category: "random",
    desc: "Random Allama Iqbal poetry",
    react: "🦅",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Allama Iqbal poetry",
            "Iqbal shayari",
            "Allama Iqbal quotes",
            "Iqbal voice",
            "Allama Iqbal viral",
            "Iqbal status",
            "Allama Iqbal new",
            "Iqbal 2026",
            "Iqbal motivational",
            "Allama Iqbal famous",
            "Iqbal rekhta",
            "Iqbal dard",
            "Allama Iqbal youth",
            "Iqbal khudi",
            "Iqbal shaheen"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (!list.length) return reply("No Iqbal videos found.");

        const vid = list[Math.floor(Math.random() * list.length)];
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `🦅 *Allama Iqbal Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Iqbal poetry fetch nahi hui!");
    }
});

cmd({
    pattern: "parveenshakir",
    alias: ["shakir"],
    category: "random",
    desc: "Random Parveen Shakir poetry",
    react: "🌸",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Parveen Shakir poetry",
            "Parveen Shakir shayari",
            "Parveen Shakir voice",
            "Parveen Shakir viral",
            "Parveen Shakir status",
            "Parveen Shakir new",
            "Parveen Shakir 2026",
            "Parveen Shakir famous",
            "Parveen Shakir rekhta",
            "Parveen Shakir dard",
            "Parveen Shakir love",
            "Parveen Shakir sad",
            "Parveen Shakir quotes",
            "Parveen Shakir feminist",
            "Parveen Shakir poetry status"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (!list.length) return reply("No Parveen Shakir poetry.");

        const vid = list[Math.floor(Math.random() * list.length)];
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `🌸 *Parveen Shakir Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Parveen Shakir fetch nahi hui!");
    }
});

cmd({
    pattern: "naqvi",
    alias: ["mohsinnaqvi"],
    category: "random",
    desc: "Random Mohsin Naqvi poetry",
    react: "💔",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Mohsin Naqvi poetry",
            "Mohsin Naqvi shayari",
            "Mohsin Naqvi voice",
            "Mohsin Naqvi viral",
            "Mohsin Naqvi status",
            "Mohsin Naqvi new",
            "Mohsin Naqvi 2026",
            "Mohsin Naqvi famous",
            "Mohsin Naqvi rekhta",
            "Mohsin Naqvi dard",
            "Mohsin Naqvi sad",
            "Mohsin Naqvi love",
            "Mohsin Naqvi quotes",
            "Mohsin Naqvi emotional",
            "Mohsin Naqvi poetry status"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (!list.length) return reply("No Mohsin Naqvi videos.");

        const vid = list[Math.floor(Math.random() * list.length)];
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `💔 *Mohsin Naqvi Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Mohsin Naqvi fetch nahi hua!");
    }
});

cmd({
    pattern: "amjad",
    alias: ["amjadislamamjad"],
    category: "random",
    desc: "Random Amjad Islam Amjad poetry",
    react: "📖",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Amjad Islam Amjad poetry",
            "Amjad Islam Amjad shayari",
            "Amjad Islam Amjad voice",
            "Amjad Islam Amjad viral",
            "Amjad status",
            "Amjad Islam Amjad new",
            "Amjad 2026",
            "Amjad Islam Amjad famous",
            "Amjad rekhta",
            "Amjad dard",
            "Amjad sad",
            "Amjad love",
            "Amjad quotes",
            "Amjad Islam Amjad emotional",
            "Amjad poetry status"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (!list.length) return reply("No Amjad poetry found.");

        const vid = list[Math.floor(Math.random() * list.length)];
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `📖 *Amjad Islam Amjad Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Amjad poetry fetch nahi hui!");
    }
});

cmd({
    pattern: "qateel",
    alias: ["qateelshifai"],
    category: "random",
    desc: "Random Qateel Shifai poetry",
    react: "🪶",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Qateel Shifai poetry",
            "Qateel Shifai shayari",
            "Qateel Shifai voice",
            "Qateel Shifai viral",
            "Qateel status",
            "Qateel Shifai new",
            "Qateel 2026",
            "Qateel Shifai famous",
            "Qateel rekhta",
            "Qateel dard",
            "Qateel sad",
            "Qateel love",
            "Qateel quotes",
            "Qateel Shifai emotional",
            "Qateel poetry status"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (!list.length) return reply("No Qateel poetry found.");

        const vid = list[Math.floor(Math.random() * list.length)];
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `🪶 *Qateel Shifai Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Qateel poetry fetch nahi hui!");
    }
});

cmd({
    pattern: "javedakhtar",
    alias: ["akhtar"],
    category: "random",
    desc: "Random Javed Akhtar poetry/video",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Javed Akhtar shayari",
            "Javed Akhtar poetry",
            "Javed Akhtar voice",
            "Javed Akhtar viral",
            "Javed Akhtar status",
            "Javed Akhtar new",
            "Javed Akhtar 2026",
            "Javed Akhtar famous",
            "Javed Akhtar rekhta",
            "Javed Akhtar dard",
            "Javed Akhtar sad",
            "Javed Akhtar love",
            "Javed Akhtar quotes",
            "Javed Akhtar emotional",
            "Javed Akhtar interview"
        ];

        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (!list.length) return reply("No Javed Akhtar reels.");

        const vid = list[Math.floor(Math.random() * list.length)];
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `🎬 *Javed Akhtar Poetry*\n\n${botConfig.CAPTION}`
        });
    } catch (err) {
        console.error(err);
        reply("⚠ Error: Javed Akhtar fetch nahi hua!");
    }
});

cmd({
    pattern: "attitude",
    alias: ["attitudepk", "attvid"],
    category: "random",
    desc: "Random Attitude TikTok video",
    react: "😎",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        // Loading reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searches = [
            "Attitude boys status Pakistan",
            "Attitude status Urdu",
            "Attitude girl status",
            "Badmashi status",
            "Gangster attitude",
            "Savage attitude video",
            "Attitude shayari Urdu",
            "Boys attitude status",
            "Girls attitude status",
            "Stylish attitude",
            "Attitude quotes Urdu",
            "Angry attitude status",
            "Attitude song status",
            "Cool attitude video",
            "Sigma attitude status",
            "Attitude poetry Urdu",
            "Danger attitude",
            "Killer attitude",
            "Attitude lines Urdu",
            "Attitude WhatsApp status"
        ];

        // Fetch with random search query
        const randomQuery = searches[Math.floor(Math.random() * searches.length)];
        const list = await fetchTikTok30(randomQuery);
        
        if (!list.length) return reply("No attitude videos found.");

        // Pick random item
        const vid = list[Math.floor(Math.random() * list.length)];

        // Success reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send video
        return conn.sendMessage(from, {
            video: { url: vid.play },
            caption: `😎 *Random Attitude Video*\n\n${botConfig.CAPTION}`
        });

    } catch (err) {
        console.error(err);
        reply("⚠ Error while loading attitude videos.");
    }
});


cmd({
  pattern: "cat",
  alias: ["meow", "randomcat"],
  desc: "Send a random cute cat picture from nekolabs API",
  react: "🐱",
  category: "random",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    await conn.sendMessage(from, { text: "😺 Cat image la raha hoon..." }, { quoted: mek });

    const res = await axios.get('https://api.nekolabs.my.id/random/cat', {
      responseType: 'arraybuffer',
      timeout: 20000
    });

    const contentType = res.headers['content-type'] || '';
    const imageBuffer = Buffer.from(res.data, 'binary');

    if (contentType.startsWith('image/')) {
      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: `🐾 Random Cute Cats\n\n${botConfig.CAPTION}`
      }, { quoted: mek });
    } else {
      const text = imageBuffer.toString('utf8');
      try {
        const json = JSON.parse(text);
        if (json && (json.url || json.image)) {
          const imageUrl = json.url || json.image;
          const follow = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
          await conn.sendMessage(from, {
            image: Buffer.from(follow.data, 'binary'),
            caption: `🐾 Random Cute Cat\n\n${botConfig.CAPTION}`
          }, { quoted: mek });
        } else {
          throw new Error('Unexpected JSON response');
        }
      } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: "❌ API ne unexpected response bheja." }, { quoted: mek });
      }
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { text: "❌ Error: Cat image load nahi hui. Dobara koshish karen." }, { quoted: mek });
  }
});

//dogs
cmd({
    pattern: "dog",
    desc: "Fetch a random dog image.",
    category: "random",
    react: "🐶",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        const apiUrl = `https://dog.ceo/api/breeds/image/random`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        await conn.sendMessage(from, { 
            image: { url: data.message }, 
            caption: `${botConfig.CAPTION}` 
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`єяяσя ƒєт¢нιηg ∂σg ιмαgє: ${e.message}`);
    }
});

//vietnam girls
cmd({
  pattern: "vietnam",
  alias: ["vietnamgirl", "girlvietnam", "randomvietnam"],
  desc: "Send a random Vietnam girl picture from nekolabs API",
  react: "🇻🇳",
  category: "random",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    await conn.sendMessage(from, { text: "📸 Random vietnam girl image la raha hoon..." }, { quoted: mek });

    const res = await axios.get('https://api.nekolabs.my.id/random/girl/vietnam', {
      responseType: 'arraybuffer',
      timeout: 20000
    });

    const contentType = res.headers['content-type'] || '';
    const imageBuffer = Buffer.from(res.data, 'binary');

    if (contentType.startsWith('image/')) {
      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: `🌸 Random Vietnam Girls\n\n${botConfig.CAPTION}`
      }, { quoted: mek });
    } else {
      const text = imageBuffer.toString('utf8');
      try {
        const json = JSON.parse(text);
        if (json && (json.url || json.image)) {
          const imageUrl = json.url || json.image;
          const follow = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
          await conn.sendMessage(from, {
            image: Buffer.from(follow.data, 'binary'),
            caption: `🌸 Random Vietnam Girl\n\n${botConfig.CAPTION}`
          }, { quoted: mek });
        } else {
          throw new Error('Unexpected JSON response');
        }
      } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: "❌ API ne unexpected response bheja." }, { quoted: mek });
      }
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { text: "❌ Error: Vietnam girl image load nahi hui. Dobara try karein." }, { quoted: mek });
  }
});

//Korea girls
cmd({
  pattern: "korea",
  alias: ["koreagirl", "girlkorea", "randomkorea"],
  desc: "Send a random Korea girl picture from nekolabs API",
  react: "🇰🇷",
  category: "random",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    await conn.sendMessage(from, { text: "📸 Random Korea girl image la raha hoon..." }, { quoted: mek });

    const res = await axios.get('https://api.nekolabs.my.id/random/girl/korea', {
      responseType: 'arraybuffer',
      timeout: 20000
    });

    const contentType = res.headers['content-type'] || '';
    const imageBuffer = Buffer.from(res.data, 'binary');

    if (contentType.startsWith('image/')) {
      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: `💖 Random Korea Girl 🇰🇷\n\n${botConfig.CAPTION}`
      }, { quoted: mek });
    } else {
      const text = imageBuffer.toString('utf8');
      try {
        const json = JSON.parse(text);
        if (json && (json.url || json.image)) {
          const imageUrl = json.url || json.image;
          const follow = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
          await conn.sendMessage(from, {
            image: Buffer.from(follow.data, 'binary'),
            caption: `💖 Random Korea Girl 🇰🇷\n\n${botConfig.CAPTION}`
          }, { quoted: mek });
        } else {
          throw new Error('Unexpected JSON response');
        }
      } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: "❌ API ne unexpected response bheja." }, { quoted: mek });
      }
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { text: "❌ Error: Korea girl image load nahi hui. Dobara try karein." }, { quoted: mek });
  }
});

//Japan girl 
cmd({
  pattern: "japan",
  alias: ["japangirl", "girljapan", "randomjapan"],
  desc: "Send a random Japan girl picture from nekolabs API",
  react: "🇯🇵",
  category: "random",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    await conn.sendMessage(from, { text: "📸 Random Japan girl image la raha hoon..." }, { quoted: mek });

    const res = await axios.get('https://api.nekolabs.my.id/random/girl/japan', {
      responseType: 'arraybuffer',
      timeout: 20000
    });

    const contentType = res.headers['content-type'] || '';
    const imageBuffer = Buffer.from(res.data, 'binary');

    if (contentType.startsWith('image/')) {
      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: `🎌 Random Japan Girl 🇯🇵\n\n${botConfig.CAPTION}`
      }, { quoted: mek });
    } else {
      const text = imageBuffer.toString('utf8');
      try {
        const json = JSON.parse(text);
        if (json && (json.url || json.image)) {
          const imageUrl = json.url || json.image;
          const follow = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
          await conn.sendMessage(from, {
            image: Buffer.from(follow.data, 'binary'),
            caption: `🎌 Random Japan Girl 🇯🇵\n\n${botConfig.CAPTION}`
          }, { quoted: mek });
        } else {
          throw new Error('Unexpected JSON response');
        }
      } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: "❌ API ne unexpected response bheja." }, { quoted: mek });
      }
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { text: "❌ Error: Japan girl image load nahi hui. Dobara koshish karein." }, { quoted: mek });
  }
});

//china Girl
cmd({
  pattern: "china",
  alias: ["china-girl", "girlchina", "randomchina"],
  desc: "Send a random China girl picture from nekolabs API",
  react: "🇨🇳",
  category: "random",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    await conn.sendMessage(from, { text: "🔎 Image dhond raha hoon..." }, { quoted: mek });

    const res = await axios.get('https://api.nekolabs.my.id/random/girl/china', {
      responseType: 'arraybuffer',
      timeout: 20000
    });

    const contentType = res.headers['content-type'] || '';
    const imageBuffer = Buffer.from(res.data, 'binary');

    if (contentType.startsWith('image/')) {
      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: `✨ Random China girls\n\n${botConfig.CAPTION}`
      }, { quoted: mek });
    } else {
      const text = imageBuffer.toString('utf8');
      try {
        const json = JSON.parse(text);
        if (json && (json.url || json.image)) {
          const imageUrl = json.url || json.image;
          const follow = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
          await conn.sendMessage(from, { 
            image: Buffer.from(follow.data, 'binary'), 
            caption: `✨ Random China girl\n\n${botConfig.CAPTION}` 
          }, { quoted: mek });
        } else {
          throw new Error('Unexpected JSON response');
        }
      } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: "❌ Image fetch karne mein masla aya. API ne unexpected response bheja." }, { quoted: mek });
      }
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { text: "❌ Error: Image load nahi hui. Dobara koshish karen." }, { quoted: mek });
  }
});

// indo girls
cmd({
  pattern: "indo",
  alias: ["indogirl", "girlindo", "randomindo"],
  desc: "Send a random Indonesia girl picture from nekolabs API",
  react: "🇮🇩",
  category: "random",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    await conn.sendMessage(from, { text: "📸 Random Indonesia girl image la raha hoon..." }, { quoted: mek });

    const res = await axios.get('https://api.nekolabs.my.id/random/girl/indonesia', {
      responseType: 'arraybuffer',
      timeout: 20000
    });

    const contentType = res.headers['content-type'] || '';
    const imageBuffer = Buffer.from(res.data, 'binary');

    if (contentType.startsWith('image/')) {
      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: `✨ Random Indonesia Girl\n\n${botConfig.CAPTION}`
      }, { quoted: mek });
    } else {
      const text = imageBuffer.toString('utf8');
      try {
        const json = JSON.parse(text);
        if (json && (json.url || json.image)) {
          const imageUrl = json.url || json.image;
          const follow = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
          await conn.sendMessage(from, {
            image: Buffer.from(follow.data, 'binary'),
            caption: `✨ Random Indonesia Girls\n\n${botConfig.CAPTION}`
          }, { quoted: mek });
        } else {
          throw new Error('Unexpected JSON response');
        }
      } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: "❌ API ne unexpected response bheja." }, { quoted: mek });
      }
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { text: "❌ Error: Image fetch nahi hui. Dobara try karein." }, { quoted: mek });
  }
});

// Thailand girls 
cmd({
  pattern: "thailand",
  alias: ["thaigirl", "girlthailand", "randomthailand"],
  desc: "Send a random Thailand girl picture from nekolabs API",
  react: "🇹🇭",
  category: "random",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    await conn.sendMessage(from, { text: "📸 Random Thailand girl image la raha hoon..." }, { quoted: mek });

    const res = await axios.get('https://api.nekolabs.my.id/random/girl/thailand', {
      responseType: 'arraybuffer',
      timeout: 20000
    });

    const contentType = res.headers['content-type'] || '';
    const imageBuffer = Buffer.from(res.data, 'binary');

    if (contentType.startsWith('image/')) {
      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: `🌸 Random Thailand Girl 🇹🇭\n\n${botConfig.CAPTION}`
      }, { quoted: mek });
    } else {
      const text = imageBuffer.toString('utf8');
      try {
        const json = JSON.parse(text);
        if (json && (json.url || json.image)) {
          const imageUrl = json.url || json.image;
          const follow = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
          await conn.sendMessage(from, {
            image: Buffer.from(follow.data, 'binary'),
            caption: `🌸 Random Thailand Girl 🇹🇭\n\n${botConfig.CAPTION}`
          }, { quoted: mek });
        } else {
          throw new Error('Unexpected JSON response');
        }
      } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: "❌ API ne unexpected response bheja." }, { quoted: mek });
      }
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { text: "❌ Error: Thailand girl image load nahi hui. Dobara try karein." }, { quoted: mek });
  }
});

// image 
// 🔑 API KEY DIRECT SET
const SERP_API_KEY = "a0595eaca61ed48798648f2a5a4bfa83a776b4cda61c6a4229f0c788ecbeb1ad";

cmd({
    pattern: "image2",
    alias: ["img2", "images2"],
    desc: "Google search se 5 images download karke bhejo",
    category: "random",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        if (!args.length) {
            return reply(
                "❌ Image ka naam likho\n\nExample:\n.image cat"
            );
        }

        const query = args.join(" ");
        const apiUrl =
            `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=isch&api_key=${SERP_API_KEY}`;

        const { data } = await axios.get(apiUrl);

        if (!data.images_results || data.images_results.length === 0) {
            return reply("❌ Koi image nahi mili");
        }

        reply(`🔎 *SEARCHING* ${query}\n📤 *SENDING 5 IMAGES...*`);

        // First 5 images
        const images = data.images_results.slice(0, 5);

        for (const img of images) {
            await conn.sendMessage(
                m.chat,
                {
                    image: { url: img.original },
                    caption: `🖼️ ${query}\n\n${botConfig.CAPTION}`
                },
                { quoted: mek }
            );
        }

    } catch (err) {
        console.log("Image Command Error:", err);
        reply("❌ Image download me error aa gaya");
    }
});

// image unlimited 
// 🔹 DuckDuckGo Image Fetch (STABLE)
async function duckDuckGoImages(query) {
    try {
        const html = await axios.get(
            `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                },
                timeout: 10000
            }
        );

        const vqdMatch = html.data.match(/vqd=([\d-]+)&/);
        if (!vqdMatch) return [];

        const vqd = vqdMatch[1];

        const imgRes = await axios.get(
            `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://duckduckgo.com/"
                },
                timeout: 10000
            }
        );

        return Array.isArray(imgRes.data?.results) ? imgRes.data.results : [];

    } catch (e) {
        console.log("DDG Fetch Error:", e.message);
        return [];
    }
}

// 🔀 Proper shuffle (true random)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

cmd({
    pattern: "image",
    alias: ["img", "images"],
    desc: "10 random images bhejo (Unlimited & Stable)",
    category: "random",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const bot = conn.user.id.split(":")[0];
        const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
        
        if (!args.length) {
            return reply("❌ Example:\n.image sana name dp");
        }

        const query = args.join(" ");
        reply(`🔎 *SEARCHING:* ${query}\n📤 *SENDING 10 RANDOM IMAGES...*`);

        let results = await duckDuckGoImages(query);
        if (!results.length) {
            return reply("❌ Koi image nahi mili");
        }

        // ✅ SHUFFLE RESULTS (MAIN FIX)
        results = shuffleArray(results);

        let sent = 0;

        for (const img of results) {
            if (sent >= 10) break;
            if (!img?.image) continue;

            try {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: img.image },
                        caption: `🖼️ ${query}\n\n${botConfig.CAPTION}`
                    },
                    { quoted: mek }
                );

                sent++;
                await new Promise(r => setTimeout(r, 1200));

            } catch {
                // ❌ bad image → skip silently
                continue;
            }
        }

        if (sent === 0) {
            reply("❌ Images mili lekin send nahi ho saki");
        }

    } catch (err) {
        console.log("DuckDuckGo Command Fatal Error:", err);
        reply("❌ Command me error aa gaya");
    }
});

// Happy bday
const bdayMessages = [
  "🎉 *HAPPY BIRTHDAY!* 🎂 Khuda aapko lambi umar de aur har khushi ata kare! 🎁",
  "🎈 *HAPPY BIRTHDAY!* 🌟 Aapka janmdin khushiyon aur muskurahaton se bhara ho! ✨",
  "🥳 *HAPPY BIRTHDAY!* 🎊 Aapki zindagi mein har din itni khushiyan aayein ke aap gin na saken! 💫",
  "🎂 *HAPPY BIRTHDAY!* 🎀 Aapka har sapna poora ho, har arman nikal aaye! 🌸",
  "🎉 *HAPPY BIRTHDAY!* 🌹 Khuda aapko sehat, khushi aur kamiyabi de! 🤲",
  "🎈 *HAPPY BIRTHDAY!* 💝 Aapki zindagi khushboo ki tarah mehke aur chamakti rahe! 🌺",
  "🥳 *HAPPY BIRTHDAY!* 🎁 Aapke liye dua hai ke aage bhi aap hamesha khush rahe! 🙏",
  "🎂 *HAPPY BIRTHDAY!* ✨ Aapka din mithai se bhi zyada meetha ho! 🍰",
  "🎉 *HAPPY BIRTHTHDAY!* 🌟 Aapki muskurahat hamesha aisi hi chamakti rahe! 😊",
  "🎈 *HAPPY BIRTHDAY!* 💫 Aapke janmdin par aasman bhi aapke liye taare barsaye! 🌠",
  "🥳 *HAPPY BIRTHDAY!* 🎊 Zindagi aapko har woh cheez de jo aap chahte hain! 💖",
  "🎂 *HAPPY BIRTHDAY!* 🌸 Aapka aane wala har din is se bhi khubsurat ho! 🌅",
  "🎉 *HAPPY BIRTHDAY!* 🎀 Aapki khwahishen poori hon aur aap hamesha khush rahe! 🌈",
  "🎈 *HAPPY BIRTHDAY!* 💝 Aapke liye har dua qabool ho, har mamla aasan ho! 📿",
  "🥳 *HAPPY BIRTHDAY!* 🎁 Aapki zindagi ka har lamha aapko khushi de! 🕊️",
  "🎂 *HAPPY BIRTHDAY!* ✨ Aapke janmdin ki dheroon badhai aur pyar! ❤️",
  "🎉 *HAPPY BIRTHDAY!* 🌹 Aapki umar barkat wali ho aur aap hamesha sehat mand rahe! 💐",
  "🎈 *HAPPY BIRTHDAY!* 💫 Aapke raste hamesha khushiyon se bhare rahe! 🛣️",
  "🥳 *HAPPY BIRTHDAY!* 🎊 Aapki har manokamna puri ho! 🌠",
  "🎂 *HAPPY BIRTHDAY!* 🌟 Aapka din cricket ki tarah exciting ho! 🏏",
  "🎉 *HAPPY BIRTHDAY!* 🎀 Aapki life movie ki tarah hit ho! 🎬",
  "🎈 *HAPPY BIRTHDAY!* 💝 Aapke liye duniya ki sare khushiyan! 🌍",
  "🥳 *HAPPY BIRTHDAY!* 🎁 Aapka har pal special ho! ⏳",
  "🎂 *HAPPY BIRTHDAY!* ✨ Aapki aankhon mein hamesha chamak rahe! 👀",
  "🎉 *HAPPY BIRTHDAY!* 🌹 Aapke chehre par hamesha muskurahat rahe! 😄",
  "🎈 *HAPPY BIRTHDAY!* 💫 Aapki zindagi garden ki tarah khile! 🌷",
  "🥳 *HAPPY BIRTHDAY!* 🎊 Aapke liye har din celebration ho! 🥂",
  "🎂 *HAPPY BIRTHDAY!* 🌟 Aapka future bright ho! 🔮",
  "🎉 *HAPPY BIRTHDAY!* 🎀 Aapke kadam hamesha kamiyabi ki taraf badhe! 👣",
  "🎈 *HAPPY BIRTHDAY!* 💝 Aapki har duaa qabool ho! 🕌"
];

cmd({
    pattern: "bday",
    desc: "Send Happy Birthday messages",
    category: "random",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    let random = bdayMessages[Math.floor(Math.random() * bdayMessages.length)];
    await reply(random + `\n\n${botConfig.CAPTION}`);
});

// fbday 
const frameBdayMessages = [
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🎁 Aapki Zindagi Ka Har Lamha Aapko Khushi De  🎊*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🌟 Aapka Har Sapna Pura Ho Aur Har Arman Nikal Aaye  ✨*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*💫 Khuda Aapko Lambi Umar De Aur Har Khushi Ata Kare  🤲*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🎉 Aapka Janmdin Khushiyon Aur Muskurahaton Se Bhara Ho  😊*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*❤️ Aapki Zindagi Mein Har Din Itni Khushiyan Aayein Ke Aap Gin Na Saken  🌈*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*👑 Aapki Muskurahat Hamesha Aisi Hi Chamakti Rahe  💎*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🕊️ Aapke Liye Dua Hai Ke Aage Bhi Aap Hamesha Khush Rahe  🙏*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🎯 Aapke Raste Hamesha Khushiyon Se Bhare Rahe  🛣️*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🌺 Aapki Zindagi Khushboo Ki Tarah Mehke Aur Chamakti Rahe  🌸*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*💝 Aapke Janmdin Par Aasman Bhi Aapke Liye Taare Barsaye  🌠*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*✨ Zindagi Aapko Har Woh Cheez De Jo Aap Chahte Hain  💖*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🎊 Aapka Aane Wala Har Din Is Se Bhi Khubsurat Ho  🌅*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🏆 Aapki Khwahishen Poori Hon Aur Aap Hamesha Khush Rahe  📈*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🌙 Aapke Liye Har Dua Qabool Ho, Har Mamla Aasan Ho  📿*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*💎 Aapki Umar Barkat Wali Ho Aur Aap Hamesha Sehat Mand Rahe  💐*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🔥 Aapki Har Manokamna Puri Ho Aur Zindagi Aap Par Fida Ho  🌟*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🎨 Aapka Din Mithai Se Bhi Zyada Meetha Ho Aur Khushiyan Aap Ka Sath Ho  🍰*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🚀 Aapke Kadam Hamesha Kamiyabi Ki Taraf Badhe Aur Safar Rangeen Ho  👣*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🌈 Aapki Aankhon Mein Hamesha Chamak Rahe Aur Chehre Par Muskurahat  😄*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🦋 Aapki Zindagi Garden Ki Tarah Khile Aur Har Phool Khushbu Le Kar Aaye  🌷*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🎵 Aapke Liye Har Din Celebration Ho Aur Khushiyan Aap Ka Intezar Kare  🥂*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🔮 Aapka Future Bright Ho Aur Har Pal Aap Ke Liye Khas Ho  💫*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🏅 Aapki Jeet Ka Jashn Har Saal Aise Hi Manaye Jaye  🎉*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🌍 Aapki Mohabbat Duniya Ko Ek Behtar Jagah Banaye  ❤️*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*⚡ Aapki Energy Har Kisi Ko Inspire Kare Aur Positive Vibes Failaye  🔥*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🎭 Aapki Kahani Har Kisi Ke Liye Motivation Ban Jaye  📖*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🌊 Aapka Josh Kabhi Kam Na Ho Aur Har Mushkil Aasan Ho  💪*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🕯️ Aapki Roshni Se Har Kisi Ka Dil Roshan Ho  💡*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🎯 Aapki Niyat Hamesha Saaf Rahe Aur Iraade Buland  🦅*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*🌼 Aapki Zindagi Phoolon Ki Tarah Khile Aur Mehke  🌺*",
  
  "✦━━━━━━━━━━━━━━━━✦\n  🎂 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎂\n✦━━━━━━━━━━━━━━━━✦\n*👼 Aapki Har Dua Qabool Ho Aur Khuda Aapko Apni Hifazat Mein Rakhe  🤲*"
];

cmd({
    pattern: "fbday", 
    desc: "Send Frame Style Birthday messages",
    category: "random",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    let random = frameBdayMessages[Math.floor(Math.random() * frameBdayMessages.length)];
    await reply(random + `\n\n${botConfig.CAPTION}`);
});

//morning 
const gmMessages = [
  "🌞 *GOOD MORNING!* 🌅 Subah ki roshni aapke din ko khushiyon se bhar de ✨",
  "☀️ *GOOD MORNING!* 🌄 Nayi subah, nayi umeed, nayi shuruaat 🍃",
  "🌤️ *GOOD MORNING!* 🌺 Khuda aapke din ko barkat se bhar de 🤲",
  "🌅 *GOOD MORNING!* 🌼 Suraj ki pehli kirne aapke liye khushkhabri le kar aaye 🌞",
  "🌞 *GOOD MORNING!* 🌸 Aaj ka din aapke liye khas hai, har pal khoobsurat ho 💫",
  "☀️ *GOOD MORNING!* 🌹 Nind se utho aur duniya ko apni muskurahat se roshan karo 😊",
  "🌤️ *GOOD MORNING!* 🌿 Aaj woh din hai jo kal ka intezar kar raha tha 🌟",
  "🌅 *GOOD MORNING!* 🌺 Subah ki hawa aapki thakan door kare 🕊️",
  "🌞 *GOOD MORNING!* 🌼 Aapka din shanti, khushi aur safalta se bhara ho 🙏",
  "☀️ *GOOD MORNING!* 💖 Har nayi subah ek naya mauka hai apne sapno ko poora karne ka ✨",
  "🌤️ *GOOD MORNING!* 🌸 Khuda aapko aaj himmat aur taaqat de 🌞",
  "🌅 *GOOD MORNING!* 🌹 Aaj kuch aisa karo jo kal tak yaad rahe 🎯",
  "🌞 *GOOD MORNING!* 🌿 Suraj ne aapke liye sone ki kirne bheji hain 💛",
  "☀️ *GOOD MORNING!* 🌺 Aapki muskurahat pure din ki roshni ho 😄",
  "🌤️ *GOOD MORNING!* 🌼 Nayi subah, nayi energy, nayi kamyabi 🚀",
  "🌅 *GOOD MORNING!* 💫 Aaj ka din aapke liye khoobsoorat pal laye 🌈",
  "🌞 *GOOD MORNING!* 🌸 Khuda aapke har kaam mein kamyabi de 📿",
  "☀️ *GOOD MORNING!* 🌹 Subah ka aaghaz meethi yaadon se ho 🍯",
  "🌤️ *GOOD MORNING!* 🌿 Aapka din khushiyon se bhari ho aur gam door rahe 🕊️",
  "🌅 *GOOD MORNING!* 🌺 Aaj woh kar dikhao jo aaj tak kisi ne nahi kiya 💎",
  "🌞 *GOOD MORNING!* 🌼 Har subah ek naya iraada lekar aati hai 🌱",
  "☀️ *GOOD MORNING!* ✨ Aapki zindagi khushiyon se bhari ho 🌷",
  "🌤️ *GOOD MORNING!* 🌸 Aaj aapko har woh cheez mile jo aap chahte hain 🎁",
  "🌅 *GOOD MORNING!* 🌹 Khuda aapki har dua qabool kare 🤲",
  "🌞 *GOOD MORNING!* 🌿 Din bhar aapke saath khushi rahe 😊",
  "☀️ *GOOD MORNING!* 🌺 Aapka har pal khushgawar ho 🕊️",
  "🌤️ *GOOD MORNING!* 🌼 Aaj aapko har jagah kamyabi mile 🏆",
  "🌅 *GOOD MORNING!* 💖 Aapki subah ki shuruaat pyar aur khushi se ho ❤️",
  "🌞 *GOOD MORNING!* 🌸 Aapka din ujale aur khushiyon se bhara ho ✨",
  "☀️ *GOOD MORNING!* 🌹 Khuda aapko har mushkil se bachaye aur har sukh de 🛡️"
];

cmd({
    pattern: "morning",
    desc: "Send Good Morning messages",
    category: "random",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    let random = gmMessages[Math.floor(Math.random() * gmMessages.length)];
    await reply(random + `\n\n${botConfig.CAPTION}`);
});

//night
const gnMessages = [
  "🌙 *GOOD NIGHT!* 🌌 May your dreams be sweet & peaceful ✨",
  "🌃 *GOOD NIGHT!* 🌠 Chandni raat apke sapno ko roshan kare 🌙",
  "😴 *GOOD NIGHT!* 🌸 Relax, recharge, and wake up refreshed 🌞",
  "🌌 *GOOD NIGHT!* 🌺 Aankhein band karo aur sukoon bhari neend mein kho jao 💫",
  "🌙 *GOOD NIGHT!* 🌼 Raat ki khamoshi apke dil ko sukoon de 🍃",
  "🌠 *GOOD NIGHT!* 🌹 Sweet dreams, peaceful sleep, khush raho 💖",
  "🌃 *GOOD NIGHT!* 🌸 Stars apke sapnon ko chamka dein ✨",
  "🌙 *GOOD NIGHT!* 🌿 Sleep well, kal ka din aur behtareen hoga 🌞",
  "🌌 *GOOD NIGHT!* 🌺 Subhanallah ki khubsurat raat ka maza lo 🌠",
  "🌙 *GOOD NIGHT!* 🌼 Khuda apke sapnon ko barkat se bharde 🙏",
  "🌃 *GOOD NIGHT!* 🌹 Dreams apke dil ke khwab poore karein 💎",
  "🌠 *GOOD NIGHT!* 🌸 Chand aur tare apko pyar bhare sapne dein 🌙",
  "🌌 *GOOD NIGHT!* 🌺 Let go of worries, kal ek nayi subah ka intezar karein 🌞",
  "😴 *GOOD NIGHT!* 🌿 Raat apko sukoon aur neend ka tohfa de 💖",
  "🌙 *GOOD NIGHT!* 🌼 Sleep tight & don’t let stress bite ✨",
  "🌃 *GOOD NIGHT!* 🌸 Mehka mehka raat ka sukoon aapke saath ho 💫",
  "🌌 *GOOD NIGHT!* 🌹 Sweet dreams, tomorrow is full of hope 🌞",
  "🌙 *GOOD NIGHT!* 🌿 Khuda apko hamesha apne hifazat mein rakhe 🤲",
  "🌠 *GOOD NIGHT!* 🌼 Dreams apke future ka raasta roshan karein 🌟",
  "🌌 *GOOD NIGHT!* 🌺 Shab khair, sukoon bhari neend aur pyare sapne 😴",
  "🌙 *GOOD NIGHT!* 🌹 Chandni apke raat ko roshan kare aur khwab meetha banaye 💖",
  "🌃 *GOOD NIGHT!* 🌸 Tare apko raat bhar company dein ✨",
  "🌠 *GOOD NIGHT!* 🌼 Sleep like a baby, dream like a star 🌌",
  "🌙 *GOOD NIGHT!* 🌿 Kal ek nayi umeed ka safar shuru hoga 🌞",
  "🌌 *GOOD NIGHT!* 🌸 Sweet sleep & peaceful night vibes 🍃",
  "🌃 *GOOD NIGHT!* 🌹 Dua hai apki raat sukoon aur barkat wali ho 🤲",
  "🌙 *GOOD NIGHT!* 🌺 Tired body ko rest do aur kal fresh uthho 🌼",
  "🌠 *GOOD NIGHT!* 🌿 May angels guard your sleep 💫",
  "🌌 *GOOD NIGHT!* 🌸 Har raat ek new hope ki pehli seedhi hai 🌟",
  "🌙 *GOOD NIGHT!* 🌼 Raat ka chand apke sapno ko roshan kare 🌙"
];

cmd({
    pattern: "night",
    desc: "Send Good Night messages",
    category: "random",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot) || { CAPTION: "POWERED BY BANDAHEALI" };
    
    let random = gnMessages[Math.floor(Math.random() * gnMessages.length)];
    await reply(random + `\n\n${botConfig.CAPTION}`);
});
