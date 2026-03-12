#!/usr/bin/env bun

import { SESv2Client, ListContactsCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION ?? "eu-west-1",
});
const CONTACT_LIST = process.env.SES_CONTACT_LIST_NAME;
if (!CONTACT_LIST) {
  console.error(
    "❌ Error: SES_CONTACT_LIST_NAME environment variable is not set",
  );
  process.exit(1);
}

interface Contact {
  email: string;
  lastUpdated: Date;
}

async function getAllContacts(): Promise<Contact[]> {
  const contacts: Contact[] = [];
  let nextToken: string | undefined;

  do {
    const response = await sesClient.send(
      new ListContactsCommand({
        ContactListName: CONTACT_LIST,
        Filter: { FilteredStatus: "OPT_IN" },
        NextToken: nextToken,
      }),
    );

    for (const c of response.Contacts ?? []) {
      if (c.EmailAddress) {
        contacts.push({
          email: c.EmailAddress,
          lastUpdated: c.LastUpdatedTimestamp ?? new Date(0),
        });
      }
    }
    nextToken = response.NextToken;
    if (nextToken) {
      await new Promise((r) => setTimeout(r, 500));
    }
  } while (nextToken);

  return contacts;
}

async function main() {
  const count = Number.parseInt(process.argv[2] || "10", 10);

  if (process.argv[2] === "--help" || process.argv[2] === "-h") {
    console.log("Usage: bun run list-subscribers [count]");
    console.log("  count  Number of latest subscribers to show (default: 10)");
    process.exit(0);
  }

  console.log(`Fetching subscribers from ${CONTACT_LIST}...\n`);

  const contacts = await getAllContacts();
  contacts.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

  console.log(`Total subscribers: ${contacts.length}\n`);
  console.log(`Latest ${Math.min(count, contacts.length)} subscriber(s):`);
  console.log("-".repeat(50));

  for (const c of contacts.slice(0, count)) {
    const date = c.lastUpdated.toISOString().split("T")[0];
    console.log(`  ${date}  ${c.email}`);
  }
}

main();
