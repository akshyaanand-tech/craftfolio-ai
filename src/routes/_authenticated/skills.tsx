import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Brain, Sparkles, AlertCircle, BookOpen, Layers, Code, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({ meta: [{ title: "Skill Insights — Craftfolio AI" }] }),
  component: SkillsPage,
});

function SkillsPage() {
  const [company, setCompany] = useState("Linear");
  const [role, setRole] = useState("Staff Engineer");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await supabase.from("skills").select("*")).data ?? [],
  });

  const handleGenerate = async () => {
    if (!company || !role) {
      return toast.error("Please fill in target company and role");
    }
    setLoading(true);
    try {
      const skillsList = skills?.map(s => s.name) || [];
      const res = await fetch("/api/skills/gap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("cf-access-token") || ""}`,
        },
        body: JSON.stringify({
          company,
          role,
          currentSkills: skillsList,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to generate roadmap");
      } else {
        setReport(data);
        toast.success("Gap analysis complete!");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Skill Insights" description="Analyze your skills against any target company & role to build an AI learning roadmap." />

      <Card className="border-border/60 p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end">
          <div className="space-y-1.5">
            <Label htmlFor="company">Target Company</Label>
            <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Stripe, Google, Linear" disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Target Role</Label>
            <Input id="role" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer" disabled={loading} />
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto h-10">
            <Brain className="mr-1.5 h-4 w-4" />
            {loading ? "Analyzing..." : "Generate Roadmap"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-border/60 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers className="h-4 w-4 text-primary" />
              Your Skill Stack
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills?.length ? (
                skills.map(s => (
                  <span key={s.id} className="rounded-md border border-border/60 bg-secondary px-2.5 py-1 text-xs">
                    {s.name}
                  </span>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Add skills in onboarding or your portfolio.</div>
              )}
            </div>
          </Card>

          {report && (
            <>
              <Card className="border-border/60 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Suggested Technologies
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {report.technologies?.map((tech: string, idx: number) => (
                    <span key={idx} className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="border-border/60 p-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Code className="h-4 w-4 text-primary" />
                  Suggested Projects
                </div>
                <div className="mt-4 space-y-4">
                  {report.projects?.map((proj: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-border/60 bg-secondary/30 p-4 space-y-2">
                      <div className="text-sm font-semibold">{proj.title}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{proj.description}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.tech?.map((t: string, i: number) => (
                          <span key={i} className="rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 p-6">
            <div className="text-sm font-medium">
              Gap to Target Role · {role} at {company}
            </div>
            <div className="mt-5 space-y-4">
              {report?.missing_skills ? (
                report.missing_skills.map((skill: string, idx: number) => {
                  // Simulate progress bars for missing skills
                  const progressVal = 30 + (idx * 15) % 55;
                  return (
                    <div key={skill} className="animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3 text-amber-500" />
                          {skill}
                        </span>
                        <span className="text-muted-foreground">{progressVal}% Match</span>
                      </div>
                      <Progress value={progressVal} className="mt-1.5 h-1.5" />
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground py-2">
                  Enter target role & company to view skill match ratings.
                </div>
              )}
            </div>
          </Card>

          {report?.roadmap && (
            <Card className="border-border/60 p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Step-by-Step Learning Roadmap
              </div>
              <div className="mt-5 relative border-l border-border pl-4 space-y-6 ml-2">
                {report.roadmap.map((step: any, idx: number) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider">{step.step}</div>
                    <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.details}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

