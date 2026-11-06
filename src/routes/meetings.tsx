import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { Btn, Card, CopyBtn, Disclaimer, ErrorBox, PageHeader, fieldCls } from "@/components/kit";
import { generate } from "@/lib/ai";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workplace AI" },
      { name: "description", content: "Turn meeting notes into summaries, decisions, action items, owners and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      { property: "og:description", content: "Turn meeting notes into clear summaries and action items." },
    ],
  }),
  component: MeetingsPage,
});

const sections = ["Summary", "Key Decisions", "Action Items", "Assigned Tasks", "Deadlines"] as const;
type Result = Record<(typeof sections)[number], string>;

function parse(text: string): Result {
  const r = Object.fromEntries(sections.map((s) => [s, ""])) as Result;
  let cur: keyof Result | null = null;
  for (const line of text.split("\n")) {
    const h = sections.find((s) => new RegExp(`^#*\\s*\\**${s}\\**:?\\s*$`, "i").test(line.trim()));
    if (h) { cur = h; continue; }
    if (cur) r[cur] += line + "\n";
  }
  for (const s of sections) r[s] = r[s].trim();
  if (sections.every((s) => !r[s])) r.Summary = text;
  return r;
}

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const text = await generate(
        [
          {
            role: "system",
            content: `You analyse meeting notes. Respond ONLY with these headings, each on its own line, followed by content: ${sections.map((s) => `## ${s}`).join(", ")}. Use bullet points. For Assigned Tasks use "Person — task". For Deadlines use "Date — item". If none are stated, write "None stated". Do not invent facts.`,
          },
          { role: "user", content: notes },
        ],
        0.3,
      );
      setRes(parse(text));
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  const all = res ? sections.map((s) => `${s}\n${res[s]}`).join("\n\n") : "";

  return (
    <>
      <PageHeader icon={<FileText className="h-6 w-6" />} title="Meeting Notes Summarizer" desc="Paste raw notes or a transcript — get structured, editable outcomes." />
      <Card>
        <textarea className={`${fieldCls} min-h-56`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your meeting notes here..." />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{notes.trim() ? notes.trim().split(/\s+/).length : 0} words</span>
          <Btn disabled={!notes.trim() || loading} onClick={run}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Summarise notes
          </Btn>
        </div>
        <ErrorBox error={err} />
      </Card>
      {res && (
        <>
          <div className="mb-3 mt-8 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Results</h2>
            <CopyBtn text={all} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {sections.map((s, i) => (
              <Card key={s} className={i === 0 ? "md:col-span-2" : ""}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    {s}
                  </h3>
                  <CopyBtn text={res[s]} />
                </div>
                <textarea className={`${fieldCls} min-h-36`} value={res[s]} onChange={(e) => setRes({ ...res, [s]: e.target.value })} />
              </Card>
            ))}
          </div>
        </>
      )}
      <Disclaimer />
    </>
  );
}
