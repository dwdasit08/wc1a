// routes/api.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

// Configure email transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rate limiter for contact/donate endpoints
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: 'Too many submissions from this IP, please try again later.',
});

// Contact form
router.post('/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    // Send email to office
    await transporter.sendMail({
      from: `"WCIA Contact Form" <${process.env.EMAIL_USER}>`,
      to: 'office@wcia.tv',
      subject: `New Contact Message: ${subject || 'General Inquiry'}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'General'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Auto-reply to user
    await transporter.sendMail({
      from: `"WCIA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting WCIA',
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to Wheelchair Cricket India Association. We have received your message and will get back to you shortly.</p>
        <p>Your support means a lot to us!</p>
        <p>Warm regards,<br>Team WCIA</p>
      `,
    });

    res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// Donation endpoint (just logs, but can integrate with payment gateway)
router.post('/donate', contactLimiter, async (req, res) => {
  try {
    const { name, email, amount, message } = req.body;
    // In production, integrate with Razorpay/PayPal here
    // For now, send a notification email
    await transporter.sendMail({
      from: `"WCIA Donation" <${process.env.EMAIL_USER}>`,
      to: 'office@wcia.tv',
      subject: 'New Donation Intent',
      html: `
        <h2>Donation Intent</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Message:</strong> ${message || 'None'}</p>
        <p>Please process via payment gateway.</p>
      `,
    });
    res.status(200).json({ success: true, message: 'Donation intent recorded. Thank you!' });
  } catch (error) {
    console.error('Donation error:', error);
    res.status(500).json({ error: 'Failed to record donation.' });
  }
});

// Newsletter subscription
router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    // Save to database or mailchimp – here we just log
    console.log(`Newsletter subscription: ${email}`);
    res.status(200).json({ success: true, message: 'Subscribed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe.' });
  }
});

module.exports = router;