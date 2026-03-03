#!/usr/bin/env bun
/**
 * One-time migration script: imports Resend subscriber export into SES contact list.
 * Run AFTER creating the SES contact list (Step 4).
 *
 * Usage:
 *   bun run scripts/migrate-to-ses.ts resend-subscribers-export.json
 */

import {
  SESv2Client,
  CreateContactCommand,
  AlreadyExistsException,
} from "@aws-sdk/client-sesv2";
import { readFileSync } from "fs";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});
const CONTACT_LIST =
  process.env.SES_CONTACT_LIST_NAME ?? "montu-mia-subscribers";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error(
      "Usage: bun run scripts/migrate-to-ses.ts <resend-export.json>",
    );
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(file, "utf-8"));
  // Resend export structure: { data: { data: [ { email, first_name, ... } ] } }
  const contacts: { email: string }[] = raw?.data?.data ?? raw?.data ?? raw;

  console.log(
    `Importing ${contacts.length} contacts into SES list: ${CONTACT_LIST}`,
  );

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      await sesClient.send(
        new CreateContactCommand({
          ContactListName: CONTACT_LIST,
          EmailAddress: contact.email,
        }),
      );
      success++;
      console.log(`  ✓ ${contact.email}`);
    } catch (err) {
      if (err instanceof AlreadyExistsException) {
        skipped++;
      } else {
        failed++;
        console.error(`  ✗ ${contact.email}: ${err}`);
      }
    }
    // Stay under SES API rate limits (1 request/second)
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log(
    `\nDone: ${success} imported, ${skipped} already existed, ${failed} failed`,
  );
}

main();
