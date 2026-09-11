import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '../../../lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) throw new Error('Missing required environment variable: RESEND_API_KEY');
    const resend = new Resend(resendApiKey);
    const { name, email, message, type } = await req.json();

    let businessEmail = 'hello@corstack.dev';
    let subjectPrefix = 'New Contact Message';
    
    if (type === 'project') {
      businessEmail = 'projects@corstack.dev';
      subjectPrefix = 'New Project Request';
    }

    const formattedMessage = message.replace(/\n/g, '<br>');

    // 1. Notification Email HTML (To Corstack)
    const notificationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 40px 0; color: #0a0a0f; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05); border: 1px solid rgba(0,0,0,0.05); }
          .header { background-color: #0a0a0f; padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 40px; }
          .badge { display: inline-block; background: #0055cc; color: white; padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
          .info-block { margin-bottom: 24px; }
          .label { font-size: 13px; color: #52525b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600; }
          .value { font-size: 16px; color: #0a0a0f; font-weight: 500; line-height: 1.5; }
          .message-box { background: #f4f4f5; padding: 24px; border-radius: 8px; font-size: 15px; line-height: 1.6; color: #27272a; white-space: pre-wrap; }
          .footer { background: #fafafa; padding: 24px 40px; text-align: center; font-size: 13px; color: #52525b; border-top: 1px solid rgba(0,0,0,0.05); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="display: flex; align-items: center; justify-content: center; gap: 12px; background-color: #0a0a0f; padding: 30px 40px; text-align: center;">
            <img src="https://firebasestorage.googleapis.com/v0/b/corstack-dev.firebasestorage.app/o/logo.png?alt=media&token=22e02e00-1a2d-4c44-ab03-bf35af099509" alt="Corstack Logo" style="height: 32px; width: auto; object-fit: contain; background: white; padding: 4px; border-radius: 4px;" />
            <h1>Corstack Agency</h1>
          </div>
          <div class="content">
            <span class="badge">${subjectPrefix} Received</span>
            
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
            Automated notification via ${businessEmail}
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. Auto-Responder Email HTML (To Client)
    const clientFirstName = name.split(' ')[0];
    const autoResponderHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 40px 0; color: #0a0a0f; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05); border: 1px solid rgba(0,0,0,0.05); }
          .header { background-color: #0a0a0f; padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 40px; }
          .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #0a0a0f; }
          .body-text { font-size: 16px; line-height: 1.6; color: #3f3f46; margin-bottom: 24px; }
          .message-summary { background: #ffffff; padding: 24px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #3f3f46; margin-top: 32px; border: 1px solid #e4e4e7; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
          .message-summary-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #a1a1aa; margin-bottom: 12px; letter-spacing: 1px; border-bottom: 1px solid #f4f4f5; padding-bottom: 10px; }
          .footer { background: #fafafa; padding: 24px 40px; text-align: center; font-size: 13px; color: #52525b; border-top: 1px solid rgba(0,0,0,0.05); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="display: flex; align-items: center; justify-content: center; gap: 12px; background-color: #0a0a0f; padding: 30px 40px; text-align: center;">
            <img src="https://firebasestorage.googleapis.com/v0/b/corstack-dev.firebasestorage.app/o/logo.png?alt=media&token=22e02e00-1a2d-4c44-ab03-bf35af099509" alt="Corstack Logo" style="height: 32px; width: auto; object-fit: contain; background: white; padding: 4px; border-radius: 4px;" />
            <h1>Corstack</h1>
          </div>
          <div class="content">
            <div class="greeting">Hi ${clientFirstName},</div>
            ${type === 'project' 
              ? `
                <div class="body-text">
                  Thanks for choosing Corstack! This is a quick note to confirm that we've received your project request.
                </div>
                <div class="body-text">
                  We're excited to learn more about what you're building. We typically review all new project requests within 24 hours, and a project manager will get back to you shortly to discuss the next steps and set up an introductory call.
                </div>
                <div class="body-text">
                  If you have any urgent details, links, or documents to share in the meantime, feel free to reply directly to this email.
                </div>
              `
              : `
                <div class="body-text">
                  Thanks for reaching out! This is a quick note to confirm that we've received your message.
                </div>
                <div class="body-text">
                  We typically review all inquiries within 24-48 hours. Someone from our team will get back to you shortly to discuss the next steps.
                </div>
                <div class="body-text">
                  If you have any urgent details to add, feel free to reply directly to this email.
                </div>
              `
            }
            
            <div class="message-summary" style="margin-top: 32px; background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div class="message-summary-title" style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                Your ${type === 'project' ? 'Project Details' : 'Message'}:
              </div>
              <div style="font-size: 14px; line-height: 1.6; color: #334155;">
                ${formattedMessage}
              </div>
            </div>
          </div>
          <div class="footer">
            Corstack Design & Development • ${businessEmail}
          </div>
        </div>
      </body>
      </html>
    `;

    // Send Notification to Business
    const businessResponse = await resend.emails.send({
      from: `Corstack Leads <${businessEmail}>`,
      to: [businessEmail],
      replyTo: email,
      subject: `${subjectPrefix}: ${name}`,
      html: notificationHtml,
    });

    if (businessResponse.error) {
      console.error('Failed to send business notification:', businessResponse.error);
      throw new Error(businessResponse.error.message);
    }

    // Send Auto-Responder to Client
    const clientResponse = await resend.emails.send({
      from: `Corstack <${businessEmail}>`,
      to: [email],
      subject: `We've received your message, ${clientFirstName}!`,
      html: autoResponderHtml,
    });

    if (clientResponse.error) {
      console.error('Failed to send client auto-responder:', clientResponse.error);
      // We don't throw here to avoid failing the overall request if only the auto-responder fails
    }

    // Save to Firestore
    try {
      await db.collection('leads').add({
        name,
        email,
        message,
        type: type || 'contact',
        createdAt: new Date().toISOString(),
        status: 'new'
      });
    } catch (dbError) {
      console.error('Failed to save lead to database:', dbError);
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
