import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, Check } from "lucide-react";
import { Btn, Card, Disclaimer, PageHeader, fieldCls } from "@/components/kit";
import { getAIConfig, saveAIConfig } from "@/lib/ai";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "AI Settings — Workplace AI" },
      { name: "description", content: "Connect an AI API to enable live generation." },
      { property: "og:title", content: "AI Settings" },
      { property: "og:description", content: "Connect an AI API to enable live generation." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = getAIConfig();
    if (c) { setEndpoint(c.endpoint); setApiKey(c.apiKey); setModel(c.model); }
  }, []);

  return (
    <>
      <PageHeader icon={<Settings className="h-6 w-6" />} title="AI Settings" desc="Connect any OpenAI-compatible chat completions API." />
      <Card className="max-w-2xl">
        <p className="mb-4 text-sm text-muted-foreground">
          Without a connection, the app does not generate anything — it tells you an API is required. Settings are saved only in this browser.
        </p>
        <label className="block text-sm font-medium">
          Endpoint URL
          <input className={`${fieldCls} mt-1.5`} value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://your-provider.com/v1/chat/completions" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          API key
          <input type="password" className={`${fieldCls} mt-1.5`} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Optional for local servers" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Model
          <input className={`${fieldCls} mt-1.5`} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model name from your provider" />
        </label>
        <div className="mt-5 flex flex-wrap gap-2">
          <Btn disabled={!endpoint || !model} onClick={() => { saveAIConfig({ endpoint, apiKey, model }); setSaved(true); setTimeout(() => setSaved(false), 1500); }}>
            {saved && <Check className="h-4 w-4" />} {saved ? "Saved" : "Save connection"}
          </Btn>
          <Btn variant="ghost" onClick={() => { saveAIConfig(null); setEndpoint(""); setApiKey(""); setModel(""); }}>Disconnect</Btn>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Note: keys stored in the browser are visible to anyone using this device. For production, route requests through a secure server.
        </p>
      </Card>
      <Disclaimer />
    </>
  );
}
