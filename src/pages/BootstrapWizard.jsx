import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAgent, SUPER_AGENTS, bootstrapAgent, validateAnswers, renderTemplate } from "@/lib/factory/superAgents";
import { ArrowLeft, Download, CheckCircle2, AlertTriangle, FileCode2, Loader2 } from "lucide-react";

export default function BootstrapWizard() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialKey = params.get("agent") || "orchestrator";
  const [agentKey, setAgentKey] = useState(initialKey);
  const agent = getAgent(agentKey);
  const [answers, setAnswers] = useState({});
  const [packet, setPacket] = useState(null);
  const [building, setBuilding] = useState(false);
  const [activeFile, setActiveFile] = useState(0);

  useEffect(() => {
    // seed defaults from schema
    if (!agent) return;
    const seed = {};
    agent.template.variables_schema.forEach((v) => { if (v.default !== undefined) seed[v.key] = v.default; });
    setAnswers(seed);
    setPacket(null);
  }, [agentKey]);

  const { missing, errors } = useMemo(() => agent ? validateAnswers(agent.template.variables_schema, answers) : { missing: [], errors: [] }, [agent, answers]);
  const ready = missing.length === 0 && errors.length === 0;

  const livePreview = useMemo(() => {
    if (!agent) return [];
    return agent.template.files.map((f) => ({ path: f.path, content: renderTemplate(f.content, answers) }));
  }, [agent, answers]);

  const build = async () => {
    setBuilding(true);
    try {
      const pkt = await bootstrapAgent(agentKey, answers);
      setPacket(pkt);
      setActiveFile(0);
    } catch (e) {
      // deterministic; surface error
      setPacket({ error: e.message });
    }
    setBuilding(false);
  };

  const download = () => {
    if (!packet || packet.error) return;
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentKey}-bootstrap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!agent) {
    return <div className="p-8 text-sm text-muted-foreground">Unknown agent. <button className="underline" onClick={() => navigate("/agents")}>Back to registry</button></div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate("/agents")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="w-3.5 h-3.5" /> Super Agents
      </button>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{agent.icon}</span>
        <div className="min-w-0">
          <h1 className="text-xl font-black font-heading text-foreground">{agent.name} · Bootstrap</h1>
          <div className="text-[11px] font-mono text-muted-foreground">{agent.template.label} · v{agent.version}</div>
        </div>
      </div>

      {/* Agent picker */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {SUPER_AGENTS.map((a) => (
          <button key={a.key} onClick={() => setAgentKey(a.key)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${a.key === agentKey ? "bg-foreground text-background" : "text-muted-foreground bg-muted hover:bg-muted/70"}`}>
            {a.icon} {a.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Questionnaire */}
        <div className="xa-card p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-[#0d2f96]">①</span> Brand Questionnaire
          </h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto xa-scroll pr-1">
            {agent.template.variables_schema.map((v) => (
              <div key={v.key}>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  {v.label}
                  {v.required && <span className="text-red-500">*</span>}
                </label>
                {v.help && <div className="text-[10px] text-muted-foreground mb-1">{v.help}</div>}
                {v.type === "select" ? (
                  <select value={answers[v.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [v.key]: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                    {(v.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : v.type === "textarea" ? (
                  <textarea value={answers[v.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [v.key]: e.target.value })} rows={3}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : v.type === "color" ? (
                  <div className="flex gap-2 items-center">
                    <input type="color" value={answers[v.key] ?? "#0059ff"} onChange={(e) => setAnswers({ ...answers, [v.key]: e.target.value })}
                      className="w-10 h-9 rounded-lg border border-input bg-background p-1" />
                    <input type="text" value={answers[v.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [v.key]: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 text-sm font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ) : v.type === "number" ? (
                  <input type="number" value={answers[v.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [v.key]: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : (
                  <input type="text" value={answers[v.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [v.key]: e.target.value })}
                    placeholder={v.type === "image" ? "https://..." : ""}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            {missing.length > 0 && (
              <div className="text-[11px] text-amber-600 flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3 h-3" /> Missing required: {missing.join(", ")}
              </div>
            )}
            {errors.length > 0 && (
              <div className="text-[11px] text-red-600 mb-2">{errors.join(", ")}</div>
            )}
            <button onClick={build} disabled={!ready || building} className="xa-btn-primary text-xs w-full" style={{ padding: "10px 14px" }}>
              {building ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {building ? "Rendering packet…" : "Render ready-to-go packet"}
            </button>
          </div>
        </div>

        {/* Live preview / packet */}
        <div className="xa-card p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-[#0d2f96]">②</span> {packet && !packet.error ? "Rendered Packet" : "Live Preview"}
          </h2>

          {!packet && (
            <div className="text-[11px] text-muted-foreground mb-2">Live substitution as you type (not yet integrity-sealed).</div>
          )}

          {packet && packet.error && (
            <div className="text-xs text-red-600 p-3 bg-red-50 rounded-lg">{packet.error}</div>
          )}

          {packet && !packet.error && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs mb-2">
                {packet.validation.ready ? (
                  <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> Incomplete</span>
                )}
                <span className="text-muted-foreground">· {packet.files.length} files · SHA-256 sealed</span>
              </div>
              <div className="text-[10px] text-amber-700 bg-amber-50 rounded p-2 mb-2">
                AI enrichment: <span className="font-mono font-bold">{packet.ai_enrichment.status}</span> — {packet.ai_enrichment.reason}
              </div>
              <button onClick={download} className="xa-btn-primary text-[11px] w-full mb-2" style={{ padding: "8px 12px" }}>
                <Download className="w-3 h-3" /> Download packet (.json)
              </button>
            </div>
          )}

          <div className="flex gap-1 mb-2 flex-wrap">
            {(packet && packet.files ? packet.files : livePreview).map((f, i) => (
              <button key={f.path} onClick={() => setActiveFile(i)}
                className={`px-2 py-1 rounded text-[10px] font-mono ${i === activeFile ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                <FileCode2 className="w-3 h-3 inline mr-1" />{f.path.split("/").pop()}
              </button>
            ))}
          </div>
          <pre className="text-[10px] font-mono bg-muted/60 rounded-lg p-3 max-h-[40vh] overflow-auto xa-scroll whitespace-pre-wrap break-words">
{(packet && packet.files ? packet.files[activeFile]?.content : livePreview[activeFile]?.content) || ""}
          </pre>
        </div>
      </div>
    </div>
  );
}