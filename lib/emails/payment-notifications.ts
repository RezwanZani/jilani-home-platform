import { sendEmail } from "@/lib/emails/email";
import { sendSMS } from "@/lib/sms";
import { getJilaniEmailTemplate } from "@/lib/emails/email-template";

// Updated statuses to match your database schema
type PaymentStatus = "pending" | "success" | "failed";

interface NotificationParams {
    userName: string;
    userEmail: string;
    userPhone: string;
    amount: number;
    points?: number;
    trxId: string;
    invoiceId: string; // Added Invoice ID
    gateway: string;   // Added Gateway (e.g., 'bKash', 'Nagad')
    reason?: string;   // The transactions.remark if failed
}

export async function sendPaymentNotification(status: PaymentStatus, params: NotificationParams, transactionData?: any) {
    const { userName, userEmail, userPhone, amount, points, trxId, invoiceId, gateway, reason } = params;

    const fromEmail = `JILANI HOME <invoices@${process.env.RESEND_DOMAIN}>`;

    let subject = "";
    let smsText = "";
    let emailTitle = "";
    let emailBody = "";
    let statusColor = "";

    // Helper to generate a clean "receipt" box for the email
    const generateReceiptBox = (extraRow = "") => `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding-bottom: 8px; color: #64748b;">Invoice No:</td><td style="padding-bottom: 8px; text-align: right; font-weight: 600;">${invoiceId}</td></tr>
        <tr><td style="padding-bottom: 8px; color: #64748b;">Gateway:</td><td style="padding-bottom: 8px; text-align: right; font-weight: 600;">${gateway}</td></tr>
        <tr><td style="padding-bottom: 8px; color: #64748b;">Transaction ID:</td><td style="padding-bottom: 8px; text-align: right; font-weight: 600; font-family: monospace;">${trxId}</td></tr>
        <tr><td style="padding-bottom: 8px; color: #64748b;">Amount:</td><td style="padding-bottom: 8px; text-align: right; font-weight: 600;">৳ ${amount}</td></tr>
        ${extraRow}
      </table>
    </div>
  `;

    // 1. Define Content Based on Status
    switch (status) {
        case "pending":
            subject = `Payment Under Review (Inv: ${invoiceId}) - Jilani Home`;
            emailTitle = "Payment Pending";
            statusColor = "#eab308"; // Yellow

            smsText = `Jilani Home: Payment of Taka ${amount} via ${gateway} (Inv: ${invoiceId}) is received and under review. TrxID: ${trxId}.`;

            emailBody = `
        <p>Hi ${userName},</p>
        <p>We have successfully received your payment request. Our team is currently verifying the transaction details.</p>
        ${generateReceiptBox()}
        <p>You will receive another update via SMS and Email once the payment is verified and points are added to your wallet.</p>
      `;
            break;

        case "success":
            subject = `Payment Successful! (Inv: ${invoiceId}) - Jilani Home`;
            emailTitle = "Payment Successful";
            statusColor = "#10b981"; // Green

            smsText = `Jilani Home: Payment of Taka ${amount} (Inv: ${invoiceId}) is SUCCESSFUL. ${points} points have been added to your wallet. Thank you!`;

            const pointsRow = `<tr><td style="padding-top: 8px; border-top: 1px dashed #cbd5e1; color: #10b981; font-weight: bold;">Points Added:</td><td style="padding-top: 8px; border-top: 1px dashed #cbd5e1; text-align: right; font-weight: bold; color: #10b981;">+${points}</td></tr>`;

            emailBody = `
        <p>Hi ${userName},</p>
        <p>Great news! Your payment has been verified and processed successfully.</p>
        ${generateReceiptBox(pointsRow)}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://jilanihome.com'}/dashboard/transactions" style="background-color: #f1f5f9; color: #475569; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 10px; border: 1px solid #cbd5e1;">
            Download Invoice
          </a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://jilanihome.com'}/dashboard/properties" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Unlock Properties Now
          </a>
        </div>
      `;
            break;

        case "failed":
            subject = `Payment Failed (Inv: ${invoiceId}) - Jilani Home`;
            emailTitle = "Payment Failed";
            statusColor = "#ef4444"; // Red

            // Keep SMS short but informative
            const shortReason = reason ? reason.substring(0, 30) + "..." : "Invalid transaction details";
            smsText = `Jilani Home: Payment of Taka ${amount} (Inv: ${invoiceId}) FAILED. Reason: ${shortReason}. Check your email for details.`;

            emailBody = `
        <p>Hi ${userName},</p>
        <p>Unfortunately, your recent payment request could not be processed.</p>
        ${generateReceiptBox()}
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Reason for Failure:</strong><br/>${reason || "Transaction ID did not match or amount was incorrect."}</p>
        </div>
        <p>If you believe this is a mistake, please reply to this email or contact our support team with a screenshot of your payment proof.</p>
      `;
            break;
    }

    // 2. Wrap HTML inside your beautiful branded template
    const formattedHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; background-color: ${statusColor}15; color: ${statusColor}; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        ${emailTitle}
      </span>
    </div>
    ${emailBody}
  `;
    const finalEmailHtml = getJilaniEmailTemplate(emailTitle, formattedHtml);

    // 3. Fire Both Notifications Concurrently
    await Promise.allSettled([
        sendEmail(fromEmail, userEmail, subject, finalEmailHtml),
        sendSMS(userPhone, smsText)
    ]);
}