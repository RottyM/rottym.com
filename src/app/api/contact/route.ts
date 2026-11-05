import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        console.log('--- Incoming Transmission ---');
        const { name, email, service, message, attribution } = await req.json();
        console.log(`Project Inquiry from: ${name} (${email}) for ${service}`);

        const attributionText = attribution && (attribution.source || attribution.campaign || attribution.ref)
            ? `\n--- Lead Tracking / Campaign Attribution ---\nSource: ${attribution.source || 'N/A'}\nCampaign: ${attribution.campaign || 'N/A'}\nRef: ${attribution.ref || 'N/A'}\n`
            : '';

        const attributionHtml = attribution && (attribution.source || attribution.campaign || attribution.ref)
            ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; margin-top: 15px;">
                 <strong style="color: #166534;">🎯 Campaign Attribution / Lead Source:</strong><br />
                 <strong>Source:</strong> ${attribution.source || 'N/A'}<br />
                 <strong>Campaign:</strong> ${attribution.campaign || 'N/A'}<br />
                 <strong>Ref Tag:</strong> ${attribution.ref || 'N/A'}
               </div>`
            : '';

        console.log('📬 NEW PROJECT INQUIRY CAPTURED:', JSON.stringify({
            name,
            email,
            service,
            message,
            attribution,
            timestamp: new Date().toISOString()
        }, null, 2));

        const smtpUser = process.env.SMTP_USER || 'rottym@gmail.com';
        const smtpPass = process.env.SMTP_PASS || 'xoprxgxybmsawnwq';

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const mailOptions = {
            from: `"RottyM Website" <${smtpUser}>`,
            to: 'rmendez@rottym.com',
            replyTo: email,
            subject: `[PROJECT INQUIRY] ${service} from ${name}`,
            text: `
Name: ${name}
Email: ${email}
Service: ${service}
${attributionText}
Message:
${message}
            `,
            html: `
<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #6366f1;">New Project Inquiry Received</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Service:</strong> ${service}</p>
  ${attributionHtml}
  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
  <h3 style="color: #444;">Project Details:</h3>
  <p style="background: #fdfdfd; padding: 15px; border-left: 4px solid #6366f1; border-radius: 4px;">${message}</p>
</div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ success: false, message: 'Transmission failed.' }, { status: 500 });
    }
}
