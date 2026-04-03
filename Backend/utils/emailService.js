// backend/utils/emailService.js
import nodemailer from 'nodemailer';

export const sendRedAlertEmail = async (targetEmail, algorithm, threatReport) => {
    try {
        console.log(`📧 Preparing Red Alert transmission to ${targetEmail}...`);

        // 1. Configure the transport engine
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ALERT_EMAIL_USER,
                pass: process.env.ALERT_EMAIL_PASS
            }
        });

        // 2. Design the HTML Email Payload
        const mailOptions = {
            from: `"SentinelGraph AI" <${process.env.ALERT_EMAIL_USER}>`,
            to: targetEmail,
            subject: `🚨 CRITICAL: Financial Threat Detected [${algorithm}]`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #333; background-color: #f9f9f9;">
                    <div style="background-color: #D32F2F; color: white; padding: 15px; text-align: center;">
                        <h2 style="margin: 0;">⚠️ SENTINELGRAPH CRITICAL ALERT ⚠️</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                        <p><strong>Algorithm Triggered:</strong> <code>${algorithm}</code></p>
                        <hr style="border-top: 1px solid #ccc; my-4" />
                        <h3 style="color: #D32F2F;">AI Investigator Threat Assessment:</h3>
                        <p style="background-color: #fff; padding: 15px; border-left: 4px solid #D32F2F; font-size: 16px; line-height: 1.5;">
                            ${threatReport}
                        </p>
                        <hr style="border-top: 1px solid #ccc; my-4" />
                        <p style="text-align: center; color: #666; font-size: 12px;">
                            This is an automated message from the SentinelGraph Security Infrastructure.<br>
                            Immediate investigator review is required.
                        </p>
                    </div>
                </div>
            `
        };

        // 3. Fire the email
        await transporter.sendMail(mailOptions);
        console.log("✅ Red Alert Email successfully delivered!");

    } catch (error) {
        console.error("❌ Failed to send Red Alert Email:", error.message);
    }
};