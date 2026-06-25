import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '../../../lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const formattedMessage = message.replace(/\n/g, '<br>');

    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #fafafa;
            margin: 0;
            padding: 40px 0;
            color: #0a0a0f;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0,0,0,0.05);
          }
          .header {
            background-color: #0a0a0f;
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px;
          }
          .badge {
            display: inline-block;
            background: #0055cc;
            color: white;
            padding: 6px 14px;
            border-radius: 99px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 24px;
          }
          .info-block {
            margin-bottom: 24px;
          }
          .label {
            font-size: 13px;
            color: #52525b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            font-weight: 600;
          }
          .value {
            font-size: 16px;
            color: #0a0a0f;
            font-weight: 500;
            line-height: 1.5;
          }
          .message-box {
            background: #f4f4f5;
            padding: 24px;
            border-radius: 8px;
            font-size: 15px;
            line-height: 1.6;
            color: #27272a;
            white-space: pre-wrap;
          }
          .footer {
            background: #fafafa;
            padding: 24px 40px;
            text-align: center;
            font-size: 13px;
            color: #52525b;
            border-top: 1px solid rgba(0,0,0,0.05);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CorStack Agency</h1>
          </div>
          <div class="content">
            <span class="badge">New Lead Received</span>
            
            <div class="info-block">
              <div class="label">Sender Name</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="info-block">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${email}" style="color: #0055cc; text-decoration: none;">${email}</a></div>
            </div>
            
            <div class="info-block" style="margin-top: 32px;">
              <div class="label">Project Details & Message</div>
              <div class="message-box">${formattedMessage}</div>
            </div>
          </div>
          <div class="footer">
            This is an automated notification from your CorStack website.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"CorStack Leads" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `New Lead: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: htmlEmail,
    });

    // Save to Firestore
    try {
      await db.collection('leads').add({
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
        status: 'new'
      });
    } catch (dbError) {
      console.error('Failed to save lead to database:', dbError);
      // We don't fail the request if the email was sent successfully but db failed
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact Form Error:', error);
    return NextResponse.json(
      { success: false, message: 'Email failed to send.' },
      { status: 500 }
    );
  }
}