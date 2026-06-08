import { sendEmail } from "@/lib/emails/email";
import { sendSMS } from "@/lib/sms";
import { getJilaniEmailTemplate } from "@/lib/emails/email-template";

export async function sendTicketNotification(params: {
    userName: string;
    userEmail: string;
    userPhone: string;
    ticketNumber: string;
    title: string;
    messages: { sender: string; content: string }[];
}) {
    const { userName, userEmail, userPhone, ticketNumber, title, messages } = params;

    const fromEmail = `JILANI HOME <support@${process.env.RESEND_DOMAIN}>`;
    const subject = `Update on your Ticket #${ticketNumber} - Jilani Home`;
    const emailTitle = "Support Ticket Update";

    // Format recent messages
    const formattedMessages = messages.map(msg => `
        <div style="margin-bottom: 16px; padding: 12px; background-color: ${msg.sender === 'Admin' ? '#f0fdf4' : '#f8fafc'}; border-left: 4px solid ${msg.sender === 'Admin' ? '#22c55e' : '#cbd5e1'}; border-radius: 4px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">${msg.sender}</p>
            <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5;">${msg.content}</p>
        </div>
    `).join('');

    const emailBody = `
        <p>Hi ${userName},</p>
        <p>An admin has just replied to your support ticket <strong>#${ticketNumber}</strong> (${title}).</p>
        
        <h3 style="margin-top: 30px; color: #1e293b; font-size: 16px;">Recent Conversation:</h3>
        <div style="margin: 20px 0;">
            ${formattedMessages}
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://jilanihome.com'}/dashboard/inquiries/${ticketNumber}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                View Ticket & Reply
            </a>
        </div>
    `;

    const formattedHtml = `
        <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; background-color: #eff6ff; color: #2563eb; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                ${emailTitle}
            </span>
        </div>
        ${emailBody}
    `;

    const finalEmailHtml = getJilaniEmailTemplate(emailTitle, formattedHtml);
    const smsText = `Jilani Home Support: Admin replied to your ticket #${ticketNumber}. Log in to view the response.`;

    await Promise.allSettled([
        sendEmail(fromEmail, userEmail, subject, finalEmailHtml),
        sendSMS(userPhone, smsText)
    ]);
}
