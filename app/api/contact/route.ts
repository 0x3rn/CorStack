import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db/neon';
import { apiError, assertSameOrigin, escapeHtml, HttpError } from '@/lib/http';
import { contactSchema, parseBody } from '@/lib/validation';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { name, email, message, type } = await parseBody(req, contactSchema);
    await enforceRateLimit(req, email, 'contact');
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) throw new HttpError(503, 'Messaging is temporarily unavailable.');
    const resend = new Resend(resendApiKey);

    let businessEmail = 'hello@corstack.dev';
    let subjectPrefix = 'New Contact Message';
    
    if (type === 'project') {
      businessEmail = 'projects@corstack.dev';
      subjectPrefix = 'New Project Request';
    }

    const formattedMessage = escapeHtml(message).replace(/\n/g, '<br>');

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
            <img src="https://corstack.dev/logo.png" alt="Corstack Logo" style="height: 32px; width: auto; object-fit: contain; background: white; padding: 4px; border-radius: 4px;" />
            <h1>Corstack Agency</h1>
          </div>
          <div class="content">
            <span class="badge">${subjectPrefix} Received</span>
            
            <div class="info-block">
              <div class="label">Sender Name</div>
              <div class="value">${escapeHtml(name)}</div>
            </div>
            
            <div class="info-block">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #0055cc; text-decoration: none;">${escapeHtml(email)}</a></div>
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
            <img src="https://corstack.dev/logo.png" alt="Corstack Logo" style="height: 32px; width: auto; object-fit: contain; background: white; padding: 4px; border-radius: 4px;" />
            <h1>Corstack</h1>
          </div>
          <div class="content">
            <div class="greeting">Hi ${escapeHtml(clientFirstName)},</div>
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

    // Persist first: a failed database write must never be acknowledged or trigger email.
    const lead = await db.collection('leads').add({
      name, email, message, type, createdAt: new Date().toISOString(), status: 'new', deliveryStatus: 'pending',
    });
    let deliveryStatus = 'sent';
    try {
      const [businessResponse, clientResponse] = await Promise.all([
        resend.emails.send({ from: `Corstack Leads <${businessEmail}>`, to: [businessEmail], replyTo: email,
          subject: `${subjectPrefix}: ${name}`, html: notificationHtml }),
        resend.emails.send({ from: `Corstack <${businessEmail}>`, to: [email], replyTo: businessEmail,
          subject: `We've received your message, ${clientFirstName}!`, html: autoResponderHtml }),
      ]);
      if (businessResponse.error || clientResponse.error) {
        deliveryStatus = 'failed';
        console.error('Lead email delivery failed:', businessResponse.error, clientResponse.error);
      }
    } catch (error) {
      deliveryStatus = 'failed';
      console.error('Lead email delivery failed:', error);
    }
    try { await db.collection('leads').doc(lead.id).update({ deliveryStatus }); }
    catch (error) { console.error('Unable to record lead email delivery status:', error); }
    return NextResponse.json({ success: true, message: 'Your message has been received.' });
  } catch (error) { return apiError(error); }
}
