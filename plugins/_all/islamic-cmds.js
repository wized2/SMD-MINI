const { bandah, commands } = require("../command");
const axios = require('axios');
const config = require('../config');
const fetch = require('node-fetch');

// Common Islamic audio base URL
const ISLAMIC_AUDIO_BASE = "https://bandaheali-cdn.koyeb.app";

// Common function for sending Islamic audio
async function sendIslamicAudio(conn, from, mek, audioPath, title, body, reply) {
  try {
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    const audioUrl = `${ISLAMIC_AUDIO_BASE}/${audioPath}`;
    
    await conn.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: body,
          thumbnailUrl: "https://bandaheali-cdn.koyeb.app/edith/alive.jpg",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (err) {
    console.error(`${title} CMD Error:`, err);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    reply(`⚠️ *Error while sending ${title} audio.* Please try again later.`);
  }
}

// ============================ ISLAMIC COMMANDS ============================

// Asma-ul-Husna Command
bandah({
  pattern: "asmaulhusna",
  alias: ["allahnames", "asma"],
  desc: "Fetch a random Asma-ul-Husna (Beautiful Name of Allah)",
  category: "islamic",
  react: "🕌",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const url = `https://api.nexoracle.com/islamic/asma-ul-husna`;

    const res = await axios.get(url);
    const data = res.data?.result;

    if (!data || !data.name) {
      return reply("⚠️ No name found. Try again later.");
    }

    const textMsg = `✨ *Asma-ul-Husna*\n\n~ The Beautiful Name of Allah ﷻ ~\n\n${data.name}`;

    reply(textMsg);
    
  } catch (err) {
    console.error("asmaulhusna error:", err?.response?.status, err?.message);
    const status = err?.response?.status;
    if (status === 404) return reply("❌ Not found. Try again later.");
    if (status === 401 || status === 403) return reply("🔒 Unauthorized.");
    return reply(`❌ Failed to fetch Asma-ul-Husna.\n• Reason: ${err?.message || "Unknown"}`);
  }
});

// Ayatul Kursi Command
bandah({
  pattern: "ayatulqursi",
  alias: ["qursi", "aayat"],
  react: "🕋",
  desc: "Send Ayatul Kursi MP3 audio",
  category: "islamic",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  await sendIslamicAudio(
    conn, from, mek, 
    "islamic/ayat_ul_qursi.mp3", 
    "Ayatul Kursi 🕋", 
    "Recitation of Ayatul Kursi — Team-Bandaheali Islamic Collection",
    reply
  );
});

// Azaan Command
bandah({
  pattern: "azaan",
  alias: ["beautiful-azaan", "azan"],
  react: "🕌",
  desc: "Send beautiful azaan MP3 audio",
  category: "islamic",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  await sendIslamicAudio(
    conn, from, mek, 
    "media/beautiful-azan.mp3", 
    "Beautiful Azaan 🕌", 
    "Recitation of Azaan — Team-Bandaheali Islamic Collection",
    reply
  );
});

// Dua-e-Kunoot Command
bandah({
  pattern: "duaekunoot",
  alias: ["kunoot", "duakunoot"],
  react: "🕋",
  desc: "Send Dua-e-Kunoot MP3 audio",
  category: "islamic",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  await sendIslamicAudio(
    conn, from, mek, 
    "islamic/dua_e_kunoot.mp3", 
    "Dua-e-Kunoot 🕋", 
    "Recitation of Dua-e-Kunoot — Team-Bandaheali Islamic Collection",
    reply
  );
});

// Prayer Times Command
bandah({
  pattern: "praytime", 
  alias: ["prayertimes", "prayertime", "ptime"], 
  react: "🕌", 
  desc: "Get the prayer times, weather, and location for the city.", 
  category: "islamic", 
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    const city = args.length > 0 ? args.join(" ") : "NawabShah";
    const apiUrl = `https://api.nexoracle.com/islamic/prayer-times?city=${city}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return reply('Error fetching prayer times!');
    }

    const data = await response.json();

    if (data.status !== 200) {
      return reply('Failed to get prayer times. Please try again later.');
    }

    const prayerTimes = data.result.items[0];
    const weather = data.result.today_weather;
    const location = data.result.city;

    let dec = `*Prayer Times for ${location}, ${data.result.state}*\n\n`;
    dec += `📍 *Location*: ${location}, ${data.result.state}, ${data.result.country}\n`;
    dec += `🕌 *Method*: ${data.result.prayer_method_name}\n\n`;

    dec += `🌅 *Fajr*: ${prayerTimes.fajr}\n`;
    dec += `🌄 *Shurooq*: ${prayerTimes.shurooq}\n`;
    dec += `☀️ *Dhuhr*: ${prayerTimes.dhuhr}\n`;
    dec += `🌇 *Asr*: ${prayerTimes.asr}\n`;
    dec += `🌆 *Maghrib*: ${prayerTimes.maghrib}\n`;
    dec += `🌃 *Isha*: ${prayerTimes.isha}\n\n`;

    dec += `🧭 *Qibla Direction*: ${data.result.qibla_direction}°\n`;

    const temperature = weather.temperature !== null ? `${weather.temperature}°C` : 'Data not available';
    dec += `🌡️ *Temperature*: ${temperature}\n`;

    await conn.sendMessage(
      from,
      {
        image: { url: config.MENU_IMAGE_URL },
        caption: dec,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.NEWSLETTER_JID,
            newsletterName: 'ᴇᴅɪᴛʜ ᴍᴅ',
            serverMessageId: 143
          }
        }
      },
      { quoted: mek }
    );

  } catch (e) {
    console.log(e);
    reply('*Error occurred while fetching prayer times and weather.*');
  }
});

// Surah Arabic Command
bandah({
  pattern: "suraharbic",
  alias: ["surahar", "quranar"],
  desc: "Fetch Qur'an Surah in Arabic with details",
  category: "islamic",
  react: "📖",
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    const query = (args && args.length ? args[0] : "1").trim();

    const surahNum = parseInt(query, 10);
    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      return reply("⚠️ Invalid input.\n\n📖 Please enter a *Surah number between 1 and 114* only.");
    }

    const url = `https://api.nexoracle.com/islamic/quran-surah?q=${surahNum}/ar`;

    const res = await axios.get(url);
    const data = res.data?.result;

    if (!data || !data.surah_details) {
      return reply("⚠️ Surah data not found. Try another number.");
    }

    const details = data.surah_details;
    const verses = data.data?.chapter || [];

    let textMsg = `📖 *Surah ${details.title_en}* (${details.title_ar})\n\n`;
    textMsg += `🏙 Place: ${details.place}\n`;
    textMsg += `📌 Type: ${details.type}\n`;
    textMsg += `🔢 Verses: ${details.verses}\n`;
    textMsg += `📄 Pages: ${details.pages}\n`;
    textMsg += `────────────────────\n\n`;

    verses.forEach(v => {
      textMsg += `(${v.chapter}:${v.verse}) ${v.text}\n`;
    });

    await conn.sendMessage(from, {
      text: textMsg,
      contextInfo: {
        externalAdReply: {
          title: `Surah ${details.title_en} - ${details.title_ar}`,
          body: "Team-Bandaheali",
          mediaType: 1
        }
      }
    }, { quoted: mek });

  } catch (err) {
    console.error("suraharbic error:", err?.response?.status, err?.message);
    const status = err?.response?.status;
    if (status === 404) return reply("❌ Surah not found. Try another number.");
    if (status === 401 || status === 403) return reply("🔒 Unauthorized. Check API access.");
    return reply(`❌ Failed to fetch Surah.\n• Reason: ${err?.message || "Unknown"}`);
  }
});

// Surah Audio Command
bandah({
  pattern: "surah",
  alias: ["surahaudio", "quranaudio"],
  react: "📖",
  desc: "Get Quran Surah details and recitation.",
  category: "islamic",
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    let surahInput = args[0];
    if (!surahInput) return reply('🎤 Please Type Surah Number Example *.surah 1*');
    
    const res = await fetch(`https://alquran-api.pages.dev/api/quran/surah/${surahInput}?lang=1`);
    const data = await res.json();

    if (!data || !data.verses) return reply(`❌ Surah Not Found For "${surahInput}".`);
    
    const surahName = data.name;
    const transliteration = data.transliteration;
    const translation = data.translation;
    const type = data.type;
    const totalVerses = data.total_verses;
    
    let ayahsText = '';
    data.verses.forEach(v => {
      ayahsText += `\n${v.id}. ${v.text}\n➡️ ${v.translation}\n`;
    });

    const about = `*🕋 Quran Surah Audio 🕋*

📖 *Surah ${surahInput}:* ${surahName}  
*(${transliteration} - ${translation})*

💫 *Type* ${type}
✅ *Ayahs* ${totalVerses}

🔮 *Verses*  
${ayahsText}
`;

    await conn.sendMessage(
      from,
      {
        image: { url: 'https://bandaheali-cdn.koyeb.app/bandaheali/team.jpg' },
        caption: about,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.NEWSLETTER_JID,
            newsletterName: 'Team-Bandaheali',
            serverMessageId: 143
          }
        }
      },
      { quoted: mek }
    );

    const audioUrl = data.audio['1'].url;
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new Error("Audio file not found");

    const buffer = await audioRes.buffer();
    await conn.sendMessage(
      from,
      {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${transliteration}.mp3`
      },
      { quoted: mek }
    );
  } catch (e) {
    console.log(e);
    reply(`❌ Error: ${e.message}`);
  }
});

// Durood Shareef Command
bandah({
  pattern: "duroodshareef",
  alias: ["durood", "dshareef"],
  react: "🕋",
  desc: "Send Durood Shareef MP3 audio",
  category: "islamic",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  await sendIslamicAudio(
    conn, from, mek, 
    "islamic/durood-shareef.mp3", 
    "Durood Shareef 🕋", 
    "Recitation of Durood Shareef — Team-Bandaheali Islamic Collection",
    reply
  );
});

// Kalma Commands
const kalmaData = {
  "kalma1": {
    alias: ["pehlakalma", "firstkalma"],
    file: "islamic/pehla_kalma.mp3",
    title: "First Kalma - Tayyab 🕋",
    text: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ"
  },
  "kalma2": {
    alias: ["dusrakalma", "secondkalma"],
    file: "islamic/dusra_kalma.mp3",
    title: "Second Kalma - Shahadat 🕋",
    text: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ"
  },
  "kalma3": {
    alias: ["tesrakalma", "thirdkalma"],
    file: "islamic/tesra_kalma.mp3",
    title: "Third Kalma - Tamjeed 🕋",
    text: "سُبْحَانَ ٱللَّٰهِ وَٱلْحَمْدُ لِلَّٰهِ وَلَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَٱللَّٰهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ ٱلْعَلِيِّ ٱلْعَظِيمِ"
  },
  "kalma4": {
    alias: ["chothakalma", "fourthkalma"],
    file: "islamic/chotha_kalma.mp3",
    title: "Fourth Kalma - Tauheed 🕋",
    text: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ أَبَدًا أَبَدًا ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ بِيَدِهِ ٱلْخَيْرُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ"
  },
  "kalma5": {
    alias: ["panchwankalma", "fifthkalma"],
    file: "islamic/panchwan_kalma.mp3",
    title: "Fifth Kalma - Astaghfar 🕋",
    text: "أَسْتَغْفِرُ ٱللَّٰهَ رَبِّي مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهُ عَمَدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوبُ إِلَيْهِ مِنْ ٱلذَّنْبِ ٱلَّذِي أَعْلَمُ وَمِنْ ٱلذَّنْبِ ٱلَّذِي لَا أَعْلَمُ إِنَّكَ أَنْتَ عَلَّامُ ٱلْغُيُوبِ وَسَتَّارُ ٱلْعُيُوبِ وَغَفَّارُ ٱلذُّنُوبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ ٱلْعَلِيِّ ٱلْعَظِيمِ"
  },
  "kalma6": {
    alias: ["chhatakalma", "sixthkalma"],
    file: "islamic/chta_kalma.mp3",
    title: "Sixth Kalma - Radd-e-Kufr 🕋",
    text: "ٱللَّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ بِهِ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ بِهِ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ ٱلْكُفْرِ وَٱلشِّرْكِ وَٱلْكِذْبِ وَٱلْغِيبَةِ وَٱلْبِدْعَةِ وَٱلنَّمِيمَةِ وَٱلْفَوَاحِشِ وَٱلْبُهْتَانِ وَٱلْمَعَاصِي كُلِّهَا وَأَسْلَمْتُ وَأَقُولُ لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ"
  }
};

// Create Kalma commands dynamically
Object.entries(kalmaData).forEach(([pattern, data]) => {
  bandah({
    pattern: pattern,
    alias: data.alias,
    react: "🕋",
    desc: `Send ${pattern.replace('kalma', 'Kalma ')} MP3 audio`,
    category: "islamic",
    filename: __filename
  }, async (conn, mek, m, { from, reply }) => {
    await sendIslamicAudio(
      conn, from, mek, 
      data.file, 
      data.title, 
      `${data.title} — Team-Bandaheali Islamic Collection`,
      reply
    );
  });
});
