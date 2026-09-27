const config = require('../config');
const { updateUserConfigInMongoDB, getUserConfigFromMongoDB } = require('../lib/database');

// Debug flag
const DEBUG = false; // Set to true for debugging, false for production

// Simple logging function
function log(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

function errorLog(...args) {
    if (DEBUG) {
        console.error(...args);
    }
}

// ------------------------
// SAFE GROUP METADATA FUNCTION (Built-in)
// ------------------------
async function getGroupMetadataSafe(conn, groupId) {
    try {
        if (!conn || !groupId) return null;
        if (!groupId.endsWith("@g.us")) return null;
        
        const metadata = await conn.groupMetadata(groupId);
        return metadata;
    } catch (err) {
        errorLog("Error in getGroupMetadataSafe:", err.message);
        return null;
    }
}

// ------------------------
// IMPROVED LINK DETECTION
// ------------------------
const containsHttpLink = (text) => {
    if (!text || typeof text !== 'string') return false;
    
    // More comprehensive link detection
    const linkPatterns = [
        // HTTP/HTTPS links
        /(https?:\/\/[^\s]+)/gi,
        // www links
        /(www\.[^\s]+)/gi,
        // Common domains without protocol
        /\b[a-zA-Z0-9.-]+\.(com|net|org|io|xyz|me|tv|app|co|in|uk|au|ca|info|biz|pk|us)\b/gi,
        // URL shorteners
        /\b(bit\.ly|tinyurl|goo\.gl|shorturl|t\.co|rb\.gy|shortlink|ow\.ly|is\.gd)\/[^\s]+/gi,
        // WhatsApp links
        /\b(chat\.whatsapp\.com|wa\.me|call\.whatsapp\.com)\/[^\s]+/gi,
        // Social media
        /\b(youtu\.be|youtube\.com|instagram\.com|facebook\.com|twitter\.com|tiktok\.com|snapchat\.com)\/[^\s]+/gi,
        // Any word with dot that might be a link
        /\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/gi,
        // Links with ports
        /\b[a-zA-Z0-9.-]+:\d+/gi
    ];
    
    // Also check for common TLDs in text without protocol
    const tldPattern = /\b[a-zA-Z0-9.-]+\.(com|net|org|io|pk)\b/i;
    
    return linkPatterns.some(pattern => pattern.test(text)) || tldPattern.test(text);
};

// ------------------------
// WARN MEMORY
// ------------------------
let warnDB = {};

// Auto cleanup warnings every hour
setInterval(() => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    for (const group in warnDB) {
        for (const user in warnDB[group]) {
            if (warnDB[group][user].timestamp < oneDayAgo) {
                delete warnDB[group][user];
            }
        }
        if (Object.keys(warnDB[group]).length === 0) {
            delete warnDB[group];
        }
    }
}, 60 * 60 * 1000);

// ------------------------
// MAIN ANTI-LINK FUNCTION - FIXED VERSION
// ------------------------
module.exports = async function AntiLink(conn, mek) {
    try {
        log("\n🔍 ANTI-LINK CHECK STARTED");
        
        // Get bot number
        if (!conn || !conn.user) {
            errorLog("❌ No connection object");
            return;
        }
        
        const bot = conn.user.id.split(":")[0];
        log(`🤖 Bot ID: ${bot}`);
        
        // ========== LOAD CONFIG ==========
        let botConfig;
        try {
            botConfig = await getUserConfigFromMongoDB(bot);
            log(`📋 Config loaded: ANTI_LINK = ${botConfig.ANTI_LINK}`);
        } catch (err) {
            errorLog("❌ Failed to load config:", err.message);
            return;
        }
        
        // Check if AntiLink is enabled
        if (!botConfig.ANTI_LINK || botConfig.ANTI_LINK !== "true") {
            log("⏸️ AntiLink is disabled in config");
            return;
        }
        
        // Validate message
        if (!mek || !mek.message || !mek.key) {
            errorLog("❌ Invalid message object");
            return;
        }

        const from = mek.key.remoteJid;
        log(`📍 From: ${from}`);
        
        // Check if it's a group message
        if (!from || !from.endsWith("@g.us")) {
            log("📱 Not a group message");
            return;
        }

        // Get sender
        const sender = mek.key.participant || mek.key.remoteJid;

        if (!sender) {
            errorLog("❌ No sender");
            return;
        }
        
        log(`👤 Sender: ${sender}`);

        // ========== EXTRACT MESSAGE BODY - IMPROVED ==========
        const body = (() => {
            try {
                if (mek.message?.conversation) return mek.message.conversation;
                if (mek.message?.extendedTextMessage?.text) return mek.message.extendedTextMessage.text;
                if (mek.message?.imageMessage?.caption) return mek.message.imageMessage.caption;
                if (mek.message?.videoMessage?.caption) return mek.message.videoMessage.caption;
                if (mek.message?.documentMessage?.caption) return mek.message.documentMessage.caption;
                if (mek.message?.buttonsResponseMessage?.selectedButtonId) return mek.message.buttonsResponseMessage.selectedButtonId;
                if (mek.message?.listResponseMessage?.singleSelectReply?.selectedRowId) return mek.message.listResponseMessage.singleSelectReply.selectedRowId;
                
                // Try to get text from any message type
                const msgType = Object.keys(mek.message)[0];
                if (msgType && mek.message[msgType]?.text) {
                    return mek.message[msgType].text;
                }
                if (msgType && mek.message[msgType]?.caption) {
                    return mek.message[msgType].caption;
                }
            } catch (e) {
                errorLog("Error extracting body:", e.message);
            }
            return "";
        })();

        log(`📝 Message: "${body.substring(0, 50)}${body.length > 50 ? '...' : ''}"`);

        // Check if message contains link
        const hasLink = containsHttpLink(body);
        log(`🔗 Contains link: ${hasLink}`);
        
        if (!hasLink) return;

        // Get group metadata using our safe function
        const groupMetadata = await getGroupMetadataSafe(conn, from);
        if (!groupMetadata || !groupMetadata.participants) {
            errorLog("❌ Could not fetch group metadata for:", from);
            return;
        }

        // Get bot number
        let botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
        
        botNumber = conn.user.lid.split(":")[0];
        
        log(`🤖 Bot Phone: ${botNumber}`);

        // Get sender number
        let senderPN = sender
        senderPN = sender.split("@")[0]
        log(`👤 Sender Phone: ${senderPN}`);

        // Get group admins with CLEAN numbers (remove @s.whatsapp.net part)
        const groupAdmins = groupMetadata.participants
            .filter(p => p.admin === "admin" || p.admin === "superadmin")
            .map(p => p.id.split("@")[0]);

        log(`👑 Admin Numbers (Clean):`, groupAdmins);

        const isBotAdmin = groupAdmins.includes(botNumber);
        const isSenderAdmin = groupAdmins.includes(senderPN);

        log(`🤖 Bot Admin: ${isBotAdmin}`);
        log(`👤 Sender Admin: ${isSenderAdmin}`);

        // Admin bypass
        if (isSenderAdmin) {
            log(`✅ Admin ${senderPN} sent link - ignored`);
            return;
        }

        // Get action type from config
        const action = (botConfig.ANTI_LINK_ACTION || "delete").toLowerCase();
        log(`⚡ Action: ${action}`);

        // Helper function to delete message
        const deleteMessage = async () => {
            try {
                await conn.sendMessage(from, {
                    delete: {
                        remoteJid: from,
                        fromMe: false,
                        id: mek.key.id,
                        participant: sender
                    }
                });
                log("✅ Message deleted");
                return true;
            } catch (err) {
                errorLog("❌ Delete failed:", err);
                return false;
            }
        };

        // Helper function to send notification
        const sendNotification = async (text) => {
            try {
                await conn.sendMessage(from, {
                    text: text,
                    mentions: [sender],
                });
                log("✅ Notification sent");
            } catch (err) {
                errorLog("❌ Notification send failed:", err);
            }
        };

        // Execute actions based on config
        log(`🚀 Executing ${action} action...`);

        switch(action) {
            case "delete":
                await deleteMessage();
                await sendNotification(`⚠️ @${senderPN} Links are not allowed in this group!`);
                break;

            case "kick":
                await deleteMessage();
                try {
                    await conn.groupParticipantsUpdate(from, [sender], "remove");
                    await sendNotification(`🚫 @${senderPN} Links are not allowed!\nUser has been removed from the group.`);
                } catch (err) {
                    errorLog("❌ Kick failed:", err);
                    await sendNotification(`❌ Failed to remove @${senderPN}. Please check my permissions.`);
                }
                break;

            case "warn":
                // Initialize warning system
                if (!warnDB[from]) warnDB[from] = {};
                if (!warnDB[from][sender]) {
                    warnDB[from][sender] = {
                        count: 0,
                        timestamp: Date.now()
                    };
                }

                // Increment warning count
                warnDB[from][sender].count += 1;
                warnDB[from][sender].timestamp = Date.now();
                
                const warns = warnDB[from][sender].count;

                // Delete the message
                await deleteMessage();

                if (warns < 3) {
                    await sendNotification(`⚠️ @${senderPN} Links are not allowed!\nWarning ${warns}/3`);
                } else {
                    try {
                        await conn.groupParticipantsUpdate(from, [sender], "remove");
                        await sendNotification(`🚫 @${senderPN} Maximum warnings (3/3) reached.\nUser has been removed from the group.`);
                        // Reset warning count
                        warnDB[from][sender].count = 0;
                    } catch (err) {
                        errorLog("❌ Kick after warnings failed:", err);
                        await sendNotification(`❌ Failed to remove @${senderPN}. Please check my permissions.`);
                    }
                }
                break;

            default:
                // Default to delete if action not recognized
                await deleteMessage();
                await sendNotification(`⚠️ @${senderPN} Links are not allowed in this group!`);
        }
        
        log("✅ AntiLink action completed\n");

    } catch (err) {
        errorLog("❌ AntiLink System Error:", err);
    }
};
