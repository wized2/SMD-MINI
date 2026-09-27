// 📁 lib/antidel.js - DEBUG VERSION

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const { updateUserConfigFromMongoDB, getUserConfigFromMongoDB } = require('./database');


const MESSAGE_FILE = path.join(__dirname, '../message.json');

(async () => {
    try {
        await fs.access(MESSAGE_FILE);
    } catch {
        await fs.writeFile(MESSAGE_FILE, '[]');
    }
})();

async function readJSON(file) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeJSON(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}


// Import Sequelize database functions


// Baileys functions
let downloadContentFromMessage = null;
let proto = null;
let isJidGroup = null;
let baileysLoaded = false;

async function initBaileys() {
    if (baileysLoaded) return;
    try {
        const baileys = await import('@whiskeysockets/baileys');
        downloadContentFromMessage = baileys.downloadContentFromMessage;
        proto = baileys.proto;
        isJidGroup = baileys.isJidGroup;
        baileysLoaded = true;
        console.log('✅ Baileys initialized');
        console.log('🔧 downloadContentFromMessage available:', !!downloadContentFromMessage);
    } catch (err) {
        console.error('❌ Baileys error:', err.message);
    }
}

function cleanJid(jid) {
    if (!jid) return jid;
    return jid.split(':')[0] + '@s.whatsapp.net';
}

function getPakistanTime() {
    return new Date().toLocaleString("en-PK", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

async function convertToPhoneNumber(conn, jidOrLid) {
    if (!jidOrLid) return 'Unknown';
    try {
        if (jidOrLid.includes('@s.whatsapp.net')) {
            return jidOrLid.split('@')[0].split(':')[0];
        }
        if (jidOrLid.includes('@lid')) {
            try {
                const pn = await conn.signalRepository?.lidMapping?.getPNForLID?.(jidOrLid);
                if (pn) return pn.split(":")[0];
            } catch (err) {}
            return jidOrLid.split('@')[0];
        }
        return jidOrLid.split('@')[0];
    } catch (error) {
        return 'Unknown';
    }
}

// ✅ SAVE ONLY MESSAGE METADATA (NO MEDIA)
async function saveMessageToDatabase(mek) {
    try {
        if (!mek?.key?.id) return false;
        if (mek.key.fromMe) return false;
        if (mek.message?.protocolMessage) return false;

        const messages = await readJSON(MESSAGE_FILE);

        const exists = messages.find(
            (msg) => msg.id === mek.key.id
        );

        if (exists) return true;

        messages.push({
            id: mek.key.id,
            message: mek,
            savedAt: Date.now()
        });

        await writeJSON(MESSAGE_FILE, messages);

        console.log('✅ Message saved:', mek.key.id);

        return true;
    } catch (err) {
        console.error('❌ Save error:', err);
        return false;
    }
}

// ✅ LOAD MESSAGE FROM DATABASE
async function loadMessageFromDatabase(id) {
    try {
        const messages = await readJSON(MESSAGE_FILE);

        return (
            messages.find((msg) => msg.id === id) || null
        );
    } catch (err) {
        console.error('❌ Load error:', err);
        return null;
    }
}

// ✅ DOWNLOAD MEDIA ON DEMAND - DEBUG VERSION
async function downloadMediaOnDemand(conn, messageData) {
    console.log('📥 Downloading media on demand...');
    
    try {
        await initBaileys();
        
        if (!downloadContentFromMessage) {
            console.log('❌ CRITICAL: downloadContentFromMessage not available!');
            return null;
        }
        
        const originalMsg = messageData.message;
        if (!originalMsg || !originalMsg.message) {
            console.log('❌ No message object in messageData');
            console.log('messageData keys:', Object.keys(messageData));
            return null;
        }
        
        console.log('📦 Original message keys:', Object.keys(originalMsg));
        console.log('📦 Original message.message keys:', Object.keys(originalMsg.message || {}));
        
        const contentType = Object.keys(originalMsg.message || {})[0];
        console.log('🎯 Content type:', contentType);
        
        if (!contentType) {
            console.log('❌ No content type found');
            return null;
        }
        
        const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(contentType);
        
        if (!isMedia) {
            console.log('❌ Not a media message:', contentType);
            return null;
        }
        
        const mediaContent = originalMsg.message[contentType];
        console.log('📸 Media content keys:', Object.keys(mediaContent || {}));
        
        if (!mediaContent) {
            console.log('❌ No media content found');
            return null;
        }
        
        const mediaType = contentType.replace('Message', '');
        console.log('🎯 Media type for download:', mediaType);
        
        // Check if media has required fields
        console.log('📊 Media details:', {
            mimetype: mediaContent.mimetype,
            fileLength: mediaContent.fileLength,
            hasCaption: !!mediaContent.caption,
            hasUrl: !!mediaContent.url
        });
        
        // Download media
        console.log('⏳ Starting download stream...');
        const stream = await downloadContentFromMessage(mediaContent, mediaType);
        console.log('✅ Stream created');
        
        let buffer = Buffer.from([]);
        let chunks = 0;
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
            chunks++;
            if (chunks % 10 === 0) {
                console.log(`📥 Downloaded chunk ${chunks}, total: ${(buffer.length / 1024).toFixed(2)} KB`);
            }
        }
        
        console.log('✅ Media download complete:', {
            chunks: chunks,
            sizeKB: (buffer.length / 1024).toFixed(2),
            sizeMB: (buffer.length / (1024 * 1024)).toFixed(2)
        });
        
        return {
            buffer: buffer,
            mimetype: mediaContent.mimetype || getDefaultMimeType(contentType),
            fileName: mediaContent.fileName || `media_${Date.now()}`,
            caption: mediaContent.caption || '',
            ptt: mediaContent.ptt || false,
            mediaType: mediaType,
            contentType: contentType
        };
        
    } catch (error) {
        console.error('❌ Download error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return null;
    }
}

function getDefaultMimeType(contentType) {
    const types = {
        'imageMessage': 'image/jpeg',
        'videoMessage': 'video/mp4',
        'audioMessage': 'audio/mp4',
        'stickerMessage': 'image/webp',
        'documentMessage': 'application/octet-stream'
    };
    return types[contentType] || 'application/octet-stream';
}

// ✅ ANTI-DELETE MAIN FUNCTION - DEBUG VERSION
const AntiDelete = async (conn, updates) => {
    console.log('🔄 ========== ANTI-DELETE TRIGGERED ==========');
    console.log('📊 Updates count:', updates?.length);
    
    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot);
    const antiDeleteEnabled = botConfig?.ANTI_DELETE === true || botConfig?.ANTI_DELETE === 'true' || config.ANTI_DELETE === true;
    
    if (!antiDeleteEnabled) {
        console.log('⏭️ Anti-delete disabled');
        return;
    }
    
    const botInboxJid = cleanJid(conn.user?.id);
    console.log('🤖 Bot inbox JID:', botInboxJid);
    
    for (const [index, update] of updates.entries()) {
        console.log(`\n📌 Processing update #${index + 1}`);
        
        try {
            // Check if delete event
            if (update.update?.message !== null) {
                console.log('⏭️ Not a delete event (message not null)');
                continue;
            }
            
            const deletedMessageId = update.key?.id;
            const remoteJid = update.key?.remoteJid;
            const participant = update.key?.participant;
            
            console.log('🗑️ Delete detected:', {
                messageId: deletedMessageId,
                remoteJid: remoteJid,
                participant: participant,
                isGroup: remoteJid?.endsWith('@g.us'),
                isStatus: remoteJid === 'status@broadcast'
            });
            
            if (!deletedMessageId) {
                console.log('❌ No message ID');
                continue;
            }
            
            // Load message from database
            console.log('⏳ Loading from database...');
            const messageData = await loadMessageFromDatabase(deletedMessageId);
            
            if (!messageData || !messageData.message) {
                console.log('❌ Message not found in database');
                continue;
            }
            
            console.log('✅ Message loaded from database');
            
            const deleteTime = getPakistanTime();
            const isGroup = remoteJid?.endsWith('@g.us');
            const isStatus = remoteJid === 'status@broadcast';
            
            // Build delete info
            let deleteInfo = `*╭────⬡ SMD-Mini ⬡────*`;
            let senderNumber = 'Unknown';
            
            if (isStatus) {
                senderNumber = await convertToPhoneNumber(conn, participant || remoteJid);
                deleteInfo += `\n*├📱 STATUS DELETED*`;
                deleteInfo += `\n*├👤 SENDER:* @${senderNumber}`;
            } else if (isGroup) {
                try {
                    const groupMetadata = await conn.groupMetadata(remoteJid);
                    const groupName = groupMetadata.subject;
                    const deleterNumber = await convertToPhoneNumber(conn, participant);
                    deleteInfo += `\n*├👥 GROUP:* ${groupName}`;
                    deleteInfo += `\n*├👤 DELETED BY:* @${deleterNumber}`;
                    senderNumber = deleterNumber;
                } catch (err) {
                    console.error('❌ Error getting group metadata:', err.message);
                    continue;
                }
            } else {
                senderNumber = await convertToPhoneNumber(conn, participant || remoteJid);
                deleteInfo += `\n*├👤 PRIVATE CHAT*`;
                deleteInfo += `\n*├👤 SENDER:* @${senderNumber}`;
            }
            
            deleteInfo += `\n*├⏰ TIME:* ${deleteTime}`;
            
            // Target JID
            const targetJid = botConfig.ANTI_DEL_PATH === "inbox" ? botInboxJid : remoteJid;
            if (!targetJid) {
                console.log('❌ No target JID');
                continue;
            }
            
            // Add source info for inbox mode
            if (botConfig.ANTI_DEL_PATH === "inbox") {
                if (isGroup) deleteInfo += `\n*├📌 SOURCE:* Group`;
                else if (isStatus) deleteInfo += `\n*├📌 SOURCE:* Status`;
                else deleteInfo += `\n*├📌 SOURCE:* Private`;
            }
            
            // 🔥 STEP 1: Send delete info
         //   console.log('📤 Sending delete info to:', targetJid);
         //   await conn.sendMessage(targetJid, { text: deleteInfo });
         //   console.log('✅ Delete info sent');
            
            // 🔥 STEP 2: Get content type
            const originalMsg = messageData.message;
            const contentType = Object.keys(originalMsg.message || {})[0];
            console.log('📋 Content type from DB:', contentType);
            
            const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(contentType);
            
            if (isMedia) {
                console.log('🎬 Media message detected, attempting download...');
                
                // Download media
                const mediaData = await downloadMediaOnDemand(conn, messageData);
                
                if (mediaData && mediaData.buffer && mediaData.buffer.length > 0) {
                    console.log('✅ Media downloaded successfully, size:', mediaData.buffer.length);
                    
                    // Send based on type
                    if (contentType === 'imageMessage') {
                        console.log('🖼️ Sending image...');
                        const caption = `${deleteInfo}\n\n${mediaData.caption || ''}`;

await conn.sendMessage(
    targetJid,
    {
        image: mediaData.buffer,
        caption: caption,
        mimetype: mediaData.mimetype
    },
    {}
);
                        console.log('✅ Image sent');
                    }
                    else if (contentType === 'videoMessage') {
                        console.log('🎥 Sending video...');
                        const caption = `${deleteInfo}\n\n${mediaData.caption || ''}`;

await conn.sendMessage(
    targetJid,
    {
        video: mediaData.buffer,
        caption: caption,
        mimetype: mediaData.mimetype
    },
    {}
);
                        console.log('✅ Video sent');
                    }
                    else if (contentType === 'audioMessage') {
                        console.log('🔊 Sending audio...');
                        await conn.sendMessage(
    targetJid,
    {
        audio: mediaData.buffer,
        mimetype: mediaData.mimetype,
        ptt: mediaData.ptt || false
    },
    {}
);

await conn.sendMessage(targetJid, {
    text: deleteInfo
});
                        console.log('✅ Audio sent');
                    }
                    else if (contentType === 'stickerMessage') {
                        console.log('🎨 Sending sticker...');
                        await conn.sendMessage(targetJid, {
    text: deleteInfo
});
                        await conn.sendMessage(targetJid, {
                            sticker: mediaData.buffer
                        });
                        console.log('✅ Sticker sent');
                    }
                    else if (contentType === 'documentMessage') {
                        console.log('📄 Sending document...');
                      const caption = `${deleteInfo}\n\n${mediaData.caption || ''}`;

await conn.sendMessage(
    targetJid,
    {
        document: mediaData.buffer,
        fileName: mediaData.fileName || 'document',
        caption: caption,
        mimetype: mediaData.mimetype
    },
    {}
);
                        console.log('✅ Document sent');
                    }
                } else {
                    console.log('❌ Media download failed or empty buffer');
                    await conn.sendMessage(targetJid, { 
                        text: `*❌ Media download failed*\n*├📁 TYPE:* ${contentType.replace('Message', '')}\n*├⚠️ REASON:* Cannot download from WhatsApp servers` 
                    });
                }
            } else {
                // Text message
                console.log('📝 Text message detected');
                let text = '';
                if (contentType === 'conversation') {
                    text = originalMsg.message.conversation || '';
                } else if (contentType === 'extendedTextMessage') {
                    text = originalMsg.message.extendedTextMessage?.text || '';
                } else {
                    text = messageData.content || '';
                }
                
                if (text) {
                    console.log('📤 Sending text:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
                    const finalText = `${deleteInfo}\n\n${text}`;

await conn.sendMessage(
    targetJid,
    { text: finalText },
    {}
);
                    console.log('✅ Text sent');
                } else {
                    console.log('❌ No text content');
                }
            }
            
        } catch (error) {
            console.error('❌ AntiDelete error:', error);
            console.error('Error stack:', error.stack);
        }
    }
    
    console.log('🔄 ========== ANTI-DELETE COMPLETE ==========\n');
};

// Anti-Edit (simplified)
/*const AntiEdit = async (conn, upsert) => {}
*/

async function AntiEdit(conn, upsert) {
    const bot = conn.user.id.split(":")[0];


    const botConfig = await getUserConfigFromMongoDB(bot);
    
    function extractOldMessageText(oldData) {
    try {
        const msg = oldData?.message?.message;
        if (!msg) return null;

        if (msg.conversation) return msg.conversation;

        if (msg.extendedTextMessage?.text)
            return msg.extendedTextMessage.text;

        if (msg.imageMessage?.caption)
            return msg.imageMessage.caption;

        if (msg.videoMessage?.caption)
            return msg.videoMessage.caption;

        if (msg.documentMessage?.caption)
            return msg.documentMessage.caption;

        if (msg.audioMessage)
            return "[Audio Message]";

        if (msg.stickerMessage)
            return "[Sticker]";

        return null;

    } catch {
        return null;
    }
}

    const antiEditEnabled = botConfig.ANTI_EDIT === true || botConfig.ANTI_EDIT === 'true';
    if (!antiEditEnabled) return;
    
    try {
        const msg = upsert.messages?.[0];
        if (!msg) return;
        
        // ✅ Detect edited message (new Baileys style)
        const edited =
            msg.message?.editedMessage ||
            msg.message?.protocolMessage?.editedMessage;
        
        if (!edited) return; // Not an edit
        
        const messageId =
            msg.message?.protocolMessage?.key?.id ||
            msg.key?.id;
        
        if (!messageId) return;
        
        const oldData = await loadMessageFromDatabase(messageId);
        if (!oldData) return;
        
        const oldText = extractOldMessageText(oldData);
        if (!oldText) return;
        
        const newText =
            edited.conversation ||
            edited.extendedTextMessage?.text ||
            edited.imageMessage?.caption ||
            edited.videoMessage?.caption ||
            edited.documentMessage?.caption ||
            null;
        
        if (!newText) return;
        
        const fromJid = msg.key.participant || msg.key.remoteJid;
        const editorNumber = fromJid.split("@")[0].replace(/[^0-9]/g, "");
        
        let groupName = "Private Chat";
        if (msg.key.remoteJid?.endsWith("@g.us")) {
            try {
                const meta = await conn.groupMetadata(msg.key.remoteJid);
                groupName = meta.subject;
            } catch {}
        }
        
        // ✅ FIXED: Apply inbox mode to AntiEdit as well for consistency
        const targetJid = botConfig.ANTI_EDIT_PATH === "inbox" 
            ? cleanJid(conn.user.id) 
            : msg.key.remoteJid;
        
        const editTime = getPakistanTime();
        const editInfo = `*╭────⬡ SMD-MINI ⬡────*\n` +
                        `*├✏️ MESSAGE EDITED*\n` +
                        `*├👥 GROUP:* ${groupName}\n` +
                        `*├👤 EDITED BY:* @${editorNumber}\n` +
                        `*├⏰ EDIT TIME:* ${editTime}\n` +
                        `*├📤 OLD MESSAGE:*\n${oldText}\n` +
                        `*├📥 NEW MESSAGE:*\n${newText}\n` +
                        `*╰────⬡ SMD-MINI ⬡────*`;
        
        await conn.sendMessage(
    targetJid,
    {
        text: editInfo,
        mentions: [fromJid]
    },
    { quoted: oldData.message }
);
    } catch (err) {
        console.log("AntiEdit Error:", err);
    }
}

// Legacy functions
const DeletedText = async () => {};
const DeletedMedia = async () => {};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
    AntiEdit,
    saveMessageToDatabase,
    loadMessageFromDatabase,
    convertToPhoneNumber,
    initBaileys
};
