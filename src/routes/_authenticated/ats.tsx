import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Check, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/ats")({
  head: () => ({ meta: [{ title: "ATS Analyzer — Craftfolio AI" }] }),
  component: ATSPage,
});

function ATSPage() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <div>
      <PageHeader title="ATS Analyzer" description="Score your resume against any job description in seconds." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 p-6">
          <div className="text-sm font-medium">Paste your resume</div>
          <Textarea className="mt-3 min-h-[260px]" placeholder="Paste plain text resume…" value={resume} onChange={e => setResume(e.target.value)} />
        </Card>
        <Card className="border-border/60 p-6">
          <div className="text-sm font-medium">Paste job description</div>
          <Textarea className="mt-3 min-h-[260px]" placeholder="Paste the job listing…" value={jd} onChange={e => setJd(e.target.value)} />
        </Card>
      </div>
      <div className="mt-6 flex justify-center">
        <Button size="lg" onClick={() => setAnalyzed(true)} disabled={!resume || !jd}><Sparkles className="mr-1.5 h-4 w-4" />Analyze</Button>
      </div>

      {analyzed && (
        <Card className="mt-8 border-border/60 p-8">
          <div className="grid items-center gap-8 md:grid-cols-[200px_1fr]">
            <div className="text-center">
              <div className="font-display text-6xl font-semibold text-gradient">87</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">ATS score</div>
            </div>
            <div className="space-y-3">
              <Row ok label="Strong action verbs detected" />
              <Row ok label="Format passes ATS parsers" />
              <Row label="Add 3 missing keywords: 'distributed systems', 'observability', 'staff'" />
              <Row label="Quantify impact in 2 bullets" />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Row({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {ok ? <Check className="mt-0.5 h-4 w-4 text-primary" /> : <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />}
      <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
