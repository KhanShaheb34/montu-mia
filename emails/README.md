# Email Templates & Sending Pipeline

Email newsletter system using React Email and Resend for মন্টু মিয়াঁর সিস্টেম ডিজাইন.

## Directory Structure

```text
emails/
├── README.md                   # This file
├── newsletter-react.tsx        # React Email template (MAIN)
└── data/
    └── past-posts.json        # List of past articles for newsletter
```

## Quick Start

### 1. Preview Email Template

Preview the email in your browser (hot reload enabled):

```bash
bun run email:preview
```

Then visit [http://localhost:3001](http://localhost:3001) to see your email template live.

### 2. Send Emails

**Send test email** to `shakirulhkhan@gmail.com`:

```bash
bun run send-emails:test
# or
bun run send-emails -- --test
```

**Send to all subscribers** in your Resend audience:

```bash
bun run send-emails:all
# or
bun run send-emails -- --all
```

⚠️ When sending to all subscribers, you'll see:

- Total number of recipients
- Preview of first 5 email addresses
- Email details (from, subject, article)
- Confirmation prompt - **Type "yes"** to proceed or anything else to cancel

### 3. Customize Content

Edit `scripts/send-emails.ts` and modify the `EMAIL_CONTENT` object:

```typescript
const EMAIL_CONTENT: EmailContentConfig = {
  lastEpisodeSummary: "মন্টু মিয়া লোড ব্যালেন্সিং নিয়ে কাজ করছিলেন",
  currentTopicTeaser: "ডাটাবেস রেপ্লিকেশনের সমস্যা",
  articleImageUrl: "https://montumia.com/og/sd/introduction/image.png",
  linkedinArticleUrl: "https://lnkd.in/example",
  unsubscribeUrl: "https://montumia.com/unsubscribe",
};
```

### 4. Update Past Posts List

Edit `emails/data/past-posts.json` to add/update articles:

```json
[
  {
    "title": "লোড ব্যালেন্সার কী?",
    "url": "https://montumia.com/sd/load-balancer"
  }
]
```

## Unsubscribe System

The email system includes a robust unsubscribe mechanism:

### How It Works

1. **Unique Links**: Each recipient gets a unique unsubscribe URL with a secure hash
2. **Email Headers**: Includes `List-Unsubscribe` and `List-Unsubscribe-Post` headers (RFC 2369 & RFC 8058)
3. **One-Click Unsubscribe**: Modern email clients (Gmail, Outlook, etc.) show an "Unsubscribe" button in the header
4. **Fallback Link**: Footer includes a visible unsubscribe link for older clients
5. **Automatic Removal**: Clicking unsubscribe removes the contact from your Resend audience

### Unsubscribe Flow

1. User clicks "Unsubscribe" button in email header OR footer link
2. Browser opens `/api/unsubscribe?email=user@example.com&hash=abc123`
3. System verifies the hash to ensure the request is legitimate
4. Confirmation page is shown
5. User confirms unsubscribe
6. Contact is removed from Resend audience
7. Success message is displayed

### Security

- Each unsubscribe link is secured with a SHA-256 hash
- Hash is generated using the recipient's email + your `UNSUBSCRIBE_SECRET`
- Links cannot be forged without knowing the secret
- Prevents malicious unsubscribes

### API Endpoint

The unsubscribe API is at `/api/unsubscribe` and handles:

- `GET` requests: Show confirmation page
- `POST` requests: Process unsubscribe and remove from Resend

## Email Template Features

### Current Template: `newsletter-react.tsx`

Built with React Email components, the template includes:

1. **OG Image** - Site logo/branding from `/og.png`
2. **Bengali Title** - "মন্টু মিয়াঁর নতুন অভিযানে স্বাগতম"
3. **Last Episode Summary** - Recap of previous content (variable)
4. **Current Topic Teaser** - Preview of new content (variable)
5. **Featured Image** - Dynamic article image (variable) - **Clickable**, links to LinkedIn article
6. **LinkedIn CTA** - Link to LinkedIn article (variable)
7. **Past Adventures** - Auto-generated list from `past-posts.json`
8. **Website CTA** - Link to montumia.com
9. **Unsubscribe Link** - Unique per-recipient secure unsubscribe URL

### Template Variables

| Variable             | Type              | Description                 | Example                                                                                  |
| -------------------- | ----------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| `lastEpisodeSummary` | string            | Previous episode summary    | "মন্টু মিয়া লোড ব্যালেন্সিং নিয়ে কাজ করছিলেন"                                          |
| `currentTopicTeaser` | string            | Current topic preview       | "ডাটাবেস রেপ্লিকেশনের সমস্যা"                                                            |
| `articleImageUrl`    | string            | Featured article image URL  | [https://montumia.com/og/sd/topic/image.png](https://montumia.com/og/sd/topic/image.png) |
| `linkedinArticleUrl` | string            | LinkedIn article short link | [https://lnkd.in/example](https://lnkd.in/example)                                       |
| `unsubscribeUrl`     | string (optional) | Unsubscribe page URL        | [https://montumia.com/unsubscribe](https://montumia.com/unsubscribe)                     |

## Styling & Theme

The email template uses the same color scheme as the main site (from `src/app/global.css`):

- **Primary Color**: `#f59e0b` (amber/yellow)
- **Background**: `#f9fafb` (light gray)
- **Text**: `#4b5563` (dark gray)
- **Headings**: `#1f2937` (near black)
- **Links**: `#f59e0b` (amber, matching primary)

### Email Client Compatibility

The template is designed to work across all major email clients:

- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Desktop, Web, Mobile)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird

**Key Compatibility Features:**

- Inline styles (no external CSS)
- Table-based layouts where needed
- Fallback fonts for Bengali text
- Centered content with max-width constraint
- Left-aligned links list for readability

## Workflow

### For Each Newsletter Issue

1. **Create/publish your article** on the website and LinkedIn
2. **Generate OG image** for the new article: `bun run generate-og`
3. **Update past posts** in `emails/data/past-posts.json`
4. **Update content variables** in `scripts/send-emails.ts`:
   ```typescript
   const EMAIL_CONTENT = {
     lastEpisodeSummary: "Previous topic summary",
     currentTopicTeaser: "New topic teaser",
     articleImageUrl: "https://montumia.com/og/sd/new-topic/image.png",
     linkedinArticleUrl: "https://lnkd.in/your-short-link",
   };
   ```
5. **Preview the email**: `bun run email:preview`
6. **Send test email**: `bun run send-emails`
7. **Check the email** in your inbox
8. **Update recipients** for bulk send (see below)
9. **Send to all subscribers**

### Sending to All Subscribers

The script automatically fetches all subscribers from your Resend audience:

```bash
bun run send-emails:all
```

**What happens:**

1. Fetches all contacts from `RESEND_SEGMENT_ID` audience
2. Shows preview of recipients (first 5)
3. Shows email details
4. **Asks for confirmation** - Type "yes" to proceed
5. Sends emails with 1-second delay between each
6. Each recipient gets a unique unsubscribe link

**Example output:**

```text
📬 ALL SUBSCRIBERS MODE
📡 Fetching subscribers from Resend audience...
✓ Found 27 subscriber(s)

==================================================
⚠️  You are about to send emails to 27 subscriber(s)
==================================================

Recipients preview (first 5):
  1. user1@example.com
  2. user2@example.com
  ...

⚠️  Are you sure you want to send to ALL subscribers?
Type "yes" to confirm, or anything else to cancel:
```

**Safety features:**

- Requires explicit "yes" confirmation
- Shows recipient count and preview before sending
- Any other input cancels the operation
- No emails sent if cancelled

## Environment Configuration

Required environment variables in `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_SEGMENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
UNSUBSCRIBE_SECRET=your_random_secret_key_here
```

Get API keys from your [Resend Dashboard](https://resend.com/api-keys).

Generate `UNSUBSCRIBE_SECRET` using:

```bash
openssl rand -hex 32
```

This secret is used to generate secure unsubscribe links for each recipient.

### Domain Verification

**Important:** Before sending emails, you must verify your domain in Resend.

The FROM email is set to `newsletter@montumia.com` in `scripts/send-emails.ts`.

To verify `montumia.com`:

1. Go to [Resend Dashboard → Domains](https://resend.com/domains)
2. Click "Add Domain" and enter `montumia.com`
3. Add the required DNS records to your domain registrar:
   - **SPF Record** (TXT) - Authorizes Resend to send on your behalf
   - **DKIM Record** (TXT) - Email authentication
   - **DMARC Record** (TXT) - Email policy (optional but recommended)
4. Wait for verification (usually 5-15 minutes)
5. Status will show "Verified" when ready

**For Testing**: You can temporarily use `onboarding@resend.dev` (no verification needed) by changing `FROM_EMAIL` in the script.

## Development

### Preview in Browser

The React Email dev server provides a live preview:

```bash
bun run email:preview
```

Features:

- Hot reload on file changes
- Preview with different content
- Responsive design testing
- Export HTML for debugging

### Modifying the Template

Edit `emails/newsletter-react.tsx`. The template uses React Email components:

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
  Hr,
} from "@react-email/components";
```

**Styling Tips:**

- Use inline styles via the `style` prop
- Define style objects outside the component for reusability
- Use TypeScript const assertions for text-align: `textAlign: "center" as const`
- Test in the preview server before sending

### Adding New Sections

Example: Add a "Featured Comment" section:

```tsx
{/* In newsletter-react.tsx, add after the main content */}
<Hr style={divider} />

<Heading style={h2}>পাঠকদের মন্তব্য</Heading>
<Text style={text}>
  "{featuredComment}" - {commentAuthor}
</Text>
```

Update the interface:

```typescript
interface NewsletterEmailProps {
  // ... existing props
  featuredComment?: string;
  commentAuthor?: string;
}
```

## Troubleshooting

### "RESEND_API_KEY environment variable is not set"

Make sure `.env.local` exists with your Resend API key:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### "Failed to load template"

Check that:

- The file exists at `emails/newsletter-react.tsx`
- No syntax errors in the React component
- All imports are correct

### "Failed to send" / Validation errors

Common issues:

- Invalid email addresses
- FROM email domain not verified in Resend
- Malformed HTML (check the preview first)
- Rate limiting (reduce sending speed)

### Email looks broken in certain clients

- Check the preview server for visual issues
- Test send to multiple email clients
- Ensure all styles are inline
- Avoid using `<style>` tags (not supported in many clients)
- Use tables for complex layouts if needed

### Past posts not showing

- Verify `emails/data/past-posts.json` exists and is valid JSON
- Check console output for "Loaded X past posts"
- Ensure the JSON array is not empty

## Best Practices

1. **Always Preview First** - Use `bun run email:preview` before sending
2. **Test Send** - Send to yourself first, check on multiple devices/clients
3. **Update Past Posts** - Keep the list current and relevant
4. **Use OG Images** - Generate proper OG images for visual consistency
5. **Short LinkedIn Links** - Use LinkedIn's URL shortener for tracking
6. **Bengali + English** - Mix languages appropriately for your audience
7. **Mobile First** - Most users will read on mobile, keep it simple
8. **Accessibility** - Use semantic HTML and alt text for images
9. **Unsubscribe** - Always include an easy way to unsubscribe
10. **Rate Limiting** - Don't send too fast (current: 1 email/second)

## Future Improvements

- [ ] Add personalization (first name in greeting)
- [ ] A/B testing for subject lines
- [ ] Email analytics tracking (open rates, click rates)
- [ ] Scheduled sending via cron job
- [ ] Multiple template variants (announcement, digest, etc.)
- [ ] Dark mode email support
- [ ] Interactive elements (polls, buttons)
- [ ] RSS-to-email automation
- [ ] Segment-based content customization
- [ ] Welcome email sequence for new subscribers

## Resources

- [React Email Documentation](https://react.email/docs)
- [Resend Documentation](https://resend.com/docs)
- [Email on Acid - Testing Tool](https://www.emailonacid.com/)
- [Can I Email - Compatibility Guide](https://www.caniemail.com/)
- [HTML Email Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
