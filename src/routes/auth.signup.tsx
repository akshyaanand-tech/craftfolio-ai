import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, EmailField, PasswordField, GoogleButton, useAuthRedirect } from "@/components/auth/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — Craftfolio AI" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectAfter = useAuthRedirect();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    await redirectAfter();
  };

  return (
    <AuthShell title="Create your account" subtitle="One platform for resumes, portfolios, and applications.">
      <GoogleButton label="Sign up with Google" />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
        </div>
        <EmailField value={email} onChange={setEmail} />
        <PasswordField value={password} onChange={setPassword} label="Password" autoComplete="new-password" />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/auth/login" className="text-foreground hover:underline">Sign in</Link>
      </div>
    </AuthShell>
  );
}
