const config = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const {
  generateWAMessageContent,
  generateWAMessageFromContent
} = require('@whiskeysockets/baileys');
const { updateUserConfigInMongoDB, getUserConfigFromMongoDB } = require('../lib/database');


cmd({
  pattern: "menu2",
  react: "⭐",
  alias: ["m2"],
  desc: "SMD-MINI Menu",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {

try {
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot);
    const botname = botConfig.BOT_NAME || "SMD-MiNI";
   const mode = botConfig.MODE || "public";
   const prefix = botConfig.PREFIX || ".";
   const menuimg = botConfig.MENU_IMG || "https://bandaheali-cdn.koyeb.app/bandaheali/smd.jpg";
   const caption = botConfig.CAPTION || "Powered By Team-Bandaheali";

const user = m.pushName|| sender.split('@')[0];

// ===== AUTO GROUP =====
let categoryMap = {};
commands.forEach(c => {
 if (!c.pattern || !c.category) return;
 const cat = c.category.toUpperCase();
 if (!categoryMap[cat]) categoryMap[cat] = [];
 categoryMap[cat].push(c.pattern);
});

// ===== MENU STRUCTURE =====
const categories = [];

// ===== INFO SLIDE =====
categories.push({
title:`⭐ ${botname} ⭐`,
desc:`
*╭━━━〔 ⭐ ${botname} ⭐ 〕━━━┈⊷*
*┇★ 👋 Hello : ${user}*
*┇★ 🤖 Bot : ${botname}*
*┇★ ⚙ Mode : ${mode}*
*┇★ ⚙ Prefix : ${prefix}*
*┇★ ⏱ Uptime : ${runtime(process.uptime())}*
*┇★ 💻 Platform : ${os.platform()}*
*┇★ 📜 Commands : ${commands.length}*
*╰━━━━━━━━━━━━━━━━━━━┈⊷*
`,
image:`${menuimg}`
});

// ===== AUTO CATEGORY SLIDES =====
Object.keys(categoryMap).forEach(cat => {

let cmdList="";
categoryMap[cat].forEach(c=>{
 cmdList += `*┇★ .${c}*\n`;
});

categories.push({
title:`⭐ ${cat} ⭐`,
desc:`
‎*╭┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊰*
‎*┋*★╭┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
‎*┋*★┋✨┋⭐┋✨┋⭐┋✨┋⭐┋
‎*┋*★┋✨┋⭐┋✨┋⭐┋✨┋  
‎*┋*★┋✨┋⭐┋✨┋⭐┋   
‎*┋*★┋✨┋⭐┋✨┋   
‎*┋*★┋✨┋⭐┋  
‎*┋*★┋✨┋                
‎*┋*★┋        
‎*┋*★┋         
‎*┋*★┋ *᛭┉┉┉┈┈┈┈┈┈┉┉┉᛭*
‎*┇*★┋⭐ ⃟ ⃟ *_${cat}_* ⃟ ⃟⭐
‎*┇*★┋ *᛭┉┉┉┈┈┈┈┈┈┉┉┉᛭*
${cmdList}
‎*┋*★╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
‎*╰┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊰*
`,
image:`${menuimg}`
});
});

// ===== BUILD CARDS =====
const cards=[];
for(let i=0;i<categories.length;i++){
const item=categories[i];

const img=(await generateWAMessageContent(
{ image:{ url:item.image } },
{ upload:conn.waUploadToServer }
)).imageMessage;

cards.push({
header:{ title:item.title, hasMediaAttachment:true, imageMessage:img },
body:{ text:item.desc },
footer:{ text:`Page ${i+1}/${categories.length}` },
nativeFlowMessage:{
buttons:[
{
name:"cta_url",
buttonParamsJson:JSON.stringify({
display_text:"📢 Channel",
url:"https://whatsapp.com/channel/0029VaDaBJGJUM2jS0z59S3s",
merchant_url:"https://whatsapp.com/channel/0029VaDaBJGJUM2jS0z59S3s"
})
},
{
name:"cta_url",
buttonParamsJson:JSON.stringify({
display_text:"🚀 Free Deploy",
url:"https://smd-mini.bandaheali.site",
merchant_url:"https://smd-mini.bandaheali.site"
})
}
]
}
});
}

// ===== SEND =====
const msg=generateWAMessageFromContent(from,{
viewOnceMessage:{
message:{
interactiveMessage:{
body:{ text:`⭐ ${botname} MENU ⭐` },
footer:{ text:`${caption}` },
carouselMessage:{ cards }
}
}
}
},{ quoted: mek });

await conn.relayMessage(from,msg.message,{ messageId:msg.key.id });

}catch(e){
console.log("MENU ERROR:", e);
reply("❌ Menu load nahi ho saka");
}

});
