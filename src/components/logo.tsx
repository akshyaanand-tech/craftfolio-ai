import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2">
      <div className="relative h-7 w-7 overflow-hidden rounded-md bg-gradient-to-br from-primary to-accent">
        <div className="absolute inset-[2px] rounded-[5px] bg-background/30 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center font-display text-[13px] font-bold text-primary-foreground">C</div>
      </div>
      <span className="font-display text-[15px] font-semibold tracking-tight">
        Craftfolio<span className="text-muted-foreground"> AI</span>
      </span>
    </Link>
  );
}
