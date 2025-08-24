import express from "express";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ WhatsApp Client Setup
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Scan this QR to log in.");
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot is ready!");
});

client.on("message", async (message) => {
  console.log(`📩 Message from ${message.from}: ${message.body}`);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // you can switch to "gpt-3.5-turbo"
      messages: [{ role: "user", content: message.body }],
    });

    const reply = completion.choices[0].message.content;
    await message.reply(reply);
    console.log("🤖 Replied:", reply);
  } catch (err) {
    console.error("❌ OpenAI error:", err);
    await message.reply("Sorry, I had an issue processing your request.");
  }
});

// ✅ Express Server (Railway needs this)
app.get("/", (req, res) => {
  res.send("🚀 WhatsApp AI Bot is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});

// Start WhatsApp client
client.initialize();
