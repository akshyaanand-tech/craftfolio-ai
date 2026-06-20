import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink, Kanban, BarChart3, Clock, TrendingUp, Award, ClipboardCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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
  const [view, setView] = useState<"kanban" | "stats" | "timeline">("kanban");

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => (await supabase.from("job_applications").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { applied: [], assessment: [], interview: [], offer: [], rejected: [] };
    jobs?.forEach(j => g[j.status]?.push(j));
    return g;
  }, [jobs]);

  const statsData = useMemo(() => {
    return COLUMNS.map(col => ({
      name: col.label,
      count: grouped[col.id]?.length || 0,
    }));
  }, [grouped]);

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

  const totalApps = jobs?.length || 0;
  const interviewsCount = (grouped.interview?.length || 0) + (grouped.offer?.length || 0);
  const offersCount = grouped.offer?.length || 0;
  const interviewRate = totalApps > 0 ? Math.round((interviewsCount / totalApps) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Job Tracker" description="Track your applications and build your interview pipeline."
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

      <div className="flex border-b border-border/60 pb-px gap-2">
        <Button variant={view === "kanban" ? "secondary" : "ghost"} size="sm" onClick={() => setView("kanban")} className="h-8 rounded-md px-3 text-xs">
          <Kanban className="mr-1.5 h-3.5 w-3.5" /> Board
        </Button>
        <Button variant={view === "stats" ? "secondary" : "ghost"} size="sm" onClick={() => setView("stats")} className="h-8 rounded-md px-3 text-xs">
          <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Analytics
        </Button>
        <Button variant={view === "timeline" ? "secondary" : "ghost"} size="sm" onClick={() => setView("timeline")} className="h-8 rounded-md px-3 text-xs">
          <Clock className="mr-1.5 h-3.5 w-3.5" /> Timeline
        </Button>
      </div>

      {view === "kanban" && (
        <DndContext sensors={sensors} onDragStart={e => setActive(e.active.id as string)} onDragEnd={onDragEnd}>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            {COLUMNS.map(col => (
              <Column key={col.id} id={col.id} label={col.label} count={grouped[col.id]?.length || 0}>
                {grouped[col.id]?.map(j => <JobCard key={j.id} job={j} onDelete={() => remove(j.id)} />)}
              </Column>
            ))}
          </div>
          <DragOverlay>{activeJob && <JobCard job={activeJob} dragging />}</DragOverlay>
        </DndContext>
      )}

      {view === "stats" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Total Applications
                <ClipboardCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-display font-semibold">{totalApps}</div>
              <div className="text-xs text-muted-foreground">Active in pipeline</div>
            </Card>
            <Card className="border-border/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Interviews Secured
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-display font-semibold">{interviewsCount}</div>
              <div className="text-xs text-muted-foreground">{interviewRate}% Response rate</div>
            </Card>
            <Card className="border-border/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Offers Received
                <Award className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-3xl font-display font-semibold">{offersCount}</div>
              <div className="text-xs text-muted-foreground">Success rate of {totalApps > 0 ? Math.round((offersCount / totalApps) * 100) : 0}%</div>
            </Card>
            <Card className="border-border/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Rejections
                <ClipboardCheck className="h-4 w-4 text-destructive" />
              </div>
              <div className="text-3xl font-display font-semibold">{grouped.rejected?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Learning opportunities</div>
            </Card>
          </div>

          <Card className="border-border/60 p-6">
            <div className="text-sm font-medium mb-4">Pipeline Distribution</div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} labelStyle={{ color: '#a1a1aa' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statsData.map((entry, index) => {
                      const colors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {view === "timeline" && (
        <Card className="border-border/60 p-6">
          <div className="text-sm font-medium mb-6">Application Timeline Log</div>
          {jobs && jobs.length > 0 ? (
            <div className="relative border-l border-border pl-4 space-y-6 ml-2">
              {jobs.map((job) => (
                <div key={job.id} className="relative animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className={`absolute -left-[22px] top-1.5 h-4 w-4 rounded-full border-2 bg-background flex items-center justify-center ${
                    job.status === 'offer' ? 'border-emerald-500' :
                    job.status === 'interview' ? 'border-yellow-500' :
                    job.status === 'rejected' ? 'border-destructive' :
                    'border-primary'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      job.status === 'offer' ? 'bg-emerald-500' :
                      job.status === 'interview' ? 'bg-yellow-500' :
                      job.status === 'rejected' ? 'bg-destructive' :
                      'bg-primary'
                    }`} />
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {job.applied_at ? new Date(job.applied_at).toLocaleDateString() : new Date(job.created_at).toLocaleDateString()}
                    </div>
                    <div className="mt-1 text-sm font-semibold">{job.role} at {job.company}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border ${
                        job.status === 'offer' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        job.status === 'interview' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        job.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        job.status === 'assessment' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {job.status}
                      </span>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                          Job link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No applications tracked yet. Click "Track application" above.
            </div>
          )}
        </Card>
      )}
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
      <div className="space-y-2 min-h-[150px]">{children}</div>
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

