"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { LOCALE_META, LOCALES, type Locale } from "@/lib/constants";
import { getDictionary } from "@/lib/dictionaries";

/**
 * Prominent flag-based language switcher for the landing page (top-right).
 * Shows the current locale's flag; clicking reveals every language with its
 * flag + label. Switching uses the Fumadocs i18n context (preserves the path).
 */
export function LanguageFlagDropdown({ className }: { className?: string }) {
  const { locale, onChange } = useI18n();
  const current = LOCALE_META[locale as Locale] ?? LOCALE_META.bn;
  const dict = getDictionary(locale ?? "bn");

  return (
    <Popover>
      <PopoverTrigger
        aria-label={dict.a11y.changeLanguage}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-2.5 py-1.5 shadow-sm backdrop-blur transition-colors hover:bg-accent cursor-pointer",
          className,
        )}
      >
        {/* biome-ignore lint/performance/noImgElement: tiny static local SVG flag, next/image is unnecessary overhead */}
        <img
          src={current.flag}
          alt=""
          aria-hidden
          width={24}
          height={16}
          className="rounded-[2px] ring-1 ring-black/10"
        />
        <ChevronDown className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-48 flex-col p-1">
        {LOCALES.map((l) => {
          const meta = LOCALE_META[l];
          const active = l === locale;
          return (
            <button
              key={l}
              type="button"
              onClick={() => onChange?.(l)}
              className={cn(
                "flex items-center gap-2.5 rounded-md p-2 text-sm text-start transition-colors",
                active
                  ? "bg-fd-primary/10 font-medium text-fd-primary"
                  : "hover:bg-accent",
              )}
            >
              {/* biome-ignore lint/performance/noImgElement: tiny static local SVG flag, next/image is unnecessary overhead */}
              <img
                src={meta.flag}
                alt=""
                aria-hidden
                width={22}
                height={15}
                className="shrink-0 rounded-[2px] ring-1 ring-black/10"
              />
              <span className="flex-1">{meta.label}</span>
              {active && <Check className="size-4 shrink-0" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
