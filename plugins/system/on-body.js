const { cmd } = require("../command");

const keyWords = ["vip", "nice", "mst", "lash"];

cmd({
  on: "body"
}, async (client, message, match, { isCreator }) => {
  try {

    if (!isCreator) return;

    const text = (message.body || "").toLowerCase();

    // keyword check
    const trigger = keyWords.some(word => text.includes(word));
    if (!trigger) return;

    // reply check
    if (!message.quoted) return;

    const quoted = message.quoted;
    const buffer = await quoted.download();
    const mtype = quoted.mtype;

    let forwardContent = {};

    switch (mtype) {

      case "imageMessage":
        forwardContent = {
          image: buffer,
          caption: quoted.caption || "",
          mimetype: quoted.mimetype || "image/jpeg"
        };
        break;

      case "videoMessage":
        forwardContent = {
          video: buffer,
          caption: quoted.caption || "",
          mimetype: quoted.mimetype || "video/mp4"
        };
        break;

      case "audioMessage":
        forwardContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: quoted.ptt || false
        };
        break;

      default:
        return;
    }

    // bot inbox
    const botNumber = client.user.id.split(":")[0] + "@s.whatsapp.net";

    await client.sendMessage(botNumber, forwardContent, {
      quoted: message
    });

  } catch (err) {
    console.log("VIP Error:", err);
  }
});
