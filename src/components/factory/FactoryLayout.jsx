import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Boxes, Wrench, FileCode2, Terminal,
  Package, ShieldCheck, Hammer, Server, CheckSquare, Plug,
  Brain, MonitorSmartphone, Globe, Gauge, ScrollText, Settings, Search, Factory,
  Layers, Shield, Award, Workflow,
  ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";

const NAV = [
  { group: "Factory", items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true }, { to: "/projects", label: "Projects", icon: FolderKanban }] },
  { group: "Generators", items: [{ to: "/generators", label: "Generator Library", icon: Boxes }, { to: "/studio", label: "Generator Studio", icon: Wrench }, { to: "/templates", label: "Template Library", icon: FileCode2 }] },
  { group: "Registries", items: [{ to: "/capabilities", label: "Capability Registry", icon: Layers }, { to: "/registry/PolicyDefinition", label: "Policies", icon: Shield }, { to: "/registry/ValidationProfile", label: "Validation Profiles", icon: ShieldCheck }, { to: "/registry/QualityProfile", label: "Quality Profiles", icon: Award }, { to: "/registry/WorkflowDefinition", label: "Workflows", icon: Workflow }] },
  { group: "Execution", items: [{ to: "/runs", label: "Run Console", icon: Terminal }, { to: "/artifacts", label: "Artifact Explorer", icon: Package }] },
  { group: "Quality", items: [{ to: "/validation", label: "Validation Center", icon: ShieldCheck }, { to: "/repair", label: "Repair Center", icon: Hammer }] },
  { group: "Operations", items: [{ to: "/provisioning-system", label: "Universal Provisioning", icon: Server }, { to: "/provisioning", label: "Provisioning Center", icon: Server }, { to: "/approvals", label: "Approvals", icon: CheckSquare }, { to: "/adapters", label: "Adapter Library", icon: Plug }] },
  { group: "Intelligence", items: [{ to: "/agents", label: "Super Agents", icon: Brain }, { to: "/lead-scraper", label: "Lead Scraper", icon: Search }, { to: "/digital-dominance", label: "Digital Dominance", icon: Factory }, { to: "/bootstrap", label: "Bootstrap Wizard", icon: Wrench }, { to: "/consulting", label: "AI Consulting", icon: Brain }, { to: "/builder", label: "Frontend Factory", icon: MonitorSmartphone }, { to: "/industries", label: "Industry Packs", icon: Globe }] },
  { group: "Admin", items: [{ to: "/usage", label: "Usage / Budgets", icon: Gauge }, { to: "/audit", label: "Audit / Receipts", icon: ScrollText }, { to: "/settings", label: "Settings", icon: Settings }] },
];

export default function FactoryLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar: off-canvas drawer on mobile, persistent collapsible rail on desktop */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto flex flex-col border-r border-border bg-background transition-transform md:transition-all duration-200 w-64 md:w-auto ${
          collapsed ? "md:w-16" : "md:w-60"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-border">
          <Link to="/" className="flex items-center min-w-0">
            <BrandLogo size={26} withWordmark={!collapsed} />
          </Link>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
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
                        isActive ? "bg-[#0059ff] text-black" : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-10 border-t border-border items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden h-12 flex items-center gap-2 px-3 border-b border-border bg-background">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-muted text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center">
            <BrandLogo size={22} withWordmark />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto xa-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}