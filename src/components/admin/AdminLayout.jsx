import React from "react";
import { Users as UsersIcon, KeyRound, GitBranch, ScrollText } from "lucide-react";
import { useTh, useT, useAuth } from "../../contexts";
import { AdminUsers } from "./AdminUsers";
import { AdminRoles } from "./AdminRoles";
import { AdminStructure } from "./AdminStructure";
import { AdminAudit } from "./AdminAudit";

export function AdminLayout({ subview, setRoute }) {
  const { theme } = useTh();
  const { t } = useT();
  const { can } = useAuth();

  const tabs = [
    { id: "users",     label: t("admin_users"),     icon: UsersIcon,  perm: "admin.users" },
    { id: "roles",     label: t("admin_roles"),     icon: KeyRound,   perm: "admin.roles" },
    { id: "structure", label: t("admin_structure"), icon: GitBranch,  perm: "admin.structure" },
    { id: "audit",     label: t("admin_audit"),     icon: ScrollText, perm: "admin.audit" },
  ].filter(tab => can(tab.perm));

  const active = tabs.find(tab => tab.id === subview) || tabs[0];
  if (!active) return null;

  return (
    <div className="page-enter">
      {/* Tab nav */}
      <div className="flex overflow-x-auto px-4 md:px-6"
           style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}` }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active.id === tab.id;
          return (
            <button key={tab.id} onClick={() => setRoute({ view: "admin", sub: tab.id })}
                    className="flex items-center gap-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors"
                    style={{
                      color: isActive ? theme.accent : theme.textMuted,
                      borderBottom: isActive ? `2px solid ${theme.accent}` : "2px solid transparent",
                      marginBottom: "-1px",
                    }}>
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Məzmun */}
      <div className="p-4 md:p-6">
        {active.id === "users"     && <AdminUsers />}
        {active.id === "roles"     && <AdminRoles />}
        {active.id === "structure" && <AdminStructure />}
        {active.id === "audit"     && <AdminAudit />}
      </div>
    </div>
  );
}
