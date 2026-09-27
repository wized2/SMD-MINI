// 📁 data/antidel.js - COMPLETE UPDATED VERSION

const { DATABASE } = require('../lib/database2');
const { DataTypes } = require('sequelize');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// ✅ 1. Anti-delete toggle settings
const AntiDelDB = DATABASE.define('AntiDelete', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: config.ANTI_DELETE || false,
    },
}, {
    tableName: 'antidelete',
    timestamps: false,
    hooks: {
        beforeCreate: record => { record.id = 1; },
        beforeBulkCreate: records => { records.forEach(record => { record.id = 1; }); },
    },
});

// ✅ 2. Message storage table - WITH FULL MESSAGE OBJECT
const MessageDB = DATABASE.define('Message', {
    messageId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    sender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    remoteJid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    messageType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT, // Store text or metadata as JSON
        allowNull: true,
    },
    // 🔥 NEW: Full message object stored as JSON
    fullMessage: {
        type: DataTypes.TEXT('long'), // For storing complete message object
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
    },
    isMedia: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    mediaPath: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'messages',
    timestamps: true,
    indexes: [
        {
            fields: ['remoteJid'],
        },
        {
            fields: ['timestamp'],
        },
        {
            fields: ['sender'],
        },
    ],
});

// ✅ 3. Media storage table
const MediaDB = DATABASE.define('Media', {
    messageId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    mediaType: {
        type: DataTypes.STRING, // 'image', 'video', 'audio', 'sticker', 'document'
        allowNull: false,
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'application/octet-stream',
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    thumbnail: {
        type: DataTypes.TEXT, // Base64 thumbnail for images/videos
        allowNull: true,
    },
    duration: {
        type: DataTypes.INTEGER, // For audio/video in seconds
        allowNull: true,
    },
    isPtt: {
        type: DataTypes.BOOLEAN, // For voice notes
        defaultValue: false,
    },
}, {
    tableName: 'media',
    timestamps: true,
    indexes: [
        {
            fields: ['messageId'],
            unique: true,
        },
        {
            fields: ['mediaType'],
        },
    ],
});

let isInitialized = false;

async function initializeAntiDeleteSettings() {
    if (isInitialized) return;
    try {
        // Sync all tables
        await AntiDelDB.sync();
        
        // 🔥 Check if fullMessage column exists, if not add it
        const tableInfo = await DATABASE.getQueryInterface().describeTable('messages');
        if (!tableInfo.fullMessage) {
            console.log('[ANTI-DELETE-DB] Adding fullMessage column to messages table...');
            await DATABASE.getQueryInterface().addColumn('messages', 'fullMessage', {
                type: DataTypes.TEXT('long'),
                allowNull: true,
            });
        }
        
        await MessageDB.sync();
        await MediaDB.sync();
        
        // Create media storage directory
        const mediaDir = path.join(__dirname, '../media_cache');
        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
        }
        
        // Migrate from old schema if exists
        try {
            const tableInfo = await DATABASE.getQueryInterface().describeTable('antidelete');
            if (tableInfo.gc_status) {
                const oldRecord = await DATABASE.query('SELECT * FROM antidelete WHERE id = 1', { 
                    type: DATABASE.QueryTypes.SELECT 
                });
                if (oldRecord && oldRecord.length > 0) {
                    const newStatus = oldRecord[0].gc_status || oldRecord[0].dm_status;
                    await DATABASE.query('DROP TABLE antidelete');
                    await AntiDelDB.sync();
                    await AntiDelDB.create({ id: 1, status: newStatus });
                }
            } else {
                await AntiDelDB.findOrCreate({
                    where: { id: 1 },
                    defaults: { status: config.ANTI_DELETE || false },
                });
            }
        } catch (migrateError) {
            console.log('No migration needed or migration error:', migrateError.message);
        }
        
        isInitialized = true;
        console.log('[ANTI-DELETE-DB] Database initialized successfully');
    } catch (error) {
        console.error('[ANTI-DELETE-DB] Error initializing database:', error);
        
        // Create tables if they don't exist
        try {
            await AntiDelDB.sync({ force: false });
            await MessageDB.sync({ force: false });
            await MediaDB.sync({ force: false });
            
            await AntiDelDB.findOrCreate({
                where: { id: 1 },
                defaults: { status: config.ANTI_DELETE || false },
            });
            
            isInitialized = true;
        } catch (createError) {
            console.error('[ANTI-DELETE-DB] Failed to create tables:', createError);
        }
    }
}

// ✅ Save message to database - WITH FULL MESSAGE OBJECT
async function saveMessage(mek) {
    try {
        await initializeAntiDeleteSettings();
        
        if (!mek || !mek.key || !mek.key.id) {
            console.log('[ANTI-DELETE-DB] Invalid message object');
            return false;
        }
        
        const messageId = mek.key.id;
        const remoteJid = mek.key.remoteJid || '';
        const sender = mek.key.participant || mek.key.remoteJid || '';
        const contentType = Object.keys(mek.message || {})[0] || 'unknown';
        const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(contentType);
        
        console.log(`[ANTI-DELETE-DB] Saving message: ${messageId} (${contentType})`);
        
        // Extract content based on type
        let content = '';
        let caption = '';
        
        if (contentType === 'conversation') {
            content = mek.message.conversation || '';
        } else if (contentType === 'extendedTextMessage') {
            content = mek.message.extendedTextMessage?.text || '';
        } else if (isMedia) {
            const mediaContent = mek.message[contentType];
            caption = mediaContent.caption || '';
            content = JSON.stringify({
                mimetype: mediaContent.mimetype,
                fileName: mediaContent.fileName,
                fileLength: mediaContent.fileLength,
                height: mediaContent.height,
                width: mediaContent.width,
                seconds: mediaContent.seconds,
                ptt: mediaContent.ptt,
            });
        }
        
        // 🔥 CRITICAL: Puri message object ko JSON string mein save karo
        // Deep clone karo circular references se bachne ke liye
        const messageCopy = JSON.parse(JSON.stringify(mek));
        const fullMessageJson = JSON.stringify(messageCopy);
        
        // Save to MessageDB with full message
        await MessageDB.upsert({
            messageId: messageId,
            sender: sender,
            remoteJid: remoteJid,
            messageType: contentType,
            content: content,
            fullMessage: fullMessageJson, // 🔥 FULL MESSAGE OBJECT SAVED HERE
            timestamp: Date.now(),
            isMedia: isMedia,
            caption: caption,
        });
        
        console.log(`[ANTI-DELETE-DB] ✅ Message saved: ${messageId} (${contentType})`);
        return true;
        
    } catch (error) {
        console.error('[ANTI-DELETE-DB] ❌ Error saving message:', error.message);
        return false;
    }
}

// ✅ Save media file to disk and database
async function saveMediaMessage(messageId, mediaInfo) {
    try {
        await initializeAntiDeleteSettings();
        
        const { buffer, mimetype, fileName, caption, ptt, contentType } = mediaInfo;
        
        // Generate file path
        const mediaDir = path.join(__dirname, '../media_cache');
        const fileExt = getFileExtension(mimetype);
        const uniqueFileName = `${messageId}${fileExt}`;
        const filePath = path.join(mediaDir, uniqueFileName);
        
        // Save buffer to file
        fs.writeFileSync(filePath, buffer);
        
        // Determine media type from content type
        let mediaType = 'document';
        if (mimetype.startsWith('image/')) {
            mediaType = mimetype === 'image/webp' ? 'sticker' : 'image';
        } else if (mimetype.startsWith('video/')) {
            mediaType = 'video';
        } else if (mimetype.startsWith('audio/')) {
            mediaType = 'audio';
        }
        
        // Save to MediaDB
        await MediaDB.upsert({
            messageId: messageId,
            mediaType: mediaType,
            mimeType: mimetype,
            fileName: fileName,
            fileSize: buffer.length,
            filePath: filePath,
            isPtt: ptt || false,
        });
        
        // Update message record with media path
        await MessageDB.update(
            { mediaPath: filePath },
            { where: { messageId: messageId } }
        );
        
        console.log(`[ANTI-DELETE-DB] Media saved: ${messageId} (${mediaType}, ${(buffer.length / 1024).toFixed(2)} KB)`);
        return true;
        
    } catch (error) {
        console.error('[ANTI-DELETE-DB] Error saving media:', error.message);
        return false;
    }
}

// ✅ Load message from database - WITH FULL MESSAGE OBJECT
async function loadMessage(messageId) {
    try {
        await initializeAntiDeleteSettings();
        
        console.log(`[ANTI-DELETE-DB] Loading message: ${messageId}`);
        
        const message = await MessageDB.findByPk(messageId);
        if (!message) {
            console.log(`[ANTI-DELETE-DB] Message not found: ${messageId}`);
            return null;
        }
        
        console.log(`[ANTI-DELETE-DB] Message found: ${messageId} (${message.messageType})`);
        
        // 🔥 TRY TO GET FULL MESSAGE OBJECT FIRST
        if (message.fullMessage) {
            try {
                const fullMessage = JSON.parse(message.fullMessage);
                console.log(`[ANTI-DELETE-DB] Full message object retrieved for: ${messageId}`);
                
                return {
                    message: fullMessage,
                    timestamp: message.timestamp,
                    isMedia: message.isMedia,
                    contentType: message.messageType,
                    caption: message.caption,
                };
            } catch (parseError) {
                console.log(`[ANTI-DELETE-DB] Failed to parse full message: ${parseError.message}`);
            }
        }
        
        // Fallback to reconstructed message if full message not available
        console.log(`[ANTI-DELETE-DB] Reconstructing message from metadata: ${messageId}`);
        
        // Reconstruct message object
        const reconstructedMessage = {
            key: {
                id: message.messageId,
                remoteJid: message.remoteJid,
                participant: message.sender,
                fromMe: false,
            },
            message: {},
        };
        
        // Reconstruct based on type
        if (message.messageType === 'conversation') {
            reconstructedMessage.message.conversation = message.content;
        } else if (message.messageType === 'extendedTextMessage') {
            reconstructedMessage.message.extendedTextMessage = {
                text: message.content
            };
        } else if (message.isMedia) {
            // For media, try to load from MediaDB
            const mediaData = await MediaDB.findByPk(messageId);
            if (mediaData) {
                reconstructedMessage.message[message.messageType] = {
                    caption: message.caption || '',
                    mimetype: mediaData.mimeType,
                    fileName: mediaData.fileName,
                };
            } else {
                // Try to parse content as JSON
                try {
                    const mediaContent = JSON.parse(message.content);
                    reconstructedMessage.message[message.messageType] = mediaContent;
                } catch {
                    reconstructedMessage.message[message.messageType] = {
                        caption: message.caption || '',
                    };
                }
            }
        }
        
        return {
            message: reconstructedMessage,
            timestamp: message.timestamp,
            isMedia: message.isMedia,
            contentType: message.messageType,
            caption: message.caption,
        };
        
    } catch (error) {
        console.error('[ANTI-DELETE-DB] Error loading message:', error.message);
        return null;
    }
}

// ✅ Load media data from database
async function loadMediaMessage(messageId) {
    try {
        await initializeAntiDeleteSettings();
        
        const media = await MediaDB.findByPk(messageId);
        if (!media) return null;
        
        // Check if file exists
        if (!fs.existsSync(media.filePath)) {
            console.log(`[ANTI-DELETE-DB] Media file not found: ${media.filePath}`);
            return null;
        }
        
        // Read file buffer
        const buffer = fs.readFileSync(media.filePath);
        
        return {
            buffer: buffer,
            mimetype: media.mimeType,
            fileName: media.fileName,
            fileSize: media.fileSize,
            mediaType: media.mediaType,
            filePath: media.filePath,
            isPtt: media.isPtt,
        };
        
    } catch (error) {
        console.error('[ANTI-DELETE-DB] Error loading media:', error.message);
        return null;
    }
}

// ✅ Load full message only (without media)
async function loadFullMessage(messageId) {
    try {
        await initializeAntiDeleteSettings();
        
        const message = await MessageDB.findByPk(messageId);
        if (!message || !message.fullMessage) return null;
        
        return JSON.parse(message.fullMessage);
    } catch (error) {
        console.error('[ANTI-DELETE-DB] Error loading full message:', error.message);
        return null;
    }
}

// ✅ Get file extension from mimetype
function getFileExtension(mimetype) {
    const extensions = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'video/mp4': '.mp4',
        'video/quicktime': '.mov',
        'audio/mpeg': '.mp3',
        'audio/mp4': '.m4a',
        'audio/ogg': '.ogg',
        'audio/webm': '.webm',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    };
    
    return extensions[mimetype] || '.bin';
}

// ✅ Clean old messages (optional, for maintenance)
async function cleanOldMessages(days = 7) {
    try {
        await initializeAntiDeleteSettings();
        
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        // Find old messages
        const oldMessages = await MessageDB.findAll({
            where: {
                timestamp: { [DATABASE.Op.lt]: cutoffTime }
            }
        });
        
        // Delete associated media files
        for (const msg of oldMessages) {
            if (msg.mediaPath && fs.existsSync(msg.mediaPath)) {
                fs.unlinkSync(msg.mediaPath);
            }
            await MediaDB.destroy({ where: { messageId: msg.messageId } });
        }
        
        // Delete old messages
        const deletedCount = await MessageDB.destroy({
            where: {
                timestamp: { [DATABASE.Op.lt]: cutoffTime }
            }
        });
        
        console.log(`[ANTI-DELETE-DB] Cleaned ${deletedCount} old messages (older than ${days} days)`);
        return deletedCount;
        
    } catch (error) {
        console.error('[ANTI-DELETE-DB] Error cleaning old messages:', error.message);
        return 0;
    }
}

// Original functions (keep for compatibility)
async function setAnti(status) {
    try {
        await initializeAntiDeleteSettings();
        const [affectedRows] = await AntiDelDB.update({ status }, { where: { id: 1 } });
        return affectedRows > 0;
    } catch (error) {
        console.error('Error setting anti-delete status:', error);
        return false;
    }
}

async function getAnti() {
    try {
        await initializeAntiDeleteSettings();
        const record = await AntiDelDB.findByPk(1);
        return record ? record.status : (config.ANTI_DELETE || false);
    } catch (error) {
        console.error('Error getting anti-delete status:', error);
        return config.ANTI_DELETE || false;
    }
}

module.exports = {
    AntiDelDB,
    MessageDB,
    MediaDB,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    saveMessage,
    saveMediaMessage,
    loadMessage,
    loadMediaMessage,
    loadFullMessage,
    cleanOldMessages,
};