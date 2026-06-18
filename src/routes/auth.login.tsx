import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, EmailField, PasswordField, GoogleButton, useAuthRedirect } from "@/components/auth/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — Craftfolio AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectAfter = useAuthRedirect();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    await redirectAfter();
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue building your career presence.">
      <GoogleButton label="Continue with Google" />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <EmailField value={email} onChange={setEmail} />
        <PasswordField value={password} onChange={setPassword} />
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground"><Checkbox /> Remember me</label>
          <Link to="/auth/forgot-password" className="text-foreground hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        New here? <Link to="/auth/signup" className="text-foreground hover:underline">Create account</Link>
      </div>
    </AuthShell>
  );
}
