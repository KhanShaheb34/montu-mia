"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string;
  const audienceId = process.env.RESEND_SEGMENT_ID;

  if (!email) {
    return { error: "ইমেইল দিতে হবে" };
  }

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
      return { error: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
    }

    return { success: true };
  } catch (error) {
    console.error("Subscription error:", error);
    return { error: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
  }
}
