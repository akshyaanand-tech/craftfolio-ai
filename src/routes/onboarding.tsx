import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth/login" });
  },
  head: () => ({ meta: [{ title: "Welcome — Craftfolio AI" }] }),
  component: Onboarding,
});

const STEPS = ["Career path", "Education", "Skills", "Experience", "Projects", "Career goals"];

function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    career_path: "", school: "", degree: "", skills: "", company: "", role: "",
    project: "", target_role: "", target_industry: "", timeline: "6 months",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const set = (k: keyof typeof data) => (v: string) => setData(d => ({ ...d, [k]: v }));

  const finish = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user!.id;
    await supabase.from("profiles").update({ career_path: data.career_path, onboarding_completed: true }).eq("id", uid);
    if (data.school) await supabase.from("education").insert({ user_id: uid, school: data.school, degree: data.degree });
    if (data.skills) await supabase.from("skills").insert(data.skills.split(",").map(s => ({ user_id: uid, name: s.trim() })).filter(s => s.name));
    if (data.company) await supabase.from("experiences").insert({ user_id: uid, company: data.company, role: data.role });
    if (data.project) await supabase.from("user_projects").insert({ user_id: uid, name: data.project });
    if (data.target_role) await supabase.from("career_goals").insert({ user_id: uid, target_role: data.target_role, target_industry: data.target_industry, timeline: data.timeline });
    toast.success("You're all set");
    router.navigate({ to: "/dashboard" });
  };

  const next = () => step < STEPS.length - 1 ? setStep(s => s + 1) : finish();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo />
          <button onClick={finish} className="text-sm text-muted-foreground hover:text-foreground">Skip for now</button>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {step + 1} of {STEPS.length}</div>
          <div className="mt-2 flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="font-display text-3xl font-semibold">{questionFor(step)}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitleFor(step)}</p>
            <div className="mt-8 space-y-4">
              {step === 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {["Software Engineering","Product Design","Data Science","Product Management","Marketing","Other"].map(c => (
                    <button key={c} type="button" onClick={() => set("career_path")(c)}
                      className={`rounded-lg border p-4 text-left text-sm transition ${data.career_path === c ? "border-primary bg-card" : "border-border/60 hover:border-border"}`}>
                      <div className="flex items-center justify-between"><span>{c}</span>{data.career_path === c && <Check className="h-4 w-4 text-primary" />}</div>
                    </button>
                  ))}
                </div>
              )}
              {step === 1 && (
                <>
                  <Field label="School"><Input value={data.school} onChange={e => set("school")(e.target.value)} placeholder="Stanford University" /></Field>
                  <Field label="Degree"><Input value={data.degree} onChange={e => set("degree")(e.target.value)} placeholder="B.S. Computer Science" /></Field>
                </>
              )}
              {step === 2 && (
                <Field label="Top skills (comma-separated)">
                  <Input value={data.skills} onChange={e => set("skills")(e.target.value)} placeholder="React, TypeScript, System Design" />
                </Field>
              )}
              {step === 3 && (
                <>
                  <Field label="Most recent company"><Input value={data.company} onChange={e => set("company")(e.target.value)} placeholder="Linear" /></Field>
                  <Field label="Role"><Input value={data.role} onChange={e => set("role")(e.target.value)} placeholder="Product Engineer" /></Field>
                </>
              )}
              {step === 4 && (
                <Field label="A project you're proud of">
                  <Input value={data.project} onChange={e => set("project")(e.target.value)} placeholder="Built a real-time collaboration editor" />
                </Field>
              )}
              {step === 5 && (
                <>
                  <Field label="Target role"><Input value={data.target_role} onChange={e => set("target_role")(e.target.value)} placeholder="Staff Engineer" /></Field>
                  <Field label="Target industry"><Input value={data.target_industry} onChange={e => set("target_industry")(e.target.value)} placeholder="Developer tools" /></Field>
                  <Field label="Timeline"><Input value={data.timeline} onChange={e => set("timeline")(e.target.value)} placeholder="6 months" /></Field>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button onClick={next} disabled={saving}>
            {step === STEPS.length - 1 ? "Finish" : "Continue"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function questionFor(s: number) {
  return ["What's your career path?", "Where did you study?", "What are your top skills?", "Where do you work?", "What have you built?", "Where are you headed?"][s];
}
function subtitleFor(s: number) {
  return ["This helps us tailor templates and suggestions.", "Add your most recent education.", "Pick a handful — you can add more later.", "Your most recent role is enough for now.", "One standout project is enough.", "We'll align your resume and portfolio with this."][s];
}
