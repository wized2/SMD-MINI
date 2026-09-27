const axios = require("axios");
const fetch = require("node-fetch");
const { sleep } = require('../lib/functions');
const { bandah, commands } = require("../command");
const config = require("../config");
const { fetchGif, gifToVideo } = require("../lib/fetchGif");
//&const axios = require("axios");
const { updateUserConfigInMongoDB, getUserConfigFromMongoDB } = require('../lib/database');

bandah({
    pattern: "alert",
    alias: ["notification"],
    use: '.alert your text',
    desc: "Generate Alert notification meme.",
    category: "fun",
    react: "🔔",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply, args }) => {
    try {
    
        if (!args || !args[0]) {
            return reply("❌ Example: .alert New Notification");
        }

        const text = args.join(" ");

        // API URL
        const url = `https://gtech-api-xtp1.onrender.com/api/image/alert?text=${encodeURIComponent(text)}&apikey=APIKEY`;

        // Fetch image as buffer
        const response = await axios.get(url, { responseType: "arraybuffer" });

        // Send image
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: `🔔 *Alert Meme Generator*\n\n📝 ${text}`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alert command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});


bandah({
    pattern: "caution",
    alias: ["warning"],
    use: '.caution your text',
    desc: "Generate Caution sign meme.",
    category: "fun",
    react: "⚠️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply, args }) => {
    try {
        if (!args || !args[0]) {
            return reply("❌ Example: .caution Sharp Curve Ahead");
        }

        const text = args.join(" ");

        // API URL
        const url = `https://gtech-api-xtp1.onrender.com/api/image/caution?text=${encodeURIComponent(text)}&apikey=APIKEY`;

        // Fetch image as buffer
        const response = await axios.get(url, { responseType: "arraybuffer" });

        // Send image
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: `⚠️ *Caution Meme Generator*\n\n📝 ${text}`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in caution command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});



bandah({
    pattern: "drake",
    alias: ["meme"],
    use: '.drake text1 | text2',
    desc: "Generate Drake meme.",
    category: "fun",
    react: "😂",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply, args }) => {
    try {
        if (!args || !args[0]) {
            return reply("❌ Example: .drake Other API | API Qasim");
        }

        const [text1, text2] = args.join(" ").split("|").map(t => t.trim());
        if (!text1 || !text2) {
            return reply("❌ Please use format: `.drake text1 | text2`");
        }

        // API URL
        const url = `https://gtech-api-xtp1.onrender.com/api/image/drake?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&apikey=APIKEY`;

        // Fetch image as buffer
        const response = await axios.get(url, { responseType: "arraybuffer" });

        // Send image
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: `*😂 Drake Meme Generator*\n\n🔹 *${text1}*\n🔸 *${text2}*`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in drake command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});




bandah({
    pattern: "happy",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "😂",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '😂' });
        const emojiMessages = [
            "😃", "😄", "😁", "😊", "😎", "🥳",
            "🤩", "🤪", "🤣", "😊"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});

bandah({
    pattern: "heart",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "❤️",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '🖤' });
        const emojiMessages = [
            "💖", "💗", "💕", "🩷", "💛", "💚",
            "🩵", "💙", "💜", "🖤"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});

bandah({
    pattern: "angry",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "🤡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '👽' });
        const emojiMessages = [
            "😡", "😠", "🤬", "😤", "😾", "😡",
            "😠", "🤬", "😤", "😾"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});

bandah({
    pattern: "sad",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "😶",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '😔' });
        const emojiMessages = [
            "🥺", "😟", "😕", "😖", "😫", "🙁",
            "😩", "😥", "😓", "😪"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});

bandah({
    pattern: "shy",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "🧐",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '🧐' });
        const emojiMessages = [
            "😳", "😊", "😶", "🙈", "🙊",
            "😳", "😊", "😶", "🙈", "🙊"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});

bandah({
    pattern: "moon",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "🌚",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '🌝' });
        const emojiMessages = [
            "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
            "🌕", "🌖", "🌗", "🌘"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});

bandah({
    pattern: "confused",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "🤔",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '🤔' });
        const emojiMessages = [
            "😕", "😟", "😵", "🤔", "😖", 
            "😲", "😦", "🤷", "🤷‍♂️", "🤷‍♀️"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});

bandah({
    pattern: "hot",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "💋",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '💋' });
        const emojiMessages = [
            "🥵", "❤️", "💋", "😫", "🤤", 
            "😋", "🥵", "🥶", "🙊", "😻"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});

bandah({
    pattern: "nikal",
    desc: "Displays a dynamic edit msg for fun.",
    category: "fun",
    react: "🗿",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: 'Edith-MD🗿' });
        
        // Define the ASCII art messages
        const asciiMessages = [
            "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀     ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀  ⠀    ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Nikal   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀⠀__⠀   ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`", "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀  ⠀  ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀       ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Lavde   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀|__|⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`", "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀⠀      ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸   Pehli   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀     ⣿  ⢹⠀           ⡇\n  ⠙⢿⣯⠄⠀⠀(P)⠀⠀     ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`", "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀   ⠀     ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Fursat  ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀        ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀⠀__ ⠀  ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`", "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀      ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀ ⠀      ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Meeee   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀       ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀|__| ⠀    ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`", "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀   ⠀  ⠀⢳⡀⠀⡏⠀⠀       ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀  ⠀       ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲   ⣿  ⣸   Nikal   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀       ⣿  ⢹⠀           ⡇\n  ⠙⢿⣯⠄⠀⠀lodu⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀   ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀  ⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀"
        ];

        // Send the initial loading message
        for (const asciiMessage of asciiMessages) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay for 500ms second
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: asciiMessage,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});



bandah({
  pattern: "compatibility",
  alias: ["friend", "fcheck"],
  desc: "Calculate the compatibility score between two users.",
  category: "fun",
  react: "💖",
  filename: __filename,
  use: "@tag1 @tag2",
}, async (conn, mek, m, { args, reply }) => {
  try {
    if (args.length < 2) {
      return reply("Please mention two users to calculate compatibility.\nUsage: `.compatibility @user1 @user2`");
    }

    let user1 = m.mentionedJid[0]; 
    let user2 = m.mentionedJid[1]; 

    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

    // Calculate a random compatibility score (between 1 to 1000)
    let compatibilityScore = Math.floor(Math.random() * 1000) + 1;

    // Check if one of the mentioned users is the special number
    if (user1 === specialNumber || user2 === specialNumber) {
      compatibilityScore = 1000; // Special case for DEV number
      return reply(`💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}+/1000 💖`);
    }

    // Send the compatibility message
    await conn.sendMessage(mek.chat, {
      text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}/1000 💖`,
      mentions: [user1, user2],
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ Error: ${error.message}`);
  }
});

  bandah({
  pattern: "aura",
  desc: "Calculate aura score of a user.",
  category: "fun",
  react: "💀",
  filename: __filename,
  use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
  try {
    if (args.length < 1) {
      return reply("Please mention a user to calculate their aura.\nUsage: `.aura @user`");
    }

    let user = m.mentionedJid[0]; 
    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

    // Calculate a random aura score (between 1 to 1000)
    let auraScore = Math.floor(Math.random() * 1000) + 1;

    // Check if the mentioned user is the special number
    if (user === specialNumber) {
      auraScore = 999999; // Special case for DEV number
      return reply(`💀 Aura of @${user.split('@')[0]}: ${auraScore}+ 🗿`);
    }

    // Send the aura message
    await conn.sendMessage(mek.chat, {
      text: `💀 Aura of @${user.split('@')[0]}: ${auraScore}/1000 🗿`,
      mentions: [user],
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ Error: ${error.message}`);
  }
});

bandah({
    pattern: "roast",
    desc: "Roast someone in Hindi",
    category: "fun",
    react: "🔥",
    filename: __filename,
    use: "@tag"
}, async (conn, mek, m, { q, reply }) => {
    let roasts = [
        "Abe bhai, tera IQ wifi signal se bhi kam hai!",
        "Bhai, teri soch WhatsApp status jaisi hai, 24 ghante baad gayab ho jaati hai!",
        "Abe sochta kitna hai, tu kya NASA ka scientist hai?",
        "Abe tu hai kaun? Google pe search karne se bhi tera naam nahi aata!",
        "Tera dimaag 2G network pe chal raha hai kya?",
        "Itna overthink mat kar bhai, teri battery jaldi down ho jayegi!",
        "Teri soch cricket ke match jaisi hai, baarish aate hi band ho jati hai!",
        "Tu VIP hai, 'Very Idiotic Person'!",
    "Abe bhai, tera IQ wifi signal se bhi kam hai!",
    "Bhai, teri soch WhatsApp status jaisi hai, 24 ghante baad gayab ho jaati hai!",
    "Abe tu kis planet se aaya hai, yeh duniya tere jaise aliens ke liye nahi hai!",
    "Tere dimag mein khojne ka itna kuch hai, lekin koi result nahi milta!",
    "Teri zindagi WhatsApp status jaisi hai, kabhi bhi delete ho sakti hai!",
    "Tera style bilkul WiFi password ki tarah hai, sabko pata nahi!",
    "Abe tu toh wahi hai jo apni zindagi ka plot twist bhi Google karta hai!",
    "Abe tu toh software update bhi nahi chalne wala, pura hang hai!",
    "Tere sochne se zyada toh Google search karne mein time waste ho jaata hai!",
    "Mere paas koi shabdon ki kami nahi hai, bas tujhe roast karne ka mood nahi tha!",
    "Teri personality toh dead battery jaisi hai, recharge karne ka time aa gaya hai!",
    "Bhai, teri soch ke liye ek dedicated server hona chahiye!",
    "Abe tu kaunsa game khel raha hai, jisme har baar fail ho jaata hai?",
    "Tere jokes bhi software update ki tarah hote hain, baar-baar lagte hain par kaam nahi karte!",
    "Teri wajah se toh mere phone ka storage bhi full ho jaata hai!",
    "Abe bhai, tu na ek walking meme ban gaya hai!",
    "Abe apne aap ko bada smart samajhta hai, par teri brain cells toh overload mein hain!",
    "Teri wajah se toh humari group chat ko mute karne ka sochna padta hai!",
    "Abe tere jaise log hamesha apne aap ko hero samajhte hain, par actually toh tum villain ho!",
    "Tere jaise logon ke liye zindagi mein rewind aur fast forward button hona chahiye!",
    "Tere mooh se nikla har lafz ek naya bug hai!",
    "Abe tu apni zindagi ke saath save nahi kar paaya, aur dusron ke liye advice de raha hai!",
    "Tu apne life ka sabse bada virus hai!",
    "Abe tu hain ya koi broken app?",
    "Tere soch ke liye CPU ki zarurat hai, par lagta hai tera CPU khatam ho gaya!",
    "Abe tu kya kar raha hai, ek walking error message ban gaya hai!",
    "Teri taareef toh bas lagti hai, par teri asli aukaat toh sabko pata hai!",
    "Tera brain toh ek broken link ki tarah hai, sab kuch dhundne ke bawajood kuch nahi milta!",
    "Bhai, tujhe dekh ke toh lagta hai, Netflix bhi teri wajah se crash ho gaya!",
    "Teri tasveer toh bas ek screenshot lagti hai, real life mein tu kuch bhi nahi!",
    "Abe bhai, tu lagta hai toh I-phone ho, lekin andar kaafi purana android hai!",
    "Abe, tere jaisi soch se toh Google bhi nafrat karta hoga!",
    "Bhai tu apne chehre se ghazab ka mood bana le, shayad koi notice kar le!",
    "Tere kaam bhi uss app ki tarah hote hain jo crash ho jata hai jab sabko zarurat ho!",
    "Teri zindagi ke sabse bada hack toh hai - 'Log mujhse kuch bhi expect mat karo'!",
    "Abe tu apne aap ko hi mirror mein dekh ke samajhta hai ki sab kuch sahi hai!",
    "Abe tu apne dimaag ko low power mode mein daalke chalta hai!",
    "Tere paas ideas hain, par sab outdated hain jaise Windows XP!",
    "Teri soch toh ek system error ki tarah hai, restart karna padega!",
    "Teri personality toh ek empty hard drive jaise hai, kuch bhi valuable nahi!", 
    "Abe tu kis planet se aaya hai, yeh duniya tere jaise logon ke liye nahi hai!",
    "Tere chehre pe kisi ne 'loading' likh diya hai, par kabhi bhi complete nahi hota!",
    "Tera dimaag toh ek broken link ki tarah hai, kabhi bhi connect nahi hota!",
    "Abe, teri soch se toh Google ka algorithm bhi confused ho jata hai!",
    "Tere jaisa banda, aur aise ideas? Yeh toh humne science fiction mein dekha tha!",
    "Abe tu apne chehre pe 'not found' likhwa le, kyunki sabko kuch milta nahi!",
    "Teri soch itni slow hai, Google bhi teri madad nahi kar paata!",
    "Abe tu toh '404 not found' ka living example hai!",
    "Tera dimaag bhi phone ki battery jaise hai, kabhi bhi drain ho jaata hai!",
    "Abe tu toh wahi hai, jo apni zindagi ka password bhool jaata hai!",
    "Abe tu jise apni soch samajhta hai, wo ek 'buffering' hai!",
    "Teri life ke decisions itne confusing hain, ki KBC ke host bhi haraan ho jaaye!",
    "Bhai, tere jaise logo ke liye ek dedicated 'error' page hona chahiye!",
    "Teri zindagi ko 'user not found' ka message mil gaya hai!",
    "Teri baatein utni hi value rakhti hain, jitni 90s ke mobile phones mein camera quality thi!",
    "Abe bhai, tu toh har waqt 'under construction' rehta hai!",
    "Tere saath toh life ka 'unknown error' hota hai, koi solution nahi milta!",
    "Bhai, tere chehre pe ek warning sign hona chahiye - 'Caution: Too much stupidity ahead'!",
    "Teri har baat pe lagta hai, system crash hone waala hai!",
    "Tere paas idea hai, par wo abhi bhi 'under review' hai!"
];               
        
    let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    let sender = `@${mek.sender.split("@")[0]}`;
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);

    if (!mentionedUser) {
        return reply("Usage: .roast @user (Tag someone to roast them!)");
    }

    let target = `@${mentionedUser.split("@")[0]}`;
    
    // Sending the roast message with the mentioned user
    let message = `${target} :\n *${randomRoast}*\n> This is all for fun, don't take it seriously!`;
    await conn.sendMessage(mek.chat, { text: message, mentions: [mek.sender, mentionedUser] }, { quoted: mek });
});

bandah({
    pattern: "compliment",
    desc: "Give a nice compliment",
    category: "fun",
    react: "😊",
    filename: __filename,
    use: "@tag (optional)"
}, async (conn, mek, m, { reply }) => {
    let compliments = [
        "You're amazing just the way you are! 💖",
        "You light up every room you walk into! 🌟",
        "Your smile is contagious! 😊",
        "You're a genius in your own way! 🧠",
        "You bring happiness to everyone around you! 🥰",
        "You're like a human sunshine! ☀️",
        "Your kindness makes the world a better place! ❤️",
        "You're unique and irreplaceable! ✨",
        "You're a great listener and a wonderful friend! 🤗",
        "Your positive vibes are truly inspiring! 💫",
        "You're stronger than you think! 💪",
        "Your creativity is beyond amazing! 🎨",
        "You make life more fun and interesting! 🎉",
        "Your energy is uplifting to everyone around you! 🔥",
        "You're a true leader, even if you don’t realize it! 🏆",
        "Your words have the power to make people smile! 😊",
        "You're so talented, and the world needs your skills! 🎭",
        "You're a walking masterpiece of awesomeness! 🎨",
        "You're proof that kindness still exists in the world! 💕",
        "You make even the hardest days feel a little brighter! ☀️"
    ];

    let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    let sender = `@${mek.sender.split("@")[0]}`;
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
    let target = mentionedUser ? `@${mentionedUser.split("@")[0]}` : "";

    let message = mentionedUser 
        ? `${sender} complimented ${target}:\n😊 *${randomCompliment}*`
        : `${sender}, you forgot to tag someone! But hey, here's a compliment for you:\n😊 *${randomCompliment}*`;

    await conn.sendMessage(mek.chat, { text: message, mentions: [mek.sender, mentionedUser].filter(Boolean) }, { quoted: mek });
});

bandah({
    pattern: "lovetest",
    desc: "Check love compatibility between two users",
    category: "fun",
    react: "❤️",
    filename: __filename,
    use: "@tag1 @tag2"
}, async (conn, mek, m, { args, reply }) => {
    if (args.length < 2) return reply("Tag two users! Example: .lovetest @user1 @user2");

    let user1 = args[0].replace("@", "") + "@s.whatsapp.net";
    let user2 = args[1].replace("@", "") + "@s.whatsapp.net";

    let lovePercent = Math.floor(Math.random() * 100) + 1; // Generates a number between 1-100

    let messages = [
        { range: [90, 100], text: "💖 *A match made in heaven!* True love exists!" },
        { range: [75, 89], text: "😍 *Strong connection!* This love is deep and meaningful." },
        { range: [50, 74], text: "😊 *Good compatibility!* You both can make it work." },
        { range: [30, 49], text: "🤔 *It’s complicated!* Needs effort, but possible!" },
        { range: [10, 29], text: "😅 *Not the best match!* Maybe try being just friends?" },
        { range: [1, 9], text: "💔 *Uh-oh!* This love is as real as a Bollywood breakup!" }
    ];

    let loveMessage = messages.find(msg => lovePercent >= msg.range[0] && lovePercent <= msg.range[1]).text;

    let message = `💘 *Love Compatibility Test* 💘\n\n❤️ *@${user1.split("@")[0]}* + *@${user2.split("@")[0]}* = *${lovePercent}%*\n${loveMessage}`;

    await conn.sendMessage(mek.chat, { text: message, mentions: [user1, user2] }, { quoted: mek });
}); 

bandah(
    {
        pattern: "emoji",
        desc: "Convert text into emoji form.",
        category: "fun",
        react: "🙂",
        filename: __filename,
        use: "<text>"
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
            // Join the words together in case the user enters multiple words
            let text = args.join(" ");
            
            // Map text to corresponding emoji characters
            let emojiMapping = {
                "a": "🅰️",
                "b": "🅱️",
                "c": "🇨️",
                "d": "🇩️",
                "e": "🇪️",
                "f": "🇫️",
                "g": "🇬️",
                "h": "🇭️",
                "i": "🇮️",
                "j": "🇯️",
                "k": "🇰️",
                "l": "🇱️",
                "m": "🇲️",
                "n": "🇳️",
                "o": "🅾️",
                "p": "🇵️",
                "q": "🇶️",
                "r": "🇷️",
                "s": "🇸️",
                "t": "🇹️",
                "u": "🇺️",
                "v": "🇻️",
                "w": "🇼️",
                "x": "🇽️",
                "y": "🇾️",
                "z": "🇿️",
                "0": "0️⃣",
                "1": "1️⃣",
                "2": "2️⃣",
                "3": "3️⃣",
                "4": "4️⃣",
                "5": "5️⃣",
                "6": "6️⃣",
                "7": "7️⃣",
                "8": "8️⃣",
                "9": "9️⃣",
                " ": "␣", // for space
            };

            // Convert the input text into emoji form
            let emojiText = text.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

            // If no valid text is provided
            if (!text) {
                return reply("Please provide some text to convert into emojis!");
            }

            await conn.sendMessage(mek.chat, {
                text: emojiText,
            }, { quoted: mek });

        } catch (error) {
            console.log(error);
            reply(`Error: ${error.message}`);
        }
    }
);




bandah({
  pattern: "joke",
  desc: "😂 Get a random joke",
  react: "🤣",
  category: "fun",
  filename: __filename
}, async (conn, m, store, { reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    const joke = response.data;

    if (!joke || !joke.setup || !joke.punchline) {
      return reply("❌ Failed to fetch a joke. Please try again.");
    }

    const jokeMessage = `🤣 *Here's a random joke for you!* 🤣\n\n*${joke.setup}*\n\n${joke.punchline} 😆\n\n> *© ${botConfig.CAPTION}*`;

    return reply(jokeMessage);
  } catch (error) {
    console.error("❌ Error in joke command:", error);
    return reply("⚠️ An error occurred while fetching the joke. Please try again.");
  }
});

// flirt

bandah({
    pattern: "flirt",
    alias: ["masom", "line"],
    desc: "Get a random flirt or pickup line.",
    react: "💘",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        // Define API key and URL
        const shizokeys = 'shizo';
        const apiUrl = `https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`;

        // Fetch data from the API
        const res = await fetch(apiUrl);
        if (!res.ok) {
            throw new Error(`API error: ${await res.text()}`);
        }
        
        const json = await res.json();
        if (!json.result) {
            throw new Error("Invalid response from API.");
        }

        // Extract and send the flirt message
        const flirtMessage = `${json.result}`;
        await conn.sendMessage(from, {
            text: flirtMessage,
            mentions: [m.sender],
        }, { quoted: m });

    } catch (error) {
        console.error("Error in flirt command:", error);
        reply("Sorry, something went wrong while fetching the flirt line. Please try again later.");
    }
});

//truth

bandah({
    pattern: "truth",
    alias: ["truthquestion"],
    desc: "Get a random truth question from the API.",
    react: "❓",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);
        
        if (!res.ok) {
            console.error(`API request failed with status ${res.status}`);
            throw new Error(`API request failed with status ${res.status}`);
        }

        const json = await res.json();

        if (!json.result) {
            console.error("Invalid API response: No 'result' field found.");
            throw new Error("Invalid API response: No 'result' field found.");
        }

        const truthText = `${json.result}`;
        await conn.sendMessage(from, { 
            text: truthText, 
            mentions: [m.sender] 
        }, { quoted: m });

    } catch (error) {
        console.error("Error in truth command:", error);
        reply("Sorry, something went wrong while fetching the truth question. Please try again later.");
    }
});

// dare

bandah({
    pattern: "dare",
    alias: ["truthordare"],
    desc: "Get a random dare from the API.",
    react: "🎯",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        // API Key
        const shizokeys = 'shizo';

        // Fetch dare text from the API
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);
        
        if (!res.ok) {
            console.error(`API request failed with status ${res.status}`);
            throw new Error(`API request failed with status ${res.status}`);
        }

        const json = await res.json();

        if (!json.result) {
            console.error("Invalid API response: No 'result' field found.");
            throw new Error("Invalid API response: No 'result' field found.");
        }

        // Format the dare message
        const dareText = `${json.result}`;

        // Send the dare to the chat
        await conn.sendMessage(from, { 
            text: dareText, 
            mentions: [m.sender] 
        }, { quoted: m });

    } catch (error) {
        console.error("Error in dare command:", error);
        reply("Sorry, something went wrong while fetching the dare. Please try again later.");
    }
});

bandah({
  pattern: "fact",
  desc: "🧠 Get a random fun fact",
  react: "🧠",
  category: "fun",
  filename: __filename
}, async (conn, m, store, { reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
    const response = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
    const fact = response.data.text;

    if (!fact) {
      return reply("❌ Failed to fetch a fun fact. Please try again.");
    }

    const factMessage = `🧠 *Random Fun Fact* 🧠\n\n${fact}\n\nIsn't that interesting? 😄\n\n> *© ${botConfig.CAPTION}*`;

    return reply(factMessage);
  } catch (error) {
    console.error("❌ Error in fact command:", error);
    return reply("⚠️ An error occurred while fetching a fun fact. Please try again later.");
  }
});

bandah({
    pattern: "pickupline",
    alias: ["pickup"],
    desc: "Get a random pickup line from the API.",
    react: "💬",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply }) => {
    try {
    const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
        // Fetch pickup line from the API
        const res = await fetch('https://api.popcat.xyz/pickuplines');
        
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }

        const json = await res.json();

        // Log the API response (for debugging purposes)
        console.log('JSON response:', json);

        // Format the pickup line message
        const pickupLine = `*Here's a pickup line for you:*\n\n"${json.pickupline}"\n\n> *© ${botConfig.CAPTION}*`;

        // Send the pickup line to the chat
        await conn.sendMessage(from, { text: pickupLine }, { quoted: m });

    } catch (error) {
        console.error("Error in pickupline command:", error);
        reply("Sorry, something went wrong while fetching the pickup line. Please try again later.");
    }
});

// char

bandah({
    pattern: "character",
    alias: ["char"],
    desc: "Check the character of a mentioned user.",
    react: "🔥",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, text, reply }) => {
    try {
        // Ensure the command is used in a group
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        // Extract the mentioned user
        const mentionedUser = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedUser) {
            return reply("Please mention a user whose character you want to check.");
        }

        // Define character traits
        const userChar = [
            "Sigma",
            "Generous",
            "Grumpy",
            "Overconfident",
            "Obedient",
            "Good",
            "Simp",
            "Kind",
            "Patient",
            "Pervert",
            "Cool",
            "Helpful",
            "Brilliant",
            "Sexy",
            "Hot",
            "Gorgeous",
            "Cute",
        ];

        // Randomly select a character trait
        const userCharacterSelection =
            userChar[Math.floor(Math.random() * userChar.length)];

        // Message to send
        const message = `Character of @${mentionedUser.split("@")[0]} is *${userCharacterSelection}* 🔥⚡`;

        // Send the message with mentions
        await conn.sendMessage(from, {
            text: message,
            mentions: [mentionedUser],
        }, { quoted: m });

    } catch (e) {
        console.error("Error in character command:", e);
        reply("An error occurred while processing the command. Please try again.");
    }
});

bandah({
  pattern: "repeat",
  alias: ["rp", "rpm"],
  desc: "Repeat a message a specified number of times.",
  category: "fun",
  filename: __filename
}, async (conn, m, store, { args, reply }) => {
  try {
    if (!args[0]) {
      return reply("✳️ Use this command like:\n*Example:* .repeat 10,I love you");
    }

    const [countStr, ...messageParts] = args.join(" ").split(",");
    const count = parseInt(countStr.trim());
    const message = messageParts.join(",").trim();

    if (isNaN(count) || count <= 0 || count > 300) {
      return reply("❎ Please specify a valid number between 1 and 300.");
    }

    if (!message) {
      return reply("❎ Please provide a message to repeat.");
    }

    const repeatedMessage = Array(count).fill(message).join("\n");

    reply(`🔄 Repeated ${count} times:\n\n${repeatedMessage}`);
  } catch (error) {
    console.error("❌ Error in repeat command:", error);
    reply("❎ An error occurred while processing your request.");
  }
});

bandah({
  pattern: "send",
  desc: "Send a message multiple times, one by one.",
  category: "fun",
  filename: __filename
}, async (conn, m, store, { args, reply, senderNumber }) => {
  try {
    const botOwner = conn.user.id.split(":")[0]; // Get bot owner's number

    if (senderNumber !== botOwner) {
      return reply("❎ Only the bot owner can use this command.");
    }

    if (!args[0]) {
      return reply("✳️ Use this command like:\n *Example:* .send 10,I love you");
    }

    const [countStr, ...messageParts] = args.join(" ").split(",");
    const count = parseInt(countStr.trim());
    const message = messageParts.join(",").trim();

    if (isNaN(count) || count <= 0 || count > 100) {
      return reply("❎ Please specify a valid number between 1 and 100.");
    }

    if (!message) {
      return reply("❎ Please provide a message to send.");
    }

    reply(`⏳ Sending "${message}" ${count} times. This may take a while...`);

    for (let i = 0; i < count; i++) {
      await conn.sendMessage(m.from, { text: message }, { quoted: m });
      await sleep(1000); // 1-second delay
    }

    reply(`✅ Successfully sent the message ${count} times.`);
  } catch (error) {
    console.error("❌ Error in ask command:", error);
    reply("❎ An error occurred while processing your request.");
  }
});

bandah({
  pattern: "readmore",
  alias: ["rm", "rmore", "readm"],
  desc: "Generate a Read More message.",
  category: "convert",
  use: ".readmore <text>",
  react: "📝",
  filename: __filename
}, async (conn, m, store, { args, reply }) => {
  try {
    const inputText = args.join(" ") || "No text provided.";
    const readMore = String.fromCharCode(8206).repeat(4000); // Creates a large hidden gap
    const message = `${inputText} ${readMore} Continue Reading...`;

    await conn.sendMessage(m.from, { text: message }, { quoted: m });
  } catch (error) {
    console.error("❌ Error in readmore command:", error);
    reply("❌ An error occurred: " + error.message);
  }
});



bandah({
    pattern: "hack",
    desc: "Displays a realistic and animated fake hacking sequence.",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { 
    from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply 
}) => {
    try {
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            return reply("🚫 *Only the bot owner can run this high-level command.*");
        }

        // React with computer emoji
        await m.react("💻");

        const steps = [
            '*Initializing secure terminal...* 🟢',
            '*Booting up Team-Bandaheali Hacking Core* 🔁',
            'Authenticating session... 🔐\n`TOKEN: VERIFIED ✅`',
            'Scanning target systems... 🛰️\n`FOUND 3 Vulnerabilities`',
            'Injecting payload... ☣️',
            'Bypassing firewalls... 🧱➡️🚫',
            '`[▁▁▁▁▁▁▁▁▁▁] 0%` Starting Hack...',
            '`[██▁▁▁▁▁▁▁▁▁] 20%` Accessing Ports 🔍',
            '`[████▁▁▁▁▁▁▁] 40%` Sniffing Data 📡',
            '`[██████▁▁▁▁▁] 60%` Cloning Repositories 👀',
            '`[████████▁▁▁] 80%` Cracking Hashes 🔓',
            '`[██████████] 100%` Operation Complete ✅',
            '📁 Extracted Files:\n - passwords.txt\n - logs.json\n - config.env',
            '*Uploading to Secure Cloud...* ☁️',
            '*Spoofing traces...* 🕵️‍♂️',
            '*Cleaning up digital footprints...* 🧽',
            '*Closing backdoors...* 🚪',
            '🧠 `Team-Bandaheali:` _Mission successful. No traces left._',
            '⚠️ *This was a simulation. Stay ethical, stay safe.*',
            '> *Team-Bandaheali HACKING SIMULATION ENDED* 🛡️'
        ];

        for (const line of steps) {
            await conn.sendMessage(from, { text: line }, { quoted: mek });
            await new Promise(res => setTimeout(res, Math.floor(Math.random() * 600) + 800)); // 800-1400ms delay
        }

        await m.react("✅");
    } catch (e) {
        console.error(e);
        await m.react("❌");
        reply(`❌ *Unexpected error:* ${e.message}`);
    }
});


;

bandah({
    pattern: "pooh",
    alias: ["classypooh", "meme3"],
    use: '.pooh text1 | text2',
    desc: "Generate Pooh meme (Normal vs Classy).",
    category: "fun",
    react: "🐻",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply, args }) => {
    try {
        if (!args || !args[0]) {
            return reply("❌ Example: .pooh Python | JavaScript");
        }

        const [text1, text2] = args.join(" ").split("|").map(t => t.trim());
        if (!text1 || !text2) {
            return reply("❌ Please use format: `.pooh text1 | text2`");
        }

        // API URL
        const url = `https://gtech-api-xtp1.onrender.com/api/image/pooh?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&apikey=APIKEY`;

        // Fetch image as buffer
        const response = await axios.get(url, { responseType: "arraybuffer" });

        // Send image
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: `🐻 *Pooh Meme Generator*\n\n😴 ${text1}\n🤵 ${text2}`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in pooh command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

bandah(
    {
        pattern: "cry",
        desc: "Send a crying reaction GIF.",
        category: "fun",
        react: "😢",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} is crying over @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is crying!`
                : `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇᴅɪᴛʜ-ᴍᴅ`;

            const apiUrl = "https://api.waifu.pics/sfw/cry";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .cry command:", error);
            reply(`❌ *Error in .cry command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "cuddle",
        desc: "Send a cuddle reaction GIF.",
        category: "fun",
        react: "🤗",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} cuddled @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is cuddling everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/cuddle";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .cuddle command:", error);
            reply(`❌ *Error in .cuddle command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "bully",
        desc: "Send a bully reaction GIF.",
        category: "fun",
        react: "😈",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} is bullying @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is bullying everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/bully";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .bully command:", error);
            reply(`❌ *Error in .bully command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "hug",
        desc: "Send a hug reaction GIF.",
        category: "fun",
        react: "🤗",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} hugged @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is hugging everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/hug";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .hug command:", error);
            reply(`❌ *Error in .hug command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);


bandah(
    {
        pattern: "awoo",
        desc: "Send an awoo reaction GIF.",
        category: "fun",
        react: "🐺",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
    const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
        try {
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} awoos at @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is awooing everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/awoo";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .awoo command:", error);
            reply(`❌ *Error in .awoo command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "lick",
        desc: "Send a lick reaction GIF.",
        category: "fun",
        react: "👅",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await  getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);

            let message = mentionedUser ? `${sender} licked @${mentionedUser.split("@")[0]}` : `${sender} licked themselves!`;

            const apiUrl = "https://api.waifu.pics/sfw/lick";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .lick command:", error);
            reply(`❌ *Error in .lick command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);
  
bandah(
    {
        pattern: "pat",
        desc: "Send a pat reaction GIF.",
        category: "fun",
        react: "🫂",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} patted @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is patting everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/pat";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .pat command:", error);
            reply(`❌ *Error in .pat command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "smug",
        desc: "Send a smug reaction GIF.",
        category: "fun",
        react: "😏",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} is smug at @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is feeling smug!`
                : `> © Powered By Bandaheali `;

            const apiUrl = "https://api.waifu.pics/sfw/smug";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .smug command:", error);
            reply(`❌ *Error in .smug command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "bonk",
        desc: "Send a bonk reaction GIF.",
        category: "fun",
        react: "🔨",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} bonked @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is bonking everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/bonk";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .bonk command:", error);
            reply(`❌ *Error in .bonk command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);


bandah(
    {
        pattern: "yeet",
        desc: "Send a yeet reaction GIF.",
        category: "fun",
        react: "💨",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} yeeted @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is yeeting everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/yeet";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .yeet command:", error);
            reply(`❌ *Error in .yeet command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "blush",
        desc: "Send a blush reaction GIF.",
        category: "fun",
        react: "😊",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} is blushing at @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is blushing!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/blush";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .blush command:", error);
            reply(`❌ *Error in .blush command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);  
  
bandah(
    {
        pattern: "handhold",
        desc: "Send a hand-holding reaction GIF.",
        category: "fun",
        react: "🤝",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} is holding hands with @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} wants to hold hands with everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/handhold";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .handhold command:", error);
            reply(`❌ *Error in .handhold command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);


bandah(
    {
        pattern: "highfive",
        desc: "Send a high-five reaction GIF.",
        category: "fun",
        react: "✋",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} gave a high-five to @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is high-fiving everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/highfive";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .highfive command:", error);
            reply(`❌ *Error in .highfive command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);  

bandah(
    {
        pattern: "nom",
        desc: "Send a nom reaction GIF.",
        category: "fun",
        react: "🍽️",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} is nomming @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is nomming everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/nom";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .nom command:", error);
            reply(`❌ *Error in .nom command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "wave",
        desc: "Send a wave reaction GIF.",
        category: "fun",
        react: "👋",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);

            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} waved at @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is waving at everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/wave";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .wave command:", error);
            reply(`❌ *Error in .wave command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "smile",
        desc: "Send a smile reaction GIF.",
        category: "fun",
        react: "😁",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} smiled at @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is smiling at everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/smile";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .smile command:", error);
            reply(`❌ *Error in .smile command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "wink",
        desc: "Send a wink reaction GIF.",
        category: "fun",
        react: "😉",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
            const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} winked at @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is winking at everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/wink";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .wink command:", error);
            reply(`❌ *Error in .wink command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "happy",
        desc: "Send a happy reaction GIF.",
        category: "fun",
        react: "😊",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} is happy with @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is happy with everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/happy";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .happy command:", error);
            reply(`❌ *Error in .happy command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "glomp",
        desc: "Send a glomp reaction GIF.",
        category: "fun",
        react: "🤗",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} glomped @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is glomping everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/glomp";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .glomp command:", error);
            reply(`❌ *Error in .glomp command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "bite",
        desc: "Send a bite reaction GIF.",
        category: "fun",
        react: "🦷",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} bit @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is biting everyone!`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/bite";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .bite command:", error);
            reply(`❌ *Error in .bite command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "poke",
        desc: "Send a poke reaction GIF.",
        category: "fun",
        react: "👉",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} poked @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} poked everyone`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/poke";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .poke command:", error);
            reply(`❌ *Error in .poke command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);
  
  
bandah(
    {
        pattern: "cringe",
        desc: "Send a cringe reaction GIF.",
        category: "fun",
        react: "😬",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} thinks @${mentionedUser.split("@")[0]} is cringe`
                : isGroup
                ? `${sender} finds everyone cringe`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/cringe";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .cringe command:", error);
            reply(`❌ *Error in .cringe command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);


bandah(
    {
        pattern: "dance",
        desc: "Send a dance reaction GIF.",
        category: "fun",
        react: "💃",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message = mentionedUser
                ? `${sender} danced with @${mentionedUser.split("@")[0]}`
                : isGroup
                ? `${sender} is dancing with everyone`
                : `> © ${botConfig.CAPTION}`;

            const apiUrl = "https://api.waifu.pics/sfw/dance";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .dance command:", error);
            reply(`❌ *Error in .dance command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);


  
bandah(
    {
        pattern: "kill",
        desc: "Send a kill reaction GIF.",
        category: "fun",
        react: "🔪",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message;
            if (mentionedUser) {
                let target = `@${mentionedUser.split("@")[0]}`;
                message = `${sender} killed ${target}`;
            } else if (isGroup) {
                message = `${sender} killed everyone`;
            } else {
                message = `> © ${botConfig.CAPTION}`;
            }

            const apiUrl = "https://api.waifu.pics/sfw/kill";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .kill command:", error);
            reply(`❌ *Error in .kill command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "slap",
        desc: "Send a slap reaction GIF.",
        category: "fun",
        react: "✊",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message;
            if (mentionedUser) {
                let target = `@${mentionedUser.split("@")[0]}`;
                message = `${sender} slapped ${target}`;
            } else if (isGroup) {
                message = `${sender} slapped everyone`;
            } else {
                message = `> © ${botConfig.CAPTION}`;
            }

            const apiUrl = "https://api.waifu.pics/sfw/slap";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .slap command:", error);
            reply(`❌ *Error in .slap command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);

bandah(
    {
        pattern: "kiss",
        desc: "Send a kiss reaction GIF.",
        category: "fun",
        react: "💋",
        filename: __filename,
        use: "@tag (optional)",
    },
    async (conn, mek, m, { args, q, reply }) => {
        try {
        const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
            let sender = `@${mek.sender.split("@")[0]}`;
            let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
            let isGroup = m.isGroup;

            let message;
            if (mentionedUser) {
                let target = `@${mentionedUser.split("@")[0]}`;
                message = `${sender} kissed ${target}`;
            } else if (isGroup) {
                message = `${sender} kissed everyone`;
            } else {
                message = `> © ${botConfig.CAPTION}`;
            }

            const apiUrl = "https://api.waifu.pics/sfw/kiss";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            await conn.sendMessage(
                mek.chat,
                { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
                { quoted: mek }
            );
        } catch (error) {
            console.error("❌ Error in .kiss command:", error);
            reply(`❌ *Error in .kiss command:*\n\`\`\`${error.message}\`\`\``);
        }
    }
);


bandah({
  pattern: "ship",
  alias: ["match", "love"],
  desc: "Randomly pairs the command user with another group member.",
  react: "❤️",
  category: "fun",
  filename: __filename
}, async (conn, m, store, { from, isGroup, groupMetadata, reply, sender }) => {
  try {
  const bot = conn.user.id.split(":")[0];
const botConfig = await getUserConfigFromMongoDB(bot);
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null; // Convert to WhatsApp format
    const participants = groupMetadata.participants.map(user => user.id);
    
    let randomPair;

    if (specialNumber && participants.includes(specialNumber) && sender !== specialNumber) {
      randomPair = specialNumber; // Always pair with this number if available
    } else {
      // Pair randomly but ensure user is not paired with themselves
      do {
        randomPair = participants[Math.floor(Math.random() * participants.length)];
      } while (randomPair === sender);
    }

    const message = `💘 *Match Found!* 💘\n❤️ @${sender.split("@")[0]} + @${randomPair.split("@")[0]}\n💖 Congratulations! 🎉`;

    await conn.sendMessage(from, {
      text: message,
      contextInfo: {
        mentionedJid: [sender, randomPair],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: config.NEWSLETTER_JID,
          newsletterName: botConfig.BOT_NAME,
          serverMessageId: 143
        }
      }
    });

  } catch (error) {
    console.error("❌ Error in ship command:", error);
    reply("⚠️ An error occurred while processing the command. Please try again.");
  }
});
