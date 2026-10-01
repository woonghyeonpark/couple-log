"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const COLORS = ["#F4A6A6", "#F6C28B", "#F2E08C", "#A8D8B9", "#A5CBEF", "#C6B5E8"];

type Profile = { id: string; display_name: string; emoji: string; color: string };

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.display_name);
  const [emoji, setEmoji] = useState(profile.emoji);
  const [color, setColor] = useState(profile.color);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const { error } = await createClient()
      .from("profiles")
      .update({ display_name: name.trim() || "나", emoji: emoji.trim() || "🙂", color })
      .eq("id", profile.id);
    setStatus(error ? "error" : "saved");
    if (!error) router.refresh();
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">이름</Label>
        <Input id="name" value={name} maxLength={12} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="emoji">이모지</Label>
        <Input id="emoji" value={emoji} maxLength={4} onChange={(e) => setEmoji(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>내 색상</Label>
        <div className="flex gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`색상 ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={cn("h-10 w-10 rounded-full border-2", color === c ? "border-foreground" : "border-transparent")}
            />
          ))}
        </div>
      </div>
      <Button type="submit" disabled={status === "saving"}>{status === "saving" ? "저장 중…" : "저장"}</Button>
      {status === "saved" && <p className="text-sm text-foreground/60">저장했어요 ✅</p>}
      {status === "error" && <p role="alert" className="text-sm text-red-500">저장하지 못했어요. 다시 시도해 주세요.</p>}
    </form>
  );
}
