import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileText, Briefcase, Sparkles, BarChart3, Brain, Github, Linkedin, History,
  ArrowRight, Check, Play, Star,
} from "lucide-react";

import { MarketingNav } from "@/components/site/marketing-nav";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Craftfolio AI — Build a Resume That Opens Doors" },
      { name: "description", content: "Create ATS-optimized resumes, professional portfolios, and career documents from one premium platform." },
      { property: "og:title", content: "Craftfolio AI — Build Your Career Presence" },
      { property: "og:description", content: "Resumes, portfolios, cover letters, and job tracking — built for the next generation." },
    ],
  }),
  component: Landing,
});

const HEADLINE = "CRAFTFOLIO AI";

function StartupSequence({ onDone }: { onDone: () => void }) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(HEADLINE.slice(0, i));
      if (i >= HEADLINE.length) {
        clearInterval(id);
        setTimeout(onDone, 700);
      }
    }, 75);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <motion.div
      key="boot"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      <div className="font-display text-3xl font-semibold tracking-[0.18em] text-white sm:text-5xl md:text-6xl">
        {typed}
        <span className="ml-1 inline-block h-[0.9em] w-[2px] -translate-y-[2px] animate-pulse bg-white" />
      </div>
    </motion.div>
  );
}

function Landing() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("cf-booted") === "1") {
      setBooting(false);
    }
  }, []);

  const finishBoot = () => {
    sessionStorage.setItem("cf-booted", "1");
    setBooting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {booting && <StartupSequence onDone={finishBoot} />}

      {!booting && <MarketingNav delay={0.2} />}

      <main className={booting ? "opacity-0" : ""}>
        <Hero />
        <Stats />
        <Features />
        <Preview />
        <Testimonials />
        <Pricing />
      </main>

      {!booting && <SiteFooter />}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 hero-gradient" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-40 dark:opacity-100" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            New · Portfolio builder + ATS analyzer
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Build a resume that <span className="text-gradient">opens doors</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            Create ATS-optimized resumes, professional portfolios, and career documents from one platform — designed for the next generation of professionals.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <Link to="/auth/signup">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="lg" className="h-11 rounded-full px-5 text-foreground/80">
              <Play className="mr-2 h-4 w-4" /> Watch demo
            </Button>
          </motion.div>
          <div className="mt-6 text-xs text-muted-foreground">No credit card required · Free forever plan</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <ResumeMockup />
        </motion.div>
      </div>
    </section>
  );
}

function ResumeMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-2 card-shadow backdrop-blur">
      <div className="rounded-xl border border-border/60 bg-background">
        <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <div className="ml-3 text-xs text-muted-foreground">resume / alex-chen.pdf</div>
        </div>
        <div className="grid gap-0 md:grid-cols-[1fr_280px]">
          <div className="space-y-4 p-8">
            <div>
              <div className="font-display text-2xl font-semibold">Alex Chen</div>
              <div className="text-sm text-muted-foreground">Senior Product Engineer · San Francisco</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Experience</div>
              {["Linear · Product Engineer · 2024 — Present", "Vercel · Frontend Engineer · 2022 — 2024", "Notion · Engineering Intern · 2021"].map(t => (
                <div key={t} className="text-sm text-foreground/85">{t}</div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Skills</div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["TypeScript","React","Node","Postgres","System Design","DX"].map(s => (
                  <span key={s} className="rounded-md border border-border/60 bg-secondary px-2 py-0.5 text-xs">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border/60 surface p-6 md:border-l md:border-t-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ATS Score</div>
            <div className="mt-2 font-display text-4xl font-semibold text-gradient">94</div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              {["Keyword match", "Format compliant", "Action verbs", "Quantified impact"].map(i => (
                <div key={i} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" />{i}</div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-border/60 bg-background p-3">
              <div className="text-xs text-muted-foreground">Tailored for</div>
              <div className="mt-0.5 text-sm font-medium">Staff Engineer · Linear</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    { v: "10,000+", l: "Resumes created" },
    { v: "5,000+", l: "Portfolios generated" },
    { v: "92%", l: "ATS success rate" },
    { v: "<2 min", l: "Average build time" },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden bg-border/40 md:grid-cols-4">
        {stats.map(s => (
          <div key={s.l} className="bg-background p-8 text-center">
            <div className="font-display text-3xl font-semibold md:text-4xl">{s.v}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { i: FileText, t: "Resume Builder", d: "Composable sections, version history, and ATS-aware templates." },
    { i: Briefcase, t: "Portfolio Builder", d: "Ship a polished portfolio site in minutes — fully editable." },
    { i: Sparkles, t: "Cover Letter Generator", d: "Tailored cover letters per role, saved to your library." },
    { i: BarChart3, t: "ATS Analyzer", d: "Live keyword scoring, formatting checks, and tailored suggestions." },
    { i: Brain, t: "Skill Gap Detection", d: "Compare your skills against target roles and close the gap." },
    { i: Github, t: "GitHub Import", d: "Pull pinned repos and READMEs straight into your portfolio." },
    { i: Linkedin, t: "LinkedIn Import", d: "Bring in experience and education with one click." },
    { i: History, t: "Resume Versioning", d: "Every save is a snapshot. Roll back anytime, fearlessly." },
  ];
  return (
    <section id="features" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Features</div>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">Everything your career needs. In one place.</h2>
          <p className="mt-4 text-muted-foreground">A focused toolkit. No bloat, no fluff — just the things that move your career forward.</p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, idx) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.04, duration: 0.5 }}
              className="group bg-background p-6 transition-colors hover:bg-card"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-secondary text-primary">
                <f.i className="h-4 w-4" />
              </div>
              <div className="mt-4 font-display text-base font-semibold">{f.t}</div>
              <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Preview() {
  return (
    <section id="preview" className="border-b border-border/60 surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Interactive preview</div>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">A workspace that thinks like you do.</h2>
          <p className="mt-4 text-muted-foreground">Drag, edit, version — every change reflected in real time across resumes, portfolios, and exports.</p>
        </div>
        <div className="mt-12">
          <ResumeMockup />
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { q: "Got 4 interviews in 2 weeks. The ATS analyzer is unreal.", n: "Maya R.", r: "Software Engineer" },
    { q: "Replaced my portfolio site, Notion CV, and a cover-letter doc with one tool.", n: "Daniel K.", r: "Product Designer" },
    { q: "The versioning alone is worth it. I tailor a resume per role in under a minute.", n: "Priya S.", r: "Data Scientist" },
  ];
  return (
    <section id="testimonials" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Loved by builders</div>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">From first draft to first interview.</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {quotes.map(q => (
            <Card key={q.n} className="border-border/60 bg-card/60 p-6">
              <div className="flex gap-0.5 text-primary">
                {Array.from({length:5}).map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{q.q}"</p>
              <div className="mt-6 text-sm">
                <div className="font-medium">{q.n}</div>
                <div className="text-xs text-muted-foreground">{q.r}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { n: "Free", p: "$0", d: "Forever", f: ["1 resume", "1 portfolio", "Basic ATS scoring", "Community support"], cta: "Get started" },
    { n: "Pro", p: "$12", d: "/ month", f: ["Unlimited resumes", "Unlimited portfolios", "Advanced ATS analyzer", "Versioning & exports", "Priority support"], cta: "Start Pro trial", featured: true },
    { n: "Team", p: "$29", d: "/ user / month", f: ["Everything in Pro", "Shared templates", "Team analytics", "SSO", "Dedicated success"], cta: "Contact sales" },
  ];
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Pricing</div>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">Simple. Honest. Scales with you.</h2>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {tiers.map(t => (
            <Card key={t.n} className={`relative border-border/60 p-7 ${t.featured ? "border-primary/60 bg-card glow-shadow" : "bg-card/50"}`}>
              {t.featured && <div className="absolute -top-2 right-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Popular</div>}
              <div className="font-display text-lg font-semibold">{t.n}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <div className="font-display text-4xl font-semibold">{t.p}</div>
                <div className="text-sm text-muted-foreground">{t.d}</div>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.f.map(i => <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" />{i}</li>)}
              </ul>
              <Button asChild className="mt-8 w-full" variant={t.featured ? "default" : "outline"}>
                <Link to="/auth/signup">{t.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
