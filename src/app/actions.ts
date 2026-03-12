"use server";

import {
  SESv2Client,
  CreateContactCommand,
  AlreadyExistsException,
} from "@aws-sdk/client-sesv2";
import { headers } from "next/headers";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION ?? "eu-west-1",
});

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { error: "সঠিক ইমেইল দিতে হবে" };
  }

  // Rate limiting: 3 requests per 15 minutes per IP
  const headersList = await headers();
  const identifier = getClientIdentifier(headersList);
  const rateLimitResult = rateLimit(identifier, {
    limit: 3,
    window: 15 * 60 * 1000,
  });

  if (!rateLimitResult.success) {
    const minutesRemaining = Math.ceil(
      (rateLimitResult.resetAt - Date.now()) / 60000,
    );
    return {
      error: `অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে ${minutesRemaining} মিনিট পরে আবার চেষ্টা করুন।`,
    };
  }

  const contactListName = process.env.SES_CONTACT_LIST_NAME;
  if (!contactListName) {
    console.error("SES_CONTACT_LIST_NAME is not defined");
    return { error: "সার্ভার কনফিগারেশন এরর" };
  }

  try {
    await sesClient.send(
      new CreateContactCommand({
        ContactListName: contactListName,
        EmailAddress: email,
      }),
    );
    return { success: true };
  } catch (error) {
    if (error instanceof AlreadyExistsException) {
      // Already subscribed — treat as success
      return { success: true };
    }
    console.error("SES subscription error:", error);
    return { error: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
  }
}
