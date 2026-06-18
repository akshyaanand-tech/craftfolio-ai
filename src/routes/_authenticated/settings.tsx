import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Craftfolio AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/auth/login", replace: true });
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Account, appearance, and security." />
      <div className="space-y-4">
        <Card className="border-border/60 p-6">
          <Row label="Theme" desc="Switch between dark and light appearance.">
            <div className="flex gap-2">
              {(["dark","light"] as const).map(t => (
                <Button key={t} variant={theme === t ? "default" : "outline"} size="sm" onClick={() => setTheme(t)} className="capitalize">{t}</Button>
              ))}
            </div>
          </Row>
        </Card>
        <Card className="border-border/60 p-6">
          <Row label="Email" desc="The email address used for sign-in.">
            <span className="text-sm text-muted-foreground">Managed via your account</span>
          </Row>
        </Card>
        <Card className="border-border/60 p-6">
          <Row label="Security" desc="Update your password from the reset flow.">
            <Button variant="outline" size="sm" onClick={async () => {
              const { data: u } = await supabase.auth.getUser();
              if (!u.user?.email) return;
              await supabase.auth.resetPasswordForEmail(u.user.email, { redirectTo: window.location.origin + "/auth/reset-password" });
              toast.success("Reset link sent");
            }}>Send reset link</Button>
          </Row>
        </Card>
        <Card className="border-destructive/30 p-6">
          <Row label="Sign out" desc="End your session on this device.">
            <Button variant="destructive" size="sm" onClick={signOut}>Sign out</Button>
          </Row>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {children}
    </div>
  );
}
