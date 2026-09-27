const axios = require("axios");
const { bandah } = require("../command");
const fs = require("fs");

const { getUserConfigFromMongoDB } = require("../lib/database");

bandah({
  pattern: "3dsilver",
  alias: ["silver", "3dlogo", "ephoto3dsilver"],
  react: "🥈",
  desc: "Generate 3D Silver Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .3dsilver Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/3dsilver?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *3D Silver Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});

bandah({
  pattern: "angelwing",
  alias: ["angel", "ephotoangelwing"],
  desc: "Generate Angel Wing-style text image using Ephoto API",
  category: "logo",
  react: "😇",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .angelwing Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/angelwing?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate Angel Wing-style image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./angelwing_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `😇 *Angel Wing 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Angel Wing image.");
  }
});


bandah({
  pattern: "bagen",
  alias: ["balogo", "bagen"],
  desc: "Generate BA style logo using API.",
  category: "logo",
  react: "🎨",
  filename: __filename
}, async (conn, m, store, { from, q, reply, quoted }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q.includes('.')) {
      return reply("✳️ Example: *.logo Bandaheali*");
    }

    const [textL, textR] = q.split('.').map(v => v.trim());
    const apiUrl = `https://api.nekolabs.my.id/canvas/ba-logo?textL=${encodeURIComponent(textL)}&textR=${encodeURIComponent(textR)}`;

    // Get image as buffer
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const image = Buffer.from(response.data, 'binary');

    // Send image as document (for better quality)
    await conn.sendMessage(from, {
      document: image,
      mimetype: 'image/png',
      fileName: `${textL}_${textR}_logo.png`,
      caption: `✅ Bandaheali BA Logo Generated Successfully\n🖋️ ${textL} . ${textR}`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply("❌ Failed to generate logo. Please try again.");
  }
});


bandah({
  pattern: "ballon",
  alias: ["balloon", "ballonlogo", "ephotoballon"],
  desc: "Generate Ballon-style text image using Ephoto API",
  category: "logo",
  react: "🎈",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .ballon Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/ballon?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data || !res.data.status || !res.data.result?.imageUrl) return reply("❌ Failed to generate Ballon-style image.");

    const imageUrl = res.data.result.imageUrl;
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./ballon_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🎈 *Ballon 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Ballon image.");
  }
});

bandah({
  pattern: "circle",
  alias: ["circle", "mascotcircle", "ephotocirclemascot"],
  desc: "Generate Circle Mascot-style text image using Ephoto API",
  category: "logo",
  react: "🔵",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .circlemascot Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/circlemascot?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data || !res.data.status || !res.data.result?.imageUrl) return reply("❌ Failed to generate Circle Mascot-style image.");

    const imageUrl = res.data.result.imageUrl;
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./circlemascot_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🔵 *Circle Mascot 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Circle Mascot image.");
  }
});


bandah({
  pattern: "colorful",
  alias: ["colorsful", "ephotocolorful"],
  desc: "Generate Colorful-style text image using Ephoto API",
  category: "logo",
  react: "🌈",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .colorful Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/colorful?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate Colorful-style image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./colorful_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🌈 *Colorful 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Colorful image.");
  }
});

bandah({
  pattern: "cubic",
  alias: ["cubictext", "ephotocubic"],
  desc: "Generate 3D cubic style text image using Ephoto API",
  category: "logo",
  react: "🧊",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .cubic Edith-MD");

    const apiKey = "APIKEY"; // apna API key yahan lagao
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/cubic?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./cubic_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `✨ *Cubic Text Created by Bandaheali* ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the cubic image.");
  }
});

bandah({
  pattern: "foggy",
  alias: ["fog", "foggylogo"],
  react: "🌫️",
  desc: "Generate Foggy Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .foggy Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/foggy?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *Foggy Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});

bandah({
  pattern: "galaxy",
  alias: ["galaxylogo", "ephotogalaxy"],
  react: "🌌",
  desc: "Generate Galaxy Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .galaxy Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/galaxy?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *Galaxy Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});


bandah({
  pattern: "galaxy2",
  alias: ["galaxytwo", "ephotogalaxy2"],
  desc: "Generate Galaxy2-style text image using Ephoto API",
  category: "logo",
  react: "🌌",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .galaxy2 Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/galaxy2?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data || !res.data.status || !res.data.result?.imageUrl) return reply("❌ Failed to generate Galaxy2-style image.");

    const imageUrl = res.data.result.imageUrl;
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./galaxy2_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🌌 *Galaxy2 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Galaxy2 image.");
  }
});


bandah({
  pattern: "gaming",
  alias: ["gameeffect", "ephotogaming"],
  desc: "Generate Gaming-style text image using Ephoto API",
  category: "logo",
  react: "🎮",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .gaming Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/gaming?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate Gaming-style image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./gaming_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🎮 *Gaming 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Gaming image.");
  }
});

bandah({
  pattern: "golden",
  alias: ["gold", "goldenlogo"],
  react: "🏅",
  desc: "Generate Golden Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .golden Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/golden?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *Golden Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});

bandah({
  pattern: "gradient",
  alias: ["gradientlogo", "ephotogradient"],
  react: "🌈",
  desc: "Generate Gradient Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .gradient Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/gradient?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *Gradient Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});

bandah({
  pattern: "hacker",
  alias: ["hackereffect", "ephotohacker"],
  desc: "Generate Hacker-style text image using Ephoto API",
  category: "logo",
  react: "🧑‍💻",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .hacker Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan lagao
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/hacker?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data || !res.data.status || !res.data.result?.imageUrl) return reply("❌ Failed to generate Hacker-style image.");

    const imageUrl = res.data.result.imageUrl;
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./hacker_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🧑‍💻 *Hacker 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Hacker image.");
  }
});

bandah({
  pattern: "jewel",
  alias: ["jewellogo", "ephotojewel"],
  react: "💎",
  desc: "Generate Jewel Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .jewel Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/jewel?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *Jewel Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});


bandah({
  pattern: "mascot",
  alias: ["ephoto", "mascotlogo"],
  react: "🎨",
  desc: "Generate Ephoto mascot logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .mascot Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/mascot?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *Mascot Logo Generated*\n🧑‍🎨 Text ${text}\n🔗 Powered by Qasim API`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});

bandah({
  pattern: "matrix",
  alias: ["matrixstyle", "ephotomatrix"],
  desc: "Generate Matrix-style text image using Ephoto API",
  category: "logo",
  react: "💚",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .matrix Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/matrix?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate Matrix-style image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./matrix_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `💚 *Matrix 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Matrix image.");
  }
});

bandah({
  pattern: "metal",
  alias: ["metallogo", "ephotometal"],
  react: "⚙️",
  desc: "Generate Metal Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .metal Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/metal?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *Metal Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});

bandah({
  pattern: "nigeria",
  alias: ["nigeffect", "ephotonigeria"],
  desc: "Generate Nigeria-style text image using Ephoto API",
  category: "logo",
  react: "🇳🇬",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .nigeria Edith-MD");

    const apiKey = "APIKEY"; // 🔑 apna API key yahan likho
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/nigeria?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate Nigeria-style image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./nigeria_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🇳🇬 *Nigeria 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Nigeria image.");
  }
});

bandah({
  pattern: "papercut",
  alias: ["paper", "ephotopapercut"],
  desc: "Generate Papercut-style text image using Ephoto API",
  category: "logo",
  react: "📄",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .papercut Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/papercut?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate Papercut-style image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./papercut_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `📄 *Papercut 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Papercut image.");
  }
});

bandah({
  pattern: "sand",
  alias: ["sandeffect", "ephotosand"],
  desc: "Generate sand-style text image using Ephoto API",
  category: "logo",
  react: "🏖️",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .sand Edith-MD");

    const apiKey = "APIKEY"; // apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/sand?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate sand image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./sand_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🏖️ *Sand Text CREATED BY Bandaheali* ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the sand image.");
  }
});


bandah({
  pattern: "snake",
  alias: ["snakelogo", "ephotosnake"],
  react: "🐍",
  desc: "Generate Snake Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .snake Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/snake?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *Snake Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});

bandah({
  pattern: "splat",
  alias: ["splat", "ephotopaintsplat"],
  desc: "Generate Paint Splat-style text image using Ephoto API",
  category: "logo",
  react: "🎨",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .paintsplat Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/paintsplat?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data.status) return reply("❌ Failed to generate Paint Splat-style image.");

    const imageUrl = res.data.result.imageUrl;

    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./paintsplat_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `🎨 *Paint Splat 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Paint Splat image.");
  }
});

bandah({
  pattern: "star",
  alias: ["starlogo", "ephotostar"],
  desc: "Generate Star-style text image using Ephoto API",
  category: "logo",
  react: "⭐",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .star Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/star?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data || !res.data.status || !res.data.result?.imageUrl) return reply("❌ Failed to generate Star-style image.");

    const imageUrl = res.data.result.imageUrl;
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./star_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `⭐ *Star 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Star image.");
  }
});

bandah({
  pattern: "typography",
  alias: ["type", "typograph", "ephototypography"],
  desc: "Generate Typography-style text image using Ephoto API",
  category: "logo",
  react: "✍️",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    if (!q) return reply("⚠️ Please provide some text.\nExample: .typography Edith-MD");

    const apiKey = "APIKEY"; // 🔑 Apna API key yahan daalein
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/typography?text=${encodeURIComponent(q)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl);
    if (!res.data || !res.data.status || !res.data.result?.imageUrl) return reply("❌ Failed to generate Typography-style image.");

    const imageUrl = res.data.result.imageUrl;
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = "./typography_result.jpg";
    fs.writeFileSync(filePath, imageResponse.data);

    await conn.sendMessage(from, { image: fs.readFileSync(filePath), caption: `✍️ *Typography 𝙏𝙚𝙭𝙩 𝙀𝙛𝙛𝙚𝙘𝙩 𝘼𝙥𝙥𝙡𝙞𝙚𝙙*\n\n  ${botConfig.CAPTION} ✨` }, { quoted: mek });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while generating the Typography image.");
  }
});

bandah({
  pattern: "wgalaxy",
  alias: ["wgalaxylogo", "whitegalaxy"],
  react: "🌠",
  desc: "Generate W-Galaxy Ephoto logo using API.",
  category: "logo",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
  const bot = conn.user.id.split(":")[0];
  const botConfig = await getUserConfigFromMongoDB(bot);
    const text = args.join(" ");
    if (!text) return reply("❌ Please provide text.\nExample: .wgalaxy Bandaheali");

    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/ephoto/wgalaxy?text=${encodeURIComponent(text)}&apikey=APIKEY`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result?.imageUrl) {
      return reply("❌ Failed to generate image. Try again later.");
    }

    const imageUrl = data.result.imageUrl;
    await conn.sendMessage(from, { 
      image: { url: imageUrl }, 
      caption: `✅ *W-Galaxy Logo Generated*\n🧑‍🎨 Text ${text}\n ${botConfig.CAPTION}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while generating the logo.");
  }
});
