const { bandah } = require('../command');
const config = require('../config');
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

// Helper function for safe string operations
function safeString(str) {
    return (str && typeof str === 'string') ? str : '';
}

// Safe includes function
function safeIncludes(str, searchValue) {
    if (!str || typeof str !== 'string') return false;
    return str.includes(searchValue);
}

// LID to Phone Number conversion function
async function lidToPhone(conn, lid) {
    try {
        if (!lid) return null;
        
        // Pehle repository se try karo
        if (conn?.signalRepository?.lidMapping) {
            const pn = await conn.signalRepository.lidMapping.getPNForLID(lid);
            if (pn) return cleanPN(pn);
        }
        
        // Agar repository fail ho, toh direct extract karo
        if (safeIncludes(lid, ':')) {
            return lid.split(':')[1].split('@')[0];
        } else {
            return lid.split('@')[0];
        }
    } catch {
        // Fallback - direct extraction
        if (!lid) return null;
        if (safeIncludes(lid, ':')) {
            return lid.split(':')[1].split('@')[0];
        } else {
            return lid.split('@')[0];
        }
    }
}

// Clean phone number function
function cleanPN(number) {
    if (!number) return '';
    return number.replace(/[^0-9]/g, '');
}

// Helper function to check admin usage permission
function checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup) {
    // If ADMINS_USE is false OR undefined, only bot owner can use commands
    if (config.ADMINS_USE === false || config.ADMINS_USE === undefined) {
        return {
            allowed: isCreator === true,
            message: "❌ Admins usage is off, you can't use group commands. Only bot owner can use."
        };
    }
    
    // If ADMINS_USE is explicitly true, check normal permissions
    return {
        allowed: true,
        message: null
    };
}

// Safe get dev number function
function getDevNumber() {
    if (!config.DEV) return null;
    let devNumber = config.DEV;
    if (!safeIncludes(devNumber, '@s.whatsapp.net')) {
        devNumber = devNumber + "@s.whatsapp.net";
    }
    return devNumber;
}

// Safe extract target from message
function extractTarget(mek, args) {
    try {
        if (mek?.message?.extendedTextMessage?.contextInfo?.participant) {
            return mek.message.extendedTextMessage.contextInfo.participant;
        }
        if (mek?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            return mek.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        if (args && args[0]) {
            let number = args[0].replace(/[^0-9]/g, "");
            if (number) {
                if (!number.endsWith("@s.whatsapp.net")) number += "@s.whatsapp.net";
                return number;
            }
        }
        return null;
    } catch {
        return null;
    }
}

// Command to list all pending group join requests
bandah({
    pattern: "requestlist",
    desc: "Shows pending group join requests",
    category: "group",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to view join requests.");

        await conn.sendMessage(from, { react: { text: '⏳', key: m?.key || mek?.key } });

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (!requests || requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m?.key || mek?.key } });
            return reply("ℹ️ No pending join requests.");
        }

        let text = `📋 *Pending Join Requests (${requests.length})*\n\n`;
        requests.forEach((user, i) => {
            if (user?.jid) {
                text += `${i+1}. @${user.jid.split('@')[0]}\n`;
            }
        });

        await conn.sendMessage(from, { react: { text: '✅', key: m?.key || mek?.key } });
        return reply(text, { mentions: requests.map(u => u?.jid).filter(Boolean) });
    } catch (error) {
        console.error("Request list error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m?.key || mek?.key } });
        return reply("❌ Failed to fetch join requests.");
    }
});

// Command to accept all pending join requests
bandah({
    pattern: "acceptall",
    desc: "Accepts all pending group join requests",
    category: "group",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to accept join requests.");

        await conn.sendMessage(from, { react: { text: '⏳', key: m?.key || mek?.key } });

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (!requests || requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m?.key || mek?.key } });
            return reply("ℹ️ No pending join requests to accept.");
        }

        const jids = requests.map(u => u?.jid).filter(Boolean);
        await conn.groupRequestParticipantsUpdate(from, jids, "approve");
        
        await conn.sendMessage(from, { react: { text: '👍', key: m?.key || mek?.key } });
        return reply(`✅ Successfully accepted ${requests.length} join requests.`);
    } catch (error) {
        console.error("Accept all error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m?.key || mek?.key } });
        return reply("❌ Failed to accept join requests.");
    }
});

// Command to reject all pending join requests
bandah({
    pattern: "rejectall",
    desc: "Rejects all pending group join requests",
    category: "group",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to reject join requests.");

        await conn.sendMessage(from, { react: { text: '⏳', key: m?.key || mek?.key } });

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (!requests || requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m?.key || mek?.key } });
            return reply("ℹ️ No pending join requests to reject.");
        }

        const jids = requests.map(u => u?.jid).filter(Boolean);
        await conn.groupRequestParticipantsUpdate(from, jids, "reject");
        
        await conn.sendMessage(from, { react: { text: '👎', key: m?.key || mek?.key } });
        return reply(`✅ Successfully rejected ${requests.length} join requests.`);
    } catch (error) {
        console.error("Reject all error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m?.key || mek?.key } });
        return reply("❌ Failed to reject join requests.");
    }
});

// Add user to group
bandah({
    pattern: "add",
    alias: ["aja"],
    react: "➕",
    desc: "Adds a user to the group.",
    category: "group",
    filename: __filename,
    use: '<number>',
}, async (conn, mek, m, { from, args, q, isGroup, isBotAdmins, isAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to add users.");

        const botJid = (conn.user?.id?.split(":")[0] + "@s.whatsapp.net").toLowerCase();
        const meta = await conn.groupMetadata(from);
        const participants = meta?.participants || [];
        const adminJids = getGroupAdmins(participants);
        const isBotAdmin = adminJids.includes(botJid);

        const num = (q || "").replace(/[^\d]/g, "");
        if (!num) return reply("❌ Please provide a valid phone number to add.");
        if (num.length < 7 || num.length > 16) return reply("❌ That doesn't look like a valid number.");

        const userJid = `${num}@s.whatsapp.net`;
        
        // Convert LID to phone number for comparison
        const memberJids = await Promise.all(participants.map(async p => {
            const jid = p?.id || p?.jid || "";
            const phone = await lidToPhone(conn, jid);
            return `${phone}@s.whatsapp.net`;
        }));
        
        if (memberJids.includes(userJid.toLowerCase())) {
            return reply("ℹ️ User is already in this group.");
        }

        const res = await conn.groupParticipantsUpdate(from, [userJid], "add");
        const st = Array.isArray(res) ? res[0]?.status : undefined;

        if (st === 200) {
            return reply("✅ User added.");
        }

        const code = await conn.groupInviteCode(from);
        const link = `https://chat.whatsapp.com/${code}`;
        return reply(`⚠️ Couldn't add due to user's privacy settings.\n👉 Invite them with this link:\n${link}`);

    } catch (e) {
        try {
            const code = await conn.groupInviteCode(from);
            const link = `https://chat.whatsapp.com/${code}`;
            return reply(`⚠️ Couldn't add directly (maybe privacy). Use invite link:\n${link}`);
        } catch {
            return reply("❌ An error occurred while adding the user. Please try again.");
        }
    }
});

// Update group description
bandah({
    pattern: "gdesc",
    alias: ["upgdesc"],
    react: "📜",
    desc: "Change the group description.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, q, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to update group description.");
        if (!q) return reply("❌ Please provide a new group description.");

        await conn.groupUpdateDescription(from, q);
        reply("✅ Group description has been updated.");
    } catch (e) {
        console.error("Error updating group description:", e);
        reply("❌ Failed to update the group description. Please try again.");
    }
});

// Update group name
bandah({
    pattern: "gname",
    alias: ["upgname", "updategname"],
    react: "📝",
    desc: "Change the group name.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, q, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to update group name.");
        if (!q) return reply("❌ Please provide a new group name.");

        await conn.groupUpdateSubject(from, q);
        reply(`✅ Group name has been updated to: *${q}*`);
    } catch (e) {
        console.error("Error updating group name:", e);
        reply("❌ Failed to update the group name. Please try again.");
    }
});

// Kick all members
bandah({
    pattern: "kickall",
    react: "💣",
    desc: "Remove all members from the group (except admins and dev).",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to kick members.");

        const metadata = await conn.groupMetadata(from);
        if (!metadata || !metadata.participants) {
            return reply("❌ Could not fetch group participants.");
        }
        
        const participants = metadata.participants || [];
        const devNumber = getDevNumber();

        let toKick = participants
            .filter(p => p && !p.admin)
            .map(p => p?.id)
            .filter(id => id && id !== conn.user?.id && id !== devNumber);

        if (toKick.length === 0) return reply("✅ No members to kick.");

        await conn.groupParticipantsUpdate(from, toKick, "remove");
        reply(`✅ Removed *${toKick.length}* members from the group.`);
    } catch (e) {
        console.error("Error in kickall command:", e);
        reply("❌ Failed to kick all members.");
    }
});

// Kick admins
bandah({
    pattern: "kickadmins",
    react: "⚡",
    desc: "Remove all admins from the group (except dev and bot).",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to kick admins.");

        const metadata = await conn.groupMetadata(from);
        if (!metadata || !metadata.participants) {
            return reply("❌ Could not fetch group participants.");
        }
        
        const participants = metadata.participants || [];
        const devNumber = getDevNumber();

        let toKick = participants
            .filter(p => p && p.admin)
            .map(p => p?.id)
            .filter(id => id && id !== conn.user?.id && id !== devNumber);

        if (toKick.length === 0) return reply("✅ No admins to kick.");

        await conn.groupParticipantsUpdate(from, toKick, "remove");
        reply(`✅ Removed *${toKick.length}* admins from the group.`);
    } catch (e) {
        console.error("Error in kickadmins command:", e);
        reply("❌ Failed to kick admins.");
    }
});

// Kick single member
bandah({
    pattern: "kick",
    alias: ["remove"],
    react: "👢",
    desc: "Remove a member from the group.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply, args }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to kick members.");

        const target = extractTarget(mek, args);
        if (!target) return reply("❌ Please reply to a user's message, mention them, or provide their number to kick.");

        const sender = mek?.key?.participant || mek?.participant || m?.sender;
        const devNumber = getDevNumber();

        if (target === sender) return reply("❌ You cannot kick yourself.");
        if (devNumber && target === devNumber) return reply("❌ You cannot remove the developer of this bot.");

        await conn.groupParticipantsUpdate(from, [target], "remove");
        reply(`✅ @${target.split("@")[0]} has been removed from the group.`, { mentions: [target] });

    } catch (e) {
        console.error("Error in kick command:", e);
        reply("❌ Something went wrong while removing the member.");
    }
});

// Leave group
bandah({
    pattern: "left",
    alias: ["leftgc", "leavegc"],
    desc: "Leave the group",
    react: "🎉",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isCreator) return reply("❌ This command can only be used by Bot Owner");

        reply("Leaving group...");
        await sleep(1500);
        await conn.groupLeave(from);
        reply("Goodbye! 👋");
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message || e}`);
    }
});

// Lock group
bandah({
    pattern: "lock",
    alias: ["lockgc"],
    react: "🔒",
    desc: "Lock the group (Prevents new members from joining).",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to lock group.");

        await conn.groupSettingUpdate(from, "locked");
        reply("✅ Group has been locked. Only admins can change settings.");
    } catch (e) {
        console.error("Error locking group:", e);
        reply("❌ Failed to lock the group. Please try again.");
    }
});

// Mute group
bandah({
    pattern: "mute",
    alias: ["groupmute"],
    react: "🔇",
    desc: "Mute the group (Only admins can send messages).",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to mute group.");

        await conn.groupSettingUpdate(from, "announcement");
        reply("✅ Group has been muted. Only admins can send messages.");
    } catch (e) {
        console.error("Error muting group:", e);
        reply("❌ Failed to mute the group. Please try again.");
    }
});

// Kick by country code
bandah({
    pattern: "out",
    alias: ["kickcountry","kickcode"],
    react: "🌍",
    desc: "Remove members by country code. Usage: .out 91  OR  .out 91 confirm",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply, args }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to kick members.");

        const code = args && args[0] ? args[0].replace(/\D/g,'') : null;
        const doConfirm = args && args[1] && args[1].toLowerCase() === 'confirm';

        if (!code) return reply("❌ Usage: .out <country_code>\nExample: .out 91\nTo actually remove run: .out 91 confirm");

        const metadata = await conn.groupMetadata(from);
        if (!metadata || !metadata.participants) {
            return reply("❌ Could not fetch group participants.");
        }
        
        const participants = metadata.participants || [];
        const devNumber = getDevNumber();
        const botJid = (conn.user?.id || "").split(":")[0] + "@s.whatsapp.net";

        const matches = participants
            .filter(p => {
                if (!p) return false;
                const id = (p.id || "").split('@')[0] || "";
                if (id + "@s.whatsapp.net" === botJid) return false;
                if (devNumber && (id + "@s.whatsapp.net") === devNumber) return false;
                if (p.admin) return false;
                return id.startsWith(code);
            })
            .map(p => p.id)
            .filter(Boolean);

        if (matches.length === 0) return reply(`✅ No non-admin members found with country code: ${code}`);

        if (!doConfirm) {
            const preview = matches.slice(0,8).map(id => '@' + id.split('@')[0]).join(', ');
            const more = matches.length > 8 ? ` and ${matches.length - 8} more` : '';
            return reply(
                `⚠️ Found *${matches.length}* non-admin members with country code *${code}*.\n` +
                `Preview: ${preview}${more}\n\n` +
                `To remove them run:\n` +
                `👉 .out ${code} confirm\n\n` +
                `(This will skip admins, the bot and the developer.)`,
                { mentions: matches.slice(0,8) }
            );
        }

        const chunkSize = 50;
        for (let i = 0; i < matches.length; i += chunkSize) {
            const chunk = matches.slice(i, i + chunkSize);
            try {
                await conn.groupParticipantsUpdate(from, chunk, "remove");
            } catch (err) {
                console.error("Error removing chunk:", err);
            }
        }

        reply(`✅ Removal attempted for ${matches.length} members with country code ${code}.`);

    } catch (err) {
        console.error("Error in out command:", err);
        reply("❌ Something went wrong while executing out.");
    }
});

// Create new group
bandah({
    pattern: "newgc",
    category: "group",
    desc: "Create a new group and add participants.",
    filename: __filename,
}, async (conn, mek, m, { body, isCreator, reply }) => {
    try {
        const permissionCheck = checkAdminPermission(conn, false, false, isCreator, false);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!body) return reply(`Usage: !newgc group_name;number1,number2,...`);

        const [groupName, numbersString] = body.split(";");
        
        if (!groupName || !numbersString) {
            return reply(`Usage: !newgc group_name;number1,number2,...`);
        }

        const participantNumbers = numbersString.split(",").map(number => `${number.trim()}@s.whatsapp.net`);
        const group = await conn.groupCreate(groupName, participantNumbers);
        const inviteLink = await conn.groupInviteCode(group.id);

        await conn.sendMessage(group.id, { text: 'Hey Buddies' });
        reply(`Group created successfully with invite link: https://chat.whatsapp.com/${inviteLink}\nWelcome message sent.`);
    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message || e}`);
    }
});

// Create poll
bandah({
    pattern: "poll",
    category: "group",
    desc: "Create a poll with a question and options in the group.",
    filename: __filename,
}, async (conn, mek, m, { from, body, prefix, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        let [question, optionsString] = body.split(";");
        
        if (!question || !optionsString) {
            return reply(`Usage: ${prefix || '.'}poll question;option1,option2,option3...`);
        }

        let options = [];
        for (let option of optionsString.split(",")) {
            if (option && option.trim() !== "") {
                options.push(option.trim());
            }
        }

        if (options.length < 2) {
            return reply("*Please provide at least two options for the poll.*");
        }

        await conn.sendMessage(from, {
            poll: {
                name: question,
                values: options,
                selectableCount: 1,
                toAnnouncementGroup: true,
            }
        }, { quoted: mek });
    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message || e}`);
    }
});

// Set group profile picture
const Jimp = require('jimp');
const generateProfilePicture = async (buffer) => {
    const jimp = await Jimp.read(buffer);
    const min = jimp.getWidth();
    const max = jimp.getHeight();
    const cropped = jimp.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    }
}

bandah({
    pattern: "setppgroup",
    alias: ["setppgc", "setppgrup", "setgcpp", "setgruppp", "setgrouppp"],
    desc: "Set group profile picture",
    category: "group",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, mime, isGroup, isAdmins, isBotAdmins, isCreator, args, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command is only for groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to change group picture.");

        if (!quoted) return reply("📸 Reply to an *image* with this command.");
        if (!mime || !/image/.test(mime)) return reply("❗ Only image files are allowed.");
        if (/webp/.test(mime)) return reply("❗ Webp stickers are not supported. Send a normal image.");

        const imgPath = await conn.downloadAndSaveMediaMessage(quoted, "groupPP.jpeg");

        if (args[0] === "full") {
            const { img } = await generateProfilePicture(imgPath);
            await conn.query({
                tag: "iq",
                attrs: { to: from, type: "set", xmlns: "w:profile:picture" },
                content: [{
                    tag: "picture",
                    attrs: { type: "image" },
                    content: img
                }]
            });
        } else {
            await conn.updateProfilePicture(from, { url: imgPath });
        }

        require('fs').unlinkSync(imgPath);
        reply("✅ Group profile picture updated successfully.");

    } catch (e) {
        console.error("SetPP Error:", e);
        reply("⚠️ Unable to update group picture.");
    }
});

// Join group via link
bandah({
    pattern: "join",
    react: "📬",
    alias: ["joinme","f_join"],
    desc: "To Join a Group from Invite link",
    category: "group",
    use: '.join < Group Link >',
    filename: __filename
}, async(conn, mek, m, { from, q, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ This command can only be used by Bot Owner");
        if (!q) return reply("*Please write the Group Link*️ 🖇️");
        
        let result = q.split('https://chat.whatsapp.com/')[1];
        if (!result) return reply("❌ Invalid group link.");
        
        await conn.groupAcceptInvite(result);
        await conn.sendMessage(from, { text: `✔️ *Successfully Joined*`}, { quoted: mek });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek?.key } });
        console.log(e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

// Get group link
bandah({
    pattern: "glink",
    react: "🖇️",
    alias: ["grouplink","invite"],
    desc: "To Get the Group Invite link",
    category: "group",
    use: '.invite',
    filename: __filename
}, async(conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to get group link.");

        const code = await conn.groupInviteCode(from);
        await conn.sendMessage(from, { text: `🖇️ *Group Link*\n\nhttps://chat.whatsapp.com/${code}`}, { quoted: mek });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek?.key } });
        console.log(e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

// Reset group link
bandah({
    pattern: "resetlink",
    react: "🖇️",
    alias: ["revokegrouplink","resetglink","revokelink","f_revoke"],
    desc: "To Reset the group link",
    category: "group",
    use: '.revoke',
    filename: __filename
}, async(conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to reset group link.");

        await conn.groupRevokeInvite(from);
        await conn.sendMessage(from, { text: `*Group link Reseted* ⛔`}, { quoted: mek });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek?.key } });
        console.log(e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

// Promote member to admin
bandah({
    pattern: "promote",
    alias: ["makeadmin"],
    react: "⬆️",
    desc: "Promote a member to group admin.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply, args }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to promote members.");

        const target = extractTarget(mek, args);
        if (!target) return reply("❌ Please reply to a user's message, mention them, or provide their number to promote.");

        const devNumber = getDevNumber();
        if (devNumber && target === devNumber) return reply("❌ You cannot change the developer's role.");

        await conn.groupParticipantsUpdate(from, [target], "promote");
        reply(`✅ @${target.split("@")[0]} has been promoted to admin.`, { mentions: [target] });

    } catch (e) {
        console.error("Error in promote command:", e);
        reply("❌ Something went wrong while promoting the member.");
    }
});

// Demote admin to member
bandah({
    pattern: "demote",
    alias: ["removeadmin"],
    react: "⬇️",
    desc: "Demote a group admin to member.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply, args }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to demote admins.");

        const target = extractTarget(mek, args);
        if (!target) return reply("❌ Please reply to a user's message, mention them, or provide their number to demote.");

        const devNumber = getDevNumber();
        if (devNumber && target === devNumber) return reply("❌ You cannot change the developer's role.");

        await conn.groupParticipantsUpdate(from, [target], "demote");
        reply(`✅ @${target.split("@")[0]} has been demoted to member.`, { mentions: [target] });

    } catch (e) {
        console.error("Error in demote command:", e);
        reply("❌ Something went wrong while demoting the member.");
    }
});

// Hide tag (mention all) - NO isBotAdmins CHECK
bandah({
    pattern: "hidetag",
    react: "🔊",
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
}, async(conn, mek, m, { from, participants, q, isGroup, isAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, false, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!q) return reply('*Please add a Message* ℹ️');
        
        let teks = `${q}`;
        const mentions = participants?.map(a => a?.id).filter(Boolean) || [];
        conn.sendMessage(from, { text: teks, mentions }, { quoted: mek });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek?.key } });
        console.log(e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

// Tag group with message
bandah({
    pattern: "taggp",
    react: "🔊",
    alias: ["tggp","djtaggp"],
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
}, async(conn, mek, m, { from, participants, q, isCreator, reply }) => {
    try {
        const permissionCheck = checkAdminPermission(conn, false, false, isCreator, false);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!m?.quoted) return reply('*Please mention a message* ℹ️');
        if (!q) return reply('*Please add a Group Jid* ℹ️');
        
        let teks = m.quoted?.text || m.quoted?.msg || '';
        const mentions = participants?.map(a => a?.id).filter(Boolean) || [];
        conn.sendMessage(q, { text: teks, mentions }, { quoted: mek });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek?.key } });
        console.log(e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

// Group information
bandah({
    pattern: "ginfo",
    react: "🥏",
    alias: ["groupinfo"],
    desc: "Get group information.",
    category: "group",
    use: '.ginfo',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply, participants }) => {
    try {
        if (!isGroup) return reply(`❌ This command only works in group chats.`);
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply(`❌ Bot must be admin to fetch group details.`);

        const fallbackPpUrls = [
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
        ];
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image');
        } catch {
            ppUrl = fallbackPpUrls[Math.floor(Math.random() * fallbackPpUrls.length)];
        }

        const metadata = await conn.groupMetadata(from);
        if (!metadata) return reply("❌ Could not fetch group metadata.");
        
        const groupParticipants = metadata.participants || [];
        const groupAdmins = groupParticipants.filter(p => p && p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v?.id?.split('@')[0] || ''}`).join('\n');
        const owner = metadata.owner || groupAdmins[0]?.id || "unknown";

        const gdata = `*「 Group Information 」*\n\n*Group Name* : ${metadata.subject || 'N/A'}\n*Group ID* : ${metadata.id || 'N/A'}\n*Participants* : ${metadata.size || groupParticipants.length}\n*Group Creator* : @${owner.split('@')[0]}\n*Description* : ${metadata.desc?.toString() || 'No description'}\n\n*Admins (${groupAdmins.length})*:\n${listAdmin || 'No admins'}`;

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: gdata,
            mentions: groupAdmins.map(v => v?.id).concat([owner]).filter(Boolean)
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek?.key } });
        reply(`❌ An error occurred:\n\n${e.message || e}`);
    }
});

// List admins
bandah({
    pattern: "listadmins",
    alias: ["admins"],
    react: "📋",
    desc: "List all admins of the group.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);

        const metadata = await conn.groupMetadata(from);
        if (!metadata || !metadata.participants) {
            return reply("❌ Could not fetch group participants.");
        }
        
        const admins = metadata.participants.filter(p => p && p.admin !== null).map(p => p.id).filter(Boolean);

        if (admins.length === 0) return reply("❌ No admins found in this group.");

        let text = `*👮 Group Admins:*\n\n`;
        admins.forEach((admin, i) => {
            text += `${i + 1}. @${admin.split("@")[0]}\n`;
        });

        await conn.sendMessage(from, { text, mentions: admins });

    } catch (e) {
        console.error("Error in listadmins command:", e);
        reply("❌ Something went wrong while fetching admins.");
    }
});

// User information
bandah({
    pattern: "whois",
    react: "🔍",
    desc: "Get user info.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (isGroup) {
            const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
            if (!permissionCheck.allowed) return reply(permissionCheck.message);
        }
        
        const target = extractTarget(mek, args) || mek?.key?.participant || mek?.participant || m?.sender;
        if (!target) return reply("❌ Could not identify user.");

        let about;
        try {
            const status = await conn.fetchStatus(target);
            about = status?.status || "No status available";
        } catch {
            about = "Couldn't fetch status";
        }

        let text = `*🔍 User Info:*\n\n`;
        text += `👤 *Number:* ${target.split("@")[0]}\n`;
        text += `🆔 *JID:* ${target}\n`;
        text += `💬 *About:* ${about}`;

        await conn.sendMessage(from, { text, mentions: [target] });

    } catch (e) {
        console.error("Error in whois command:", e);
        reply("❌ Something went wrong while fetching user info.");
    }
});

// Tag all members - NO isBotAdmins CHECK
bandah({
    pattern: "tagall",
    alias: ["gc_tagall"],
    react: "🔊",
    desc: "Tag all group members.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, reply, isGroup, isAdmins, isCreator, q }) => {
    try {
        if (!isGroup) return reply("❌ Group only.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, false, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);

        const meta = await conn.groupMetadata(from);
        if (!meta || !meta.participants) {
            return reply("❌ Could not fetch group participants.");
        }
        
        const groupName = meta.subject || 'Group';
        const participants = meta.participants || [];

        let msg = q;
        if (!msg) msg = "Attention everyone!";

        let emo = ["🚀","⚡","🔥","🎯","💠"][Math.floor(Math.random()*5)];

        let text = `✨ *${groupName}*\n`;
        text += `👥 Members: *${participants.length}*\n\n`;
        text += `💬 *Message:* ${msg}\n\n`;
        text += `┌── *MENTIONS* ──┐\n`;

        for (let p of participants) {
            let name = p?.notify || p?.vname || p?.name || p?.id?.split("@")[0] || 'User';
            text += `${emo} @${name}\n`;
        }

        text += `└───────────────⦿\n⭐ *EDITH-MD*`;

        await conn.sendMessage(
            from,
            {
                text,
                mentions: participants.map(p => p?.id).filter(Boolean)
            },
            { quoted: mek }
        );

    } catch (e) {
        reply("❌ Error: " + (e.message || e));
    }
});

// Tag with message
bandah({
    pattern: "tag",
    react: "🔊",
    desc: "To tag all members with a message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
}, async (conn, mek, m, { from, participants, q, isGroup, isAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, false, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);

        if (!q) return reply('*Please provide a message to send.* ℹ️');

        const mentions = participants?.map(a => a?.id).filter(Boolean) || [];
        conn.sendMessage(from, { text: q, mentions, linkPreview: true }, { quoted: mek });

    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek?.key } });
        console.log(e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});

// Unlock group
bandah({
    pattern: "unlock",
    alias: ["gunlock"],
    react: "🔓",
    desc: "Unlock the group (Allows new members to join).",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to unlock group.");

        await conn.groupSettingUpdate(from, "unlocked");
        reply("✅ Group has been unlocked. All members can change settings.");
    } catch (e) {
        console.error("Error unlocking group:", e);
        reply("❌ Failed to unlock the group. Please try again.");
    }
});

// Unmute group
bandah({
    pattern: "unmute",
    alias: ["groupunmute"],
    react: "🔊",
    desc: "Unmute the group (Everyone can send messages).",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
        if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
        if (!isBotAdmins) return reply("❌ Bot must be admin to unmute group.");

        await conn.groupSettingUpdate(from, "not_announcement");
        reply("✅ Group has been unmuted. Everyone can send messages.");
    } catch (e) {
        console.error("Error unmuting group:", e);
        reply("❌ Failed to unmute the group. Please try again.");
    }
});

bandah({
  pattern: "gcpp",
  alias: ["gpp", "fullppgc", "gcdp", "groupdp"],
  react: "🏙️",
  desc: "Group Admin Only - Set group profile picture",
  category: "group",
  filename: __filename
}, async (conn, message, match, { from, isCreator, isBotAdmins, isAdmins, isGroup, reply }) => {
  try {
    if (!isGroup) {
      return await conn.sendMessage(from, {
        text: "⚠️ This command only works in groups."
      }, { quoted: message });
    }
    
    const permissionCheck = checkAdminPermission(conn, isAdmins, isBotAdmins, isCreator, isGroup);
    if (!permissionCheck.allowed) return reply(permissionCheck.message);
        
    if (!isBotAdmins) {
      return await conn.sendMessage(from, {
        text: "❌ I must be admin to change group picture."
      }, { quoted: message });
    }

    if (!match?.quoted) {
      return await conn.sendMessage(from, {
        text: "*Please reply to an image with .gcpp*"
      }, { quoted: message });
    }

    const mtype = match.quoted.mtype;
    
    if (mtype !== "imageMessage") {
      return await conn.sendMessage(from, {
        text: "❌ Only image messages are supported for group picture"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
    await conn.updateProfilePicture(from, buffer);
    
    await conn.sendMessage(from, {
      text: "*✅ Group profile picture updated successfully!*"
    }, { quoted: message });

  } catch (error) {
    console.error("setgcpp Error:", error);
    await conn.sendMessage(from, {
      text: "❌ Error updating group picture:\n" + (error.message || error)
    }, { quoted: message });
  }
});
