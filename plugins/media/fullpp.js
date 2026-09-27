// ✅ FULLPP Pair Code Generator (Correct API Flow)

const { cmd } = require("../command");
const axios = require("axios");
const FormData = require("form-data");

cmd({
    pattern: "fullpp",
    alias: ["pairfull", "ppcode"],
    desc: "Generate FULLPP pairing code using replied image",
    category: "tools",
    react: "📱",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    try {

        if (!q) {
            return reply(
                "📱 Example:\nReply to image then type:\n.fullpp 923XXXXXXXXX"
            );
        }

        if (!mek.quoted || !mek.quoted.mtype.includes("image")) {
            return reply("🖼️ Please reply to an image.");
        }

        const phoneNumber = q.trim();

        // 📥 download image buffer
        const buffer = await mek.quoted.download();

        const fileName =
            mek.quoted.message?.imageMessage?.fileName ||
            `fullpp_${Date.now()}.jpg`;

        // ⏳ processing react
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        // 📤 STEP 1: upload image
        const uploadForm = new FormData();
        uploadForm.append("image", buffer, fileName);

        const uploadRes = await axios.post(
            "https://fullpp-by-bandaheali.koyeb.app/upload",
            uploadForm,
            { headers: uploadForm.getHeaders() }
        );

        const uploadData = uploadRes.data;

        if (!uploadData?.filename) {
            return reply("❌ Image upload failed.");
        }

        // 📡 STEP 2: generate pairing code
        const connectRes = await axios.get(
            `https://fullpp-by-bandaheali.koyeb.app/connect?phoneNumber=${phoneNumber}&filename=${encodeURIComponent(uploadData.filename)}`
        );

        const data = connectRes.data;

        if (!data?.code) {
            return reply("❌ Failed to generate pairing code.");
        }

        // 📩 styled message
        const msg = `
📱 *FULLPP Pairing Code*

🔑 Code : *${data.code}*

⚠️ Connect this paircode with your WhatsApp,
then your *FullPP will be updated* successfully.

📞 Number : ${phoneNumber}
`;

        await conn.sendMessage(
            from,
            { text: msg },
            { quoted: mek }
        );

        // 📋 separate copy message
        await conn.sendMessage(
            from,
            { text: `${data.code}` },
            { quoted: mek }
        );

        // ✅ success react
        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {

        console.error("FULLPP ERROR:", err);

        await reply("⚠️ Upload or pairing failed. Try again.");

        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
    }
});
