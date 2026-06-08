import { Resend } from 'resend';

// Initialize the Resend client
const resend = new Resend(process.env.RESEND_API_KEY);
const defaultFrom = `JILANI HOME <hello@${process.env.RESEND_DOMAIN}>`;

export async function sendEmail(from: string = defaultFrom, to: string, subject: string, htmlContent: string, attachments?: { filename: string, content: Buffer }[]) {
    // 1. Sandbox protection in development
    // if (process.env.NODE_ENV === "development") {
    //     console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    //     // In dev, you might still want to test sending to yourself.
    //     // Comment out the return true if you want to actually send in dev.
    //     return { success: true };
    // }

    try {
        const payload: any = {
            from: from,
            to: [to],
            subject: subject,
            html: htmlContent,
        };

        if (attachments) {
            payload.attachments = attachments;
        }

        const data = await resend.emails.send(payload);

        if (data.error) {
            console.error("Resend API Error:", data.error);
            return { success: false, error: data.error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to reach Resend:", error);
        return { success: false, error: "Email Gateway is unreachable." };
    }
}