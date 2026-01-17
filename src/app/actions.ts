"use server";

import { Resend } from "resend";
import { headers } from "next/headers";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string;

  // Basic email validation
  if (!email || !email.includes("@")) {
    return { error: "সঠিক ইমেইল দিতে হবে" };
  }

  // Rate limiting: 3 requests per 15 minutes per IP
  const headersList = await headers();
  const identifier = getClientIdentifier(headersList);
  const rateLimitResult = rateLimit(identifier, {
    limit: 3,
    window: 15 * 60 * 1000, // 15 minutes
  });

  if (!rateLimitResult.success) {
    const minutesRemaining = Math.ceil(
      (rateLimitResult.resetAt - Date.now()) / 60000,
    );
    return {
      error: `অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে ${minutesRemaining} মিনিট পরে আবার চেষ্টা করুন।`,
    };
  }

  const audienceId = process.env.RESEND_SEGMENT_ID;

  if (!audienceId) {
    console.error("RESEND_SEGMENT_ID is not defined");
    return { error: "সার্ভার কনফিগারেশন এরর" };
  }

  try {
    const { error } = await resend.contacts.create({
      email: email,
      audienceId: audienceId,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
    }

    return { success: true };
  } catch (error) {
    console.error("Subscription error:", error);
    return { error: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
  }
}
