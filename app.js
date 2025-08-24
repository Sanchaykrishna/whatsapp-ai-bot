import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

// WhatsApp Client setup
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
  },
});

// Show QR code in Railway logs
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("📱 Scan the QR code above to log in.");
});

// Ready
client.on("ready", () => {
  console.log("✅ WhatsApp Bot is ready and running on Railway!");
});

// Simple message listener
client.on("message", async (msg) => {
  console.log(`📩 Message from ${msg.from}: ${msg.body}`);
  if (msg.body.toLowerCase() === "hi") {
    await msg.reply("Hello! 🚀 Bot is live on Railway!");
  }
});

// Initialize
client.initialize();

// Express server (needed for Railway)
app.get("/", (req, res) => {
  res.send("✅ WhatsApp bot running on Railway!");
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
