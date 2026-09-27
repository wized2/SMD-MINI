
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Config = require('../config');

// ====================================
// DATABASE TYPE DETECTION
// ====================================
const DATABASE_URL = Config.MONGODB_URI || Config.DATABASE_URL || '';
let dbType = 'memory';

if (DATABASE_URL) {
    if (DATABASE_URL.startsWith('mongodb://') || DATABASE_URL.startsWith('mongodb+srv://')) {
        dbType = 'mongodb';
    } else if (DATABASE_URL.startsWith('postgresql://') || DATABASE_URL.startsWith('postgres://')) {
        dbType = 'postgresql';
    }
}

console.log(`🗄️ Database Type: ${dbType.toUpperCase()}`);

// ====================================
// MEMORY STORAGE (Fallback)
// ====================================
class MemoryStorage {
    constructor() {
        this.sessions = new Map();
        this.userConfigs = new Map();
        this.otps = new Map();
        this.activeNumbers = new Map();
        this.stats = new Map();
        this.statIdCounter = 0;
        
        // OTP cleanup interval
        setInterval(() => this.cleanupOTPs(), 60000);
    }

    cleanupOTPs() {
        const now = Date.now();
        for (const [key, value] of this.otps) {
            if (value.expiresAt < now) {
                this.otps.delete(key);
            }
        }
    }

    // Session methods
    async saveSession(number, credentials) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        this.sessions.set(cleanNumber, {
            number: cleanNumber,
            credentials,
            updatedAt: new Date()
        });
        console.log(`📁 Session saved to Memory for ${cleanNumber}`);
        return true;
    }

    async getSession(number) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const session = this.sessions.get(cleanNumber);
        return session ? session.credentials : null;
    }

    async deleteSession(number) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        this.sessions.delete(cleanNumber);
        this.activeNumbers.delete(cleanNumber);
        console.log(`🗑️ Session deleted from Memory for ${cleanNumber}`);
        return true;
    }

    async getAllSessions() {
        return Array.from(this.sessions.values()).map(s => ({
            number: s.number,
            credentials: s.credentials
        }));
    }

    // Config methods
    async getUserConfig(number) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        let config = this.userConfigs.get(cleanNumber);
        
        if (config) {
            return config.config;
        }
        
        const defaultConfig = {
            AUTO_RECORDING: 'false',
            AUTO_TYPING: 'false',
            READ_MESSAGE: 'false',
            ANTI_CALL: 'false',
            ANTI_LINK: "false",
            ANTI_LINK_ACTION: "delete",
            REJECT_MSG: '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!*',
            AUTO_VIEW_STATUS: 'true',
            AUTO_LIKE_STATUS: 'true',
            AUTO_STATUS_REPLY: 'false',
            AUTO_STATUS_MSG: Config.STATUS_REPLY_MSG,
            AUTO_REACT: 'false',
            AUTO_LIKE_EMOJI: ['❤️','👍','😮','😎'],
            CUSTOM_EMOJIS: ['❤️','🔥','👍','😊'],
            HEART_REACT: 'false',
            CUSTOM_REACT: 'false',
            ANTI_DELETE: 'false',
            ANTI_DEL_PATH: 'same',
            ANTI_EDIT: 'false',
            ANTI_EDIT_PATH: 'same',
            WELCOME: 'false',
            GOODBYE: 'false',
            ADMIN_ACTION: 'false',
            MODE: 'public',
            CHATBOT: 'off',
            PREFIX: '.',
            MENU_IMG: Config.MENU_IMG,
            BOT_NAME: Config.BOT_NAME,
            CAPTION: Config.CAPTION,
            OWNER_NAME: Config.OWNER_NAME,
            ANTI_FORIGN: "false",
            ANTI_FORIGN_NUMBER: "91,97,225",
            ANTI_PROMOTE: "false",
            AUTO_REPLY: "false",
            AUTO_STICKER: "false",
            ANTI_BAD: "false",
            AUTO_DOWNLOAD: "false",
            MENTION_REPLY: "false"
            
        };
        
        this.userConfigs.set(cleanNumber, {
            number: cleanNumber,
            config: defaultConfig,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        return defaultConfig;
    }

    async updateUserConfig(number, newConfig) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const existing = this.userConfigs.get(cleanNumber);
        
        let configToUpdate = newConfig;
        if (existing && existing.config) {
            configToUpdate = { ...existing.config, ...newConfig };
        }
        
        this.userConfigs.set(cleanNumber, {
            number: cleanNumber,
            config: configToUpdate,
            createdAt: existing ? existing.createdAt : new Date(),
            updatedAt: new Date()
        });
        
        console.log(`⚙️ Config updated in Memory for ${cleanNumber}`);
        return configToUpdate;
    }

    // OTP methods
    async saveOTP(number, otp, config) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const key = `${cleanNumber}_${otp}`;
        this.otps.set(key, {
            number: cleanNumber,
            otp,
            config,
            expiresAt: Date.now() + 5 * 60000
        });
        console.log(`🔐 OTP saved to Memory for ${cleanNumber}`);
        return true;
    }

    async verifyOTP(number, otp) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const key = `${cleanNumber}_${otp}`;
        const otpRecord = this.otps.get(key);
        
        if (!otpRecord || otpRecord.expiresAt < Date.now()) {
            return { valid: false, error: 'Invalid or expired OTP' };
        }
        
        this.otps.delete(key);
        return { valid: true, config: otpRecord.config };
    }

    // Active numbers methods
    async addNumber(number) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        this.activeNumbers.set(cleanNumber, {
            number: cleanNumber,
            lastConnected: new Date(),
            isActive: true
        });
        return true;
    }

    async removeNumber(number) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        this.activeNumbers.delete(cleanNumber);
        return true;
    }

    async getAllNumbers() {
        return Array.from(this.activeNumbers.values())
            .filter(num => num.isActive)
            .map(num => num.number);
    }

    // Stats methods
    async incrementStats(number, field) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const today = new Date().toISOString().split('T')[0];
        const key = `${cleanNumber}_${today}`;
        
        let stat = this.stats.get(key);
        if (!stat) {
            stat = {
                id: ++this.statIdCounter,
                number: cleanNumber,
                date: today,
                commandsUsed: 0,
                messagesReceived: 0,
                messagesSent: 0,
                groupsInteracted: 0
            };
            this.stats.set(key, stat);
        }
        
        const validFields = ['commandsUsed', 'messagesReceived', 'messagesSent', 'groupsInteracted'];
        if (validFields.includes(field)) {
            stat[field]++;
        }
        
        return true;
    }

    async getStatsForNumber(number) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const stats = Array.from(this.stats.values())
            .filter(stat => stat.number === cleanNumber)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 30);
        return stats;
    }
}

// ====================================
// POSTGRESQL IMPLEMENTATION
// ====================================
class PostgresStorage {
    constructor() {
        this.pool = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        this.pool = new Pool({
            connectionString: DATABASE_URL,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        await this.createTables();
        this.initialized = true;
    }

    async createTables() {
        const client = await this.pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS sessions (
                    number VARCHAR(20) PRIMARY KEY,
                    credentials JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS user_configs (
                    number VARCHAR(20) PRIMARY KEY,
                    config JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS otps (
                    id SERIAL PRIMARY KEY,
                    number VARCHAR(20) NOT NULL,
                    otp VARCHAR(10) NOT NULL,
                    config JSONB NOT NULL,
                    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes'),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            await client.query(`CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at)`);

            await client.query(`
                CREATE TABLE IF NOT EXISTS active_numbers (
                    number VARCHAR(20) PRIMARY KEY,
                    last_connected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS stats (
                    id SERIAL PRIMARY KEY,
                    number VARCHAR(20) NOT NULL,
                    date DATE NOT NULL,
                    commands_used INTEGER DEFAULT 0,
                    messages_received INTEGER DEFAULT 0,
                    messages_sent INTEGER DEFAULT 0,
                    groups_interacted INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(number, date)
                )
            `);

            console.log('✅ PostgreSQL tables created/verified');
        } finally {
            client.release();
        }
    }

    async ensureConnection() {
        if (!this.initialized) {
            await this.init();
        }
    }

    // Session methods
    async saveSession(number, credentials) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.pool.query(
                `INSERT INTO sessions (number, credentials, updated_at) 
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 ON CONFLICT (number) DO UPDATE SET 
                 credentials = EXCLUDED.credentials,
                 updated_at = CURRENT_TIMESTAMP`,
                [cleanNumber, JSON.stringify(credentials)]
            );
            console.log(`📁 Session saved to PostgreSQL for ${cleanNumber}`);
            return true;
        } catch (error) {
            console.error('❌ PostgreSQL saveSession error:', error.message);
            return false;
        }
    }

    async getSession(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const result = await this.pool.query(
                'SELECT credentials FROM sessions WHERE number = $1',
                [cleanNumber]
            );
            return result.rows.length > 0 ? result.rows[0].credentials : null;
        } catch (error) {
            console.error('❌ PostgreSQL getSession error:', error.message);
            return null;
        }
    }

    async deleteSession(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.pool.query('DELETE FROM sessions WHERE number = $1', [cleanNumber]);
            await this.pool.query('DELETE FROM active_numbers WHERE number = $1', [cleanNumber]);
            console.log(`🗑️ Session deleted from PostgreSQL for ${cleanNumber}`);
            return true;
        } catch (error) {
            console.error('❌ PostgreSQL deleteSession error:', error.message);
            return false;
        }
    }

    async getAllSessions() {
        await this.ensureConnection();
        try {
            const result = await this.pool.query('SELECT number, credentials FROM sessions');
            return result.rows;
        } catch (error) {
            console.error('❌ PostgreSQL getAllSessions error:', error.message);
            return [];
        }
    }

    // Config methods
    async getUserConfig(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const result = await this.pool.query(
                'SELECT config FROM user_configs WHERE number = $1',
                [cleanNumber]
            );
            
            if (result.rows.length > 0) {
                return result.rows[0].config;
            }
            
            const defaultConfig = {
                AUTO_RECORDING: 'false',
                AUTO_TYPING: 'false',
                READ_MESSAGE: 'false',
                ANTI_CALL: 'false',
                ANTI_LINK: "false",
                ANTI_LINK_ACTION: "delete",
                REJECT_MSG: '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!*',
                AUTO_VIEW_STATUS: 'true',
                AUTO_LIKE_STATUS: 'true',
                AUTO_STATUS_REPLY: 'false',
                AUTO_STATUS_MSG: Config.STATUS_REPLY_MSG,
                AUTO_REACT: 'false',
                AUTO_LIKE_EMOJI: ['❤️','👍','😮','😎'],
                CUSTOM_EMOJIS: ['❤️','🔥','👍','😊'],
                HEART_REACT: 'false',
                CUSTOM_REACT: 'false',
                ANTI_DELETE: 'false',
                ANTI_DEL_PATH: 'same',
                ANTI_EDIT: 'false',
                ANTI_EDIT_PATH: 'same',
                WELCOME: 'false',
                GOODBYE: 'false',
                ADMIN_ACTION: 'false',
                MODE: 'public',
                CHATBOT: 'off',
                PREFIX: '.',
                MENU_IMG: Config.MENU_IMG,
            BOT_NAME: Config.BOT_NAME,
            CAPTION: Config.CAPTION,
            OWNER_NAME: Config.OWNER_NAME,
                ANTI_FORIGN: "false",
            ANTI_FORIGN_NUMBER: "91,97,225",
            ANTI_PROMOTE: "false",
            AUTO_REPLY: "false",
            AUTO_STICKER: "false",
            ANTI_BAD: "false",
            AUTO_DOWNLOAD: "false",
            MENTION_REPLY: "false"
            };
            
            await this.pool.query(
                `INSERT INTO user_configs (number, config) VALUES ($1, $2)`,
                [cleanNumber, JSON.stringify(defaultConfig)]
            );
            
            return defaultConfig;
        } catch (error) {
            console.error('❌ PostgreSQL getUserConfig error:', error.message);
            return {};
        }
    }

    async updateUserConfig(number, newConfig) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const existing = await this.pool.query(
                'SELECT config FROM user_configs WHERE number = $1',
                [cleanNumber]
            );
            
            let configToUpdate = newConfig;
            if (existing.rows.length > 0) {
                configToUpdate = { ...existing.rows[0].config, ...newConfig };
            }
            
            await this.pool.query(
                `INSERT INTO user_configs (number, config, updated_at) 
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 ON CONFLICT (number) DO UPDATE SET 
                 config = EXCLUDED.config,
                 updated_at = CURRENT_TIMESTAMP`,
                [cleanNumber, JSON.stringify(configToUpdate)]
            );
            
            console.log(`⚙️ Config updated in PostgreSQL for ${cleanNumber}`);
            return configToUpdate;
        } catch (error) {
            console.error('❌ PostgreSQL updateUserConfig error:', error.message);
            return null;
        }
    }

    // OTP methods
    async saveOTP(number, otp, config) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.pool.query(
                `INSERT INTO otps (number, otp, config) VALUES ($1, $2, $3)`,
                [cleanNumber, otp, JSON.stringify(config)]
            );
            console.log(`🔐 OTP saved to PostgreSQL for ${cleanNumber}`);
            return true;
        } catch (error) {
            console.error('❌ PostgreSQL saveOTP error:', error.message);
            return false;
        }
    }

    async verifyOTP(number, otp) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const result = await this.pool.query(
                `SELECT * FROM otps WHERE number = $1 AND otp = $2 AND expires_at > CURRENT_TIMESTAMP`,
                [cleanNumber, otp]
            );
            
            if (result.rows.length === 0) {
                return { valid: false, error: 'Invalid or expired OTP' };
            }
            
            await this.pool.query('DELETE FROM otps WHERE id = $1', [result.rows[0].id]);
            
            return { valid: true, config: result.rows[0].config };
        } catch (error) {
            console.error('❌ PostgreSQL verifyOTP error:', error.message);
            return { valid: false, error: 'Verification error' };
        }
    }

    // Active numbers methods
    async addNumber(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.pool.query(
                `INSERT INTO active_numbers (number, last_connected, is_active) 
                 VALUES ($1, CURRENT_TIMESTAMP, true)
                 ON CONFLICT (number) DO UPDATE SET 
                 last_connected = CURRENT_TIMESTAMP,
                 is_active = true`,
                [cleanNumber]
            );
            return true;
        } catch (error) {
            console.error('❌ PostgreSQL addNumber error:', error.message);
            return false;
        }
    }

    async removeNumber(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.pool.query('DELETE FROM active_numbers WHERE number = $1', [cleanNumber]);
            return true;
        } catch (error) {
            console.error('❌ PostgreSQL removeNumber error:', error.message);
            return false;
        }
    }

    async getAllNumbers() {
        await this.ensureConnection();
        try {
            const result = await this.pool.query(
                'SELECT number FROM active_numbers WHERE is_active = true'
            );
            return result.rows.map(row => row.number);
        } catch (error) {
            console.error('❌ PostgreSQL getAllNumbers error:', error.message);
            return [];
        }
    }

    // Stats methods
    async incrementStats(number, field) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const today = new Date().toISOString().split('T')[0];
        
        const fieldMap = {
            'commandsUsed': 'commands_used',
            'messagesReceived': 'messages_received',
            'messagesSent': 'messages_sent',
            'groupsInteracted': 'groups_interacted'
        };
        
        const pgField = fieldMap[field];
        if (!pgField) return false;
        
        try {
            await this.pool.query(
                `INSERT INTO stats (number, date, ${pgField}) 
                 VALUES ($1, $2, 1)
                 ON CONFLICT (number, date) DO UPDATE SET 
                 ${pgField} = stats.${pgField} + 1`,
                [cleanNumber, today]
            );
            return true;
        } catch (error) {
            console.error('❌ PostgreSQL incrementStats error:', error.message);
            return false;
        }
    }

    async getStatsForNumber(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const result = await this.pool.query(
                `SELECT 
                    number, 
                    TO_CHAR(date, 'YYYY-MM-DD') as date,
                    commands_used as "commandsUsed",
                    messages_received as "messagesReceived",
                    messages_sent as "messagesSent",
                    groups_interacted as "groupsInteracted"
                 FROM stats 
                 WHERE number = $1 
                 ORDER BY date DESC 
                 LIMIT 30`,
                [cleanNumber]
            );
            return result.rows;
        } catch (error) {
            console.error('❌ PostgreSQL getStatsForNumber error:', error.message);
            return [];
        }
    }
}

// ====================================
// MONGODB IMPLEMENTATION
// ====================================
class MongoStorage {
    constructor() {
        this.connected = false;
    }

    async connect() {
        if (this.connected) return;
        
        try {
            mongoose.set('strictQuery', false);
            await mongoose.connect(DATABASE_URL, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            
            this.defineSchemas();
            
            this.connected = true;
            console.log("✅ MongoDB Database Connected Successfully");
        } catch (e) {
            console.error("❌ MongoDB Database Connection Failed:", e.message);
            throw e;
        }
    }

    defineSchemas() {
        const sessionSchema = new mongoose.Schema({
            number: { type: String, required: true, unique: true, index: true },
            credentials: { type: mongoose.Schema.Types.Mixed, required: true },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        const userConfigSchema = new mongoose.Schema({
            number: { type: String, required: true, unique: true, index: true },
            config: { type: mongoose.Schema.Types.Mixed, default: {} }
        }, { timestamps: true });

        const otpSchema = new mongoose.Schema({
            number: { type: String, required: true, index: true },
            otp: { type: String, required: true },
            config: { type: mongoose.Schema.Types.Mixed, required: true },
            expiresAt: { type: Date, default: () => new Date(Date.now() + 5 * 60000), index: { expires: '5m' } }
        }, { timestamps: true });

        const activeNumberSchema = new mongoose.Schema({
            number: { type: String, required: true, unique: true, index: true },
            lastConnected: { type: Date, default: Date.now },
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });

        const statsSchema = new mongoose.Schema({
            number: { type: String, required: true, index: true },
            date: { type: String, required: true, index: true },
            commandsUsed: { type: Number, default: 0 },
            messagesReceived: { type: Number, default: 0 },
            messagesSent: { type: Number, default: 0 },
            groupsInteracted: { type: Number, default: 0 }
        }, { timestamps: true });

        statsSchema.index({ number: 1, date: 1 }, { unique: true });

        this.Session = mongoose.model('Session', sessionSchema);
        this.UserConfig = mongoose.model('UserConfig', userConfigSchema);
        this.OTP = mongoose.model('OTP', otpSchema);
        this.ActiveNumber = mongoose.model('ActiveNumber', activeNumberSchema);
        this.Stats = mongoose.model('Stats', statsSchema);
    }

    async ensureConnection() {
        if (!this.connected) {
            await this.connect();
        }
    }

    // Session methods
    async saveSession(number, credentials) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.Session.findOneAndUpdate(
                { number: cleanNumber },
                { credentials, updatedAt: new Date() },
                { upsert: true, new: true }
            );
            console.log(`📁 Session saved to MongoDB for ${cleanNumber}`);
            return true;
        } catch (error) {
            console.error('❌ MongoDB saveSession error:', error.message);
            return false;
        }
    }

    async getSession(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const session = await this.Session.findOne({ number: cleanNumber });
            return session ? session.credentials : null;
        } catch (error) {
            console.error('❌ MongoDB getSession error:', error.message);
            return null;
        }
    }

    async deleteSession(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.Session.deleteOne({ number: cleanNumber });
            await this.ActiveNumber.deleteOne({ number: cleanNumber });
            console.log(`🗑️ Session deleted from MongoDB for ${cleanNumber}`);
            return true;
        } catch (error) {
            console.error('❌ MongoDB deleteSession error:', error.message);
            return false;
        }
    }

    async getAllSessions() {
        await this.ensureConnection();
        try {
            const sessions = await this.Session.find({});
            return sessions.map(s => ({
                number: s.number,
                credentials: s.credentials
            }));
        } catch (error) {
            console.error('❌ MongoDB getAllSessions error:', error.message);
            return [];
        }
    }

    // Config methods
    async getUserConfig(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            let config = await this.UserConfig.findOne({ number: cleanNumber });
            
            if (config) {
                return config.config;
            }
            
            const defaultConfig = {
                AUTO_RECORDING: 'false',
                AUTO_TYPING: 'false',
                READ_MESSAGE: 'false',
                ANTI_CALL: 'false',
                ANTI_LINK: "false",
                ANTI_LINK_ACTION: "delete",
                REJECT_MSG: '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!*',
                AUTO_VIEW_STATUS: 'true',
                AUTO_LIKE_STATUS: 'true',
                AUTO_STATUS_REPLY: 'false',
                AUTO_STATUS_MSG: Config.STATUS_REPLY_MSG,
                AUTO_REACT: 'false',
                AUTO_LIKE_EMOJI: ['❤️','👍','😮','😎'],
                CUSTOM_EMOJIS: ['❤️','🔥','👍','😊'],
                HEART_REACT: 'false',
                CUSTOM_REACT: 'false',
                ANTI_DELETE: 'false',
                ANTI_DEL_PATH: 'same',
                ANTI_EDIT: 'false',
                ANTI_EDIT_PATH: 'same',
                WELCOME: 'false',
                GOODBYE: 'false',
                ADMIN_ACTION: 'false',
                MODE: 'public',
                CHATBOT: 'off',
                PREFIX: '.',
                MENU_IMG: Config.MENU_IMG,
            BOT_NAME: Config.BOT_NAME,
            CAPTION: Config.CAPTION,
            OWNER_NAME: Config.OWNER_NAME,
                ANTI_FORIGN: "false",
            ANTI_FORIGN_NUMBER: "91,97,225",
            ANTI_PROMOTE: "false",
            AUTO_REPLY: "false",
            AUTO_STICKER: "false",
            ANTI_BAD: "false",
            AUTO_DOWNLOAD: "false",
            MENTION_REPLY: "false"
            };
            
            await this.UserConfig.create({ number: cleanNumber, config: defaultConfig });
            return defaultConfig;
        } catch (error) {
            console.error('❌ MongoDB getUserConfig error:', error.message);
            return {};
        }
    }

    async updateUserConfig(number, newConfig) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const existing = await this.UserConfig.findOne({ number: cleanNumber });
            
            let configToUpdate = newConfig;
            if (existing && existing.config) {
                configToUpdate = { ...existing.config, ...newConfig };
            }
            
            const result = await this.UserConfig.findOneAndUpdate(
                { number: cleanNumber },
                { config: configToUpdate, updatedAt: new Date() },
                { upsert: true, new: true }
            );
            
            console.log(`⚙️ Config updated in MongoDB for ${cleanNumber}`);
            return result.config;
        } catch (error) {
            console.error('❌ MongoDB updateUserConfig error:', error.message);
            return null;
        }
    }

    // OTP methods
    async saveOTP(number, otp, config) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.OTP.create({ number: cleanNumber, otp, config });
            console.log(`🔐 OTP saved to MongoDB for ${cleanNumber}`);
            return true;
        } catch (error) {
            console.error('❌ MongoDB saveOTP error:', error.message);
            return false;
        }
    }

    async verifyOTP(number, otp) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const otpRecord = await this.OTP.findOne({
                number: cleanNumber,
                otp: otp,
                expiresAt: { $gt: new Date() }
            });
            
            if (!otpRecord) {
                return { valid: false, error: 'Invalid or expired OTP' };
            }
            
            await this.OTP.deleteOne({ _id: otpRecord._id });
            return { valid: true, config: otpRecord.config };
        } catch (error) {
            console.error('❌ MongoDB verifyOTP error:', error.message);
            return { valid: false, error: 'Verification error' };
        }
    }

    // Active numbers methods
    async addNumber(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.ActiveNumber.findOneAndUpdate(
                { number: cleanNumber },
                { lastConnected: new Date(), isActive: true },
                { upsert: true, new: true }
            );
            return true;
        } catch (error) {
            console.error('❌ MongoDB addNumber error:', error.message);
            return false;
        }
    }

    async removeNumber(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            await this.ActiveNumber.deleteOne({ number: cleanNumber });
            return true;
        } catch (error) {
            console.error('❌ MongoDB removeNumber error:', error.message);
            return false;
        }
    }

    async getAllNumbers() {
        await this.ensureConnection();
        try {
            const activeNumbers = await this.ActiveNumber.find({ isActive: true });
            return activeNumbers.map(num => num.number);
        } catch (error) {
            console.error('❌ MongoDB getAllNumbers error:', error.message);
            return [];
        }
    }

    // Stats methods
    async incrementStats(number, field) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const today = new Date().toISOString().split('T')[0];
        
        const validFields = ['commandsUsed', 'messagesReceived', 'messagesSent', 'groupsInteracted'];
        if (!validFields.includes(field)) return false;
        
        try {
            await this.Stats.findOneAndUpdate(
                { number: cleanNumber, date: today },
                { $inc: { [field]: 1 } },
                { upsert: true, new: true }
            );
            return true;
        } catch (error) {
            console.error('❌ MongoDB incrementStats error:', error.message);
            return false;
        }
    }

    async getStatsForNumber(number) {
        await this.ensureConnection();
        const cleanNumber = number.replace(/[^0-9]/g, '');
        try {
            const stats = await this.Stats.find({ number: cleanNumber })
                .sort({ date: -1 })
                .limit(30);
            return stats;
        } catch (error) {
            console.error('❌ MongoDB getStatsForNumber error:', error.message);
            return [];
        }
    }
}

// ====================================
// UNIFIED STORAGE INTERFACE
// ====================================
class UnifiedStorage {
    constructor() {
        if (dbType === 'mongodb') {
            this.storage = new MongoStorage();
        } else if (dbType === 'postgresql') {
            this.storage = new PostgresStorage();
        } else {
            console.log('⚠️ No database URL provided, using Memory storage');
            this.storage = new MemoryStorage();
        }
        this.dbType = dbType;
    }

    // Session functions
    async saveSessionToMongoDB(number, credentials) {
        return await this.storage.saveSession(number, credentials);
    }

    async getSessionFromMongoDB(number) {
        return await this.storage.getSession(number);
    }

    async deleteSessionFromMongoDB(number) {
        return await this.storage.deleteSession(number);
    }

    async getAllSessions() {
        return await this.storage.getAllSessions();
    }

    // Config functions
    async getUserConfigFromMongoDB(number) {
        return await this.storage.getUserConfig(number);
    }

    async updateUserConfigInMongoDB(number, newConfig) {
        return await this.storage.updateUserConfig(number, newConfig);
    }

    // OTP functions
    async saveOTPToMongoDB(number, otp, config) {
        return await this.storage.saveOTP(number, otp, config);
    }

    async verifyOTPFromMongoDB(number, otp) {
        return await this.storage.verifyOTP(number, otp);
    }

    // Active numbers functions
    async addNumberToMongoDB(number) {
        return await this.storage.addNumber(number);
    }

    async removeNumberFromMongoDB(number) {
        return await this.storage.removeNumber(number);
    }

    async getAllNumbersFromMongoDB() {
        return await this.storage.getAllNumbers();
    }

    // Stats functions
    async incrementStats(number, field) {
        return await this.storage.incrementStats(number, field);
    }

    async getStatsForNumber(number) {
        return await this.storage.getStatsForNumber(number);
    }

    // Legacy compatibility
    async getUserConfig(number) {
        const config = await this.storage.getUserConfig(number);
        return config || {};
    }

    async updateUserConfig(number, newConfig) {
        return await this.storage.updateUserConfig(number, newConfig);
    }

    getActiveDatabase() {
        return this.dbType;
    }
}

// ====================================
// CONNECTION FUNCTION
// ====================================
const unifiedStorage = new UnifiedStorage();

const connectdb = async () => {
    try {
        if (dbType === 'mongodb') {
            await unifiedStorage.storage.connect();
        } else if (dbType === 'postgresql') {
            await unifiedStorage.storage.init();
            console.log("✅ PostgreSQL Database Connected Successfully");
        } else {
            console.log("✅ Memory Storage Initialized Successfully");
        }
    } catch (e) {
        console.error("❌ Database Connection Failed:", e.message);
        console.log("⚠️ Falling back to Memory storage");
        unifiedStorage.storage = new MemoryStorage();
        unifiedStorage.dbType = 'memory';
    }
};

// ====================================
// EXPORTS
// ====================================
module.exports = {
    connectdb,

    get Session() { return unifiedStorage.storage.Session; },
    get UserConfig() { return unifiedStorage.storage.UserConfig; },
    get OTP() { return unifiedStorage.storage.OTP; },
    get ActiveNumber() { return unifiedStorage.storage.ActiveNumber; },
    get Stats() { return unifiedStorage.storage.Stats; },

    saveSessionToMongoDB: (number, credentials) => unifiedStorage.saveSessionToMongoDB(number, credentials),
    getSessionFromMongoDB: (number) => unifiedStorage.getSessionFromMongoDB(number),
    deleteSessionFromMongoDB: (number) => unifiedStorage.deleteSessionFromMongoDB(number),

    getUserConfigFromMongoDB: (number) => unifiedStorage.getUserConfigFromMongoDB(number),
    updateUserConfigInMongoDB: (number, newConfig) => unifiedStorage.updateUserConfigInMongoDB(number, newConfig),

    saveOTPToMongoDB: (number, otp, config) => unifiedStorage.saveOTPToMongoDB(number, otp, config),
    verifyOTPFromMongoDB: (number, otp) => unifiedStorage.verifyOTPFromMongoDB(number, otp),

    addNumberToMongoDB: (number) => unifiedStorage.addNumberToMongoDB(number),
    removeNumberFromMongoDB: (number) => unifiedStorage.removeNumberFromMongoDB(number),
    getAllNumbersFromMongoDB: () => unifiedStorage.getAllNumbersFromMongoDB(),

    incrementStats: (number, field) => unifiedStorage.incrementStats(number, field),
    getStatsForNumber: (number) => unifiedStorage.getStatsForNumber(number),

    getUserConfig: async (number) => unifiedStorage.getUserConfig(number),
    updateUserConfig: (number, newConfig) => unifiedStorage.updateUserConfig(number, newConfig),
    
    getActiveDatabase: () => unifiedStorage.getActiveDatabase(),
    getAllSessions: () => unifiedStorage.getAllSessions()
};

