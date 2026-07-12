const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allows your React frontend to communicate with this backend

// Replace these with your actual credentials from Step 1
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const MY_CHAT_ID = 'YOUR_PERSONAL_CHAT_ID';

app.post('/api/place-order', async (req, res) => {
    const { name, phone, location, items, total } = req.body;

    // 1. Format the message exactly how you want to see it on your phone
    const message = `
🔔 *NEW ORDER RECEIVED!*
👤 *Customer:* ${name}
📞 *Phone:* ${phone}
📍 *Delivery Address:* ${location}
🍔 *Items:* ${items.join(', ')}
💰 *Total Amount:* ₹${total}

🗺️ *Navigate via Google Maps:*
https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}
    `;

    try {
        // 2. Send the message to your Telegram Phone via the Telegram API
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(telegramUrl, {
            chat_id: MY_CHAT_ID,
            text: message,
            parse_mode: 'Markdown' // Makes the text look clean with bolding
        });

        res.status(200).json({ success: true, message: 'Notification sent to owner!' });
    } catch (error) {
        console.error('Telegram API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: 'Failed to send notification' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));