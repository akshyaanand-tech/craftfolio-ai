import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, FileText, MoreVertical, Download, Copy, Trash2, Pencil } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/resumes")({
  head: () => ({ meta: [{ title: "My Resumes — Craftfolio AI" }] }),
  component: ResumesPage,
});

const TEMPLATES = ["modern","classic","minimal","editorial"];

function ResumesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("modern");

  const { data: resumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => (await supabase.from("resumes").select("*").order("updated_at", { ascending: false })).data ?? [],
  });

  const create = async () => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("resumes").insert({ user_id: u.user!.id, title: title || "Untitled resume", template });
    if (error) return toast.error(error.message);
    toast.success("Resume created");
    setOpen(false); setTitle(""); setTemplate("modern");
    qc.invalidateQueries({ queryKey: ["resumes"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["resumes"] });
  };

  const duplicate = async (r: any) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("resumes").insert({ user_id: u.user!.id, title: r.title + " (copy)", template: r.template, content: r.content });
    if (error) return toast.error(error.message);
    toast.success("Duplicated");
    qc.invalidateQueries({ queryKey: ["resumes"] });
  };

  return (
    <div>
      <PageHeader
        title="My Resumes"
        description="Create, version, and tailor resumes for every role."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> New resume</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create resume</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Senior Engineer" />
                </div>
                <div className="space-y-1.5">
                  <Label>Template</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(t => (
                      <button key={t} type="button" onClick={() => setTemplate(t)}
                        className={`rounded-lg border p-3 text-left text-sm capitalize transition ${template === t ? "border-primary bg-card" : "border-border/60"}`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter><Button onClick={create}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {resumes && resumes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resumes.map(r => (
            <Card key={r.id} className="group relative overflow-hidden border-border/60 transition-colors hover:border-border">
              <div className="relative aspect-[3/4] surface">
                <div className="absolute inset-4 rounded-md border border-border/60 bg-background p-3 text-[8px] leading-tight">
                  <div className="font-display text-[10px] font-semibold">{r.title}</div>
                  <div className="mt-1 text-muted-foreground">Senior · San Francisco</div>
                  <div className="mt-2 space-y-1">
                    {Array.from({length:8}).map((_,i)=><div key={i} className="h-1 rounded bg-border/60" style={{width: `${60+(i*7)%40}%`}} />)}
                  </div>
                </div>
                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/resumes/$id" params={{ id: r.id }} className="flex w-full items-center cursor-pointer">
                          <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicate(r)}><Copy className="mr-2 h-3.5 w-3.5" />Duplicate</DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/resumes/$id" params={{ id: r.id }} className="flex w-full items-center cursor-pointer">
                          <Download className="mr-2 h-3.5 w-3.5" />Download PDF
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => remove(r.id)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4">
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">Updated {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })} · {r.template}</div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-border/60 p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="mt-3 font-display text-lg font-semibold">No resumes yet</div>
          <div className="mt-1 text-sm text-muted-foreground">Create your first ATS-optimized resume in under a minute.</div>
          <Button className="mt-4" onClick={() => setOpen(true)}>Create resume</Button>
        </Card>
      )}
    </div>
  );
}
