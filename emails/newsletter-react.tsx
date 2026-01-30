import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface NewsletterEmailProps {
  lastEpisodeSummary?: string;
  currentTopicTeaser?: string;
  articleTitle?: string;
  articleImageUrl?: string;
  linkedinArticleUrl?: string;
  pastPosts?: Array<{ title: string; url: string }>;
  unsubscribeUrl?: string;
}

export const NewsletterEmail = ({
  lastEpisodeSummary = "মন্টু মিয়া লোড ব্যালেন্সিং নিয়ে কাজ করছিলেন",
  currentTopicTeaser = "ডাটাবেস রেপ্লিকেশনের সমস্যা",
  articleTitle = "ডাটাবেস রেপ্লিকেশনের সমস্যা",
  articleImageUrl = "https://montumia.com/og/sd/introduction/image.png",
  linkedinArticleUrl = "https://lnkd.in/example",
  pastPosts = [],
  unsubscribeUrl = "https://montumia.com/api/unsubscribe",
}: NewsletterEmailProps) => {
  return (
    <Html lang="bn">
      <Head />
      <Preview>মন্টু মিয়াঁর নতুন অভিযানে স্বাগতম</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/OG Image */}
          <Section style={logoSection}>
            <Img
              src="https://montumia.com/og.png"
              width="600"
              alt="মন্টু মিয়াঁর সিস্টেম ডিজাইন"
              style={logo}
            />
          </Section>

          {/* Main Title */}
          <Section style={content}>
            <Heading style={h1}>মন্টু মিয়াঁর নতুন অভিযানে স্বাগতম</Heading>

            {/* Last Episode Summary */}
            <Text style={text}>
              গত পর্বে আমরা দেখেছিলাম <strong>{lastEpisodeSummary}</strong>
            </Text>

            {/* Current Topic Teaser */}
            <Text style={text}>
              চলুন এবার দেখে আসি <strong>{currentTopicTeaser}</strong>
            </Text>

            {/* Article Featured Image */}
            <Section style={imageSection}>
              <Img
                src={articleImageUrl}
                width="560"
                alt="Article preview"
                style={articleImage}
              />
            </Section>

            {/* Article CTA */}
            <Text style={text}>
              আর্টিকেল টি লিঙ্কডইন থেকে পড়ুন এখনই:{" "}
              <Link href={linkedinArticleUrl} style={link}>
                {articleTitle}
              </Link>
            </Text>

            {/* Divider */}
            <Hr style={divider} />

            {/* Past Adventures Section */}
            <Heading style={h2}>পূর্বের অভিযানগুলো দেখুন লিঙ্কডইন থেকে</Heading>

            {pastPosts.length > 0 ? (
              <Section style={listSection}>
                {pastPosts.map((post, index) => (
                  <Text key={post.url} style={listItem}>
                    •{" "}
                    <Link href={post.url} style={link}>
                      {post.title}
                    </Link>
                  </Text>
                ))}
              </Section>
            ) : (
              <Text style={text}>আরও অভিযান নেই</Text>
            )}

            {/* Visit Website */}
            <Text style={text}>
              মন্টু মিয়ার সব অভিযানগুলো একসাথে পড়ুন এখান থেকে:{" "}
              <Link href="https://montumia.com" style={link}>
                montumia.com
              </Link>
            </Text>

            {/* Footer / Unsubscribe */}
            <Section style={footer}>
              <Text style={footerText}>
                © ২০২৬ মন্টু মিয়াঁর সিস্টেম ডিজাইন
              </Text>
              <Text style={footerText}>
                এই ইমেইলটি আপনি পাচ্ছেন কারণ আপনি আমাদের নিউজলেটারে সাবস্ক্রাইব
                করেছেন।
              </Text>
              <Text style={footerText}>
                <Link href={unsubscribeUrl} style={unsubscribeLink}>
                  Unsubscribe from this list
                </Link>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;

// Styles matching the theme from global.css
const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const logoSection = {
  padding: "20px 20px 0",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  borderRadius: "8px",
};

const content = {
  padding: "20px 40px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "30px 0 20px",
  lineHeight: "1.8",
};

const h2 = {
  color: "#1f2937",
  fontSize: "22px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "20px 0 15px",
  lineHeight: "1.8",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "16px 0",
};

const imageSection = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const articleImage = {
  margin: "0 auto",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const link = {
  color: "#f59e0b",
  textDecoration: "none",
  fontWeight: "500",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "30px 0",
};

const listSection = {
  margin: "20px 0",
};

const listItem = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.8",
  textAlign: "left" as const,
  margin: "8px 0",
  paddingLeft: "20px",
};

const footer = {
  marginTop: "40px",
  paddingTop: "20px",
  borderTop: "1px solid #e5e7eb",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "8px 0",
};

const unsubscribeLink = {
  color: "#6b7280",
  textDecoration: "underline",
  fontSize: "11px",
};
