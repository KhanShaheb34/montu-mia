"use client";

import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { subscribeToNewsletter } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getDictionary } from "@/lib/dictionaries";

export function SubscribeModal({
  trigger,
  lang = "bn",
}: {
  trigger?: React.ReactNode;
  lang?: string;
}) {
  const t = getDictionary(lang).subscribe;
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("locale", lang);

    const result = await subscribeToNewsletter(formData);

    setLoading(false);

    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({
        text: t.success,
        type: "success",
      });
      setEmail("");
      setTimeout(() => setOpen(false), 2000);
    }
  };

  // Auto-scroll input into view when focused on mobile
  const handleInputFocus = () => {
    // Small delay to allow keyboard to appear first
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="secondary" size="lg" className="cursor-pointer">
            {t.trigger}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <label htmlFor="email" className="sr-only">
                {t.emailLabel}
              </label>
              <Input
                ref={inputRef}
                id="email"
                placeholder={t.placeholder}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleInputFocus}
                required
              />
            </div>
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-500"
              }`}
            >
              {message.text}
            </p>
          )}
          <DialogFooter className="sm:justify-start">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
