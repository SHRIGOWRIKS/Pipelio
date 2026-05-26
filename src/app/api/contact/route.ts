import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    // If Resend not configured, just log and return success (for dev)
    if (!apiKey || apiKey === "re_your_api_key") {
            return NextResponse.json({ success: true });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@pipelio.app",
      to: "hello@pipelio.app",
      replyTo: email,
      subject: `[Pipelio Contact] ${subject || "New message"} — from ${name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #6B9E78; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Message</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">via Pipelio contact form</p>
          </div>
          
          <div style="background: #FAFAF8; border: 1px solid #E8E8E4; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #9CA3AF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 80px;">Name</td>
                <td style="padding: 8px 0; color: #1C1C1E; font-size: 14px; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #9CA3AF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
                <td style="padding: 8px 0; color: #1C1C1E; font-size: 14px;"><a href="mailto:${email}" style="color: #6B9E78;">${email}</a></td>
              </tr>
              ${subject ? `<tr>
                <td style="padding: 8px 0; color: #9CA3AF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Subject</td>
                <td style="padding: 8px 0; color: #1C1C1E; font-size: 14px;">${subject}</td>
              </tr>` : ""}
            </table>
          </div>
          
          <div style="background: white; border: 1px solid #E8E8E4; border-radius: 12px; padding: 20px 24px;">
            <p style="color: #9CA3AF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Message</p>
            <p style="color: #1C1C1E; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 24px;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message. Try again." }, { status: 500 });
  }
}
