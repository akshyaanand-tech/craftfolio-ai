import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, EmailField } from "@/components/auth/shared";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Craftfolio AI" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/auth/reset-password" });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  return (
    <AuthShell title="Reset your password" subtitle="We'll send a secure link to your inbox.">
      {sent ? (
        <div className="rounded-lg border border-border/60 bg-card/60 p-4 text-sm">
          Check <span className="font-medium">{email}</span> for the reset link.
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <EmailField value={email} onChange={setEmail} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
      <div className="text-center text-sm text-muted-foreground">
        <Link to="/auth/login" className="text-foreground hover:underline">Back to sign in</Link>
      </div>
    </AuthShell>
  );
}
