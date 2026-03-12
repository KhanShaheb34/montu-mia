#!/usr/bin/env bun

import { SESv2Client, ListContactsCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION ?? "eu-west-1",
});
const CONTACT_LIST =
  process.env.SES_CONTACT_LIST_NAME ?? "montu-mia-subscribers";

interface Contact {
  email: string;
  createdAt: Date;
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
          createdAt: c.LastUpdatedTimestamp ?? new Date(0),
        });
      }
    }
    nextToken = response.NextToken;
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
  contacts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  console.log(`Total subscribers: ${contacts.length}\n`);
  console.log(`Latest ${Math.min(count, contacts.length)} subscriber(s):`);
  console.log("-".repeat(50));

  for (const c of contacts.slice(0, count)) {
    const date = c.createdAt.toISOString().split("T")[0];
    console.log(`  ${date}  ${c.email}`);
  }
}

main();
