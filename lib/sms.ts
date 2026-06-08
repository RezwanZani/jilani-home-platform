export async function sendSMS(phone: string, message: string) {
    // 1. Sandbox configuration to protect your wallet balance in development
    // if (process.env.NODE_ENV === "development") {
    //     console.log(`[SMS SANDBOX] To: ${phone} | Message: ${message}`);
    //     return { success: true };
    // }

    // 2. Format phone number exactly for Bangladeshi carrier requirements
    // Ensures spacing, brackets, plus signs, and global country codes are normalized
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('8801')) {
        // Keep it as is or strip down if your endpoint prefers base local format.
        // Generally, SMSNOC handles both standard local numbers starting with '01' 
        // and full country code versions. Let's ensure it adheres to standard local matching if preferred:
        if (formattedPhone.startsWith('88')) {
            formattedPhone = formattedPhone.substring(2);
        }
    } else if (formattedPhone.startsWith('1') && formattedPhone.length === 10) {
        formattedPhone = '0' + formattedPhone;
    }

    try {
        const API_KEY = process.env.SMSNOC_API_TOKEN;
        const URL = 'https://smsnoc.com/api/v1/send-sms';

        if (!API_KEY) {
            throw new Error("Missing SMSNOC_API_TOKEN in environment variables.");
        }

        // 3. Fire Recommended POST Request with Bearer Token Authorization
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                to: formattedPhone,         // Matches official parameter 'to'
                message: message,           // Matches official parameter 'message'
                sender_id: process.env.SMSNOC_SENDER_ID // Matches official parameter 'sender_id'
            })
        });

        const result = await response.json();

        // 4. Validate exact API response schema flags
        if (response.ok && result.status === 'success') {
            console.log(`✅ SMS Gateway Delivery Confirmed | Count: ${result.message_count} | Type: ${result.sms_type}`);
            return { success: true, count: result.message_count, type: result.sms_type };
        } else {
            console.error("❌ SMSNOC Gateway Error Payload:", result);
            return { success: false, error: result.error || "Gateway rejected authorization or payload structure." };
        }

    } catch (error: any) {
        console.error("🚨 Critical Connection Failure to SMSNOC API:", error);
        return { success: false, error: error.message || "Gateway endpoint unreachable." };
    }
}