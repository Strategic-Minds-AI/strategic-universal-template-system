import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function useGatewayConversation(agentKey = "strategic_operator", context = "") {
  const { user } = useAuth();
  const key = user?.id ? `vercel.agent.${user.id}.${agentKey}` : null;
  const [session, setSession] = useState({ key: null, messages: [] });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const messages = session.key === key ? session.messages : [];
  useEffect(() => {
    let saved = [];
    try { saved = key ? JSON.parse(localStorage.getItem(key) || "[]") : []; } catch { /* invalid local history */ }
    setSession({ key, messages: Array.isArray(saved) ? saved : [] }); setInput(""); setError("");
  }, [key]);
  useEffect(() => {
    if (key && session.key === key) {
      try { localStorage.setItem(key, JSON.stringify(session.messages.slice(-40))); } catch { /* keep session in memory */ }
    }
  }, [key, session]);
  const send = async () => {
    const text = input.trim();
    if (!text || inFlight.current || !key) return;
    inFlight.current = true; setBusy(true); setError(""); setInput("");
    const next = [...messages, { role: "user", content: text }];
    setSession({ key, messages: next });
    try {
      const res = await base44.functions.invoke("agentChat", {
        agent_key: agentKey, context,
        messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content.slice(0, 8000) })),
      });
      if (res.data?.error) throw new Error(res.data.error);
      if (!res.data?.content) throw new Error("Vercel AI Gateway returned no reply");
      setSession({ key, messages: [...next, { role: "assistant", content: res.data.content, tool_calls: res.data.tool_calls }] });
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Unable to reach your Vercel AI Gateway");
      setInput(text); setSession({ key, messages });
    } finally { inFlight.current = false; setBusy(false); }
  };
  return { messages, input, setInput, busy, error, send, ready: !!key };
}