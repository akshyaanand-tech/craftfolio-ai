import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/cover-letters")({
  head: () => ({ meta: [{ title: "Cover Letters — Craftfolio AI" }] }),
  component: CoverLettersPage,
});

function CoverLettersPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const { data: letters } = useQuery({
    queryKey: ["cl"],
    queryFn: async () => (await supabase.from("cover_letters").select("*").order("updated_at", { ascending: false })).data ?? [],
  });

  const active = letters?.find(l => l.id === selected) ?? letters?.[0];

  const create = async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("cover_letters").insert({ user_id: u.user!.id, title: "Untitled cover letter", content: "" }).select().single();
    if (error) return toast.error(error.message);
    setSelected(data.id);
    qc.invalidateQueries({ queryKey: ["cl"] });
  };
  const update = async (patch: any) => {
    if (!active) return;
    await supabase.from("cover_letters").update(patch).eq("id", active.id);
    qc.invalidateQueries({ queryKey: ["cl"] });
  };
  const remove = async (id: string) => {
    await supabase.from("cover_letters").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["cl"] });
  };

  return (
    <div>
      <PageHeader title="Cover Letters" description="Tailored letters per role, organized in your library." action={<Button onClick={create}><Plus className="mr-1.5 h-4 w-4" />New letter</Button>} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border-border/60 p-2">
          {letters && letters.length > 0 ? (
            <ul className="space-y-0.5">
              {letters.map(l => (
                <li key={l.id}>
                  <button onClick={() => setSelected(l.id)} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${active?.id === l.id ? "bg-secondary" : "hover:bg-secondary/60"}`}>
                    <span className="truncate">{l.title}</span>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); remove(l.id); }} />
                  </button>
                </li>
              ))}
            </ul>
          ) : <div className="p-6 text-center text-sm text-muted-foreground">No letters yet</div>}
        </Card>
        <Card className="border-border/60 p-6">
          {active ? (
            <div className="space-y-4">
              <Input className="border-0 px-0 font-display text-2xl font-semibold focus-visible:ring-0" defaultValue={active.title} onBlur={e => update({ title: e.target.value })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Company" defaultValue={active.company ?? ""} onBlur={e => update({ company: e.target.value })} />
                <Input placeholder="Role" defaultValue={active.role ?? ""} onBlur={e => update({ role: e.target.value })} />
              </div>
              <Textarea className="min-h-[400px] resize-none" placeholder="Dear hiring manager…" defaultValue={active.content ?? ""} onBlur={e => update({ content: e.target.value })} />
            </div>
          ) : <div className="py-24 text-center text-sm text-muted-foreground">Select or create a cover letter</div>}
        </Card>
      </div>
    </div>
  );
}
