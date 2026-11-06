import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Loader2, Trash2, Bot, User } from "lucide-react";
import { Btn, Card, CopyBtn, Disclaimer, ErrorBox, PageHeader, fieldCls } from "@/components/kit";
import { generate, type ChatMessage } from "@/lib/ai";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Workplace Chatbot — Workplace AI" },
      { name: "description", content: "An AI workplace assistant for contextual answers on communication, planning and productivity." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "Contextual answers to your workplace questions." },
    ],
  }),
  component: ChatPage,
});

const KEY = "awpa.chat";
const SYSTEM: ChatMessage = {
  role: "system",
  content:
    "You are a sharp, practical workplace assistant. Give specific, contextual, actionable answers tailored to the user's situation. Ask a brief clarifying question when key context is missing. Avoid generic filler. Use short paragraphs and bullet points where useful.",
};

function ChatPage() {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setMsgs(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(msgs));
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs]);

  async function send() {
    const q = input.trim();
    if (!q) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    setErr(null);
    try {
      const a = await generate([SYSTEM, ...next.slice(-20)]);
      setMsgs([...next, { role: "assistant", content: a }]);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader icon={<MessageSquare className="h-6 w-6" />} title="Workplace Chatbot" desc="Ask anything about work — the conversation stays in your browser." />
      <Card className="flex h-[65vh] flex-col p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <span className="text-sm font-semibold">Conversation</span>
          <button onClick={() => setMsgs([])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive" disabled={!msgs.length}>
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!msgs.length && (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <Bot className="mx-auto mb-2 h-10 w-10 text-primary/60" />
                Start by describing a workplace situation or question.
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`group max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-secondary" : "border bg-background"}`}>
                {m.content}
                {m.role === "assistant" && <div className="mt-2"><CopyBtn text={m.content} /></div>}
              </div>
            </div>
          ))}
          {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          <div ref={end} />
        </div>
        <div className="border-t p-4">
          <ErrorBox error={err} />
          <div className="mt-2 flex gap-2">
            <textarea
              rows={1}
              className={`${fieldCls} resize-none`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask a workplace question…"
            />
            <Btn onClick={send} disabled={!input.trim() || loading} aria-label="Send"><Send className="h-4 w-4" /></Btn>
          </div>
        </div>
      </Card>
      <Disclaimer />
    </>
  );
}
