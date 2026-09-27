const { cmd } = require("../command");

cmd({
pattern: "scan",
desc: "Scan WhatsApp user",
category: "tools",
react: "🔍",
filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

try {

let jid;
let number;

// 1️⃣ reply (q)
if (q && q.sender) {
jid = q.sender;
number = jid.split("@")[0];

// 2️⃣ mention
} else if (m.mentionedJid && m.mentionedJid[0]) {
jid = m.mentionedJid[0];
number = jid.split("@")[0];

// 3️⃣ number from command
} else if (m.text) {

let num = m.text.replace(/[^0-9]/g,"");

if(num.length < 8){
return reply("❌ Valid number do.");
}

number = num;
jid = number + "@s.whatsapp.net";

} else {
return reply("❌ Reply / mention / number do.");
}

// check whatsapp
const check = await conn.onWhatsApp(number);

if(!check || !check.length){
return reply("❌ Ye number WhatsApp par nahi hai.");
}

// bio
let bio = "No bio";
try{
const status = await conn.fetchStatus(jid);
bio = status.status || "No bio";
}catch{}

// dp
let pp;
try{
pp = await conn.profilePictureUrl(jid,"image");
}catch{
pp = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}

let msg = `
╭───〔 *USER SCAN* 〕
│ 👤 Number : ${number}
│ 📱 WhatsApp : Yes
│ 📝 Bio : ${bio}
╰────────────
`;

await conn.sendMessage(from,{
image:{url:pp},
caption:msg
},{quoted:mek});

}catch(e){
console.log(e);
reply("❌ User scan failed");
}

});

cmd({
pattern: "getpp",
alias: ["dp"],
desc: "Get user profile picture",
category: "tools",
react: "🖼️",
filename: __filename
},
async (conn, mek, m, { from, quoted, reply, args }) => {

try {

let jid;

// quoted
if (quoted) {
jid = quoted.sender;

// mentioned
} else if (m.mentionedJid && m.mentionedJid[0]) {
jid = m.mentionedJid[0];

// number
} else if (args[0]) {
let num = args[0].replace(/[^0-9]/g,"");
jid = num + "@s.whatsapp.net";

} else {
return reply("❌ Reply / mention / number do.");
}

let pp;

try {
pp = await conn.profilePictureUrl(jid,"image");
} catch {
pp = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}

await conn.sendMessage(from,{
image:{url:pp},
caption:`👤 *User Profile Picture*\n\n📱 ${jid.split("@")[0]}`
},{quoted:mek});

} catch(e){
console.log(e);
reply("❌ *Fetch Failed*\nError: "+e.message);
}

});
