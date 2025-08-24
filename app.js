const express = require("express");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const OpenAI = require("openai");

// Init express
const app = express();
const port = process.env.PORT || 3000;

// Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Init WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  console.log("Scan this QR code:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot is ready!");
});

client.on("message", async (msg) => {
  if (msg.body) {
    console.log("📩 Message received:", msg.body);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: msg.body }],
      });

      await msg.reply(response.choices[0].message.content);
    } catch (err) {
      console.error("❌ OpenAI error:", err);
      await msg.reply("Sorry, I couldn’t process your request.");
    }
  }
});

// Express route
app.get("/", (req, res) => {
  res.send("WhatsApp Bot is running!");
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

// Start WhatsApp
client.initialize();
