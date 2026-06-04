"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LOCALE_META, LOCALES } from "@/lib/constants";
import { getDictionary } from "@/lib/dictionaries";

// Compact language switcher for the docs sidebar (ghost icon + popover).
export function LanguageToggle() {
  const { locale, onChange } = useI18n();
  const dict = getDictionary(locale ?? "bn");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label={dict.a11y.changeLanguage}
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-44 flex-col p-1">
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
                  : "hover:bg-fd-accent hover:text-fd-accent-foreground",
              )}
            >
              {/* biome-ignore lint/performance/noImgElement: tiny static local SVG flag, next/image is unnecessary overhead */}
              <img
                src={meta.flag}
                alt=""
                aria-hidden
                width={20}
                height={14}
                className="shrink-0 rounded-[2px] ring-1 ring-black/10"
              />
              {meta.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
