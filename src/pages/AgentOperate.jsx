import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAgent } from "@/lib/factory/superAgents";
import { ArrowLeft, Terminal } from "lucide-react";
import GatewayConversation from "@/components/agents/GatewayConversation";

export default function AgentOperate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const agentKey = params.get("agent") || "orchestrator";
  const agent = getAgent(agentKey);

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
        <h2 className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-[#0d2f96]" /> Entity Tools · Tier {agent.tier} (full CRUD)</h2>
        <div className="space-y-1.5 mb-3">
          {(agent.tool_configs || []).map((t) => (
            <div key={t.entity_name} className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-semibold text-foreground">{t.entity_name}</span>
              <span className="font-mono text-muted-foreground">{t.allowed_operations.join(" · ")}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
          {agent.tools.map((t) => (
            <span key={t} className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{t}</span>
          ))}
        </div>
      </div>

      <GatewayConversation key={agentKey} agentKey={agentKey} context={agent.system_prompt} name={agent.name} />
    </div>
  );
}