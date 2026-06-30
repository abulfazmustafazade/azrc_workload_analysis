import React, { useState, useEffect } from "react";
import { useTh } from "../contexts";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { Dashboard } from "./Dashboard";
import { PositionLibrary } from "./PositionLibrary";
import { ReportView } from "./ReportView";
import { AnalysisEditor } from "./analysis/AnalysisEditor";
import { AdminLayout } from "./admin/AdminLayout";

// Auth keçdikdən sonra göstərilən əsas layout.
// Sidebar (desktop) + mobil drawer + top bar + əsas məzmun + footer.
// Sadə client-side routing — `route` state-i ilə.
export function AppShell() {
  const { theme } = useTh();
  const [route, setRoute] = useState({ view: "dashboard" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Route dəyişəndə mobil sidebar avtomatik bağlansın
  useEffect(() => { setSidebarOpen(false); }, [route]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar route={route} setRoute={setRoute} />
      </div>

      {/* Mobil sidebar drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar route={route} setRoute={setRoute} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Əsas məzmun — öz scroll-u var, sidebar-dan asılı olmayaraq */}
      <main className="flex-1 min-w-0 flex flex-col" style={{ background: theme.bg }}>
        <TopBar route={route} setRoute={setRoute} onMenu={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {route.view === "dashboard" && <Dashboard setRoute={setRoute} />}
          {route.view === "library" && <PositionLibrary setRoute={setRoute} initialDept={route.dept} />}
          {route.view === "analyze" && <AnalysisEditor pid={route.pid} setRoute={setRoute} />}
          {route.view === "report" && <ReportView setRoute={setRoute} />}
          {route.view === "admin" && <AdminLayout subview={route.sub || "users"} setRoute={setRoute} />}
          <Footer />
        </div>
      </main>
    </div>
  );
}
