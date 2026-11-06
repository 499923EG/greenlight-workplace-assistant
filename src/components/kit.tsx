import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, Copy, PlugZap, ShieldCheck } from "lucide-react";
import { AINotConfiguredError, getAIConfig } from "@/lib/ai";

export function useAIConnected() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const f = () => setOk(!!getAIConfig());
    f();
    window.addEventListener("awpa-config", f);
    return () => window.removeEventListener("awpa-config", f);
  }, []);
  return ok;
}

export function PageHeader({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-brand">
        {icon}
      </div>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-card p-5 shadow-card ${className}`}>{children}</div>;
}

export function Btn({
  children,
  variant = "primary",
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "gold" }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand",
    gold: "bg-accent text-accent-foreground hover:bg-accent/90",
    ghost: "border bg-card text-foreground hover:bg-secondary",
  }[variant];
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${p.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Btn
      variant="ghost"
      disabled={!text}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      {done ? "Copied" : "Copy"}
    </Btn>
  );
}

export const fieldCls =
  "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";

export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null;
  const notCfg = error instanceof AINotConfiguredError;
  return (
    <div className="mt-4 flex gap-3 rounded-xl border border-accent/50 bg-accent/10 p-4 text-sm">
      {notCfg ? <PlugZap className="h-5 w-5 shrink-0 text-accent-foreground" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />}
      <div>
        <p className="font-semibold">{notCfg ? "AI not connected" : "Something went wrong"}</p>
        <p className="mt-1 text-muted-foreground">{(error as Error).message}</p>
        {notCfg && (
          <Link to="/settings" className="mt-2 inline-block font-semibold text-primary underline">
            Connect an AI API →
          </Link>
        )}
      </div>
    </div>
  );
}

export function Disclaimer() {
  return (
    <div className="mt-8 flex gap-3 rounded-xl border bg-secondary/60 p-4 text-xs text-muted-foreground">
      <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
      <p>
        <span className="font-semibold text-foreground">Responsible AI:</span> AI-generated content can be
        inaccurate or incomplete. Always review, verify facts, names, dates and commitments before sharing.
      </p>
    </div>
  );
}
