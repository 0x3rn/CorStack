require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.EMAIL_USER,
            subject: "New Agency Lead from NovaWeb",
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        });
        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Email failed to send." });
    }
});

app.post('/api/checkout', async (req, res) => {
    const { tier, currency } = req.body;
    
    let priceAmount;
    let packageName;

    if (currency === 'ngn') {
        if (tier === 'basic') { priceAmount = 95000000; packageName = "Basic Website Package"; }
        if (tier === 'growth') { priceAmount = 150000000; packageName = "Business Growth Package"; }
    } else {
        if (tier === 'basic') { priceAmount = 99900; packageName = "Basic Website Package"; }
        if (tier === 'growth') { priceAmount = 249900; packageName = "Business Growth Package"; }
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items:[{
                price_data: {
                    currency: currency,
                    product_data: { name: packageName },
                    unit_amount: priceAmount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/?success=true',
            cancel_url: 'http://localhost:3000/?canceled=true',
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));