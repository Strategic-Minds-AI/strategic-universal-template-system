import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import GatewayMessage from "@/components/agents/GatewayMessage";
import useGatewayConversation from "@/components/agents/useGatewayConversation";

export default function AgentChat() {
  const [open, setOpen] = useState(false);
  const { messages, input, setInput, busy, error, send, ready } = useGatewayConversation();
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  return (
    <>
      {/* Right-edge tab */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 rounded-l-xl border border-r-0 border-border bg-[#0059ff] text-white px-2.5 py-3 shadow-lg transition-transform hover:brightness-110 ${open ? "translate-x-[380px] max-[422px]:translate-x-[90vw]" : ""}`}
        title="Strategic Operator"
      >
        {open ? <ChevronLeft className="w-4 h-4" /> : <><Bot className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">Operator</span></>}
      </button>

      {/* Slide-in panel */}
      <div className={`fixed top-0 right-0 h-full w-[380px] max-w-[90vw] z-50 bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-[#0059ff] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
            <div>
              <div className="text-sm font-black">Strategic Operator</div>
              <div className="text-[10px] opacity-90">Vercel AI Gateway · factory tools</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/15"><X className="w-4 h-4" /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto xa-scroll p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Ask the operator to audit the factory, fix a run, optimize a registry, generate a logo, or provision a connected account.
            </div>
          )}
          {messages.map((m, i) => <GatewayMessage key={i} m={m} />)}
          {error && <div role="alert" className="text-xs text-destructive">{error}</div>}
          {busy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" />Operator is working…</div>}
        </div>

        <div className="p-3 border-t border-border">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={1}
              placeholder="Tell the operator what to do…"
              className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0059ff] max-h-32"
            />
            <button onClick={send} disabled={busy || !ready || !input.trim()} className="xa-btn-primary" aria-label="Send to operator" style={{ padding: "10px 12px" }}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}