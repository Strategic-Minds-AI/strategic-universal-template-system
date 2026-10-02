import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Bot, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AGENT = "strategic_operator";

function ToolPill({ tc }) {
  const status = tc.status || "pending";
  const done = status === "completed" || status === "success";
  const failed = ["failed", "error"].includes(status) || (tc.results && /error|failed/i.test(String(tc.results)));
  const label = tc.display_projection?.label || tc.name || "tool";
  const hide = tc.display_projection?.hide_details && tc.display_projection?.details_redacted;
  const [open, setOpen] = useState(false);
  let parsed;
  try { parsed = typeof tc.results === "string" ? JSON.parse(tc.results) : tc.results; } catch { parsed = tc.results; }
  return (
    <div className="mt-1.5 text-xs">
      <button onClick={() => !hide && setOpen(!open)} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
        {failed ? <span className="text-red-600 font-bold">✕</span> : done ? <span className="text-green-600 font-bold">✓</span> : <Loader2 className="w-3 h-3 animate-spin" />}
        <span className="font-mono">{label}</span>
        <span className="text-[10px] uppercase tracking-wide">{failed ? "failed" : done ? "done" : "running"}</span>
      </button>
      {!hide && open && (
        <div className="mt-1 ml-4 space-y-1">
          {tc.arguments_string && <div><span className="font-semibold">Args:</span> <code className="text-[10px] break-all">{tc.arguments_string}</code></div>}
          {parsed != null && <div><span className="font-semibold">Result:</span><pre className="text-[10px] bg-muted p-1.5 rounded overflow-auto max-h-32 mt-0.5">{typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2)}</pre></div>}
        </div>
      )}
    </div>
  );
}

function Bubble({ m }) {
  const isUser = m.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={`max-w-[88%] rounded-2xl px-3 py-2 ${isUser ? "bg-[#0059ff] text-white" : "bg-muted text-foreground"}`}>
        {m.content && (isUser ? <p className="text-sm whitespace-pre-wrap">{m.content}</p> : <ReactMarkdown className="text-sm prose prose-sm max-w-none">{m.content}</ReactMarkdown>)}
        {m.tool_calls?.map((tc, i) => <ToolPill key={i} tc={tc} />)}
      </div>
    </div>
  );
}

export default function AgentChat() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open || conversation) return;
    setLoadingConv(true);
    (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT });
        let conv = list && list[0];
        if (!conv) conv = await base44.agents.createConversation({ agent_name: AGENT, metadata: { name: "Strategic Operator", description: "Autonomous operator session" } });
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch (e) {
        setMessages([{ role: "assistant", content: "Could not start the operator agent: " + (e?.message || "unknown") + ". The agent is configured — if this persists, integration credits may be exhausted this month." }]);
      } finally {
        setLoadingConv(false);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!conversation) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setBusy(false);
    });
    return () => unsub();
  }, [conversation]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !conversation || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: text }]);
    try {
      const updated = await base44.agents.addMessage(conversation, { role: "user", content: text });
      setConversation(updated);
    } catch (e) {
      setBusy(false);
      setMessages((m) => [...m, { role: "assistant", content: "Error sending: " + (e?.message || "failed") }]);
    }
  };

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
              <div className="text-[10px] opacity-90">Autonomous agent · full system access</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/15"><X className="w-4 h-4" /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto xa-scroll p-3 space-y-3">
          {loadingConv && <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="w-4 h-4 animate-spin" />Starting agent…</div>}
          {!loadingConv && messages.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Ask the operator to audit the factory, fix a run, optimize a registry, generate a logo, or provision a connected account.
            </div>
          )}
          {messages.map((m, i) => <Bubble key={i} m={m} />)}
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
            <button onClick={send} disabled={busy || !conversation} className="xa-btn-primary" style={{ padding: "10px 12px" }}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}