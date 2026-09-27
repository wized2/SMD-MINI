const config = require('../config');
const { getUserConfigFromMongoDB } = require("./database");

const PresenceControl = async (conn, update) => {
    try {
        const bot = conn.user.id.split(":")[0] || "923029450054";
        const botConfig = await getUserConfigFromMongoDB(bot);

        // ALWAYS ONLINE MODE
        if (botConfig.ALWAYS_ONLINE === true || botConfig.ALWAYS_ONLINE === "true") {
            await conn.sendPresenceUpdate("available", update.id);
            return;
        }

        // SAFE ACCESS
        const userPresence = update?.presences?.[update.id]?.lastKnownPresence;

        if (!userPresence) return;

        let presenceState;

        switch (userPresence) {
            case 'available':
            case 'online':
                presenceState = 'available';
                break;

            case 'unavailable':
            case 'offline':
                presenceState = 'unavailable';
                break;

            case 'composing':
            case 'recording':
                if (
                    botConfig.AUTO_TYPING === 'true' ||
                    botConfig.AUTO_RECORDING === 'true'
                ) {
                    return;
                }
                presenceState = 'available';
                break;

            default:
                presenceState = 'unavailable';
        }

        await conn.sendPresenceUpdate(presenceState, update.id);

    } catch (err) {
        console.error('[Presence Error]', err);
    }
};


// FILTER BOT AUTO PRESENCE
const BotActivityFilter = async (conn) => {

    const bot = conn.user.id.split(":")[0];
    const botConfig = await getUserConfigFromMongoDB(bot);

    const originalSendMessage = conn.sendMessage.bind(conn);
    const originalSendPresenceUpdate = conn.sendPresenceUpdate.bind(conn);


    conn.sendMessage = async (jid, content, options) => {

        const result = await originalSendMessage(jid, content, options);

        if (
            botConfig.AUTO_TYPING !== 'true' &&
            botConfig.AUTO_RECORDING !== 'true'
        ) {
            await originalSendPresenceUpdate('unavailable', jid);
        }

        return result;
    };


    conn.sendPresenceUpdate = async (type, jid) => {

        const stack = new Error().stack;

        if (
            stack.includes('PresenceControl') ||
            (type === 'composing' && botConfig.AUTO_TYPING === 'true') ||
            (type === 'recording' && botConfig.AUTO_RECORDING === 'true')
        ) {
            return originalSendPresenceUpdate(type, jid);
        }

        return;
    };
};

module.exports = { PresenceControl, BotActivityFilter };
