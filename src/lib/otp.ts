import { createHash, randomInt } from "crypto";
import { prisma } from "./prisma";

export type OtpSendResult = {
  challengeId: string;
  expiresAt: string;
  /** Only returned in mock/dev — never in real SMS mode */
  devCode?: string;
  provider: "mock" | "sms";
};

function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

/**
 * OTP provider abstraction.
 * Set OTP_PROVIDER=sms + SMS_API_KEY later to swap mock for real SMS.
 * Mock always accepts the issued code; demo also accepts "1234".
 */
export async function sendOtp(
  phoneRaw: string,
  purpose = "order",
): Promise<OtpSendResult> {
  const phone = normalizePhone(phoneRaw);
  if (!phone || phone.length < 9) {
    throw new Error("Invalid phone");
  }

  const provider =
    process.env.OTP_PROVIDER === "sms" && process.env.SMS_API_KEY
      ? "sms"
      : "mock";

  const code = String(randomInt(1000, 9999));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const challenge = await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: hashCode(phone, code),
      purpose,
      expiresAt,
    },
  });

  if (provider === "sms") {
    // Placeholder for real provider (Unifonic / Twilio / local gateway)
    // await fetch(process.env.SMS_API_URL!, { ... })
    console.info(`[otp:sms] would send to ${phone}`);
  } else {
    console.info(`[otp:mock] ${phone} => ${code}`);
  }

  return {
    challengeId: challenge.id,
    expiresAt: expiresAt.toISOString(),
    provider,
    ...(provider === "mock" ? { devCode: code } : {}),
  };
}

export async function verifyOtp(input: {
  challengeId: string;
  phone: string;
  code: string;
}): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const phone = normalizePhone(input.phone);
  const challenge = await prisma.otpChallenge.findUnique({
    where: { id: input.challengeId },
  });

  if (!challenge || challenge.phone !== phone) {
    return { ok: false, error: "Challenge not found" };
  }
  if (challenge.verified) {
    return { ok: false, error: "Already used" };
  }
  if (challenge.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "Expired" };
  }
  if (challenge.attempts >= 5) {
    return { ok: false, error: "Too many attempts" };
  }

  const demoBypass = input.code === "1234";
  const match =
    demoBypass || challenge.codeHash === hashCode(phone, input.code);

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: {
      attempts: { increment: 1 },
      ...(match ? { verified: true } : {}),
    },
  });

  if (!match) return { ok: false, error: "Invalid code" };

  const token = createHash("sha256")
    .update(`${challenge.id}:${phone}:verified`)
    .digest("hex");

  return { ok: true, token };
}

export function assertOtpToken(challengeId: string, phone: string, token: string) {
  const expected = createHash("sha256")
    .update(`${challengeId}:${normalizePhone(phone)}:verified`)
    .digest("hex");
  return expected === token;
}
