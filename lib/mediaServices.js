"use strict";

const googleTTS = require("google-tts-api");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

/* ================= GOOGLE TTS ================= */

async function googleTTSVoice(text, lang = "en") {
  const id = Date.now();
  const input = path.join("/tmp", `tts_${id}.mp3`);
  const output = path.join("/tmp", `tts_${id}.ogg`);

  const url = googleTTS.getAudioUrl(text, {
    lang,
    slow: false,
    host: "https://translate.google.com",
  });

  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(input, Buffer.from(res.data));

  await new Promise((resolve, reject) => {
    exec(
      `"${ffmpegPath}" -y -i "${input}" -ar 48000 -ac 1 -c:a libopus "${output}"`,
      err => err ? reject(err) : resolve()
    );
  });

  const buffer = fs.readFileSync(output);
  fs.unlinkSync(input);
  fs.unlinkSync(output);

  return buffer;
}

/* ================= ELEVEN LABS ================= */

// 🔑 DIRECT API KEY (SAFE SYNTAX)
const ELEVEN_API_KEY = "sk_fc8a25e476f955e779f07dba2af16e24444a1f5ae399baeb";

const VOICES = {
  male: "21m00Tcm4TlvDq8ikWAM",
  female: "EXAVITQu4vr4xnSDxMaL",
};

async function elevenTTSVoice(text, gender = "male") {
  if (!ELEVEN_API_KEY) throw new Error("ElevenLabs API key missing");

  const id = Date.now();
  const input = path.join("/tmp", `tts2_${id}.mp3`);
  const output = path.join("/tmp", `tts2_${id}.ogg`);

  const voiceId = VOICES[gender] || VOICES.male;

  const res = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    { text },
    {
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  fs.writeFileSync(input, Buffer.from(res.data));

  await new Promise((resolve, reject) => {
    exec(
      `"${ffmpegPath}" -y -i "${input}" -ar 48000 -ac 1 -c:a libopus "${output}"`,
      err => err ? reject(err) : resolve()
    );
  });

  const buffer = fs.readFileSync(output);
  fs.unlinkSync(input);
  fs.unlinkSync(output);

  return buffer;
}

/* ================= CURRENCY ================= */

const BASE_URL = "https://v6.exchangerate-api.com/v6";

// 🔑 DIRECT CURRENCY API KEY
const CURRENCY_API_KEY = "6546c765c816c0f27f37900a";

async function convertCurrency(amount, from, to) {
  const res = await axios.get(`${BASE_URL}/${CURRENCY_API_KEY}/latest/${from}`);

  if (res.data.result === "error") {
    throw new Error(res.data["error-type"]);
  }

  const rate = res.data.conversion_rates[to];
  if (!rate) throw new Error("invalid-currency");

  return {
    rate,
    result: (amount * rate).toFixed(2),
    updated: res.data.time_last_update_utc,
  };
}

module.exports = {
  googleTTSVoice,
  elevenTTSVoice,
  convertCurrency,
};