// app.js

import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
});

client.on('message', async (message) => {
    console.log(`📩 Message received: ${message.body}`);

    if (message.body.toLowerCase() === 'ping') {
        await message.reply('pong 🏓');
    }
});

client.initialize();
