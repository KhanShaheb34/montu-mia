#!/usr/bin/env bun

import { Resend } from "resend";
import { readFileSync } from "fs";
import { join } from "path";
import { render } from "@react-email/components";
import { NewsletterEmail } from "../emails/newsletter-react";
import { generateEmailHash } from "../src/lib/email-hash";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = "Montu Mia's Newsletter <newsletter@montumia.com>";
const SUBJECT = "মন্টু মিয়াঁর সিস্টেম ডিজাইন - নিউজলেটার";
const BASE_URL = "https://www.montumia.com";

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
}

// For testing, we'll use a single recipient
const TEST_RECIPIENT: EmailRecipient = {
  email: process.env.TEST_EMAIL || "",
  name: "Test User",
};

// Email content configuration
// TODO: Update these values for each newsletter send
const EMAIL_CONTENT: EmailContentConfig = {
  lastEpisodeSummary:
    "মন্টু মিয়াঁ লোড ব্যালেন্সার সেটআপ করতে গিয়ে একগাদা প্রোটোকল এর নাম দেখে কিভাবে ভ্যাবাচ্যাকা খেয়ে গিয়েছিল।",
  currentTopicTeaser:
    "মন্টু মিয়াঁর গুরু বল্টু ভাই কিভাবে বেশ কিছু কমন প্রোটোকল গুলো এর ব্যাপারে খুব সহজে বুঝিয়ে দেয় মন্টুকে।",
  articleTitle: "নেটওয়ার্কিং প্রোটোকলের গোলকধাঁধা",
  articleImageUrl: "https://www.montumia.com/linkedin/networking.png",
  linkedinArticleUrl:
    "https://www.linkedin.com/pulse/%E0%A6%AE%E0%A6%A8%E0%A6%9F-%E0%A6%AE%E0%A6%AF%E0%A6%B0-%E0%A6%B8%E0%A6%B8%E0%A6%9F%E0%A6%AE-%E0%A6%A1%E0%A6%9C%E0%A6%87%E0%A6%A8-%E0%A6%85%E0%A6%AD%E0%A6%AF%E0%A6%A8-%E0%A7%AA-%E0%A6%A8%E0%A6%9F%E0%A6%93%E0%A6%AF%E0%A6%B0%E0%A6%95-%E0%A6%AA%E0%A6%B0%E0%A6%9F%E0%A6%95%E0%A6%B2%E0%A6%B0-%E0%A6%97%E0%A6%B2%E0%A6%95%E0%A6%A7%E0%A6%A7-shakirul-hasan-khan-xcg5c",
};

/**
 * Generate unsubscribe URL for a specific email
 */
function generateUnsubscribeUrl(email: string): string {
  const hash = generateEmailHash(email);
  return `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&hash=${hash}`;
}

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
async function generateEmailHtml(
  config: EmailContentConfig,
  unsubscribeUrl: string,
): Promise<string> {
  const pastPosts = loadPastPosts();

  const html = await render(
    NewsletterEmail({
      lastEpisodeSummary: config.lastEpisodeSummary,
      currentTopicTeaser: config.currentTopicTeaser,
      articleTitle: config.articleTitle,
      articleImageUrl: config.articleImageUrl,
      linkedinArticleUrl: config.linkedinArticleUrl,
      pastPosts: pastPosts,
      unsubscribeUrl: unsubscribeUrl,
    }),
  );

  return html;
}

/**
 * Send email to a single recipient with unsubscribe headers
 */
async function sendEmail(
  recipient: EmailRecipient,
  htmlContent: string,
  unsubscribeUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract email and hash from unsubscribe URL for POST header
    const url = new URL(unsubscribeUrl);
    const email = url.searchParams.get("email");
    const hash = url.searchParams.get("hash");

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: SUBJECT,
      html: htmlContent,
      headers: {
        // List-Unsubscribe header with both HTTP and mailto (RFC 2369)
        "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:unsubscribe@montumia.com?subject=Unsubscribe>`,
        // List-Unsubscribe-Post for one-click unsubscribe (RFC 8058)
        "List-Unsubscribe-Post": `List-Unsubscribe=One-Click`,
        // Additional headers for better deliverability
        Precedence: "bulk",
        "List-Id":
          "Montu Mia System Design Newsletter <newsletter.montumia.com>",
      },
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
 * Fetch all subscribers from Resend audience
 */
async function getAllSubscribers(): Promise<EmailRecipient[]> {
  const audienceId = process.env.RESEND_SEGMENT_ID;

  if (!audienceId) {
    console.error(
      "❌ Error: RESEND_SEGMENT_ID environment variable is not set",
    );
    console.error(
      "Please set it in your .env.local file or export it in your shell\n",
    );
    process.exit(1);
  }

  try {
    console.log("📡 Fetching subscribers from Resend audience...");

    const { data: response, error } = await resend.contacts.list({
      audienceId: audienceId,
    });

    if (error) {
      console.error("❌ Failed to fetch contacts from Resend:", error);
      process.exit(1);
    }

    if (!response?.data || response.data.length === 0) {
      console.warn("⚠️  No contacts found in Resend audience");
      return [];
    }

    const subscribers: EmailRecipient[] = response.data.map((contact) => ({
      email: contact.email,
      name: contact.first_name || undefined,
    }));

    console.log(`✓ Found ${subscribers.length} subscriber(s)\n`);
    return subscribers;
  } catch (error) {
    console.error("❌ Failed to fetch subscribers:", error);
    process.exit(1);
  }
}

/**
 * Send emails to multiple recipients with delay between sends
 * Each recipient gets a unique unsubscribe link
 */
async function sendBulkEmails(
  recipients: EmailRecipient[],
  config: EmailContentConfig,
  delayMs: number = 1000,
): Promise<void> {
  console.log(`\nSending emails to ${recipients.length} recipient(s)...\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const recipient of recipients) {
    // Generate unique unsubscribe URL for this recipient
    const unsubscribeUrl = generateUnsubscribeUrl(recipient.email);

    // Generate email HTML with this recipient's unsubscribe URL
    const htmlContent = await generateEmailHtml(config, unsubscribeUrl);

    // Send email
    const result = await sendEmail(recipient, htmlContent, unsubscribeUrl);

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
 * Show usage instructions
 */
function showUsage() {
  console.log("\nUsage:");
  console.log("  bun run send-emails --test    # Send to test email only");
  console.log("  bun run send-emails --all     # Send to all subscribers");
  console.log("\nOptions:");
  console.log("  --test    Send test email to shakirulhkhan@gmail.com");
  console.log("  --all     Send to all subscribers in Resend audience");
  console.log("  --help    Show this help message\n");
}

/**
 * Ask for user confirmation (async stdin prompt)
 */
async function askForConfirmation(question: string): Promise<boolean> {
  console.log(question);
  console.log('Type "yes" to confirm, or anything else to cancel:');

  // Read from stdin
  const buffer = new Uint8Array(1024);
  const n = await Bun.stdin.stream().getReader().read();
  const input = new TextDecoder().decode(n.value).trim().toLowerCase();

  return input === "yes";
}

/**
 * Main execution
 */
async function main() {
  console.log("=".repeat(50));
  console.log("মন্টু মিয়াঁর সিস্টেম ডিজাইন - Email Sending Pipeline");
  console.log("=".repeat(50));

  // Parse command-line arguments
  const args = process.argv.slice(2);
  const mode = args[0];

  // Show help
  if (mode === "--help" || mode === "-h") {
    showUsage();
    process.exit(0);
  }

  // Validate mode
  if (!mode || (mode !== "--test" && mode !== "--all")) {
    console.error("\n❌ Error: Invalid or missing argument\n");
    showUsage();
    process.exit(1);
  }

  // Check for API key
  if (!process.env.RESEND_API_KEY) {
    console.error("\n❌ Error: RESEND_API_KEY environment variable is not set");
    console.error(
      "Please set it in your .env.local file or export it in your shell\n",
    );
    process.exit(1);
  }

  // Ensure unsubscribe secret is set
  if (!process.env.UNSUBSCRIBE_SECRET) {
    console.error(
      "\n❌ Error: UNSUBSCRIBE_SECRET environment variable is not set",
    );
    console.error(
      "Please set it in your .env.local file or export it in your shell\n",
    );
    process.exit(1);
  }

  try {
    // Load past posts
    const pastPosts = loadPastPosts();
    console.log(`✓ Loaded ${pastPosts.length} past posts`);

    let recipients: EmailRecipient[];

    if (mode === "--test") {
      console.log("\n🧪 TEST MODE: Sending to test email only\n");
      recipients = [TEST_RECIPIENT];
    } else if (mode === "--all") {
      console.log("\n📬 ALL SUBSCRIBERS MODE\n");

      // Fetch all subscribers
      recipients = await getAllSubscribers();

      if (recipients.length === 0) {
        console.error("❌ No subscribers found. Exiting.\n");
        process.exit(1);
      }

      // Show confirmation prompt
      console.log("=".repeat(50));
      console.log(
        `⚠️  You are about to send emails to ${recipients.length} subscriber(s)`,
      );
      console.log("=".repeat(50));
      console.log("\nRecipients preview (first 5):");
      recipients.slice(0, 5).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.email}`);
      });
      if (recipients.length > 5) {
        console.log(`  ... and ${recipients.length - 5} more`);
      }
      console.log("\nEmail details:");
      console.log(`  From: ${FROM_EMAIL}`);
      console.log(`  Subject: ${SUBJECT}`);
      console.log(`  Article: ${EMAIL_CONTENT.articleTitle}`);
      console.log("\n" + "=".repeat(50));

      const confirmed = await askForConfirmation(
        "\n⚠️  Are you sure you want to send to ALL subscribers?",
      );

      if (!confirmed) {
        console.log("\n❌ Send cancelled by user. No emails were sent.\n");
        process.exit(0);
      }

      console.log("\n✅ Confirmed. Starting bulk send...\n");
    }

    console.log("📧 Sending emails with unique unsubscribe links...\n");

    // Send emails
    await sendBulkEmails(recipients, EMAIL_CONTENT);

    console.log("\n💡 Tip: Each recipient gets a unique unsubscribe link");
    console.log(
      "   Email clients will show 'Unsubscribe' button in the header\n",
    );
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
main();
