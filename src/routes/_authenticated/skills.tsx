import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Brain } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({ meta: [{ title: "Skill Insights — Craftfolio AI" }] }),
  component: SkillsPage,
});

function SkillsPage() {
  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await supabase.from("skills").select("*")).data ?? [],
  });

  const gaps = [
    { name: "System Design", have: 60 },
    { name: "Distributed Systems", have: 35 },
    { name: "Observability", have: 20 },
    { name: "Leadership", have: 55 },
  ];

  return (
    <div>
      <PageHeader title="Skill Insights" description="See where you stand against your target role." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 p-6">
          <div className="flex items-center gap-2 text-sm font-medium"><Brain className="h-4 w-4 text-primary" />Your skill stack</div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills?.length ? skills.map(s => (
              <span key={s.id} className="rounded-md border border-border/60 bg-secondary px-2.5 py-1 text-xs">{s.name}</span>
            )) : <div className="text-sm text-muted-foreground">Add skills in onboarding or your portfolio.</div>}
          </div>
        </Card>
        <Card className="border-border/60 p-6">
          <div className="text-sm font-medium">Gap to target role · Staff Engineer</div>
          <div className="mt-5 space-y-4">
            {gaps.map(g => (
              <div key={g.name}>
                <div className="flex justify-between text-xs"><span>{g.name}</span><span className="text-muted-foreground">{g.have}%</span></div>
                <Progress value={g.have} className="mt-1.5 h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
