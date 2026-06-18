import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio Builder — Craftfolio AI" }] }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const qc = useQueryClient();
  const { data: portfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      let { data } = await supabase.from("portfolios").select("*").maybeSingle();
      if (!data) {
        const ins = await supabase.from("portfolios").insert({ user_id: u.user!.id, hero: { title: "", subtitle: "" }, about: "", sections: [] }).select().single();
        data = ins.data!;
      }
      return data;
    },
  });
  const { data: projects } = useQuery({
    queryKey: ["user_projects"],
    queryFn: async () => (await supabase.from("user_projects").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await supabase.from("skills").select("*")).data ?? [],
  });

  const [hero, setHero] = useState<{ title: string; subtitle: string }>({ title: "", subtitle: "" });
  const [about, setAbout] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    if (portfolio) {
      const h = (portfolio.hero as any) ?? {};
      setHero({ title: h.title ?? "", subtitle: h.subtitle ?? "" });
      setAbout(portfolio.about ?? "");
      setContact(h.contact ?? "");
    }
  }, [portfolio]);

  const save = async () => {
    if (!portfolio) return;
    const { error } = await supabase.from("portfolios").update({ hero: { ...hero, contact }, about }).eq("id", portfolio.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const addProject = async () => {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("user_projects").insert({ user_id: u.user!.id, name: "New project", description: "" });
    qc.invalidateQueries({ queryKey: ["user_projects"] });
  };
  const delProject = async (id: string) => {
    await supabase.from("user_projects").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["user_projects"] });
  };
  const addSkill = async () => {
    const name = prompt("Skill name");
    if (!name) return;
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("skills").insert({ user_id: u.user!.id, name });
    qc.invalidateQueries({ queryKey: ["skills"] });
  };
  const delSkill = async (id: string) => {
    await supabase.from("skills").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["skills"] });
  };

  return (
    <div>
      <PageHeader title="Portfolio Builder" description="Edit your hero, about, projects, skills, and contact." action={<Button onClick={save}>Save changes</Button>} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <Card className="border-border/60 p-6">
            <div className="font-display text-sm font-semibold">Hero</div>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5"><Label>Title</Label><Input value={hero.title} onChange={e => setHero(h => ({...h, title: e.target.value}))} placeholder="Alex Chen" /></div>
              <div className="space-y-1.5"><Label>Subtitle</Label><Input value={hero.subtitle} onChange={e => setHero(h => ({...h, subtitle: e.target.value}))} placeholder="Building product engineering at Linear" /></div>
            </div>
          </Card>
          <Card className="border-border/60 p-6">
            <div className="font-display text-sm font-semibold">About</div>
            <Textarea className="mt-3 min-h-32" value={about} onChange={e => setAbout(e.target.value)} placeholder="A few sentences about you." />
          </Card>
          <Card className="border-border/60 p-6">
            <div className="flex items-center justify-between"><div className="font-display text-sm font-semibold">Projects</div><Button size="sm" variant="outline" onClick={addProject}><Plus className="mr-1 h-3.5 w-3.5" />Add</Button></div>
            <ul className="mt-3 space-y-2">
              {projects?.map(p => (
                <li key={p.id} className="flex items-center justify-between rounded-md border border-border/60 p-3">
                  <div><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.description || "No description"}</div></div>
                  <Button variant="ghost" size="icon" onClick={() => delProject(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </li>
              ))}
              {projects?.length === 0 && <div className="rounded-md border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">No projects yet</div>}
            </ul>
          </Card>
          <Card className="border-border/60 p-6">
            <div className="flex items-center justify-between"><div className="font-display text-sm font-semibold">Skills</div><Button size="sm" variant="outline" onClick={addSkill}><Plus className="mr-1 h-3.5 w-3.5" />Add</Button></div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills?.map(s => (
                <button key={s.id} onClick={() => delSkill(s.id)} className="rounded-md border border-border/60 bg-secondary px-2.5 py-1 text-xs hover:border-destructive hover:text-destructive">{s.name} ×</button>
              ))}
              {skills?.length === 0 && <div className="text-xs text-muted-foreground">No skills yet</div>}
            </div>
          </Card>
          <Card className="border-border/60 p-6">
            <div className="font-display text-sm font-semibold">Contact</div>
            <Input className="mt-3" value={contact} onChange={e => setContact(e.target.value)} placeholder="alex@craftfolio.ai" />
          </Card>
        </div>

        <div className="sticky top-20 self-start">
          <Card className="overflow-hidden border-border/60">
            <div className="border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">Live preview</div>
            <div className="relative aspect-[3/4] bg-background p-8">
              <div className="absolute inset-0 hero-gradient opacity-50" />
              <div className="relative">
                <div className="font-display text-3xl font-semibold">{hero.title || "Your name"}</div>
                <div className="mt-1 text-sm text-muted-foreground">{hero.subtitle || "What you do, in one sentence."}</div>
                <p className="mt-6 max-w-md text-sm">{about || "Your about story shows up here."}</p>
                <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-primary">Projects</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {projects?.slice(0,3).map(p => <li key={p.id}>· {p.name}</li>)}
                </ul>
                <div className="mt-4 flex flex-wrap gap-1">
                  {skills?.slice(0,8).map(s => <span key={s.id} className="rounded border border-border/60 px-2 py-0.5 text-xs">{s.name}</span>)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
