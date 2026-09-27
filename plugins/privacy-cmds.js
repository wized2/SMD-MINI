const fs = require("fs");
const config = require("../config");
const { bandah, commands } = require("../command");
const path = require('path');
const axios = require("axios");

// 🛡️ Privacy Settings Menu
bandah({
    pattern: "privacy",
    alias: ["privacymenu", "privacyhelp"],
    desc: "Privacy settings control panel",
    category: "privacy",
    react: "🛡️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let privacyMenu = `
╔═════◇ *PRIVACY SETTINGS* ◇═════╗
║
║  🛡️  *Privacy Control Panel*
║
╠══════◇ *CORE SETTINGS* ◇══════╣
║ • 📋 blocklist - View blocked users
║ • 👤 getbio - Get user's bio info
║ • 🖼️ setppall - Profile pic privacy
║ • 🟢 setonline - Online status privacy
║ • 🏷️ setmyname - Change bot's name
║ • 📝 updatebio - Update bot's bio
║ • 👥 groupsprivacy - Group add settings
║ • ⚙️ getprivacy - View current settings
║ • 🎯 getpp - Get profile picture
║ • 🌟 setpp - Change bot's profile pic
║
╠══════◇ *PRIVACY OPTIONS* ◇══════╣
║ • 🌍 all - Everyone
║ • 📞 contacts - Contacts only
║ • 🚫 contact_blacklist - Exclude blocked
║ • ❌ none - Nobody
║ • ⏰ match_last_seen - Match last seen
║
╠══════◇ *ACCESS CONTROL* ◇══════╣
║ 🔒 *Owner-only commands*
║ Most privacy settings require owner access
║
╚═══════════════════════════╝
*🔐 Protect your privacy with precision*`;

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || "https://example.com/privacy-banner.jpg" },
                caption: privacyMenu,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363175375282051@newsletter',
                        newsletterName: "🛡️ Privacy Control Center",
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// 📋 Blocklist Viewer
bandah({
    pattern: "blocklist",
    desc: "View list of blocked users",
    category: "privacy",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ *Access Denied!* Owner-only command");

    try {
        const blockedUsers = await conn.fetchBlocklist();

        if (blockedUsers.length === 0) {
            return reply("✅ *Block List Empty*\nNo users are currently blocked");
        }

        const list = blockedUsers
            .map((user, i) => `┃ ${i + 1}. 🚫 @${user.split('@')[0]}`)
            .join('\n');

        const count = blockedUsers.length;
        
        const blockListMsg = `
╔═════◇ *BLOCKED USERS* ◇═════╗
║
║ 📊 Total Blocked: ${count}
║
${list}
║
║ 🔄 Use *unblock <number>* to remove
║
╚═══════════════════════════╝`;

        await conn.sendMessage(from, { 
            text: blockListMsg,
            mentions: blockedUsers
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});

// 👤 Bio Fetcher
bandah({
    pattern: "getbio",
    desc: "Get user's biography information",
    category: "privacy",
    react: "👤",
    filename: __filename,
}, async (conn, mek, m, { args, reply, sender }) => {
    try {
        const jid = args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : sender;
        const about = await conn.fetchStatus(jid);
        
        if (!about || !about.status) {
            return reply("❌ *No Bio Found*\nThis user hasn't set a biography");
        }

        const bioMsg = `
╔═════◇ *USER BIOGRAPHY* ◇═════╗
║
║ 📝 *Bio Content:*
║ ${about.status}
║
║ ⏰ *Last Updated:*
║ ${new Date(about.setAt).toLocaleString()}
║
╚═══════════════════════════╝`;

        reply(bioMsg);

    } catch (error) {
        console.error("Bio fetch error:", error);
        reply("❌ *Unable to fetch bio*\nUser may have privacy restrictions");
    }
});

// 🖼️ Profile Picture Privacy
bandah({
    pattern: "setppall",
    desc: "Set profile picture visibility privacy",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, 
async (conn, mek, m, { from, isOwner, reply, args }) => {
    if (!isOwner) return reply("❌ *Owner Only!* This command requires owner privileges");
    
    try {
        const value = args[0]?.toLowerCase() || 'all';
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
        
        if (!validValues.includes(value)) {
            return reply(`❌ *Invalid Option!*\n\n📋 Available options:\n• 🌍 all - Everyone\n• 📞 contacts - Contacts only\n• 🚫 contact_blacklist - Exclude blocked\n• ❌ none - Nobody`);
        }
        
        await conn.updateProfilePicturePrivacy(value);
        
        const privacyMap = {
            'all': '🌍 Everyone',
            'contacts': '📞 Contacts Only', 
            'contact_blacklist': '🚫 Contacts (Exclude Blocked)',
            'none': '❌ Nobody'
        };
        
        reply(`✅ *Profile Picture Privacy Updated*\n\n🛡️ New Setting: ${privacyMap[value]}`);
    } catch (e) {
        reply(`❌ *Update Failed*\nError: ${e.message}`);
    }
});

// 🟢 Online Status Privacy  
bandah({
    pattern: "setonline",
    desc: "Configure online status visibility",
    category: "privacy",
    react: "🟢",
    filename: __filename
}, 
async (conn, mek, m, { from, isOwner, reply, args }) => {
    if (!isOwner) return reply("❌ *Owner Only!*");

    try {
        const value = args[0]?.toLowerCase() || 'all';
        const validValues = ['all', 'match_last_seen'];
        
        if (!validValues.includes(value)) {
            return reply("❌ *Invalid Option!*\n\nAvailable: 'all', 'match_last_seen'");
        }

        await conn.updateOnlinePrivacy(value);
        
        const statusMsg = value === 'all' ? 
            "🌍 Everyone can see online status" : 
            "⏰ Online status matches last seen privacy";
            
        reply(`✅ *Online Privacy Updated*\n\n${statusMsg}`);
    } catch (e) {
        reply(`❌ *Update Failed*\nError: ${e.message}`);
    }
});

// 🏷️ Name Changer
bandah({
    pattern: "setmyname",
    desc: "Change bot's display name",
    category: "privacy", 
    react: "🏷️",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, args }) => {
    if (!isOwner) return reply("❌ *Owner Only!*");

    const displayName = args.join(" ");
    if (!displayName) return reply("❌ *Please provide a name*\nUsage: .setmyname Your New Name");

    if (displayName.length > 25) {
        return reply("❌ *Name too long!* Maximum 25 characters");
    }

    try {
        await conn.updateProfileName(displayName);
        reply(`✅ *Display Name Updated*\n\n🏷️ New Name: ${displayName}`);
    } catch (err) {
        console.error(err);
        reply("❌ *Failed to update name*");
    }
});

// 📝 Bio Updater
bandah({
    pattern: "updatebio",
    react: "📝",
    desc: "Change bot's biography",
    category: "privacy",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, args, q }) => {
    try {
        if (!isOwner) return reply('❌ *Owner Only!* This command requires owner access');
        
        const newBio = q || args.join(" ");
        if (!newBio) return reply('❌ *Please provide bio text*\nUsage: .updatebio Your new bio here');
        
        if (newBio.length > 139) return reply('❌ *Bio too long!* Maximum 139 characters');

        await conn.updateProfileStatus(newBio);
        
        const successMsg = `
✅ *Bio Updated Successfully*

📝 New Biography:
${newBio}

💫 Your profile has been updated`;
        
        await conn.sendMessage(from, { text: successMsg }, { quoted: mek });
        
    } catch (e) {
        reply('❌ *Update Failed*\nError: ' + e.message);
    }
});

// 👥 Group Privacy Controller
bandah({
    pattern: "groupsprivacy", 
    desc: "Manage who can add you to groups",
    category: "privacy",
    react: "👥",
    filename: __filename
}, 
async (conn, mek, m, { from, isOwner, reply, args }) => {
    if (!isOwner) return reply("❌ *Owner Only!*");

    try {
        const value = args[0]?.toLowerCase() || 'all';
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
        
        if (!validValues.includes(value)) {
            return reply(`❌ *Invalid Option!*\n\n📋 Available:\n• 🌍 all - Everyone\n• 📞 contacts - Contacts only\n• 🚫 contact_blacklist - Exclude blocked\n• ❌ none - Nobody`);
        }

        await conn.updateGroupsAddPrivacy(value);
        
        const privacyMap = {
            'all': '🌍 Everyone can add me',
            'contacts': '📞 Contacts can add me',
            'contact_blacklist': '🚫 Contacts (except blocked)',
            'none': '❌ Nobody can add me'
        };
        
        reply(`✅ *Group Add Privacy Updated*\n\n${privacyMap[value]}`);
    } catch (e) {
        reply(`❌ *Update Failed*\nError: ${e.message}`);
    }
});

// ⚙️ Privacy Settings Viewer
bandah({
    pattern: "getprivacy",
    desc: "View current privacy settings",
    category: "privacy",
    react: "⚙️",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    try {
        if (!isOwner) return reply('❌ *Owner Only!*');
        
        const privacySettings = await conn.fetchPrivacySettings(true);
        if (!privacySettings) return reply('❌ *Failed to fetch privacy settings*');
        
        const formatSetting = (value) => {
            const maps = {
                'all': '🌍 Everyone',
                'contacts': '📞 Contacts',
                'contact_blacklist': '🚫 Contacts (Exclude Blocked)',
                'none': '❌ Nobody',
                'match_last_seen': '⏰ Match Last Seen'
            };
            return maps[value] || value;
        };
        
        const privacyDisplay = `
╔═════◇ *CURRENT PRIVACY SETTINGS* ◇═════╗
║
║ 📖 Read Receipts: ${formatSetting(privacySettings.readreceipts)}
║ 🖼️ Profile Picture: ${formatSetting(privacySettings.profile)}
║ 📝 Status: ${formatSetting(privacySettings.status)}
║ 🟢 Online: ${formatSetting(privacySettings.online)}
║ ⏰ Last Seen: ${formatSetting(privacySettings.last)}
║ 👥 Group Add: ${formatSetting(privacySettings.groupadd)}
║ 📞 Call Add: ${formatSetting(privacySettings.calladd)}
║
║ 🔄 Use privacy commands to modify
║
╚══════════════════════════════════╝`;

        await conn.sendMessage(from, { text: privacyDisplay }, { quoted: mek });
    } catch (e) {
        reply('❌ *Fetch Failed*\nError: ' + e.message);
    }
});

// 🎯 Profile Picture Stealer
bandah({
    pattern: "getpp",
    alias: ["stealpp", "getprofile"],
    react: "🎯",
    desc: "Get user's profile picture by number",
    category: "privacy",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, args }) => {
    try {
        if (!isOwner) return reply("❌ *Owner Only!*");

        if (!args[0]) return reply("❌ *Please provide a phone number*\nUsage: .getpp 1234567890");

        let targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, "image");
        } catch (e) {
            return reply("❌ *No Profile Picture*\nThis user has no profile picture or it's private");
        }

        let userName = targetJid.split("@")[0];
        try {
            const contact = await conn.getContact(targetJid);
            userName = contact.notify || contact.vname || userName;
        } catch {
            // Keep number as fallback
        }

        const caption = `
✅ *Profile Picture Fetched*

👤 User: ${userName}
📞 Number: ${targetJid.split('@')[0]}

💫 Powered by Privacy Module 🛡️`;

        await conn.sendMessage(from, { 
            image: { url: ppUrl }, 
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        reply("❌ *Fetch Failed*\nError: " + e.message);
    }
});

// 🌟 Profile Picture Setter
bandah({
    pattern: "setpp",
    desc: "Change bot's profile picture",
    category: "privacy",
    react: "🌟",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, quoted }) => {
    if (!isOwner) return reply("❌ *Owner Only!*");

    try {
        if (!quoted || !quoted.message?.imageMessage) {
            return reply("❌ *Please reply to an image*\nReply to an image with .setpp");
        }

        const media = await conn.downloadAndSaveMediaMessage(quoted);
        const imageBuffer = fs.readFileSync(media);
        
        await conn.updateProfilePicture(botNumber, imageBuffer);
        
        fs.unlinkSync(media); // Clean up
        
        reply("✅ *Profile Picture Updated Successfully*");
        
    } catch (e) {
        reply(`❌ *Update Failed*\nError: ${e.message}`);
    }
});