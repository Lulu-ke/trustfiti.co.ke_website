import axios from "axios";

// TalkSasa Bulk SMS OAuth 2.0 API
const TALKSASA_BASE_URL = process.env.TALKSASA_API_URL || "https://bulksms.talksasa.com/api/v3";
const TALKSASA_API_TOKEN = process.env.TALKSASA_API_KEY || "";
const TALKSASA_SENDER = process.env.TALKSASA_SENDER || "TALK-SASA";

interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSMS(phone: string, text: string): Promise<SendSMSResult> {
  try {
    const response = await axios.post(
      `${TALKSASA_BASE_URL}/messages`,
      {
        from: TALKSASA_SENDER,
        to: phone,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${TALKSASA_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return {
      success: true,
      messageId: response.data?.data?.id || response.data?.messageId,
    };
  } catch (error: any) {
    console.error("TalkSasa SMS error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

export async function sendOTP(phone: string, otp: string): Promise<SendSMSResult> {
  return sendSMS(phone, `Your TrustFiti verification code is ${otp}. Valid for 5 minutes.`);
}
