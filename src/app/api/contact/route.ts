import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { name, email, service, message } = await req.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'no-reply@rottym.com',
                // In production, these should be environment variables:
                // process.env.SMTP_USER (no-reply@rottym.com)
                // process.env.SMTP_PASS (your Google Workspace App Password)
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: '"RottyM Website" <no-reply@rottym.com>',
            to: 'rmendez@rottym.com', // Destination email
            replyTo: email,
            subject: `[VIBE INQUIRY] ${service} from ${name}`,
            text: `
        Name: ${name}
        Email: ${email}
        Service: ${service}
        
        Message:
        ${message}
      `,
            html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #6366f1;">New Vibe Inquiry Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Service:</strong> ${service}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3 style="color: #444;">Message Vision:</h3>
          <p style="background: #fdfdfd; padding: 15px; border-left: 4px solid #6366f1; border-radius: 4px;">${message}</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Vibe transmitted successfully.' });
    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ success: false, message: 'Transmission failed.' }, { status: 500 });
    }
}
