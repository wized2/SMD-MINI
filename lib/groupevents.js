// Credits Team-Bandaheali (Full Fancy + Debug Version)

const { isJidGroup } = require('@whiskeysockets/baileys');
const { getUserConfigFromMongoDB } = require("./database");

const DEBUG = false;

function log(...msg) {
    if (DEBUG) console.log("[GROUP-EVENTS]", ...msg);
}

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'
];

// Fancy font converter
function toSameStyle(text) {
    const map = {
        A:'α',B:'в',C:'¢',D:'∂',E:'є',F:'f',G:'g',H:'н',I:'ι',
        J:'נ',K:'к',L:'ℓ',M:'м',N:'и',O:'σ',P:'ρ',Q:'q',R:'я',
        S:'ѕ',T:'т',U:'υ',V:'ν',W:'ω',X:'χ',Y:'у',Z:'z',
        a:'α',b:'в',c:'¢',d:'∂',e:'є',f:'f',g:'g',h:'н',i:'ι',
        j:'נ',k:'к',l:'ℓ',m:'м',n:'и',o:'σ',p:'ρ',q:'q',r:'я',
        s:'ѕ',t:'т',u:'υ',v:'ν',w:'ω',x:'χ',y:'у',z:'z'
    };
    return text.split('').map(x => map[x] || x).join('');
}

function isBotAdmin(metadata, jid) {
    const bot = metadata.participants.find(p => p.id === jid);
    return bot && (bot.admin === 'admin' || bot.admin === 'superadmin');
}

function isUserAdmin(metadata, jid) {
    const user = metadata.participants.find(p => p.id === jid);
    return user && (user.admin === 'admin' || user.admin === 'superadmin');
}

const GroupEvents = async (conn, update) => {

try {

log("Event:", update.action);

const botNum = conn.user.id?.split(":")[0];
const config = await getUserConfigFromMongoDB(botNum);

if (!config) return log("Config missing ❌");

if (!isJidGroup(update.id)) return log("Not group event ❌");

const metadata = await conn.groupMetadata(update.id);
log("Metadata loaded ✅");

const participants = update.participants || [];
const desc = metadata.desc || "No Description";
const members = metadata.participants.length;
const timestamp = new Date().toLocaleString();

const botName = config.BOT_NAME || "TEAM-BANDAHEALI";
const styledBotName = toSameStyle(botName);
const powerText = `ρσωєяє∂ ву ${styledBotName}`;

let ppUrl;

try {
    ppUrl = await conn.profilePictureUrl(update.id,'image');
} catch {
    ppUrl = ppUrls[0];
}

const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
const botLid = conn.user.lid.split(":")[0] + "@lid";
const botAdmin = isBotAdmin(metadata, botLid);

log("Bot admin:", botAdmin);

for (const item of participants) {

const participantId = typeof item === "string" ? item : item.phoneNumber;
const number = participantId.split("@")[0];

log("Processing:", number);

// ================= ANTI FOREIGN =================

if (update.action === "add" && config.ANTI_FORIGN === "true") {

if (!botAdmin) continue;

let blockedCodes = [];

if (typeof config.ANTI_FORIGN_NUMBER === "string") {
blockedCodes = config.ANTI_FORIGN_NUMBER.split(",").map(x=>x.trim());
}

const foreign = blockedCodes.length === 0
? true
: blockedCodes.some(code => number.startsWith(code));

if (foreign) {

await conn.sendMessage(update.id,{
text:
`*╭────⬡ αηтι-ƒσяєιgη ⬡────*
*├▢ @${number} fσяєιgη ηυмвєя ∂єтє¢тє∂*
*├▢ αυтσ яємσνє∂ ƒяσм gяσυρ*
*├▢ ¢σ∂єѕ : ${blockedCodes.length ? blockedCodes.join(', ') : 'ALL NON-LOCAL'}*
*╰────────────────────*`,
mentions:[participantId]
});

await conn.groupParticipantsUpdate(update.id,[participantId],"remove");

log("Foreign removed:", number);

continue;
}
}


// ================= WELCOME =================

if (update.action === "add" && config.WELCOME === "true") {

const WelcomeText =
`*╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄──*
*│  ̇─̣─̇─̣〘 ωєℓ¢σмє 〙̣─̇─̣─̇*
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│❀ нєу* @${number}
*│❀ gʀσυρ* ${metadata.subject}
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│● ѕтαу ѕαfє αи∂ fσℓℓσω*
*│● тнє gʀσυρѕ яυℓєѕ!*
*│● נσιиє∂ ${members}*
*│● ${powerText}*
*╰┉┉┉┉┈┈┈┈┈┈┈┈┉┉┉᛫᛭*
${desc}`;

await conn.sendMessage(update.id,{
image:{url:ppUrl},
caption:WelcomeText,
mentions:[participantId]
});

log("Welcome sent");

}


// ================= GOODBYE =================

else if (update.action === "remove" && config.GOODBYE === "true") {

const GoodbyeText =
`*╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄──*
*│  ̇─̣─̇─̣〘 gσσ∂вує 〙̣─̇─̣─̇*
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│❀ υѕєя* @${number}
*│● мємвєя ℓєfт тнє gʀσυρ*
*│● мємвєяѕ ${members}*
*│● ${powerText}*
*╰┉┉┉┉┈┈┈┈┈┈┈┈┉┉┉᛫᛭*`;

await conn.sendMessage(update.id,{
image:{url:ppUrl},
caption:GoodbyeText,
mentions:[participantId]
});

log("Goodbye sent");

}


// ================= ANTI PROMOTE =================

else if (update.action === "promote" && config.ANTI_PROMOTE === "true") {

if (!botAdmin) continue;

const promoter = update.author.split("@")[0];

await conn.groupParticipantsUpdate(update.id,[participantId],"demote");
await conn.groupParticipantsUpdate(update.id,[update.author],"demote");

await conn.sendMessage(update.id,{
text:
`*╭────⬡ αηтι-ρяσмσтє ⬡────*
*├▢ @${promoter} тяιє∂ тσ ρяσмσтє*
*├▢ @${number} αѕ α∂мιη*
*├▢ αυтσ яєνєяѕє∂ ѕυ¢¢єѕѕƒυℓℓу*
*├▢ υѕєя ∂ємσтє∂*
*╰────────────────────*`,
mentions:[update.author,participantId]
});

log("Anti-promote executed");

}


// ================= ANTI DEMOTE =================

else if (update.action === "demote" && config.ANTI_PROMOTE === "true") {

if (!botAdmin) continue;

const demoter = update.author.split("@")[0];

await conn.groupParticipantsUpdate(update.id,[update.author],"demote");
await conn.groupParticipantsUpdate(update.id,[participantId],"promote");

await conn.sendMessage(update.id,{
text:
`*╭────⬡ αηтι-∂ємσтє ⬡────*
*├▢ @${demoter} тяιє∂ тσ ∂ємσтє*
*├▢ @${number} fяσм α∂мιη*
*├▢ αυтσ яєνєяѕє∂ ѕυ¢¢єѕѕƒυℓℓу*
*├▢ υѕєя яєѕтσяє∂*
*╰────────────────────*`,
mentions:[update.author,participantId]
});

log("Anti-demote executed");

}


// ================= ADMIN EVENTS =================

else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {

const promoter = update.author.split("@")[0];

await conn.sendMessage(update.id,{
text:
`*╭────⬡ α¢тιση-ѕтαтυѕ ⬡────*
*├▢ @${promoter} нαѕ ρяσмσтє∂*
*├▢ @${number} тσ α∂мιη*
*├▢ тιмє : ${timestamp}*
*├▢ gяσυρ : ${metadata.subject}*
*├▢ ${powerText}*
*╰────────────────────*`,
mentions:[update.author,participantId]
});

}


else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {

const demoter = update.author.split("@")[0];

await conn.sendMessage(update.id,{
text:
`*╭────⬡ α¢тιση-ѕтαтυѕ ⬡────*
*├▢ @${demoter} нαѕ ∂ємσтє∂*
*├▢ @${number} fяσм α∂мιη*
*├▢ тιмє : ${timestamp}*
*├▢ gяσυρ : ${metadata.subject}*
*├▢ ${powerText}*
*╰────────────────────*`,
mentions:[update.author,participantId]
});

}

}

log("Event completed ✅");

} catch (err) {

console.error("GROUP EVENT ERROR ❌", err);

}

};

module.exports = GroupEvents;
