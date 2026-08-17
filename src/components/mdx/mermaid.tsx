"use client";

import { use, useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";

export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;
  return <MermaidContent chart={chart} />;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(
  key: string,
  setPromise: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(
    cachePromise("mermaid", () => import("mermaid")),
  );

  const isDark = resolvedTheme === "dark";
  const renderId = id.replace(/:/g, "_");

  const { svg, bindFunctions } = use(
    cachePromise(`${renderId}-${chart}-${resolvedTheme}`, () => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        fontFamily: "var(--font-bricolage), var(--font-bengali), sans-serif",
        themeCSS: "margin: 1.5rem auto 0;",
        look: "handDrawn",
        theme: "base",
        darkMode: isDark,
        themeVariables: isDark
          ? {
              darkMode: true,
              background: "transparent",
              primaryColor: "#27272a",
              primaryTextColor: "#f4f4f5",
              primaryBorderColor: "#52525b",
              lineColor: "#a1a1aa",
              secondaryColor: "#3f3f46",
              tertiaryColor: "#27272a",
              secondaryTextColor: "#e4e4e7",
              secondaryBorderColor: "#71717a",
              tertiaryTextColor: "#d4d4d8",
              tertiaryBorderColor: "#52525b",
              noteBkgColor: "#27272a",
              noteTextColor: "#f4f4f5",
              noteBorderColor: "#52525b",
              actorBkg: "#27272a",
              actorTextColor: "#f4f4f5",
              actorLineColor: "#a1a1aa",
              signalColor: "#f4f4f5",
              signalTextColor: "#f4f4f5",
              labelBoxBkgColor: "#27272a",
              labelBoxBorderColor: "#52525b",
              labelTextColor: "#f4f4f5",
              loopTextColor: "#f4f4f5",
              activationBorderColor: "#71717a",
              activationBkgColor: "#3f3f46",
              sequenceNumberColor: "#18181b",
              edgeLabelBackground: "#18181b",
              nodeTextColor: "#f4f4f5",
              clusterBkg: "#18181b",
              clusterBorder: "#3f3f46",
            }
          : {
              darkMode: false,
              background: "transparent",
              primaryColor: "#f4f4f5",
              primaryTextColor: "#18181b",
              primaryBorderColor: "#d4d4d8",
              lineColor: "#52525b",
              secondaryColor: "#e4e4e7",
              tertiaryColor: "#f4f4f5",
              secondaryTextColor: "#27272a",
              secondaryBorderColor: "#a1a1aa",
              tertiaryTextColor: "#3f3f46",
              tertiaryBorderColor: "#d4d4d8",
              noteBkgColor: "#fef9c3",
              noteTextColor: "#854d0e",
              noteBorderColor: "#fde047",
              actorBkg: "#f4f4f5",
              actorTextColor: "#18181b",
              actorLineColor: "#52525b",
              signalColor: "#18181b",
              signalTextColor: "#18181b",
              labelBoxBkgColor: "#f4f4f5",
              labelBoxBorderColor: "#d4d4d8",
              labelTextColor: "#18181b",
              loopTextColor: "#18181b",
              activationBorderColor: "#a1a1aa",
              activationBkgColor: "#e4e4e7",
              sequenceNumberColor: "#ffffff",
              edgeLabelBackground: "#ffffff",
              nodeTextColor: "#18181b",
              clusterBkg: "#fafafa",
              clusterBorder: "#e4e4e7",
            },
      });

      return mermaid.render(renderId, chart.replaceAll("\\n", "\n"));
    }),
  );

  return (
    <div
      ref={(container) => {
        if (container) bindFunctions?.(container);
      }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for mermaid
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
