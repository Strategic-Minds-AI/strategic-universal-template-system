import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAgent, SUPER_AGENTS } from "@/lib/factory/superAgents";
import { ArrowLeft, Wrench, Terminal, AlertTriangle } from "lucide-react";

export default function AgentOperate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const agentKey = params.get("agent") || "orchestrator";
  const agent = getAgent(agentKey);
  const [input, setInput] = useState("");

  if (!agent) {
    return <div className="p-8 text-sm text-muted-foreground">Unknown agent. <button className="underline" onClick={() => navigate("/agents")}>Back</button></div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate("/agents")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="w-3.5 h-3.5" /> Super Agents
      </button>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{agent.icon}</span>
        <div className="min-w-0">
          <h1 className="text-xl font-black font-heading text-foreground">{agent.name}</h1>
          <div className="text-[11px] font-mono text-muted-foreground">{agent.key} · v{agent.version} · {agent.category}</div>
        </div>
      </div>

      <div className="xa-card p-4 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-2">System Prompt (operator)</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">{agent.system_prompt}</p>
      </div>

      <div className="xa-card p-4 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-[#CCBB00]" /> Tools</h2>
        <div className="flex flex-wrap gap-1.5">
          {agent.tools.map((t) => (
            <span key={t} className="text-[11px] font-mono text-foreground bg-muted px-2 py-1 rounded">{t}</span>
          ))}
        </div>
      </div>

      <div className="xa-card p-4 border-amber-200 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-foreground">Live agent loop: NOT_CONFIGURED</div>
            <div className="text-muted-foreground mt-1">
              The conversation runtime (LLM tool loop) needs the AI Gateway, which is out of integration credits until 2026-10-12.
              The agent definition, system prompt, and tools above are registered and versioned — the moment credits reset, this shell
              connects to the live loop with zero code changes. Meanwhile, you can still bootstrap this agent's template deterministically.
            </div>
          </div>
        </div>
      </div>

      <div className="xa-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-3.5 h-3.5 text-[#CCBB00]" />
          <span className="text-xs font-semibold">Give {agent.name} a goal</span>
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} disabled
          placeholder="Live dispatch re-enables when the AI Gateway is configured (credits reset 2026-10-12)."
          className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-muted/40 text-muted-foreground resize-none" />
        <button disabled className="xa-btn-outline text-xs w-full mt-2 opacity-50 cursor-default" style={{ padding: "8px 12px" }}>
          Dispatch (NOT_CONFIGURED)
        </button>
      </div>
    </div>
  );
}