import React from "react";
import { Users as UsersIcon, KeyRound, GitBranch, ScrollText } from "lucide-react";
import { useTh, useT, useAuth } from "../../contexts";
import { AdminUsers } from "./AdminUsers";
import { AdminRoles } from "./AdminRoles";
import { AdminStructure } from "./AdminStructure";
import { AdminAudit } from "./AdminAudit";

// Admin panelinin tab əsaslı layoutu.
// Yalnız müvafiq icazəsi olan tablar görünür.
export function AdminLayout({ subview, setRoute }) {
  const { theme } = useTh();
  const { t } = useT();
  const { can } = useAuth();

  const tabs = [
    { id: "users", label: t("admin_users"), icon: UsersIcon, perm: "admin.users" },
    { id: "roles", label: t("admin_roles"), icon: KeyRound, perm: "admin.roles" },
    { id: "structure", label: t("admin_structure"), icon: GitBranch, perm: "admin.structure" },
    { id: "audit", label: t("admin_audit"), icon: ScrollText, perm: "admin.audit" },
  ].filter((tab) => can(tab.perm));

  const active = tabs.find((tab) => tab.id === subview) || tabs[0];

  return (
    <div className="p-4 md:p-8 space-y-4">
      {/* Tab nav */}
      <div className="flex overflow-x-auto" style={{ borderBottom: `1px solid ${theme.border}` }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active.id === tab.id;
          return (
            <button key={tab.id} onClick={() => setRoute({ view: "admin", sub: tab.id })}
              className="flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap"
              style={{
                color: isActive ? theme.text : theme.textMuted,
                borderBottom: isActive ? `2px solid ${theme.accent}` : "2px solid transparent",
                marginBottom: "-1px",
              }}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Aktiv tab məzmunu */}
      {active.id === "users" && <AdminUsers />}
      {active.id === "roles" && <AdminRoles />}
      {active.id === "structure" && <AdminStructure />}
      {active.id === "audit" && <AdminAudit />}
    </div>
  );
}
