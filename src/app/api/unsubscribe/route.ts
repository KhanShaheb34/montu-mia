import { Resend } from "resend";
import { type NextRequest, NextResponse } from "next/server";
import { verifyEmailHash } from "@/lib/email-hash";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Escape HTML special characters in a string to prevent XSS.
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Handle one-click unsubscribe (POST request with List-Unsubscribe-Post)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const hash = formData.get("hash") as string;

    if (!email || !hash) {
      return NextResponse.json(
        { error: "Missing email or hash" },
        { status: 400 },
      );
    }

    // Verify the hash
    try {
      if (!verifyEmailHash(email, hash)) {
        return NextResponse.json({ error: "Invalid hash" }, { status: 403 });
      }
    } catch (error) {
      console.error("Unsubscribe hash verification error:", error);
      return NextResponse.json(
        { error: "Server configuration error (UNSUBSCRIBE_SECRET missing)" },
        { status: 500 },
      );
    }

    // Remove from Resend audience
    const audienceId = process.env.RESEND_SEGMENT_ID;
    if (!audienceId) {
      console.error("RESEND_SEGMENT_ID not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Find and delete the contact
    const { data: contact } = await resend.contacts.get({
      audienceId: audienceId,
      email: email,
    });

    if (contact) {
      await resend.contacts.remove({
        audienceId: audienceId,
        id: contact.id,
      });
    }

    // Return success (with simple HTML for browser view)
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed</title>
  <style>
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 20px;
      text-align: center;
    }
    h1 { color: #1f2937; }
    p { color: #4b5563; line-height: 1.6; }
    a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <h1>আনসাবস্ক্রাইব সফল হয়েছে</h1>
  <p>আপনাকে মন্টু মিয়াঁর সিস্টেম ডিজাইন নিউজলেটার থেকে আনসাবস্ক্রাইব করা হয়েছে।</p>
  <p>আপনি আর কোন ইমেইল পাবেন না।</p>
  <p><a href="https://www.montumia.com">মূল পাতায় ফিরে যান</a></p>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
}

/**
 * Handle GET request for manual unsubscribe page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const hash = searchParams.get("hash");

  if (!email || !hash) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invalid Link</title>
  <style>
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 20px;
      text-align: center;
    }
    h1 { color: #dc2626; }
    p { color: #4b5563; line-height: 1.6; }
    a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <h1>ভুল লিংক</h1>
  <p>আনসাবস্ক্রাইব লিংক টি সঠিক নয়।</p>
  <p><a href="https://www.montumia.com">মূল পাতায় ফিরে যান</a></p>
</body>
</html>`,
      {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  // Verify hash
  try {
    if (!verifyEmailHash(email, hash)) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invalid Link</title>
  <style>
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 20px;
      text-align: center;
    }
    h1 { color: #dc2626; }
    p { color: #4b5563; line-height: 1.6; }
    a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <h1>ভুল লিংক</h1>
  <p>আনসাবস্ক্রাইব লিংক টি সঠিক নয়।</p>
  <p><a href="https://www.montumia.com">মূল পাতায় ফিরে যান</a></p>
</body>
</html>`,
        {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      );
    }
  } catch (error) {
    console.error("Unsubscribe hash verification error:", error);
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server Error</title>
  <style>
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 20px;
      text-align: center;
    }
    h1 { color: #dc2626; }
    p { color: #4b5563; line-height: 1.6; }
    a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <h1>সার্ভার ত্রুটি</h1>
  <p>দুঃখিত, একটি অভ্যন্তরীণ সমস্যা হয়েছে (UNSUBSCRIBE_SECRET missing)।</p>
  <p><a href="https://www.montumia.com">মূল পাতায় ফিরে যান</a></p>
</body>
</html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  const escapedEmail = escapeHtml(email);
  const escapedHash = escapeHtml(hash);

  // Show confirmation page with button
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>আনসাবস্ক্রাইব</title>
  <style>
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 20px;
      text-align: center;
    }
    h1 { color: #1f2937; }
    p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
    button {
      background: #f59e0b;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    button:hover { background: #d97706; }
    .cancel {
      display: inline-block;
      margin-left: 10px;
      color: #6b7280;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <h1>নিউজলেটার থেকে আনসাবস্ক্রাইব</h1>
  <p>আপনি কি নিশ্চিত যে আপনি মন্টু মিয়াঁর সিস্টেম ডিজাইন নিউজলেটার থেকে আনসাবস্ক্রাইব করতে চান?</p>
  <p><strong>${escapedEmail}</strong></p>

  <form method="POST" action="/api/unsubscribe">
    <input type="hidden" name="email" value="${escapedEmail}">
    <input type="hidden" name="hash" value="${escapedHash}">
    <button type="submit">হ্যাঁ, আনসাবস্ক্রাইব করুন</button>
    <a href="https://www.montumia.com" class="cancel">না, থাক</a>
  </form>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}
