import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, MessageSquare, ArrowRight, PlugZap, LayoutDashboard } from "lucide-react";
import { Card, Disclaimer, PageHeader, useAIConnected } from "@/components/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Write emails, summarise meetings and get workplace answers with AI." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Write emails, summarise meetings and get workplace answers with AI." },
    ],
  }),
  component: Index,
});

const tools = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft personalised emails in Formal, Friendly or Persuasive tones." },
  { to: "/meetings", icon: FileText, title: "Meeting Notes Summarizer", desc: "Turn long notes into summaries, decisions, action items and deadlines." },
  { to: "/chat", icon: MessageSquare, title: "Workplace Chatbot", desc: "Ask contextual questions about work, communication and planning." },
] as const;

function Index() {
  const connected = useAIConnected();
  return (
    <>
      <PageHeader icon={<LayoutDashboard className="h-6 w-6" />} title="Good to see you" desc="Your AI toolkit for faster, clearer work." />
      {!connected && (
        <Card className="mb-6 flex flex-col gap-4 border-accent/50 bg-accent/10 sm:flex-row sm:items-center">
          <PlugZap className="h-8 w-8 shrink-0 text-accent-foreground" />
          <div className="flex-1">
            <p className="font-semibold">Live AI generation requires an API connection</p>
            <p className="text-sm text-muted-foreground">
              No AI service is connected, so nothing will be generated. Nothing here is pre-written or simulated.
            </p>
          </div>
          <Link to="/settings" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Connect AI
          </Link>
        </Card>
      )}
      <div className="grid gap-5 md:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Card className="h-full transition group-hover:-translate-y-1 group-hover:border-primary/40">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <h2 className="font-display text-lg font-semibold">{t.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
      <Disclaimer />
    </>
  );
}
