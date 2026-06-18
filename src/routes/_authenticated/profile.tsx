import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Craftfolio AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const [form, setForm] = useState({ full_name: "", headline: "", career_path: "" });
  useEffect(() => { if (profile) setForm({ full_name: profile.full_name ?? "", headline: profile.headline ?? "", career_path: profile.career_path ?? "" }); }, [profile]);

  const save = async () => {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update(form).eq("id", profile.id);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const initials = (form.full_name || "U").split(" ").map(s => s[0]).slice(0,2).join("");

  return (
    <div>
      <PageHeader title="Profile" description="The information that powers your resumes and portfolio." action={<Button onClick={save}>Save</Button>} />
      <Card className="border-border/60 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-br from-primary to-accent font-display text-lg text-primary-foreground">{initials}</AvatarFallback></Avatar>
          <div>
            <div className="font-display text-xl font-semibold">{form.full_name || "Your name"}</div>
            <div className="text-sm text-muted-foreground">{form.headline || "Add a one-line headline"}</div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Field label="Full name"><Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></Field>
          <Field label="Headline"><Input value={form.headline} onChange={e => setForm({...form, headline: e.target.value})} placeholder="Senior Product Engineer" /></Field>
          <Field label="Career path"><Input value={form.career_path} onChange={e => setForm({...form, career_path: e.target.value})} /></Field>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
