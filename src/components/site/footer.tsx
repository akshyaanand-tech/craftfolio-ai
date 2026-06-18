import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 surface">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The career operating system for the next generation of builders.
              Resumes, portfolios, and applications — engineered to ship.
            </p>
          </div>
          {[
            { h: "Product", l: ["Resume Builder", "Portfolio", "ATS Analyzer", "Job Tracker"] },
            { h: "Company", l: ["About", "Changelog", "Privacy", "Terms"] },
          ].map(col => (
            <div key={col.h}>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.h}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {col.l.map(i => <li key={i}><a className="text-foreground/80 hover:text-foreground" href="#">{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Craftfolio AI. All rights reserved.</div>
          <div>Built for the 2026 generation of professionals.</div>
        </div>
      </div>
    </footer>
  );
}
