import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-8 px-6">
      <div className="text-center">
        <div className="text-5xl">💑</div>
        <h1 className="mt-3 text-2xl font-bold">우리의 캘린더</h1>
        <p className="mt-1 text-sm text-foreground/60">둘만의 기록을 시작해요</p>
      </div>
      <LoginForm />
    </main>
  );
}
