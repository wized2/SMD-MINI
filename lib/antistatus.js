async function antiStatusMention(conn, mek) {
try {

console.log("📡 AntiStatusMention Triggered");

// ================= STATUS CHECK =================
const from = mek.key?.remoteJid;

console.log("RemoteJid:", from);

if (from !== "status@broadcast") {
console.log("❌ Not a status message");
return;
}

console.log("✅ Status detected");

// ================= SENDER =================
const sender = mek.key?.participant || mek.key?.remoteJid;

console.log("Sender:", sender);

// ================= BOT IDS =================
const botNumber = conn.user.id.split(":")[0];
const botJid = botNumber + "@s.whatsapp.net";
const botLid = botNumber + "@lid";

console.log("BotJid:", botJid);
console.log("BotLid:", botLid);

// ================= MESSAGE DEBUG =================
console.log("Full Status Message:");
console.log(JSON.stringify(mek.message, null, 2));

// ================= DETECT GROUP =================
const mentioned =
mek.message?.groupStatusMentionMessage?.groupJid ||
mek.message?.extendedTextMessage?.contextInfo?.mentionedJid;

console.log("Mentioned:", mentioned);

if (!mentioned) {
console.log("❌ No group mention found");
return;
}

const groups = Array.isArray(mentioned) ? mentioned : [mentioned];

for (const groupId of groups) {

console.log("GroupId:", groupId);

if (!groupId.endsWith("@g.us")) {
console.log("❌ Not a group");
continue;
}

// ================= GROUP METADATA =================
const metadata = await conn.groupMetadata(groupId);

console.log("Group Name:", metadata.subject);

// ================= BOT ADMIN CHECK =================
const botAdmin = metadata.participants.find(
p => p.id === botJid || p.id === botLid
);

if (!botAdmin || !botAdmin.admin) {
console.log("❌ Bot is not admin");
continue;
}

// ================= SELF PROTECTION =================
if (sender === botJid || sender === botLid) {
console.log("⚠️ Sender is bot itself");
return;
}

console.log("🚨 Removing user:", sender);

// ================= REMOVE USER =================
await conn.groupParticipantsUpdate(groupId, [sender], "remove");

// ================= SEND MESSAGE =================
await conn.sendMessage(groupId, {
text:
`🚫 *ANTI STATUS MENTION*

@${sender.split("@")[0]} mentioned this group in WhatsApp status.

User removed automatically.`,
mentions: [sender]
});

console.log("✅ User removed successfully");

}

} catch (err) {
console.log("❌ AntiStatusMention Error:", err);
}
}

module.exports = antiStatusMention;
