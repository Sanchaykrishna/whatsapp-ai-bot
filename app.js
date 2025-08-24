import express from "express";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health server (Railway + UptimeRobot will ping this)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (_, res) => res.send("WA bot running ✅"));
app.get("/healthz", (_, res) => res.send("ok"));
app.listen(PORT, () => console.log(`Health server running on :${PORT}`));

// WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "/data/wwebjs" }), // session saved in Railway volume
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium"
  }
});

client.on("qr", (qr) => {
  console.log("📷 Scan this QR (first-time only)");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp bot is ready and linked");
});

client.on("message", async (msg) => {
  console.log("📩 Incoming:", msg.body);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly WhatsApp chatbot." },
        { role: "user", content: msg.body }
      ]
    });

    const reply = completion.choices[0].message.content;
    await client.sendMessage(msg.from, reply);
  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
    await client.sendMessage(msg.from, "⚠️ Sorry, I couldn’t reply right now.");
  }
});

client.initialize();
