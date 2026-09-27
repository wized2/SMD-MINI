const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
}

module.exports = {
    // ===========================================================
    // 1. CONFIGURATION DE BASE (Session & Database)
    // ===========================================================
    SESSION_ID: process.env.SESSION_ID || "SMD-MINI", 
    MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE_URL || '',
    
    // ===========================================================
    // 2. INFORMATIONS DU BOT
    // ===========================================================
    PREFIX: process.env.PREFIX || '.',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '923253617422', // Mettez votre numéro ici
    BOT_NAME: "SMD MINI",
    BOT_FOOTER: '© TEAM-BANDAHEALI',
    
    // Mode de travail : public, private, group, inbox
    WORK_TYPE: process.env.WORK_TYPE || "public", 
    
    
 ANTI_DELETE: "true",
        ANTI_DEL_PATH: "same",
        ANTI_EDIT: "true",
        ANTI_EDIT_PATH: "same",
    WELCOME: "true",
GOODBYE: "true",
    ADMIN_ACTION: "true",

    // ===========================================================
    // 3. FONCTIONNALITÉS AUTOMATIQUES (STATUTS)
    // ===========================================================
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || 'true', // Voir automatiquement les statuts
    AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'true', // Liker automatiquement les statuts
    AUTO_LIKE_EMOJI: ['❤️', '🌹', '✨', '🥰', '🌹', '😍', '💞', '💕', '☺️', '🤗'], 
    
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || 'false', // Répondre aux statuts
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || '🤗', // Message de réponse
    
    // ===========================================================
    // 4. FONCTIONNALITÉS DE CHAT & PRÉSENCE
    // ===========================================================
    READ_MESSAGE: process.env.READ_MESSAGE || 'false', // Marquer les messages comme lus (Blue Tick)
    AUTO_TYPING: process.env.AUTO_TYPING || 'false', // Afficher "Écrit..."
    AUTO_RECORDING: process.env.AUTO_RECORDING || 'false', // Afficher "Enregistre..."
    
    // ===========================================================
    // 5. GESTION DES GROUPES
    // ===========================================================
    WELCOME_ENABLE: process.env.WELCOME_ENABLE || 'true',
    GOODBYE_ENABLE: process.env.GOODBYE_ENABLE || 'true',
    WELCOME_MSG: process.env.WELCOME_MSG || null, 
    GOODBYE_MSG: process.env.GOODBYE_MSG || null, 
    WELCOME_IMAGE: process.env.WELCOME_IMAGE || null, 
    GOODBYE_IMAGE: process.env.GOODBYE_IMAGE || null,
    
    GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || 'https://chat.whatsapp.com/BwWffeDwiqe6cjDDklYJ5m',
    
    // ===========================================================
    // 6. SÉCURITÉ & ANTI-CALL
    // ===========================================================
    ANTI_CALL: process.env.ANTI_CALL || 'false', // Rejeter les appels
    ANTI_LINK: process.env.ANTI_LINK || "true",
    ANTI_LINK_ACTION: process.env.ANTI_LINK_ACTION || "kick",
    REJECT_MSG: process.env.REJECT_MSG || '*CALL NAHI KARE PLEASE ☺️🌹*',
    
    // ===========================================================
    // 7. IMAGES & LIENS
    // ===========================================================
    IMAGE_PATH: 'https://files.catbox.moe/kunzpz.png',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBXuGe4yltMLngL582d',
    
    // ===========================================================
    // 8. EXTERNAL API (Optionnel)
    // ===========================================================
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '7214172448:AAHGqSgaw-zGVPZWvl8msDOVDhln-9kExas',
    TELEGRAM_CHAT_ID: process.env.  TELEGRAM_CHAT_ID || '+923078071982'
    
};
  
