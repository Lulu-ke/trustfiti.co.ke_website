import { enqueue, dequeue, completeJob, failJob } from "./jobQueue";
import { sendSMS } from "./talksasa";
import nodemailer from "nodemailer";

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
};

const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Job handlers
const handlers: Record<string, (payload: any) => Promise<void>> = {
  SEND_OTP: async (payload) => {
    const { phone, otp } = payload;
    const result = await sendSMS(phone, otp);
    if (!result.success) throw new Error(`Failed to send OTP: ${result.error}`);
  },

  SEND_INVITATION_EMAIL: async (payload) => {
    const { to, subject, html } = payload;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@trustfiti.co.ke",
      to,
      subject,
      html,
    });
  },

  SEND_INVITATION_SMS: async (payload) => {
    const { phone, message } = payload;
    const result = await sendSMS(phone, message);
    if (!result.success) throw new Error(`Failed to send invitation SMS: ${result.error}`);
  },

  NOTIFY_NEW_REVIEW: async (payload) => {
    const { ownerId, companyName, reviewerName, rating } = payload;
    // Notification is already created in DB, email is optional
    // Could send email notification here
  },

  NOTIFY_REVIEW_REPLY: async (payload) => {
    const { userId, companyName } = payload;
    // Could send email about reply
  },

  RECALCULATE_COMPANY_RATING: async (payload) => {
    const { companyId } = payload;
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const result = await prisma.review.aggregate({
        where: {
          companyId,
          status: "PUBLISHED",
          isPublished: true,
        },
        _avg: { rating: true },
        _count: { id: true },
      });

      await prisma.company.update({
        where: { id: companyId },
        data: {
          averageRating: Math.round((result._avg.rating || 0) * 10) / 10,
          totalReviews: result._count.id,
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  },
};

let isRunning = false;
let workerInterval: NodeJS.Timeout | null = null;

export async function processJobs(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  try {
    const jobs = await dequeue(5);
    for (const job of jobs) {
      try {
        const handler = handlers[job.type];
        if (handler) {
          await handler(job.payload as any);
          await completeJob(job.id);
        } else {
          console.warn(`No handler for job type: ${job.type}`);
          await failJob(job.id, `No handler for job type: ${job.type}`);
        }
      } catch (error: any) {
        console.error(`Job ${job.id} (${job.type}) failed:`, error.message);
        await failJob(job.id, error.message);
      }
    }
  } finally {
    isRunning = false;
  }
}

export function startWorker(intervalMs: number = 15000): void {
  console.log(`Background worker started (polling every ${intervalMs}ms)`);
  workerInterval = setInterval(processJobs, intervalMs);

  // Process immediately on start
  processJobs();
}

export function stopWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log("Background worker stopped");
  }
}
