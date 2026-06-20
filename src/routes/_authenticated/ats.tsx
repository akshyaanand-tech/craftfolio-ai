import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Check, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ats")({
  head: () => ({ meta: [{ title: "ATS Analyzer — Craftfolio AI" }] }),
  component: ATSPage,
});

function ATSPage() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("cf-access-token") || ""}`,
        },
        body: JSON.stringify({
          resumeText: resume,
          jobDescription: jd,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Analysis failed");
      } else {
        setReport(data);
        toast.success("Analysis complete!");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during analysis");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = report?.feedback?.suggestions || [];

  return (
    <div>
      <PageHeader title="ATS Analyzer" description="Score your resume against any job description in seconds." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 p-6">
          <div className="text-sm font-medium">Paste your resume</div>
          <Textarea className="mt-3 min-h-[260px]" placeholder="Paste plain text resume…" value={resume} onChange={e => setResume(e.target.value)} disabled={loading} />
        </Card>
        <Card className="border-border/60 p-6">
          <div className="text-sm font-medium">Paste job description</div>
          <Textarea className="mt-3 min-h-[260px]" placeholder="Paste the job listing…" value={jd} onChange={e => setJd(e.target.value)} disabled={loading} />
        </Card>
      </div>
      <div className="mt-6 flex justify-center">
        <Button size="lg" onClick={handleAnalyze} disabled={!resume || !jd || loading}>
          <Sparkles className="mr-1.5 h-4 w-4" />
          {loading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>

      {report && (
        <Card className="mt-8 border-border/60 p-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid items-center gap-8 md:grid-cols-[200px_1fr]">
            <div className="text-center">
              <div className="font-display text-6xl font-semibold text-gradient">{report.score}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">ATS score</div>
            </div>
            <div className="space-y-3">
              <Row ok label="Formatting checks processed" />
              {report.missing_keywords && report.missing_keywords.length > 0 && (
                <Row label={`Missing keywords: ${report.missing_keywords.map((k: string) => `'${k}'`).join(", ")}`} />
              )}
              {suggestions.map((s: string, idx: number) => (
                <Row key={idx} label={s} />
              ))}
              {suggestions.length === 0 && (
                <Row ok label="Format and content meet target requirements!" />
              )}
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

