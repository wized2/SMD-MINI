const { bandah } = require('../command');
const { updateUserConfigInMongoDB, getUserConfigFromMongoDB } = require('../lib/database');

// Auto Record
bandah({
  pattern: "autorecord",
  alias: ["recording", "record"], // Fixed: alies -> alias, added proper array
  desc: "Auto Recording On/Off",
  category: "settings",
  react: "🎤",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`🎤 Auto Recording: ${c?.AUTO_RECORDING === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .autorecord on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { AUTO_RECORDING: newValue });

  reply(`✅ Auto Recording ${args[0].toUpperCase()} `);
});

bandah({
  pattern: "antipromote",
  alias: ["apromote", "antip"], // Fixed: alies -> alias, added proper array
  desc: "Anti Promote On/Off",
  category: "settings",
  react: "🎤",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(` Anti Promote: ${c?.ANTI_PROMOTE === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .antipromote on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { ANTI_PROMOTE: newValue });

  reply(`✅ ANTI PROMOTE ${args[0].toUpperCase()} `);
});


bandah({
  pattern: "antiforign",
  alias: ["aforeign", "antif"],
  desc: "Anti Foreign Numbers On/Off",
  category: "settings",
  react: "🌍",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(` Anti Foreign: ${c?.ANTI_FORIGN === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0]))
    return reply("Use: .antiforign on/off");

  const newValue = args[0] === "on" ? "true" : "false";

  await updateUserConfigInMongoDB(bot, {
    ANTI_FORIGN: newValue
  });

  reply(`✅ ANTI FOREIGN ${args[0].toUpperCase()} 🌍`);
});


bandah({
  pattern: "antiforignnumber",
  alias: ["afnum", "foreigncodes"],
  desc: "Set allowed country codes (comma separated)",
  category: "settings",
  react: "📵",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(
      ` Current Allowed Codes: ${
        c?.ANTI_FORIGN_NUMBER || "Not Set (ALL NON-LOCAL BLOCKED)"
      }`
    );
  }

  const codes = args[0]
    .split(",")
    .map(x => x.trim())
    .filter(Boolean)
    .join(",");

  await updateUserConfigInMongoDB(bot, {
    ANTI_FORIGN_NUMBER: codes
  });

  reply(`✅ Not Allowed Country Codes Updated:\n📌 ${codes}`);
});


bandah({
  pattern: "alwaysonline",
  alias: ["aonline", "alwayso"], // Fixed: alies -> alias, added proper array
  desc: "Auto AlwaysOnline On/Off",
  category: "settings",
  react: "👨‍💻",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`👨‍💻 Always Online: ${c?.ALWAYS_ONLINE === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .alwaysonline on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { ALWAYS_ONLINE: newValue });

  reply(`✅ ALWAYS ONLINE ${args[0].toUpperCase()} `);
});


bandah({
  pattern: "antibad",
  alias: ["badword", "antigali"],
  desc: "Anti Bad Words On/Off",
  category: "settings",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`🚫 Anti Bad: ${c?.ANTI_BAD === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .antibad on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { ANTI_BAD: newValue });

  reply(`✅ Anti Bad ${args[0].toUpperCase()}`);
});

bandah({
  pattern: "autoreply",
  alias: ["autorep", "replyauto"],
  desc: "Auto Reply On/Off",
  category: "settings",
  react: "💬",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`💬 Auto Reply: ${c?.AUTO_REPLY === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .autoreply on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { AUTO_REPLY: newValue });

  reply(`✅ Auto Reply ${args[0].toUpperCase()}`);
});

bandah({
  pattern: "mentionreply",
  alias: ["mentionrep", "mreply"],
  desc: "Mention Reply On/Off",
  category: "settings",
  react: "📢",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`📢 Mention Reply: ${c?.MENTION_REPLY === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) {
    return reply("Use: .mentionreply on/off");
  }

  const newValue = args[0] === "on" ? "true" : "false";

  await updateUserConfigInMongoDB(bot, {
    MENTION_REPLY: newValue
  });

  reply(`✅ Mention Reply ${args[0].toUpperCase()}`);
});

bandah({
  pattern: "autosticker",
  alias: ["autostick", "stickerauto"],
  desc: "Auto Sticker On/Off",
  category: "settings",
  react: "🖼️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`🖼️ Auto Sticker: ${c?.AUTO_STICKER === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) {
    return reply("Use: .autosticker on/off");
  }

  const newValue = args[0] === "on" ? "true" : "false";

  await updateUserConfigInMongoDB(bot, {
    AUTO_STICKER: newValue
  });

  reply(`✅ Auto Sticker ${args[0].toUpperCase()}`);
});



bandah({
  pattern: "auto-dl",
  alias: ["autodownload", "autodl"], // Fixed: alies -> alias, added proper array
  desc: "Auto DOWNLOAD On/Off",
  category: "settings",
  react: "📥",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`📥 Auto Download: ${c?.AUTO_DOWNLOAD === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off", "inbox", "groups"].includes(args[0])) return reply("Use: .auto-dl on/off/inbox/groups");

 // const newValue = args;
    let newValue =
  args[0] === "on" ? "true" :
  args[0] === "off" ? "false" :
  args[0];
  await updateUserConfigInMongoDB(bot, { AUTO_DOWNLOAD: newValue });

  reply(`✅ Auto DOWNLOAD ${args[0].toUpperCase()} `);
});

      
// Anti Call
bandah({
  pattern: "anticall",
  alias: ["callblock", "blockcall"], // Added aliases
  desc: "Enable or Disable Anti Call (Bot Only)",
  category: "settings",
  react: "📞",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {
  try {
      if (!isOwner) return reply("❌ Only bot can use this");

    const botNumber = conn.user.id.split(":")[0];

    if (!args[0]) {
      const current = await getUserConfigFromMongoDB(botNumber);
      const status = current?.ANTI_CALL === "true" ? "ON ✅" : "OFF ❌";
      return reply(`📞 *Anti Call Status*\n\nCurrent: ${status}\n\nUse:\n.anticall on\n.anticall off`);
    }

    let value = args[0].toLowerCase();
    if (!["on", "off"].includes(value)) {
      return reply("❌ Use only:\n.anticall on\n.anticall off");
    }

    const newValue = value === "on" ? "true" : "false";
    await updateUserConfigInMongoDB(botNumber, { ANTI_CALL: newValue });

    reply(`✅ Anti Call ${value.toUpperCase()}`);

  } catch (err) {
    console.error("AntiCall CMD Error:", err);
    reply("❌ Failed to update Anti Call");
  }
});

// Auto Type
bandah({
  pattern: "autotype",
  alias: ["typing", "autotyping"], // Added aliases
  desc: "Auto Typing On/Off",
  category: "settings",
  react: "⌨️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`⌨️ Auto Typing: ${c?.AUTO_TYPING === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .autotype on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { AUTO_TYPING: newValue });

  reply(`✅ Auto Typing ${args[0].toUpperCase()}`);
});

// Auto Read
bandah({
  pattern: "autoread",
  alias: ["read", "autoreading"], // Added aliases
  desc: "Auto Read On/Off",
  category: "settings",
  react: "📖",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`📖 Auto Read: ${c?.READ_MESSAGE === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .autoread on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { READ_MESSAGE: newValue });

  reply(`✅ Auto Read ${args[0].toUpperCase()}`);
});

// Anti Delete
bandah({
  pattern: "antidel",
  alias: ["antidelete", "delprotection"], // Added aliases
  desc: "Anti Delete On/Off",
  category: "settings",
  react: "🛡️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`🛡️ Anti Delete: ${c?.ANTI_DELETE === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .antidel on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { ANTI_DELETE: newValue });

  reply(`✅ Anti Delete ${args[0].toUpperCase()}`);
});

// Anti Edit
bandah({
  pattern: "antiedit",
  alias: ["antedit", "editprotection"], // Added aliases
  desc: "Anti Edit On/Off",
  category: "settings",
  react: "✏️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`✏️ Anti Edit: ${c?.ANTI_EDIT === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .antiedit on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { ANTI_EDIT: newValue });

  reply(`✅ Anti Edit ${args[0].toUpperCase()}`);
});

// Reject Message
bandah({
  pattern: "rejectmsg",
  alias: ["reject", "rejectmessage"], // Added aliases
  desc: "Set Reject Message",
  category: "settings",
  react: "💬",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args.length) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`💬 Current Reject Message:\n${c?.REJECT_MSG || "Not Set"}\n\nUse: .rejectmsg Your text here`);
  }

  await updateUserConfigInMongoDB(bot, { REJECT_MSG: args.join(" ") });

  reply(`✅ Reject Message Updated: "${args}`);
});

// Status View
bandah({
  pattern: "statusview",
  alias: ["viewstatus", "autoview"], // Added aliases
  desc: "Auto View Status On/Off",
  category: "settings",
  react: "👀",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`👀 Status View: ${c?.AUTO_VIEW_STATUS === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .statusview on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { AUTO_VIEW_STATUS: newValue });

  reply(`✅ Status View ${args[0].toUpperCase()} `);
});

// Status React
bandah({
  pattern: "statusreact",
  alias: ["reactstatus", "statuslike"], // Added aliases
  desc: "Auto React Status On/Off",
  category: "settings",
  react: "❤️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`❤️ Status React: ${c?.AUTO_LIKE_STATUS === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .statusreact on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { AUTO_LIKE_STATUS: newValue });

  reply(`✅ Status React ${args[0].toUpperCase()} `);
});

// Status Reply
bandah({
  pattern: "statusreply",
  alias: ["replystatus", "autoreplystatus"], // Added aliases
  desc: "Auto Status Reply On/Off",
  category: "settings",
  react: "💬",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`💬 Status Reply: ${c?.AUTO_STATUS_REPLY === "true" ? "ON ✅" : "OFF ❌"}`);
  }

  if (!["on", "off"].includes(args[0])) return reply("Use: .statusreply on/off");

  const newValue = args[0] === "on" ? "true" : "false";
  await updateUserConfigInMongoDB(bot, { AUTO_STATUS_REPLY: newValue });

  reply(`✅ Status Reply ${args[0].toUpperCase()} `);
});

// Status Message
bandah({
  pattern: "statusmsg",
  alias: ["statusmessage", "replymsg"], // Added aliases
  desc: "Set Status Reply Message",
  category: "settings",
  react: "✍️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args.length) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`✍️ Current Status Msg:\n${c?.AUTO_STATUS_MSG || "Not Set"}\n\nUse: .statusmsg Your message here`);
  }

  await updateUserConfigInMongoDB(bot, { AUTO_STATUS_MSG: args.join(" ") });

  reply(`✅ Status Reply Message Updated: "${args.join(" ")}" [${args[0]}...]`);
});

// Anti Delete Path
bandah({
  pattern: "antidelpath",
  alias: ["antideletepath", "delpath"], // Added aliases
  desc: "Set Anti Delete Path",
  category: "settings",
  react: "📁",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`📁 Current AntiDel Path: ${c?.ANTI_DEL_PATH || "samechat"}\n\nUse:\n.antidelpath inbox\n.antidelpath samechat`);
  }

  const mode = args[0].toLowerCase();
  if (!["inbox", "same"].includes(mode)) {
    return reply("❌ Use: inbox / same");
  }

  await updateUserConfigInMongoDB(bot, { ANTI_DEL_PATH: mode });

  reply(`✅ Anti Delete Path set to: ${mode.toUpperCase()} [${mode}]`);
});

// Anti Edit Path
bandah({
  pattern: "antieditpath",
  alias: ["anteditpath", "editpath"], // Added aliases
  desc: "Set Anti Edit Path",
  category: "settings",
  react: "📝",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`📝 Current AntiEdit Path: ${c?.ANTI_EDIT_PATH || "samechat"}\n\nUse:\n.antieditpath inbox\n.antieditpath samechat`);
  }

  const mode = args[0].toLowerCase();
  if (!["inbox", "same"].includes(mode)) {
    return reply("❌ Use: inbox / same");
  }

  await updateUserConfigInMongoDB(bot, { ANTI_EDIT_PATH: mode });

  reply(`✅ Anti Edit Path set to: ${mode.toUpperCase()} [${mode}]`);
});

// Menu Image
bandah({
  pattern: "menuimg",
  alias: ["menupic", "menuimage"], // Added aliases
  desc: "Set Menu Image",
  category: "settings",
  react: "🖼️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`🖼️ Current Menu Img:\n${c?.MENU_IMG || "Not Set"}\n\nUse: .menuimg [image_url]`);
  }

  const url = args.join(" ");
  await updateUserConfigInMongoDB(bot, { MENU_IMG: url });

  reply(`✅ Menu image updated: ${url.substring(0, 30)}... `);
});

// Bot Name
bandah({
  pattern: "botname",
  alias: ["name", "bot"], // Added aliases
  desc: "Set Bot Name",
  category: "settings",
  react: "🤖",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args.length) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`🤖 Current Bot Name:\n${c?.BOT_NAME || "Not Set"}\n\nUse: .botname Your Bot Name`);
  }

  const name = args.join(" ");
  await updateUserConfigInMongoDB(bot, { BOT_NAME: name });

  reply(`✅ Bot name updated to: "${name}" `);
});

// Menu Caption
bandah({
  pattern: "caption",
  alias: ["menucap", "menutext"], // Added aliases
  desc: "Set Menu Caption",
  category: "settings",
  react: "📝",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only bot can use this");

  const bot = conn.user.id.split(":")[0];

  if (!args.length) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`📝 Current Caption:\n${c?.CAPTION || "Not Set"}\n\nUse: .caption Your caption text`);
  }

  const text = args.join(" ");
  await updateUserConfigInMongoDB(bot, { CAPTION: text });

  reply(`✅ Caption updated: "${text}" `);
});

bandah({
  pattern: "mode",
  alias: ["botmode", "setmode"], // Added aliases
  desc: "Set Bot Mode",
  category: "settings",
  react: "📝",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id
    .replace(/@.*$/, "")
    .replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);

    return reply(
      `📝 Current MODE: ${(c?.MODE || "public").toUpperCase()}\n\n` +
      `Use:\n` +
      `.mode public\n` +
      `.mode private\n` +
      `.mode inbox\n` +
      `.mode groups`
    );
  }

  const mode = args[0].toLowerCase();

  if (!["public", "private", "inbox", "groups"].includes(mode)) {
    return reply("❌ Use: public / private / inbox / groups");
  }

  await updateUserConfigInMongoDB(bot, { MODE: mode });

  reply(`✅ Mode set to: ${mode.toUpperCase()}`);
});


bandah({
  pattern: "prefix",
  alias: ["setprefix", "changeprefix"], // Added aliases
  desc: "Set Bot Prefix",
  category: "settings",
  react: "✏️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  // ❌ Only Owner
  if (!isOwner) return reply("❌ Only owner can use this command");

  // ✅ Get bot number
  const bot = conn.user.id
    .replace(/@.*$/, "")
    .replace(/:.+$/, "");

  // 📌 Show current prefix
  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);

    return reply(
      `📝 Current PREFIX: *${c?.PREFIX || "."}*\n\n` +
      `Use:\n` +
      `.prefix !\n` +
      `.prefix #\n` +
      `.prefix $`
    );
  }

  const newPrefix = args[0];

  // ❌ Validation
  if (newPrefix.length > 3) {
    return reply("❌ Prefix too long (Max 3 characters)");
  }

  if (newPrefix.includes(" ")) {
    return reply("❌ Prefix cannot contain spaces");
  }

  // ✅ Save in MongoDB
  await updateUserConfigInMongoDB(bot, { PREFIX: newPrefix });

  reply(`✅ Prefix set to: *${newPrefix}*`);

});

bandah({
  pattern: "autoreact",
  alias: ["autoreaction", "reactauto"], // Added aliases
  desc: "Turn Auto React On/Off",
  category: "settings",
  react: "🤖",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`🤖 AUTO_REACT: *${c?.AUTO_REACT || "false"}*\n\nUse:\n.autoreact on/off`);
  }

  const val = args[0].toLowerCase();

  if (!["on","off"].includes(val)) {
    return reply("❌ Use: on / off");
  }

  await updateUserConfigInMongoDB(bot, {
    AUTO_REACT: val === "on" ? "true" : "false"
  });

  reply(`✅ AUTO_REACT ${val.toUpperCase()}`);
});

bandah({
  pattern: "heartreact",
  alias: ["heart", "heartreaction"], // Added aliases
  desc: "Turn Heart React On/Off",
  category: "settings",
  react: "❤️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`❤️ HEART_REACT: *${c?.HEART_REACT || "false"}*\n\nUse:\n.heartreact on/off`);
  }

  const val = args[0].toLowerCase();

  if (!["on","off"].includes(val)) {
    return reply("❌ Use: on / off");
  }

  await updateUserConfigInMongoDB(bot, {
    HEART_REACT: val === "on" ? "true" : "false"
  });

  reply(`✅ HEART_REACT ${val.toUpperCase()}`);
});



bandah({
  pattern: "customreact",
  alias: ["customreaction", "creact"], // Added aliases
  desc: "Turn Custom React On/Off",
  category: "settings",
  react: "✨",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(`✨ CUSTOM_REACT: *${c?.CUSTOM_REACT || "false"}*\n\nUse:\n.customreact on/off`);
  }

  const val = args[0].toLowerCase();

  if (!["on","off"].includes(val)) {
    return reply("❌ Use: on / off");
  }

  await updateUserConfigInMongoDB(bot, {
    CUSTOM_REACT: val === "on" ? "true" : "false"
  });

  reply(`✅ CUSTOM_REACT ${val.toUpperCase()}`);
});



bandah({
  pattern: "customemoji",
  alias: ["customemojis", "setemoji"], // Added aliases
  desc: "Set Custom React Emojis",
  category: "settings",
  react: "😎",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);

    return reply(
      `😎 Current Emojis:\n*${(c?.CUSTOM_EMOJIS || "🔥,💯,😎").toString()}*\n\n` +
      `Use:\n.customemoji 😎🔥💯`
    );
  }

  const emojis = args.join(" ").trim();

  if (emojis.length > 50) {
    return reply("❌ Too many emojis (Max 50 chars)");
  }

  await updateUserConfigInMongoDB(bot, {
    CUSTOM_EMOJIS: emojis
  });

  reply(`✅ Custom Emojis Set:\n${emojis}`);
});

// ============================================
// WELCOME COMMAND
// ============================================
bandah({
  pattern: "welcome",
  alias: ["welcomemsg", "welcomeon"], // Added aliases
  desc: "Welcome Message On/Off",
  category: "settings",
  react: "👋",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    const status = c?.WELCOME === "true" ? "ON ✅" : "OFF ❌";
    return reply(`👋 *Welcome Message*\n\nCurrent: ${status}\n\nUse:\n.welcome on\n.welcome off`);
  }

  const val = args[0].toLowerCase();
  if (!["on", "off"].includes(val)) {
    return reply("❌ Use: on / off");
  }

  await updateUserConfigInMongoDB(bot, {
    WELCOME: val === "on" ? "true" : "false"
  });

  reply(`✅ Welcome Message ${val.toUpperCase()}`);
});


// ============================================
// GOODBYE COMMAND
// ============================================
bandah({
  pattern: "goodbye",
  alias: ["byemsg", "goodbyemsg"], // Added aliases
  desc: "Goodbye Message On/Off",
  category: "settings",
  react: "👋",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    const status = c?.GOODBYE === "true" ? "ON ✅" : "OFF ❌";
    return reply(`👋 *Goodbye Message*\n\nCurrent: ${status}\n\nUse:\n.goodbye on\n.goodbye off`);
  }

  const val = args[0].toLowerCase();
  if (!["on", "off"].includes(val)) {
    return reply("❌ Use: on / off");
  }

  await updateUserConfigInMongoDB(bot, {
    GOODBYE: val === "on" ? "true" : "false"
  });

  reply(`✅ Goodbye Message ${val.toUpperCase()}`);
});


// ============================================
// ADMIN EVENTS COMMAND (Promote/Demote)
// ============================================
bandah({
  pattern: "adminevents",
  alias: ["adminevent", "adminaction"], // Added aliases
  desc: "Admin Events (Promote/Demote) On/Off",
  category: "settings",
  react: "👑",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    const status = c?.ADMIN_ACTION === "true" ? "ON ✅" : "OFF ❌";
    return reply(`👑 *Admin Events (Promote/Demote)*\n\nCurrent: ${status}\n\nUse:\n.adminevents on\n.adminevents off`);
  }

  const val = args[0].toLowerCase();
  if (!["on", "off"].includes(val)) {
    return reply("❌ Use: on / off");
  }

  await updateUserConfigInMongoDB(bot, {
    ADMIN_ACTION: val === "on" ? "true" : "false"
  });
  reply(`✅ Admin Events ${val.toUpperCase()}`);
});

// ============================================
// ANTI LINK COMMAND (Simple On/Off)
// ============================================
bandah({
  pattern: "antilink",
  alias: ["linkremove", "blocklink"],
  desc: "Anti Link On/Off (Delete links in groups)",
  category: "settings",
  react: "🔗",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  try {

    const botConfig = await getUserConfigFromMongoDB(bot);

    // STATUS CHECK
    if (!args[0]) {

      const status = botConfig?.ANTI_LINK === "true" ? "ON ✅" : "OFF ❌";

      return reply(
`🔗 *ANTI LINK SETTINGS*

Status: ${status}

📌 *Usage:*
• .antilink on  → Enable Anti Link
• .antilink off → Disable Anti Link`
      );
    }

    const val = args[0].toLowerCase();

    if (!["on", "off"].includes(val)) {
      return reply("❌ Use: .antilink on / .antilink off");
    }

    await updateUserConfigInMongoDB(bot, {
      ANTI_LINK: val === "on" ? "true" : "false"
    });

    const statusText = val === "on" ? "ON ✅" : "OFF ❌";

    return reply(`🔗 *Anti Link Successfully Turned ${statusText}*`);

  } catch (err) {
    console.log("Antilink Error:", err);
    reply("❌ Error updating Anti Link setting");
  }

});


      // ============================================
// ANTI LINK ACTION COMMAND
// ============================================
bandah({
  pattern: "antilinkaction",
  alias: ["antilinkact", "linkaction", "antilinkset"],
  desc: "Set Anti Link Action (kick/warn/delete)",
  category: "settings",
  react: "⚙️",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args[0]) {
    const c = await getUserConfigFromMongoDB(bot);
    const currentAction = c?.ANTI_LINK_ACTION || "delete"; // default delete
    return reply(
      `⚙️ *Anti Link Action*\n\n` +
      `Current Action: *${currentAction}*\n\n` +
      `*Available Options:*\n` +
      `1. kick - Remove member from group\n` +
      `2. warn - Give warning\n` +
      `3. delete - Only delete message\n\n` +
      `*Use:*\n` +
      `.antilinkaction kick\n` +
      `.antilinkaction warn\n` +
      `.antilinkaction delete`
    );
  }

  const action = args[0].toLowerCase();

  if (!["kick", "warn", "delete"].includes(action)) {
    return reply("❌ Invalid action! Use: kick / warn / delete");
  }

  await updateUserConfigInMongoDB(bot, {
    ANTI_LINK_ACTION: action
  });

  reply(`✅ Anti Link Action set to: *${action}*`);
});


      // ============================================
// OWNER NAME COMMAND
// ============================================
bandah({
  pattern: "ownername",
  alias: ["sowner", "setowner", "ownername"],
  desc: "Set Owner Name",
  category: "settings",
  react: "👑",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  const bot = conn.user.id.replace(/@.*$/, "").replace(/:.+$/, "");

  if (!args.length) {
    const c = await getUserConfigFromMongoDB(bot);
    return reply(
      `👑 *Owner Name*\n\n` +
      `Current: *${c?.OWNER_NAME || "Not Set"}*\n\n` +
      `Use: .ownername Your Name Here`
    );
  }

  const ownerName = args.join(" ");

  if (ownerName.length > 50) {
    return reply("❌ Owner name too long (Max 50 characters)");
  }

  await updateUserConfigInMongoDB(bot, {
    OWNER_NAME: ownerName
  });

  reply(`✅ Owner Name set to: *${ownerName}*`);
});

bandah({
  pattern: "chatbot",
  alias: ["aichat", "botai", "aimode"],
  desc: "Set Chatbot Mode",
  category: "settings",
  react: "🤖",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {

  if (!isOwner) return reply("❌ Only owner can use this command");

  // ✅ bot id
  const bot = conn.user.id.split(":")[0];

  // ================= CURRENT =================
  const currentConfig = await getUserConfigFromMongoDB(bot);
  const current = currentConfig?.CHATBOT || "off";

  // ================= NO ARG =================
  if (!args[0]) {
    return reply(
`🤖 *CHATBOT SETTINGS*

📌 Current: *${current.toUpperCase()}*

━━━━━━━━━━━━━━━
Available Modes:

1. *on*     → Inbox + Groups  
2. *off*    → Disabled  
3. *inbox*  → Only private chats  
4. *groups* → Only group chats  

━━━━━━━━━━━━━━━
💡 Example:
.chatbot on`
    );
  }

  // ================= VALIDATION =================
  const mode = args[0].toLowerCase();
  const valid = ["on", "off", "inbox", "groups"];

  if (!valid.includes(mode)) {
    return reply("❌ Use: on / off / inbox / groups");
  }

  // ================= SAVE =================
  await updateUserConfigInMongoDB(bot, { CHATBOT: mode });

  // ================= RESPONSE =================
  let msg = "";

  switch (mode) {
    case "on":
      msg = "🤖 Chatbot is now ACTIVE (Inbox + Groups)";
      break;
    case "off":
      msg = "😴 Chatbot is now OFF";
      break;
    case "inbox":
      msg = "📩 Chatbot will work only in INBOX";
      break;
    case "groups":
      msg = "👥 Chatbot will work only in GROUPS";
      break;
  }

  reply(`✅ *Chatbot Updated*\n\n${msg}`);
});
