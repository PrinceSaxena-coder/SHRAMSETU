import React from "react";
import {
  LayoutDashboard,
  Users,
  UserRound,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Building2,
  AlertTriangle,
  HeartPulse,
  LogOut,
  X,
  MapPinned,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["workers", "Workers", Users],
  ["customers", "Customers", UserRound],
  ["bookings", "Bookings", ClipboardList],
  ["kyc", "KYC Verification", ShieldCheck],
  ["live", "Live Workers", MapPinned],
  ["reports", "Reports & Analytics", BarChart3],
  ["ai", "AI Insights", Sparkles],
  ["cooperatives", "Cooperative Network", Building2],
  ["disputes", "Disputes", AlertTriangle],
  ["welfare", "Worker Welfare", HeartPulse],
];

export default function AdminSidebar({
  activeTab = "dashboard",
  setActiveTab,
  mobileOpen = false,
  setMobileOpen,
}) {
  const nav = useNavigate(),
    loc = useLocation();
  const current = loc.pathname.includes("/admin/workers")
    ? "workers"
    : activeTab;
  const go = (id) => {
    setActiveTab?.(id);
    setMobileOpen?.(false);
    if (loc.pathname === "/admin/workers" && id !== "workers") nav("/admin");
  };
  const logout = () => {
    localStorage.removeItem("ss_admin_session");
    localStorage.removeItem("adminToken");
    setMobileOpen?.(false);
    nav("/admin/login");
  };
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#08111f] text-white shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-white/10 px-6">
          <div>
            <div className="text-xl font-black tracking-[.18em]">SHRAMSETU</div>
            <div className="mt-1 text-[10px] uppercase tracking-[.2em] text-slate-500">
              Cooperative Command
            </div>
          </div>
          <button
            className="rounded-xl p-2 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[.06] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-slate-900">
              A
            </div>
            <div>
              <b className="text-sm">System Administrator</b>
              <p className="text-xs text-slate-500">Operations & Governance</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">
            Workspace
          </p>
          {items.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${current === id ? "bg-white text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/[.07] hover:text-white"}`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {id === "kyc" && (
                <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] text-amber-300">
                  LIVE
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
