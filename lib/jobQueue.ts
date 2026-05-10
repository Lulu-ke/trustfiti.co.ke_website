import prisma from "./prisma";

type JobType =
  | "SEND_OTP"
  | "SEND_INVITATION_EMAIL"
  | "SEND_INVITATION_SMS"
  | "NOTIFY_NEW_REVIEW"
  | "NOTIFY_REVIEW_REPLY"
  | "NOTIFY_VERIFICATION_RESULT"
  | "NOTIFY_REVIEW_REMOVED"
  | "RECALCULATE_COMPANY_RATING"
  | "PROCESS_VERIFICATION"
  | "SEND_ANNOUNCEMENT_NOTIFICATIONS"
  | "CLEANUP_EXPIRED_INVITATIONS";

interface EnqueueOptions {
  priority?: number;
  runAfter?: Date;
  maxAttempts?: number;
}

export async function enqueue(
  type: JobType,
  payload: Record<string, any>,
  options: EnqueueOptions = {}
): Promise<string> {
  const job = await prisma.jobQueue.create({
    data: {
      type,
      payload,
      priority: options.priority ?? 0,
      maxAttempts: options.maxAttempts ?? 3,
      runAfter: options.runAfter ?? null,
    },
  });
  return job.id;
}

export async function dequeue(limit: number = 5): Promise<{ id: string; type: string; payload: Record<string, string> }[]> {
  const now = new Date();
  const jobs = await prisma.jobQueue.findMany({
    where: {
      status: "PENDING",
      runAfter: { lte: now },
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
    take: limit,
  });

  if (jobs.length === 0) return [];

  // Mark as processing
  await prisma.jobQueue.updateMany({
    where: {
      id: { in: jobs.map((j: { id: string }) => j.id) },
    },
    data: {
      status: "PROCESSING",
      startedAt: now,
    },
  });

  return jobs;
}

export async function completeJob(jobId: string): Promise<void> {
  await prisma.jobQueue.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}

export async function failJob(jobId: string, error: string): Promise<void> {
  const job = await prisma.jobQueue.findUnique({ where: { id: jobId } });
  if (!job) return;

  if (job.attempts + 1 >= job.maxAttempts) {
    await prisma.jobQueue.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        attempts: { increment: 1 },
        lastError: error,
        completedAt: new Date(),
      },
    });
  } else {
    // Retry with exponential backoff
    const backoffMs = Math.pow(2, job.attempts) * 1000 * 30; // 30s, 60s, 120s
    await prisma.jobQueue.update({
      where: { id: jobId },
      data: {
        status: "PENDING",
        attempts: { increment: 1 },
        lastError: error,
        startedAt: null,
        runAfter: new Date(Date.now() + backoffMs),
      },
    });
  }
}

export async function getJobStats(): Promise<{
  pending: number;
  processing: number;
  failed: number;
  completed: number;
}> {
  const [pending, processing, failed, completed] = await Promise.all([
    prisma.jobQueue.count({ where: { status: "PENDING" } }),
    prisma.jobQueue.count({ where: { status: "PROCESSING" } }),
    prisma.jobQueue.count({ where: { status: "FAILED" } }),
    prisma.jobQueue.count({ where: { status: "COMPLETED" } }),
  ]);
  return { pending, processing, failed, completed };
}
