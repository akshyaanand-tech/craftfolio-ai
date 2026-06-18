import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FileText, Briefcase, Mail, Target, TrendingUp, Eye, Download, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Craftfolio AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const counts = useQuery({
    queryKey: ["dash-counts"],
    queryFn: async () => {
      const [r, p, c, j] = await Promise.all([
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("portfolios").select("id", { count: "exact", head: true }),
        supabase.from("cover_letters").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("id", { count: "exact", head: true }),
      ]);
      return { resumes: r.count ?? 0, portfolios: p.count ?? 0, cl: c.count ?? 0, jobs: j.count ?? 0 };
    },
  });
  const jobs = useQuery({
    queryKey: ["dash-jobs"],
    queryFn: async () => (await supabase.from("job_applications").select("*").order("updated_at", { ascending: false }).limit(5)).data ?? [],
  });

  const name = profile.data?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <PageHeader title={`Welcome back, ${name}`} description="Here's what's moving in your career this week." />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={FileText} label="Resumes" value={counts.data?.resumes ?? 0} to="/resumes" />
          <Stat icon={Briefcase} label="Portfolios" value={counts.data?.portfolios ?? 0} to="/portfolio" />
          <Stat icon={Mail} label="Cover letters" value={counts.data?.cl ?? 0} to="/cover-letters" />
          <Stat icon={Target} label="Applications" value={counts.data?.jobs ?? 0} to="/jobs" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Resume analytics</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Metric icon={Eye} label="Views" value="1,248" delta="+12%" />
              <Metric icon={Download} label="Downloads" value="312" delta="+4%" />
              <Metric icon={Sparkles} label="ATS score" value="94" delta="+6" />
            </div>
            <Spark />
          </Card>
          <Card className="border-border/60 p-6">
            <div className="text-sm font-medium">Recent activity</div>
            <ul className="mt-4 divide-y divide-border/60 text-sm">
              {[
                { t: "Updated resume 'Senior Engineer'", w: "2h ago" },
                { t: "Added project 'Realtime editor'", w: "Yesterday" },
                { t: "Exported portfolio site", w: "2 days ago" },
                { t: "Logged application at Stripe", w: "3 days ago" },
              ].map(a => (
                <li key={a.t} className="flex items-center justify-between py-2.5">
                  <span>{a.t}</span><span className="text-xs text-muted-foreground">{a.w}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="border-border/60 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Active applications</div>
            <Button asChild variant="ghost" size="sm"><Link to="/jobs">Open tracker</Link></Button>
          </div>
          {jobs.data && jobs.data.length > 0 ? (
            <ul className="mt-4 divide-y divide-border/60">
              {jobs.data.map(j => (
                <li key={j.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{j.role}</div>
                    <div className="text-xs text-muted-foreground">{j.company}</div>
                  </div>
                  <StatusBadge status={j.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty label="No applications yet" cta="Track your first" to="/jobs" />
          )}
        </Card>
      </div>

      <aside className="space-y-4">
        <Card className="border-border/60 bg-gradient-to-br from-card to-surface p-6 card-shadow">
          <div className="text-xs uppercase tracking-wider text-primary">Insight</div>
          <div className="mt-2 font-display text-lg font-semibold">You're 1 project away from a stronger portfolio.</div>
          <p className="mt-2 text-sm text-muted-foreground">Add a recent project to lift your portfolio score above 90.</p>
          <Button asChild className="mt-4 w-full" size="sm"><Link to="/portfolio">Add project</Link></Button>
        </Card>
        <Card className="border-border/60 p-6">
          <div className="text-sm font-medium">Recent exports</div>
          <ul className="mt-3 space-y-2 text-sm">
            {["resume-staff-engineer.pdf","portfolio-site.zip","cover-letter-stripe.pdf"].map(f => (
              <li key={f} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                <span className="truncate">{f}</span>
                <Download className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-border/60 p-6">
          <div className="text-sm font-medium">Resume versions</div>
          <ul className="mt-3 space-y-2 text-sm">
            {["v8 · Today","v7 · 2 days ago","v6 · Last week"].map(v => (
              <li key={v} className="text-muted-foreground">{v}</li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}

function Stat({ icon: Icon, label, value, to }: { icon: any; label: string; value: number; to: string }) {
  return (
    <Link to={to}>
      <Card className="group border-border/60 p-5 transition-colors hover:border-border">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
      </Card>
    </Link>
  );
}

function Metric({ icon: Icon, label, value, delta }: { icon: any; label: string; value: string; delta: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
      <div className="text-xs text-primary">{delta}</div>
    </div>
  );
}

function Spark() {
  const pts = [12,18,14,22,28,24,32,38,34,42,46,52];
  const max = Math.max(...pts);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * 100} ${100 - (p / max) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-6 h-20 w-full">
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="oklch(0.55 0.22 264)" stopOpacity="0.3"/><stop offset="100%" stopColor="oklch(0.55 0.22 264)" stopOpacity="0"/></linearGradient></defs>
      <path d={`${path} L 100 100 L 0 100 Z`} fill="url(#g)" />
      <path d={path} fill="none" stroke="oklch(0.55 0.22 264)" strokeWidth="1.5" />
    </svg>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    applied: "bg-muted text-foreground",
    assessment: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    interview: "bg-primary/15 text-primary",
    offer: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-destructive/15 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] ?? map.applied}`}>{status}</span>;
}

function Empty({ label, cta, to }: { label: string; cta: string; to: string }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-border/60 p-8 text-center">
      <div className="text-sm text-muted-foreground">{label}</div>
      <Button asChild size="sm" className="mt-3"><Link to={to}>{cta}</Link></Button>
    </div>
  );
}
