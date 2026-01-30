#!/usr/bin/env bun

import { Resend } from "resend";
import { readFileSync } from "fs";
import { join } from "path";
import { render } from "@react-email/components";
import { NewsletterEmail } from "../emails/newsletter-react";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = "onboarding@resend.dev"; // Replace with your verified domain email
const SUBJECT = "মন্টু মিয়াঁর সিস্টেম ডিজাইন - নিউজলেটার";

interface EmailRecipient {
  email: string;
  name?: string;
}

interface PastPost {
  title: string;
  url: string;
}

interface EmailContentConfig {
  lastEpisodeSummary: string;
  currentTopicTeaser: string;
  articleTitle: string;
  articleImageUrl: string;
  linkedinArticleUrl: string;
  unsubscribeUrl?: string;
}

// For testing, we'll use a single recipient
const TEST_RECIPIENT: EmailRecipient = {
  email: "shakirulhkhan@gmail.com",
  name: "Test User",
};

// Email content configuration
// TODO: Update these values for each newsletter send
const EMAIL_CONTENT: EmailContentConfig = {
  lastEpisodeSummary:
    "মন্টু মিয়াঁ লোড ব্যালেন্সার সেটআপ করতে গিয়ে একগাদা প্রোটোকল এর নাম দেখে কিভাবে ভ্যাবাচ্যাকা খেয়ে গিয়েছিল।",
  currentTopicTeaser:
    "মন্টু মিয়াঁর গুরু বল্টু ভাই কিভাবে বেশ কিছু কমন প্রোটোকল গুলো এর ব্যাপারে খুব সহজে বুঝিয়ে দেয় মন্টুকে।",
  articleTitle: "নেটওয়ার্কিং প্রোটোকলের গোলকধাঁধা",
  articleImageUrl: "https://montumia.com/linkedin/networking.png",
  linkedinArticleUrl:
    "https://www.linkedin.com/pulse/%E0%A6%AE%E0%A6%A8%E0%A6%9F-%E0%A6%AE%E0%A6%AF%E0%A6%B0-%E0%A6%B8%E0%A6%B8%E0%A6%9F%E0%A6%AE-%E0%A6%A1%E0%A6%9C%E0%A6%87%E0%A6%A8-%E0%A6%85%E0%A6%AD%E0%A6%AF%E0%A6%A8-%E0%A7%AA-%E0%A6%A8%E0%A6%9F%E0%A6%93%E0%A6%AF%E0%A6%B0%E0%A6%95-%E0%A6%AA%E0%A6%B0%E0%A6%9F%E0%A6%95%E0%A6%B2%E0%A6%B0-%E0%A6%97%E0%A6%B2%E0%A6%95%E0%A6%A7%E0%A6%A7-shakirul-hasan-khan-xcg5c",
  unsubscribeUrl: "https://montumia.com/unsubscribe",
};

/**
 * Load past posts from JSON file
 */
function loadPastPosts(): PastPost[] {
  const postsPath = join(process.cwd(), "emails", "data", "past-posts.json");
  try {
    const data = readFileSync(postsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.warn("⚠️  Failed to load past posts, using empty list");
    return [];
  }
}

/**
 * Generate HTML email from React Email template
 */
async function generateEmailHtml(config: EmailContentConfig): Promise<string> {
  const pastPosts = loadPastPosts();

  const html = await render(
    NewsletterEmail({
      lastEpisodeSummary: config.lastEpisodeSummary,
      currentTopicTeaser: config.currentTopicTeaser,
      articleImageUrl: config.articleImageUrl,
      linkedinArticleUrl: config.linkedinArticleUrl,
      pastPosts: pastPosts,
      unsubscribeUrl: config.unsubscribeUrl,
    }),
  );

  return html;
}

/**
 * Send email to a single recipient
 */
async function sendEmail(
  recipient: EmailRecipient,
  htmlContent: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: SUBJECT,
      html: htmlContent,
    });

    if (error) {
      console.error(`Failed to send to ${recipient.email}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✓ Email sent to ${recipient.email} (ID: ${data?.id})`);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to send to ${recipient.email}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send emails to multiple recipients with delay between sends
 */
async function sendBulkEmails(
  recipients: EmailRecipient[],
  htmlContent: string,
  delayMs: number = 1000,
): Promise<void> {
  console.log(`\nSending emails to ${recipients.length} recipient(s)...\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const recipient of recipients) {
    const result = await sendEmail(recipient, htmlContent);

    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Delay between sends to avoid rate limiting
    if (recipients.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✓ Successfully sent: ${successCount}`);
  console.log(`✗ Failed: ${failureCount}`);
  console.log("=".repeat(50) + "\n");
}

/**
 * Main execution
 */
async function main() {
  console.log("=".repeat(50));
  console.log("মন্টু মিয়াঁর সিস্টেম ডিজাইন - Email Sending Pipeline");
  console.log("=".repeat(50));

  // Check for API key
  if (!process.env.RESEND_API_KEY) {
    console.error("\n❌ Error: RESEND_API_KEY environment variable is not set");
    console.error(
      "Please set it in your .env.local file or export it in your shell\n",
    );
    process.exit(1);
  }

  try {
    // Generate email HTML from React Email template
    console.log("📧 Generating email from React Email template...");
    const htmlContent = await generateEmailHtml(EMAIL_CONTENT);
    console.log("✓ Email template rendered successfully");

    // Load past posts
    const pastPosts = loadPastPosts();
    console.log(`✓ Loaded ${pastPosts.length} past posts\n`);

    // Send to test recipient
    await sendBulkEmails([TEST_RECIPIENT], htmlContent);
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
main();
