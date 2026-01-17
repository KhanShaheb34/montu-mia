"use client";

import { useState, useRef } from "react";
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
import { subscribeToNewsletter } from "@/app/actions";
import { Loader2 } from "lucide-react";

export function SubscribeModal() {
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

    const result = await subscribeToNewsletter(formData);

    setLoading(false);

    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({
        text: "ধন্যবাদ! সফলভাবে সাবস্ক্রাইব করা হয়েছে।",
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
        <Button variant="secondary" size="lg" className="cursor-pointer">
          সাবস্ক্রাইব করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>আপডেট পেতে সাবস্ক্রাইব করুন</DialogTitle>
          <DialogDescription>
            নতুন অধ্যায় রিলিজ হলে আমরা আপনাকে ইমেইলে জানিয়ে দিব।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                ref={inputRef}
                id="email"
                placeholder="name@example.com"
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
              সাবস্ক্রাইব
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
