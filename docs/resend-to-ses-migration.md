# Migrating from Resend to Amazon SES

A complete guide on how we migrated the মন্টু মিয়াঁর সিস্টেম ডিজাইন newsletter from Resend to Amazon SES — including the obstacles, scripts, and lessons learned.

## Why we migrated

We started with [Resend](https://resend.com) for sending newsletters. Their free tier offers:

- 100 emails/day
- 1,000 contacts
- Simple API, great DX

With ~50 subscribers, this was more than enough. But after the website gained traction (thanks to people sharing it on LinkedIn), subscribers jumped to 700+ within weeks and kept growing.

At that point, our options with Resend were:

1. **Send over 7 days** — 100 emails/day to cover all subscribers
2. **Pay $20/month** — Resend's paid tier

For a hobby project with zero revenue, $20/month felt steep. So we looked for alternatives and landed on **Amazon SES**:

- **$0.10 per 1,000 emails** (no monthly fee)
- Scales to millions of emails
- Full control over contact lists, bounce handling, and deliverability

Estimated monthly cost went from $20 to ~$0.20.

## Prerequisites

Before starting, you'll need:

- **AWS account** with CLI access configured (`aws configure`)
- **Domain** with DNS access (we use Namecheap, but any registrar works)
- **Existing subscriber data** exported from Resend (or wherever you're migrating from)
- **Node.js/Bun** runtime for running migration scripts

## Migration overview

```text
1. Verify domain in SES (DKIM + SPF + DMARC)
2. Create SES contact list
3. Create SES configuration set
4. Set up bounce/complaint handling (SNS → SQS)
5. Request production access (exit sandbox)
6. Export subscribers from Resend
7. Import subscribers into SES contact list
8. Update application code (subscribe, unsubscribe, send)
9. Create IAM user for Vercel (least-privilege)
10. Test everything
```

## Step 1: Verify your domain in SES

SES requires domain verification via DKIM (DomainKeys Identified Mail). This proves you own the domain.

```bash
aws sesv2 create-email-identity \
  --email-identity yourdomain.com \
  --region eu-west-1
```

The response contains 3 DKIM tokens. For each token, create a CNAME record in your DNS:

| Type  | Name                                 | Value                         |
| ----- | ------------------------------------ | ----------------------------- |
| CNAME | `<token1>._domainkey.yourdomain.com` | `<token1>.dkim.amazonses.com` |
| CNAME | `<token2>._domainkey.yourdomain.com` | `<token2>.dkim.amazonses.com` |
| CNAME | `<token3>._domainkey.yourdomain.com` | `<token3>.dkim.amazonses.com` |

**Important:** Add all 3 CNAME records. Missing even one will leave verification stuck in "pending" status.

You can verify the status:

```bash
aws sesv2 get-email-identity \
  --email-identity yourdomain.com \
  --region eu-west-1 \
  --query 'DkimAttributes.Status'
```

Wait until the status shows `SUCCESS`. This usually takes 5-15 minutes but can take up to 72 hours.

### SPF and DMARC records

Also add these DNS records for better deliverability:

| Type | Name     | Value                                                     |
| ---- | -------- | --------------------------------------------------------- |
| TXT  | `@`      | `v=spf1 include:amazonses.com ~all`                       |
| TXT  | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com` |

**Note:** If you already have an SPF record, append `include:amazonses.com` to it rather than creating a new one. Multiple SPF records will cause validation failures.

## Step 2: Create a contact list

SES Contact Lists replace Resend Audiences. They store your subscribers and their opt-in/opt-out status.

```bash
aws sesv2 create-contact-list \
  --contact-list-name your-subscribers \
  --region eu-west-1
```

## Step 3: Create a configuration set

Configuration sets let you track email events (sends, bounces, complaints, opens, clicks).

```bash
aws sesv2 create-configuration-set \
  --configuration-set-name your-config \
  --region eu-west-1
```

## Step 4: Set up bounce and complaint handling

This is important for maintaining a good sender reputation. AWS will suspend your account if bounces/complaints are too high. We use SNS → SQS to capture these events.

### Create an SNS topic

```bash
aws sns create-topic \
  --name ses-feedback \
  --region eu-west-1
```

### Create an SQS queue

```bash
aws sqs create-queue \
  --queue-name ses-feedback-queue \
  --region eu-west-1
```

### Allow SNS to publish to SQS

Create a policy file (`sqs-policy.json`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "sns.amazonaws.com" },
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:eu-west-1:<ACCOUNT_ID>:ses-feedback-queue",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "arn:aws:sns:eu-west-1:<ACCOUNT_ID>:ses-feedback"
        }
      }
    }
  ]
}
```

Apply the policy:

```bash
aws sqs set-queue-attributes \
  --queue-url https://sqs.eu-west-1.amazonaws.com/<ACCOUNT_ID>/ses-feedback-queue \
  --attributes file://sqs-policy.json \
  --region eu-west-1
```

**Gotcha:** If you're using zsh, inline JSON with curly braces can cause parsing errors. Always write the policy to a file and reference it with `file://`.

### Subscribe SQS to SNS

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:eu-west-1:<ACCOUNT_ID>:ses-feedback \
  --protocol sqs \
  --notification-endpoint arn:aws:sqs:eu-west-1:<ACCOUNT_ID>:ses-feedback-queue \
  --region eu-west-1
```

### Connect SES to SNS

```bash
aws sesv2 create-configuration-set-event-destination \
  --configuration-set-name your-config \
  --event-destination-name bounce-complaints \
  --event-destination '{
    "Enabled": true,
    "MatchingEventTypes": ["BOUNCE", "COMPLAINT"],
    "SnsDestination": {
      "TopicArn": "arn:aws:sns:eu-west-1:<ACCOUNT_ID>:ses-feedback"
    }
  }' \
  --region eu-west-1
```

## Step 5: Request production access

By default, SES accounts are in **sandbox mode**, which means:

- You can only send to verified email addresses
- Sending limit is 200 emails/day

To send to real subscribers, you need production access.

```bash
aws sesv2 put-account-details \
  --production-access-enabled \
  --mail-type TRANSACTIONAL \
  --use-case-description "Newsletter for a Bengali-language system design learning platform. Subscribers opt in via a subscribe form on the website. Each email includes an unsubscribe link with HMAC-SHA256 verification. We comply with RFC 2369 (List-Unsubscribe) and RFC 8058 (one-click unsubscribe)." \
  --website-url https://www.yourdomain.com \
  --additional-contact-email-addresses your@email.com \
  --region eu-west-1
```

### What to expect

AWS reviews these manually. They may:

1. **Approve immediately** (rare)
2. **Ask follow-up questions** about your sending practices, opt-in process, and bounce handling
3. **Deny the request** if they're not satisfied

### What happened to us

We were **rejected twice** in `us-east-1`. AWS wanted more details about our use case. After the second rejection, we pivoted to `eu-west-1` (Ireland) and applied fresh. Third time was the charm — approved with a 50,000 emails/day limit.

**Lesson:** If you get rejected in one region, try a different one. Each region has its own review queue and reviewers. When writing your use case, be specific:

- Explain what your product is
- Describe how users subscribe (double opt-in, single opt-in, etc.)
- Mention your unsubscribe mechanism
- Reference the RFC standards you comply with
- Include your website URL so they can verify it's legitimate

### Verifying a test email (while in sandbox)

While waiting for production access, you can still test by verifying recipient addresses:

```bash
aws sesv2 create-email-identity \
  --email-identity test@example.com \
  --region eu-west-1
```

The recipient will get a verification email they need to click.

## Step 6: Export subscribers from Resend

Export your contacts from Resend using their API:

```bash
curl -s https://api.resend.com/audiences/<AUDIENCE_ID>/contacts \
  -H "Authorization: Bearer re_YOUR_API_KEY" \
  > resend-export.json
```

The export format looks like:

```json
{
  "object": "list",
  "data": [
    { "email": "subscriber@example.com", "first_name": "...", ... },
    ...
  ]
}
```

## Step 7: Import subscribers into SES

We wrote a migration script (`scripts/migrate-to-ses.ts`) that:

1. Reads the Resend export JSON
2. Iterates through each contact
3. Calls `CreateContactCommand` for each one
4. Handles `AlreadyExistsException` (safe to re-run)
5. Adds a 1.1-second delay between API calls to avoid rate limiting

Run it:

```bash
bun run scripts/migrate-to-ses.ts resend-export.json
```

### Rate limiting gotcha

SES has a rate limit on `CreateContact` (1 request/second). Our first run with a 100ms delay caused ~101 failures out of 770+ contacts. We increased the delay to 1100ms and re-ran — the script handles duplicates gracefully, so re-running is safe.

### Pagination gotcha

When verifying the import, we initially saw only 50 contacts. SES `ListContacts` returns a maximum of 50 per page. You need to handle pagination using `NextToken`. Also add a delay between paginated calls — we hit `TooManyRequestsException` without one.

## Step 8: Update application code

Three main files needed changes:

### Subscribe action (`src/app/actions.ts`)

**Before (Resend):**

```typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.contacts.create({
  email: email,
  audienceId: process.env.RESEND_SEGMENT_ID,
});
```

**After (SES):**

```typescript
import { SESv2Client, CreateContactCommand } from "@aws-sdk/client-sesv2";
const sesClient = new SESv2Client({
  region: process.env.AWS_REGION ?? "eu-west-1",
});

await sesClient.send(
  new CreateContactCommand({
    ContactListName: process.env.SES_CONTACT_LIST_NAME,
    EmailAddress: email,
  }),
);
```

### Unsubscribe endpoint (`src/app/api/unsubscribe/route.ts`)

**Before (Resend):** Used `resend.contacts.remove()` which deletes the contact entirely.

**After (SES):** Uses `UpdateContactCommand` with `UnsubscribeAll: true`. This marks the contact as unsubscribed rather than deleting them, which is more durable — SES won't re-add them if you accidentally send to the full list.

```typescript
import {
  SESv2Client,
  UpdateContactCommand,
  NotFoundException,
} from "@aws-sdk/client-sesv2";

await sesClient.send(
  new UpdateContactCommand({
    ContactListName: contactListName,
    EmailAddress: email,
    UnsubscribeAll: true,
  }),
);
```

**Why `UpdateContact` instead of `DeleteContact`?** If you delete a contact and later send using SES list management, the contact could be re-created. Marking them as unsubscribed is the correct approach.

### Send emails script (`scripts/send-emails.ts`)

Replaced `resend.emails.send()` with SES `SendEmailCommand`. The key difference is how custom headers are specified:

```typescript
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

await sesClient.send(
  new SendEmailCommand({
    FromEmailAddress: "Newsletter <newsletter@yourdomain.com>",
    Destination: { ToAddresses: [recipient.email] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: { Html: { Data: htmlContent, Charset: "UTF-8" } },
        Headers: [
          { Name: "List-Unsubscribe", Value: `<${unsubscribeUrl}>` },
          {
            Name: "List-Unsubscribe-Post",
            Value: "List-Unsubscribe=One-Click",
          },
          { Name: "Precedence", Value: "bulk" },
        ],
      },
    },
    ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
  }),
);
```

### Email template — UTM tracking

We also added UTM parameters to track which links get clicked in the newsletter:

```typescript
function withUtm(url: string, campaign: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(campaign)}`;
}
```

## Step 9: Create IAM user for Vercel

Your Vercel deployment needs AWS credentials, but it should have **minimal permissions** — only what the web app actually uses (subscribe and unsubscribe).

```bash
# Create user
aws iam create-user --user-name vercel-ses-your-project

# Create access key
aws iam create-access-key --user-name vercel-ses-your-project
```

Attach an inline policy with only the permissions needed:

```bash
aws iam put-user-policy \
  --user-name vercel-ses-your-project \
  --policy-name ses-contact-list-only \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "SESContactListReadWrite",
        "Effect": "Allow",
        "Action": [
          "ses:CreateContact",
          "ses:DeleteContact",
          "ses:UpdateContact",
          "ses:GetContact"
        ],
        "Resource": "arn:aws:ses:eu-west-1:<ACCOUNT_ID>:contact-list/your-subscribers"
      }
    ]
  }'
```

**Gotcha we hit:** We initially created the policy with `CreateContact`, `DeleteContact`, and `GetContact`. When we later changed the unsubscribe flow from `DeleteContact` to `UpdateContact`, the Vercel deployment broke with `AccessDeniedException`. Don't forget to update IAM policies when you change which API calls your code makes.

Set these environment variables in Vercel:

- `AWS_REGION` = `eu-west-1`
- `AWS_ACCESS_KEY_ID` = (from create-access-key output)
- `AWS_SECRET_ACCESS_KEY` = (from create-access-key output)
- `SES_CONTACT_LIST_NAME` = your contact list name
- `SES_CONFIGURATION_SET` = your configuration set name
- `UNSUBSCRIBE_SECRET` = (generate with `openssl rand -hex 32`)

**Note:** For local development, you don't need the IAM keys if you have `~/.aws/credentials` configured with sufficient permissions.

## Step 10: Test everything

### Test subscribe

Visit your website and subscribe with a test email. Check your SES contact list:

```bash
aws sesv2 list-contacts \
  --contact-list-name your-subscribers \
  --region eu-west-1 \
  --query 'Contacts[-1]'
```

### Test send

```bash
bun run send-emails:test
```

### Test unsubscribe

Click the unsubscribe link in the test email. Verify the contact's status changed:

```bash
aws sesv2 get-contact \
  --contact-list-name your-subscribers \
  --email-address test@example.com \
  --region eu-west-1
```

### List subscribers

```bash
bun run subscribers 10
```

## Environment variables

Here's the complete set of environment variables after migration:

```bash
# AWS SES Configuration
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=<your-iam-key>        # Only needed on Vercel
AWS_SECRET_ACCESS_KEY=<your-iam-secret>  # Only needed on Vercel
SES_CONTACT_LIST_NAME=your-subscribers
SES_CONFIGURATION_SET=your-config

# Unsubscribe verification
UNSUBSCRIBE_SECRET=<openssl rand -hex 32>

# Test email for send-emails:test
TEST_EMAIL=your_email@example.com
```

## Obstacles we hit (and how we solved them)

### 1. Production access denied twice (us-east-1)

AWS rejected our request in us-east-1 twice, asking for more details each time. We applied in eu-west-1 instead and got approved. Each region has its own review process.

### 2. DKIM verification stuck in pending

We missed adding the third CNAME record. DKIM requires all 3 tokens. Double-check with `dig`:

```bash
dig CNAME <token>._domainkey.yourdomain.com +short
```

### 3. Rate limiting during contact import

The `CreateContact` API has a 1 request/second rate limit. Our initial 100ms delay caused 101 failures out of 770 contacts. Fix: increased delay to 1100ms. The migration script handles duplicates, so re-running is safe.

### 4. ListContacts pagination

SES returns max 50 contacts per `ListContacts` call. Without pagination handling, it looked like we only had 50 subscribers when we actually had 770+. Fix: loop with `NextToken` and add a 500ms delay between pages to avoid `TooManyRequestsException`.

### 5. Zsh JSON parsing in CLI

Zsh interprets curly braces in inline JSON as glob patterns. This broke our `aws sqs set-queue-attributes` command. Fix: write JSON to a file and use `file://path.json`.

### 6. IAM policy mismatch after code change

We changed unsubscribe from `DeleteContact` to `UpdateContact` but forgot to update the IAM policy. The Vercel deployment broke with `AccessDeniedException`. Fix: added `ses:UpdateContact` to the policy.

### 7. Sandbox sending restrictions

While in sandbox mode, SES only allows sending to verified email addresses. We had to verify each test recipient:

```bash
aws sesv2 create-email-identity --email-identity test@example.com --region eu-west-1
```

## Cost comparison

|                  | Resend (free) | Resend (paid) | Amazon SES                  |
| ---------------- | ------------- | ------------- | --------------------------- |
| Monthly cost     | $0            | $20           | ~$0.09 (for 880 emails)     |
| Contacts limit   | 1,000         | 50,000        | Unlimited                   |
| Daily send limit | 100           | 50,000        | 50,000 (our approved limit) |
| Rate limit       | -             | -             | 14 emails/second            |

## Files changed in the migration

| File                               | What changed                                        |
| ---------------------------------- | --------------------------------------------------- |
| `src/app/actions.ts`               | Resend → SES `CreateContactCommand`                 |
| `src/app/api/unsubscribe/route.ts` | Resend → SES `UpdateContactCommand`                 |
| `scripts/send-emails.ts`           | Resend → SES `SendEmailCommand` with custom headers |
| `scripts/migrate-to-ses.ts`        | New — one-time import script                        |
| `scripts/list-subscribers.ts`      | New — list SES contacts                             |
| `emails/newsletter-react.tsx`      | Added UTM tracking (`campaign` prop)                |
| `.env.example`                     | Updated for SES variables                           |
| `package.json`                     | Added `@aws-sdk/client-sesv2`, new script entries   |
| `CLAUDE.md`                        | Updated documentation                               |

## Key takeaways

1. **SES is incredibly cheap** for small-to-medium newsletters. If you're paying for a third-party email service and your volume is low, SES might save you 99% of the cost.

2. **Production access is the hardest part.** Write a detailed, honest use case. Mention your compliance with email standards (RFC 2369, RFC 8058). If rejected, try a different region.

3. **Use `UpdateContact` for unsubscribe, not `DeleteContact`.** Deletion is amnesia — the system can re-add them. Marking as unsubscribed is durable.

4. **Always handle pagination.** SES (and most AWS APIs) paginate results. Don't assume you're getting everything in one call.

5. **Least-privilege IAM is worth the effort.** Create a dedicated user for your deployment with only the permissions it needs. Update the policy whenever you change which API calls your code makes.

6. **Rate limits are real.** Add delays between API calls, especially during bulk operations. 1 request/second is a safe default for SES contact operations.

## Related links

- [AWS SES v2 API Reference](https://docs.aws.amazon.com/ses/latest/APIReference-V2/Welcome.html)
- [AWS SES Pricing](https://aws.amazon.com/ses/pricing/)
- [React Email](https://react.email) — the template library we use
- [RFC 2369](https://datatracker.ietf.org/doc/html/rfc2369) — List-Unsubscribe header
- [RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058) — One-Click Unsubscribe
