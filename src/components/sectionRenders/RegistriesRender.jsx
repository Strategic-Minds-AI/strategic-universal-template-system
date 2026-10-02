import React from "react";
import RenderFrame from "./RenderFrame";
import { Library, FileBox, Shield, Server, Cpu, Boxes } from "lucide-react";

/**
 * Visual mockup of the Registries section — versioned profile/pack browsing.
 * Shows what a user sees: a list of versioned definitions with status pills.
 */
export default function RegistriesRender({ height = 320 }) {
  const rows = [
    { icon: Shield, name: "Quality Profile", key: "quality-pro", v: "2.1.0", status: "frozen", entity: "QualityProfile" },
    { icon: FileBox, name: "Template Pack", key: "landing-v3", v: "1.4.0", status: "published", entity: "TemplatePack" },
    { icon: Server, name: "Provisioning Profile", key: "prod-plan", v: "3.0.0", status: "approved", entity: "ProvisioningProfile" },
    { icon: Cpu, name: "Adapter Definition", key: "github-adapter", v: "1.2.0", status: "validated", entity: "AdapterDefinition" },
    { icon: Boxes, name: "Generator Definition", key: "seo-report", v: "2.0.0", status: "approved", entity: "GeneratorDefinition" },
  ];
  const statusCls = (s) => s === "frozen" ? "text-purple-600 bg-purple-50" : s === "published" ? "text-green-600 bg-green-50" : s === "approved" ? "text-[#0d2f96] bg-[#e6f0ff]" : "text-blue-600 bg-blue-50";
  return (
    <RenderFrame label="factory / registries" height={height}>
      <div className="p-3 h-full flex flex-col">
        <div className="flex items-center gap-1.5 mb-2">
          <Library className="w-3 h-3 text-[#0d2f96]" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Versioned Registry</span>
          <div className="ml-auto flex gap-1">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">All</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-foreground text-background">Profiles</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Packs</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-12 gap-1 px-2 py-1.5 bg-muted/60 text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
            <span className="col-span-5">Name</span>
            <span className="col-span-3">Key</span>
            <span className="col-span-2">Version</span>
            <span className="col-span-2">Status</span>
          </div>
          {rows.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={r.key} className={`grid grid-cols-12 gap-1 px-2 py-1.5 items-center text-[9px] border-t border-border ${i === 1 ? "bg-[#e6f0ff]/30" : ""}`}>
                <span className="col-span-5 flex items-center gap-1 truncate">
                  <Icon className="w-2.5 h-2.5 text-[#0d2f96] shrink-0" />
                  <span className="font-semibold truncate">{r.name}</span>
                </span>
                <span className="col-span-3 font-mono text-muted-foreground truncate">{r.key}</span>
                <span className="col-span-2 font-mono">v{r.v}</span>
                <span className="col-span-2"><span className={`text-[8px] font-bold px-1 py-0.5 rounded ${statusCls(r.status)}`}>{r.status}</span></span>
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-[8px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> published</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#0059ff]" /> approved</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> frozen</span>
          <span className="ml-auto font-mono">SHA-256 verified</span>
        </div>
      </div>
    </RenderFrame>
  );
}