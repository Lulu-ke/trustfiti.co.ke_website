import axios from "axios";

const TALKSASA_BASE_URL = "https://api.talksasa.com/v1";
const TALKSASA_API_KEY = process.env.TALKSASA_API_KEY || "";
const TALKSASA_SENDER = process.env.TALKSASA_SENDER || "TrustFiti";

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
          Authorization: `Bearer ${TALKSASA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      messageId: response.data?.messageId,
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
