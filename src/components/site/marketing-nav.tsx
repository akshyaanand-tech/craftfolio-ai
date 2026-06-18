import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function MarketingNav({ delay = 0 }: { delay?: number }) {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#preview" className="hover:text-foreground">Preview</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#testimonials" className="hover:text-foreground">Customers</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to="/auth/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
