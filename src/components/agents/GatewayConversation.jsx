import React, { useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import useGatewayConversation from "@/components/agents/useGatewayConversation";
import GatewayMessage from "@/components/agents/GatewayMessage";

export default function GatewayConversation({ agentKey, context, name }) {
  const { messages, input, setInput, busy, error, send, ready } = useGatewayConversation(agentKey, context);
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);
  return <div className="xa-card p-4">
    <h2 className="text-sm font-bold mb-3">Give {name} a goal</h2>
    <p className="text-xs text-muted-foreground mb-3">Vercel AI Gateway · your existing factory permissions</p>
    <div ref={scrollRef} className="space-y-3 max-h-[50vh] overflow-y-auto xa-scroll mb-3" aria-live="polite">
      {messages.map((m, i) => <GatewayMessage key={i} m={m} />)}
      {busy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" />Agent is working…</div>}
    </div>
    {error && <p role="alert" className="text-sm text-destructive mb-2">{error}</p>}
    <form onSubmit={(e) => { e.preventDefault(); send(); }}>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} maxLength={8000} disabled={busy}
        aria-label={`Goal for ${name}`} placeholder="Describe your goal…"
        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
      <button disabled={busy || !ready || !input.trim()} className="xa-btn-primary w-full mt-2">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {busy ? "Working…" : "Dispatch"}
      </button>
    </form>
  </div>;
}