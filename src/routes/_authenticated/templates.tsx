import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({ meta: [{ title: "Templates — Craftfolio AI" }] }),
  component: TemplatesPage,
});

const TEMPLATES = [
  { name: "Modern", tag: "Most popular", accent: "from-primary to-accent" },
  { name: "Classic", tag: "Timeless", accent: "from-slate-500 to-slate-700" },
  { name: "Minimal", tag: "For creators", accent: "from-emerald-500 to-emerald-700" },
  { name: "Editorial", tag: "For designers", accent: "from-rose-500 to-rose-700" },
  { name: "Technical", tag: "For engineers", accent: "from-blue-500 to-indigo-600" },
  { name: "Executive", tag: "For leaders", accent: "from-amber-500 to-amber-700" },
];

function TemplatesPage() {
  return (
    <div>
      <PageHeader title="Templates" description="Start from a polished template, tailored to your field." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map(t => (
          <Card key={t.name} className="group overflow-hidden border-border/60">
            <div className={`relative aspect-[3/4] bg-gradient-to-br ${t.accent}`}>
              <div className="absolute inset-6 rounded-md bg-background/95 p-4">
                <div className="h-2 w-20 rounded bg-foreground/80" />
                <div className="mt-1 h-1.5 w-32 rounded bg-muted-foreground/50" />
                <div className="mt-4 space-y-1.5">
                  {Array.from({length:10}).map((_,i)=><div key={i} className="h-1 rounded bg-border" style={{ width: `${50+(i*9)%50}%` }} />)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.tag}</div>
              </div>
              <Button size="sm" variant="outline">Use</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
