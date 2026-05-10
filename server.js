require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 


// 1. CONTACT FORM EMAIL SERVER

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
            subject: "New Agency Lead from CorStack", 
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        });
        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Email failed to send." });
    }
});


// 2. PAYSTACK CHECKOUT PAYMENTS
app.post('/api/checkout', async (req, res) => {
    const { tier, currency, email } = req.body; 
    
    const domainURL = req.headers.origin || `http://${req.headers.host}`;
    
    let priceAmount;
    let packageName;

    // BUG FIX: Paystack requires amounts in Kobo (NGN) and Cents (USD). 
    // MUST add 00 to the end of the numbers, otherwise I will only charge ₦3,500!
    if (currency === 'ngn') {
        if (tier === 'basic') { priceAmount = 35000000; packageName = "Basic Package"; }
        if (tier === 'growth') { priceAmount = 60000000; packageName = "Business Package"; }
    } else {
        if (tier === 'basic') { priceAmount = 29900; packageName = "Basic Package"; }
        if (tier === 'growth') { priceAmount = 59900; packageName = "Business Package"; }
    }

    try {
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: email, 
                amount: priceAmount,
                currency: currency.toUpperCase(), 
                callback_url: `${domainURL}/paymentSuccess.html`,
                metadata: {
                    custom_fields:[
                        { display_name: "Package Purchased", variable_name: "package", value: packageName }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ url: paystackResponse.data.data.authorization_url });
        
    } catch (error) {
        // Extract the EXACT error message from Paystack, or use a default fallback if Paystack is completely offline
        const errorMessage = error.response && error.response.data && error.response.data.message 
            ? error.response.data.message 
            : "The payment gateway is currently offline. Please try again later.";

        console.error("Paystack Error:", errorMessage);
        
        // Send the specific error message back to the frontend
        res.status(400).json({ error: errorMessage });
    }
});

// Start the server (Only if running locally)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// Export the app for Vercel
module.exports = app;