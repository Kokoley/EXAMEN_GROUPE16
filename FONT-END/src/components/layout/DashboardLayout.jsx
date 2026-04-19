import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";

export function DashboardLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <Outlet />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 transition md:hidden ${
          mobileOpen ? "opacity-100 visible" : "pointer-events-none opacity-0 invisible"
        }`}
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-xl transition md:static md:translate-x-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar role={user.role} onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
