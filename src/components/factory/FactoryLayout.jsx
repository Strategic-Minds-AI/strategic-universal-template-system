import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Boxes, Wrench, FileCode2, Terminal,
  Package, ShieldCheck, Hammer, Server, CheckSquare, Plug,
  Brain, MonitorSmartphone, Globe, Gauge, ScrollText, Settings,
  Layers, Shield, Award, Workflow,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";

const NAV = [
  { group: "Factory", items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true }, { to: "/projects", label: "Projects", icon: FolderKanban }] },
  { group: "Generators", items: [{ to: "/generators", label: "Generator Library", icon: Boxes }, { to: "/studio", label: "Generator Studio", icon: Wrench }, { to: "/templates", label: "Template Library", icon: FileCode2 }] },
  { group: "Registries", items: [{ to: "/capabilities", label: "Capability Registry", icon: Layers }, { to: "/registry/PolicyDefinition", label: "Policies", icon: Shield }, { to: "/registry/ValidationProfile", label: "Validation Profiles", icon: ShieldCheck }, { to: "/registry/QualityProfile", label: "Quality Profiles", icon: Award }, { to: "/registry/WorkflowDefinition", label: "Workflows", icon: Workflow }] },
  { group: "Execution", items: [{ to: "/runs", label: "Run Console", icon: Terminal }, { to: "/artifacts", label: "Artifact Explorer", icon: Package }] },
  { group: "Quality", items: [{ to: "/validation", label: "Validation Center", icon: ShieldCheck }, { to: "/repair", label: "Repair Center", icon: Hammer }] },
  { group: "Operations", items: [{ to: "/provisioning", label: "Provisioning Center", icon: Server }, { to: "/approvals", label: "Approvals", icon: CheckSquare }, { to: "/adapters", label: "Adapter Library", icon: Plug }] },
  { group: "Intelligence", items: [{ to: "/consulting", label: "AI Consulting", icon: Brain }, { to: "/builder", label: "Frontend Factory", icon: MonitorSmartphone }, { to: "/industries", label: "Industry Packs", icon: Globe }] },
  { group: "Admin", items: [{ to: "/usage", label: "Usage / Budgets", icon: Gauge }, { to: "/audit", label: "Audit / Receipts", icon: ScrollText }, { to: "/settings", label: "Settings", icon: Settings }] },
];

export default function FactoryLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className={`shrink-0 border-r border-border bg-background flex flex-col transition-all ${collapsed ? "w-16" : "w-60"}`}>
        <div className="h-14 flex items-center px-3 border-b border-border">
          <Link to="/" className="flex items-center min-w-0">
            <BrandLogo size={26} withWordmark={!collapsed} />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto xa-scroll py-2">
          {NAV.map((sec) => (
            <div key={sec.group} className="mb-3">
              {!collapsed && <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{sec.group}</div>}
              {sec.items.map((it) => {
                const Icon = it.icon;
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 mx-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? "bg-[#FFEA00] text-black" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`
                    }
                    title={it.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <button onClick={() => setCollapsed(!collapsed)} className="h-10 border-t border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto xa-scroll">
        <Outlet />
      </main>
    </div>
  );
}