import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { Btn, Card, CopyBtn, Disclaimer, ErrorBox, PageHeader, fieldCls } from "@/components/kit";
import { generate } from "@/lib/ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      { name: "description", content: "Generate personalised professional emails in formal, friendly or persuasive tones." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate personalised professional emails with AI." },
    ],
  }),
  component: EmailPage,
});

const tones = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("Formal");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const text = await generate([
        {
          role: "system",
          content: `You are an expert business writer. Write a complete, ready-to-send email in a ${tone.toLowerCase()} tone. Start with "Subject: ..." on the first line, then a blank line, then the email. Be specific to the user's details; never use placeholders unless information is missing.`,
        },
        {
          role: "user",
          content: `Recipient: ${recipient || "not specified"}\nSender: ${sender || "not specified"}\nInstructions: ${instructions}`,
        },
      ]);
      setOut(text);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader icon={<Mail className="h-6 w-6" />} title="Smart Email Generator" desc="Describe what you need — get a polished email you can edit and copy." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Recipient
              <input className={`${fieldCls} mt-1.5`} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah, Head of Finance" />
            </label>
            <label className="text-sm font-medium">
              Your name / role
              <input className={`${fieldCls} mt-1.5`} value={sender} onChange={(e) => setSender(e.target.value)} placeholder="e.g. James, Project Lead" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium">
            What should the email say?
            <textarea className={`${fieldCls} mt-1.5 min-h-40`} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Purpose, key points, deadlines, context..." />
          </label>
          <p className="mt-4 text-sm font-medium">Tone</p>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${tone === t ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <Btn className="mt-5 w-full" disabled={!instructions.trim() || loading} onClick={run}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate email
          </Btn>
          <ErrorBox error={err} />
        </Card>
        <Card className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your email</h2>
            <CopyBtn text={out} />
          </div>
          <textarea
            className={`${fieldCls} min-h-80 flex-1 font-mono text-[13px] leading-relaxed`}
            value={out}
            onChange={(e) => setOut(e.target.value)}
            placeholder="Your generated email will appear here. You can edit it freely."
          />
        </Card>
      </div>
      <Disclaimer />
    </>
  );
}
