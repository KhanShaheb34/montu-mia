// No metadata export here: Next merges `openGraph` SHALLOWLY, so re-declaring
// it (even just `images`) would wipe the per-locale og:locale/siteName/url set
// in [lang]/layout.tsx. The root layout already provides /og.webp images.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
