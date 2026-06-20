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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

import { AnimatePresence } from "framer-motion";
import { AlertCircle, BookOpen, Layers, Code } from "lucide-react";
import { toast } from "sonner";

const HEADLINE = "Craftfolio AI";

function StartupSequence({ onDone }: { onDone: () => void }) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(HEADLINE.slice(0, i));
      if (i >= HEADLINE.length) {
        clearInterval(id);
        setTimeout(onDone, 1000); // Wait exactly 1 second after completes
      }
    }, 75);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <motion.div
      key="boot"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark kept visible */}
        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-accent animate-pulse">
          <div className="absolute inset-[2.5px] rounded-[6px] bg-background/30 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-primary-foreground">C</div>
        </div>
        <div className="font-display text-2xl font-semibold tracking-[0.18em] text-white sm:text-4xl md:text-5xl mt-2">
          {typed}
          <span className="ml-1 inline-block h-[0.9em] w-[2px] -translate-y-[2px] animate-pulse bg-white" />
        </div>
      </div>
    </motion.div>
  );
}

const TAGLINES = [
  "Create. Optimize. Apply.",
  "Build Your Professional Presence.",
  "From Resume to Portfolio.",
  "Designed for Modern Careers."
];

function RotatingTagline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % TAGLINES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-8 mt-4 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="font-display text-base font-semibold text-primary md:text-lg tracking-wide"
        >
          {TAGLINES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function InteractiveWalkthrough({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [atsScore, setAtsScore] = useState(0);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setStep(prev => (prev % 3) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (step === 2 && open) {
      setAtsScore(0);
      const id = setInterval(() => {
        setAtsScore(prev => {
          if (prev >= 94) {
            clearInterval(id);
            return 94;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(id);
    }
  }, [step, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-border/60 bg-background/95 backdrop-blur-xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold">Interactive Walkthrough</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-[220px_1fr] mt-4">
          <div className="flex flex-col gap-2 border-r border-border/60 pr-4">
            {[
              { id: 1, label: "1. Resume Creation", desc: "Build tailored resume content" },
              { id: 2, label: "2. ATS Analysis", desc: "Live match score scanner" },
              { id: 3, label: "3. Portfolio Site", desc: "Instantly publish web portfolio" }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`text-left p-3 rounded-lg border transition ${
                  step === s.id
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border/60 hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <div className="text-xs font-semibold">{s.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>

          <div className="min-h-[300px] flex items-center justify-center rounded-xl border border-border/60 bg-secondary/20 p-6 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-4 font-mono text-xs max-w-md bg-background border border-border/60 rounded-lg p-5"
                >
                  <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 mb-2 text-muted-foreground text-[10px]">
                    <span className="h-2 w-2 rounded-full bg-primary" /> editor.json
                  </div>
                  <div><span className="text-primary">const</span> candidate = &#123;</div>
                  <div className="pl-4">name: <span className="text-emerald-500">"Alex Chen"</span>,</div>
                  <div className="pl-4">role: <span className="text-emerald-500">"Staff Product Engineer"</span>,</div>
                  <div className="pl-4">experience: [</div>
                  <div className="pl-8"><span className="text-emerald-500">"Linear - Product Engineer (2024-Present)"</span>,</div>
                  <div className="pl-8"><span className="text-emerald-500">"Vercel - Frontend Engineer (2022-2024)"</span></div>
                  <div className="pl-4">],</div>
                  <div className="pl-4">skills: [<span className="text-emerald-500">"TypeScript"</span>, <span className="text-emerald-500">"React"</span>, <span className="text-emerald-500">"System Design"</span>]</div>
                  <div>&#125;;</div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-4 max-w-md bg-background border border-border/60 rounded-lg p-6 text-center"
                >
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Scanning Resume against Staff Engineer role...</div>
                  <div className="font-display text-7xl font-bold text-gradient my-4">{atsScore}%</div>
                  <div className="space-y-2 text-left max-w-xs mx-auto text-xs">
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Format passes ATS checks</div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> High Action Verb count</div>
                    <div className="flex items-center gap-2 text-amber-500"><AlertCircle className="h-3.5 w-3.5" /> Missing keyword: "observability"</div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur shadow-xl space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display text-white font-bold">AC</div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">Alex Chen</div>
                      <div className="text-xs text-muted-foreground">Staff Product Engineer</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Building premium user experiences and developer tools. Previously designed features at Vercel and Notion.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["TypeScript", "React", "System Design"].map(s => (
                      <span key={s} className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                    ))}
                  </div>
                  <div className="border-t border-border/60 pt-3 flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>craftfolio.ai/alexchen</span>
                    <span className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer">Visit site <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Landing() {
  const [booting, setBooting] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

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
      <AnimatePresence>
        {booting && <StartupSequence onDone={finishBoot} />}
      </AnimatePresence>

      {!booting && <MarketingNav delay={0.3} />}

      <main className={booting ? "opacity-0" : ""}>
        <Hero onWatchDemo={() => setDemoOpen(true)} />
        <Stats />
        <Features />
        <Preview />
        <Testimonials />
        <Pricing />
      </main>

      {!booting && <SiteFooter />}

      <InteractiveWalkthrough open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}

function Hero({ onWatchDemo }: { onWatchDemo: () => void }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 hero-gradient" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-40 dark:opacity-100" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            New · Portfolio builder + ATS analyzer
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Build a resume that <span className="text-gradient">opens doors</span>.
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <RotatingTagline />
          </motion.div>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            Create ATS-optimized resumes, professional portfolios, and career documents from one platform — designed for the next generation of professionals.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <Link to="/auth/signup">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={onWatchDemo} className="h-11 rounded-full px-5 text-foreground/80 cursor-pointer">
              <Play className="mr-2 h-4 w-4" /> Watch demo
            </Button>
          </motion.div>
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

function PortfolioMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-2 card-shadow backdrop-blur">
      <div className="rounded-xl border border-border/60 bg-background">
        {/* Browser Top Bar */}
        <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <div className="ml-3 text-xs text-muted-foreground font-mono">craftfolio.ai/alexchen</div>
        </div>
        
        {/* Portfolio Layout */}
        <div className="p-8 space-y-6 text-left">
          {/* Header */}
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="font-display text-3xl font-semibold tracking-tight text-gradient">Alex Chen</div>
              <div className="text-sm text-muted-foreground mt-1">Staff Product Engineer · San Francisco</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg cursor-pointer">Resume</Button>
              <Button size="sm" className="h-8 text-xs rounded-lg cursor-pointer">Contact</Button>
            </div>
          </div>

          <div className="border-t border-border/60 my-4" />

          {/* About section */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">About</div>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">
              I build premium web applications and user interfaces. Currently leading key frontend infrastructure initiatives at Linear. Passionate about developer tooling, design systems, and observability.
            </p>
          </div>

          {/* Grid section */}
          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <div className="rounded-lg border border-border/60 bg-secondary/20 p-4 space-y-2">
              <div className="text-sm font-semibold flex justify-between items-center">
                Linear Sync Engine
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">Active</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time caching and synchronization protocol for high-throughput desktop application UI states.
              </p>
              <div className="flex gap-1.5 pt-1">
                {["TypeScript", "Go", "WebSockets"].map(t => (
                  <span key={t} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/20 p-4 space-y-2">
              <div className="text-sm font-semibold flex justify-between items-center">
                React Federated Shell
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">Open Source</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A lightweight micro-frontend frame orchestrator for high-performance React runtime composition.
              </p>
              <div className="flex gap-1.5 pt-1">
                {["React", "Webpack", "Docker"].map(t => (
                  <span key={t} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
          <PortfolioMockup />
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
