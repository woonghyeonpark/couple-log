import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, emoji, color")
    .eq("id", auth.user.id)
    .single();

  return (
    <div className="flex flex-col gap-6 py-2">
      <h2 className="text-xl font-bold">설정</h2>
      {profile ? (
        <SettingsForm profile={profile} />
      ) : (
        <p className="text-sm text-red-500">프로필을 불러오지 못했어요.</p>
      )}
      <form action={logout}>
        <Button type="submit" variant="outline" className="w-full">로그아웃</Button>
      </form>
    </div>
  );
}
