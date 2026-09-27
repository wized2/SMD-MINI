// ✅ Universal Multi-JID Forward Command (Stable Version)

const { cmd } = require("../command");

const SAFETY = {
    MAX_JIDS: 20,
    BASE_DELAY: 2000,
    EXTRA_DELAY: 4000
};

cmd({
    pattern: "forward",
    alias: ["fwd"],
    desc: "Forward replied message to users/groups/LIDs",
    category: "tools",
    react: "📤",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, isOwner }) => {

    try {

        if (!isOwner)
            return reply("📛 Owner Only Command");

        if (!q)
            return reply(
                "Example:\n.forward 923xxx@s.whatsapp.net 120xxx@g.us 123456@lid"
            );

        // safer quoted detection (your framework compatible)
        const quoted = mek.quoted ? mek.quoted : mek;

        const mime = (quoted.msg || quoted).mimetype || "";
        const textMsg = quoted.text || "";

        if (!mime && !textMsg)
            return reply("❌ Unsupported message type.");

        // detect message type
        let msgType = "";

        if (mime.includes("image")) msgType = "image";
        else if (mime.includes("video")) msgType = "video";
        else if (mime.includes("audio")) msgType = "audio";
        else if (mime.includes("sticker")) msgType = "sticker";
        else if (mime.includes("application")) msgType = "document";
        else if (textMsg) msgType = "text";
        else return reply("❌ Unsupported media type.");

        // extract JIDs
        const rawJids = q.split(/[\s,]+/);

        const validJids = rawJids
            .map(j => j.trim())
            .filter(j =>
                j.endsWith("@g.us") ||
                j.endsWith("@s.whatsapp.net") ||
                j.endsWith("@lid")
            )
            .slice(0, SAFETY.MAX_JIDS);

        if (!validJids.length)
            return reply("❌ No valid JIDs found.");

        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        let content = {};

        // text forwarding
        if (msgType === "text") {

            content = {
                text: textMsg
            };

        } else {

            // download media buffer safely
            const buffer = await quoted.download();

            if (!buffer)
                return reply("❌ Failed to download media.");

            if (msgType === "image")
                content = {
                    image: buffer,
                    caption: textMsg
                };

            else if (msgType === "video")
                content = {
                    video: buffer,
                    caption: textMsg
                };

            else if (msgType === "audio")
                content = {
                    audio: buffer,
                    mimetype: mime
                };

            else if (msgType === "sticker")
                content = {
                    sticker: buffer
                };

            else if (msgType === "document")
                content = {
                    document: buffer,
                    mimetype: mime,
                    fileName: quoted.fileName || "file"
                };
        }

        let success = 0;
        let failed = [];

        for (let i = 0; i < validJids.length; i++) {

            try {

                await conn.sendMessage(validJids[i], content);
                success++;

                const delay =
                    (i + 1) % 10 === 0
                        ? SAFETY.EXTRA_DELAY
                        : SAFETY.BASE_DELAY;

                await new Promise(r => setTimeout(r, delay));

            } catch (err) {

                failed.push(validJids[i]);
            }
        }

        let report =
            `✅ Forward Complete\n\n📦 Success: ${success}/${validJids.length}`;

        if (failed.length)
            report += `\n❌ Failed: ${failed.length}`;

        if (rawJids.length > SAFETY.MAX_JIDS)
            report += `\n⚠️ Limited to first ${SAFETY.MAX_JIDS} targets`;

        await reply(report);

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {

        console.error("Forward Error:", err);

        await reply(
            "❌ Forward failed\nCheck:\n• Bot joined group\n• Valid JIDs\n• Media supported"
        );

        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
    }
});
