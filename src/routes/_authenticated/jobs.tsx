import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({ meta: [{ title: "Job Tracker — Craftfolio AI" }] }),
  component: JobsPage,
});

const COLUMNS = [
  { id: "applied", label: "Applied" },
  { id: "assessment", label: "Assessment" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
] as const;

function JobsPage() {
  const qc = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", url: "" });
  const [active, setActive] = useState<string | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => (await supabase.from("job_applications").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { applied: [], assessment: [], interview: [], offer: [], rejected: [] };
    jobs?.forEach(j => g[j.status]?.push(j));
    return g;
  }, [jobs]);

  const onDragEnd = async (e: DragEndEvent) => {
    setActive(null);
    if (!e.over) return;
    const newStatus = e.over.id as string;
    const job = jobs?.find(j => j.id === e.active.id);
    if (!job || job.status === newStatus) return;
    await supabase.from("job_applications").update({ status: newStatus as any }).eq("id", job.id);
    qc.invalidateQueries({ queryKey: ["jobs"] });
  };

  const create = async () => {
    if (!form.company || !form.role) return toast.error("Company and role required");
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("job_applications").insert({ user_id: u.user!.id, ...form, status: "applied" });
    setOpen(false); setForm({ company: "", role: "", url: "" });
    qc.invalidateQueries({ queryKey: ["jobs"] });
  };
  const remove = async (id: string) => {
    await supabase.from("job_applications").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["jobs"] });
  };

  const activeJob = jobs?.find(j => j.id === active);

  return (
    <div>
      <PageHeader title="Job Tracker" description="A kanban for every application — drag to update status."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" />Track application</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New application</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Company</Label><Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Role</Label><Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>URL (optional)</Label><Input value={form.url} onChange={e => setForm({...form, url: e.target.value})} /></div>
              </div>
              <DialogFooter><Button onClick={create}>Add</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DndContext sensors={sensors} onDragStart={e => setActive(e.active.id as string)} onDragEnd={onDragEnd}>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {COLUMNS.map(col => (
            <Column key={col.id} id={col.id} label={col.label} count={grouped[col.id].length}>
              {grouped[col.id].map(j => <JobCard key={j.id} job={j} onDelete={() => remove(j.id)} />)}
            </Column>
          ))}
        </div>
        <DragOverlay>{activeJob && <JobCard job={activeJob} dragging />}</DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ id, label, count, children }: { id: string; label: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`rounded-xl border border-border/60 surface p-3 transition-colors ${isOver ? "border-primary/60 bg-card" : ""}`}>
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="text-xs font-semibold uppercase tracking-wider">{label}</div>
        <div className="text-xs text-muted-foreground">{count}</div>
      </div>
      <div className="space-y-2 min-h-[100px]">{children}</div>
    </div>
  );
}

function JobCard({ job, onDelete, dragging }: { job: any; onDelete?: () => void; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      className={`group rounded-lg border border-border/60 bg-background p-3 transition ${isDragging ? "opacity-30" : ""} ${dragging ? "shadow-xl" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{job.role}</div>
          <div className="truncate text-xs text-muted-foreground">{job.company}</div>
        </div>
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 transition group-hover:opacity-100">
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </div>
      {job.url && (
        <a href={job.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
          View posting <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
