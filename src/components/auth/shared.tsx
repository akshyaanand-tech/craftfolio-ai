import { useState, type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";

export function AuthShell({ title, subtitle, children, side }: { title: string; subtitle: string; children: ReactNode; side?: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col px-6 py-8">
        <Logo />
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            <h1 className="font-display text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8 space-y-4">{children}</div>
          </motion.div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-border/60 surface md:block">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative flex h-full items-center justify-center p-12">
          {side ?? <DefaultSide />}
        </div>
      </div>
    </div>
  );
}

function DefaultSide() {
  return (
    <div className="max-w-md">
      <div className="rounded-2xl border border-border/60 bg-card/60 p-6 card-shadow backdrop-blur">
        <div className="text-xs uppercase tracking-wider text-primary">Today on Craftfolio</div>
        <div className="mt-3 font-display text-2xl font-semibold">"Got 4 interviews in 2 weeks."</div>
        <div className="mt-4 text-sm text-muted-foreground">— Maya R., Software Engineer at Stripe</div>
      </div>
    </div>
  );
}

export function GoogleButton({ label }: { label: string }) {
  const handler = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error("Google sign-in failed");
  };
  return (
    <Button variant="outline" type="button" onClick={handler} className="w-full">
      <GoogleIcon /> {label}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"/></svg>
  );
}

export function useAuthRedirect() {
  const router = useRouter();
  return async () => {
    const { data: prof } = await supabase.from("profiles").select("onboarding_completed").maybeSingle();
    router.navigate({ to: prof?.onboarding_completed ? "/dashboard" : "/onboarding" });
  };
}

export function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" autoComplete="email" required value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export function PasswordField({ value, onChange, label = "Password", autoComplete = "current-password" }: { value: string; onChange: (v: string) => void; label?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={autoComplete}>{label}</Label>
      <div className="relative">
        <Input id={autoComplete} type={show ? "text" : "password"} autoComplete={autoComplete} required minLength={6} value={value} onChange={e => onChange(e.target.value)} />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">{show ? "Hide" : "Show"}</button>
      </div>
    </div>
  );
}

export { Link };
