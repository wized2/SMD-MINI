/**
 * ORIGINAL upstream loader (kept for reference only).
 * Do not use if you want local readable plugins — use index.js from the runtime.
 */
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const LOCAL_FILE = path.join(__dirname, "cdn-smd-mini.js");
(async () => {
  try {
    const url = "https://bandaheali-cdn.koyeb.app/bandaheali/smd-mini.js";
    const { data } = await axios.get(url, { timeout: 15000 });
    fs.writeFileSync(LOCAL_FILE, data);
    delete require.cache[require.resolve(LOCAL_FILE)];
    require(LOCAL_FILE);
  } catch (err) {
    console.error("CDN Loader Error:", err.message);
    if (fs.existsSync(LOCAL_FILE)) require(LOCAL_FILE);
  }
})();
