// Provider-agnostic AI client. Connect any OpenAI-compatible chat completions API
// via the Settings page (stored in the browser only). No responses are ever mocked.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type AIConfig = { endpoint: string; apiKey: string; model: string };

const KEY = "awpa.ai-config";

export class AINotConfiguredError extends Error {
  constructor() {
    super(
      "Live AI generation requires an API connection. Open Settings and add an AI endpoint, key and model to enable this feature.",
    );
    this.name = "AINotConfiguredError";
  }
}

export function getAIConfig(): AIConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as AIConfig;
    return c.endpoint && c.model ? c : null;
  } catch {
    return null;
  }
}

export function saveAIConfig(c: AIConfig | null) {
  if (c) localStorage.setItem(KEY, JSON.stringify(c));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("awpa-config"));
}

export async function generate(messages: ChatMessage[], temperature = 0.7): Promise<string> {
  const cfg = getAIConfig();
  if (!cfg) throw new AINotConfiguredError();
  const res = await fetch(cfg.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: cfg.model, messages, temperature }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}). ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("The AI service returned an empty response.");
  return String(text).trim();
}
