# Unsubscribe System - Quick Reference

## Overview

The email system now includes a complete unsubscribe mechanism that works with all major email clients.

## How It Works

### For Recipients

1. **Email Header Button** (Modern Clients)
   - Gmail, Outlook, Apple Mail, etc. show an "Unsubscribe" button next to the sender
   - One-click unsubscribe - no need to open the email
   - Most convenient method

2. **Footer Link** (Fallback)
   - Every email has an unsubscribe link in the footer
   - Works in all email clients
   - Requires confirmation click

### For You (Sender)

Each email sent includes:

- **Unique URL**: `https://www.montumia.com/api/unsubscribe?email=user@example.com&hash=abc123`
- **Secure Hash**: Prevents unauthorized unsubscribes
- **Email Headers**: Standard RFC-compliant headers for email clients

## Email Headers Added

```
List-Unsubscribe: <https://www.montumia.com/api/unsubscribe?email=...&hash=...>, <mailto:unsubscribe@montumia.com?subject=Unsubscribe>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
Precedence: bulk
List-Id: Montu Mia System Design Newsletter <newsletter.montumia.com>
```

### What Each Header Does

- **List-Unsubscribe**: Tells email clients where to send unsubscribe requests (HTTP + mailto fallback)
- **List-Unsubscribe-Post**: Enables one-click unsubscribe (RFC 8058)
- **Precedence**: Marks email as bulk/mass mailing
- **List-Id**: Identifies the mailing list

## API Endpoint

### URL

`/api/unsubscribe`

### Supported Methods

**GET**: Show confirmation page

```
GET /api/unsubscribe?email=user@example.com&hash=abc123
```

**POST**: Process unsubscribe

```
POST /api/unsubscribe
Body: email=user@example.com&hash=abc123
```

### Response

**Success (GET)**:

- Shows confirmation page in Bengali
- User must click "হ্যাঁ, আনসাবস্ক্রাইব করুন" button

**Success (POST)**:

- Removes contact from Resend audience
- Shows success message
- Contact will no longer receive emails

**Error**:

- Invalid hash: Shows error page
- Missing parameters: Shows error page
- Server error: Returns JSON error

## Security

### Hash Generation

```typescript
// Generate hash for email
const secret = process.env.UNSUBSCRIBE_SECRET;
const hash = createHash("sha256")
  .update(email + secret)
  .digest("hex")
  .substring(0, 16);
```

### Verification

```typescript
// Verify hash matches email
function verifyEmailHash(email: string, hash: string): boolean {
  return generateEmailHash(email) === hash;
}
```

### Why This Is Secure

- Hash is generated using email + secret key
- Secret key is never sent to the client
- Cannot forge unsubscribe links without knowing the secret
- Each email has a unique hash
- Hash is deterministic (same email = same hash)

## Testing

### Test Unsubscribe Link

1. Send a test email:

   ```bash
   bun run send-emails
   ```

2. Check your inbox at shakirulhkhan@gmail.com

3. Look for "Unsubscribe" button in the email header (Gmail)

4. Or click the footer link

5. Confirm on the web page

6. Verify removal in Resend dashboard

### Test Locally

For local development, you can test the unsubscribe page:

```bash
# Start dev server
bun dev

# Generate test link
bun -e "
const crypto = require('crypto');
const email = 'test@example.com';
const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-me';
const hash = crypto.createHash('sha256').update(email + secret).digest('hex').substring(0, 16);
console.log(\`http://localhost:3000/api/unsubscribe?email=\${encodeURIComponent(email)}&hash=\${hash}\`);
"
```

Visit the generated URL to see the confirmation page.

## Email Client Support

### ✅ Full Support (One-Click Unsubscribe)

- Gmail (Web, iOS, Android)
- Outlook.com (Web)
- Apple Mail (macOS 10.15+, iOS 13+)
- Yahoo Mail

### ⚠️ Partial Support (Manual Link Only)

- Older Outlook desktop versions
- Some corporate email systems
- Custom email clients

### 🔄 Fallback

All clients can use the footer link as fallback.

## Troubleshooting

### Unsubscribe button doesn't appear

- Check email headers using "View Original" or "Show Original"
- Verify `List-Unsubscribe` and `List-Unsubscribe-Post` headers are present
- Some clients may take time to show the button
- Try the footer link instead

### Invalid hash error

- Verify `UNSUBSCRIBE_SECRET` is set correctly in `.env.local`
- Ensure the same secret is used for generation and verification
- Check if the URL was modified (copy-paste errors)

### Contact not removed from Resend

- Check Resend API logs for errors
- Verify `RESEND_SEGMENT_ID` is correct
- Ensure contact exists in the audience
- Check API key permissions

### Server error

- Check Next.js server logs
- Verify all environment variables are set
- Ensure Resend API is accessible
- Check if contact ID is valid

## Best Practices

1. **Always Test First**: Send to yourself before bulk sending
2. **Monitor Unsubscribes**: Check Resend dashboard regularly
3. **Respect Requests**: Never re-add unsubscribed contacts
4. **Keep Secret Safe**: Never commit `UNSUBSCRIBE_SECRET` to git
5. **Use HTTPS**: Always use secure URLs in production
6. **Log Removals**: Consider logging unsubscribe events for analytics
7. **Immediate Removal**: Process unsubscribes immediately (current implementation)
8. **Confirmation**: Show clear success message to users

## Compliance

This implementation follows:

- **RFC 2369**: The Use of URLs as Meta-Syntax for Core Mail List Commands
- **RFC 8058**: Signaling One-Click Functionality for List Email Headers
- **CAN-SPAM Act**: Requires clear unsubscribe mechanism
- **GDPR**: Right to withdraw consent

## Future Enhancements

- [ ] Add unsubscribe analytics/logging
- [ ] Support for unsubscribe preferences (daily/weekly digests)
- [ ] Re-subscription flow
- [ ] Unsubscribe reason collection
- [ ] Email templates for unsubscribe confirmation
- [ ] Webhook for unsubscribe events
- [ ] Admin dashboard for unsubscribe management
