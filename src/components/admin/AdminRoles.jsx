import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useTh, useT, useAuth } from "../../contexts";
import { PERM_GROUPS, PERM_LABELS } from "../../permissions";
import { uuid } from "../../lib";
import { Modal, FormField } from "../shared";

// Rol və icazə idarəetməsi.
// Sistem rolları (super_admin, hr_director, vs.) read-only — yalnız xüsusi rollar silinə bilər.
export function AdminRoles() {
  const { theme } = useTh();
  const { t, lang } = useT();
  const { roles, setRoles, users, pushAudit, can } = useAuth();
  const canManage = can("admin.roles");

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const saveRole = (r) => {
    if (r.id && roles.find((x) => x.id === r.id)) {
      setRoles(roles.map((x) => (x.id === r.id ? r : x)));
      pushAudit("audit_update", `${r.name_az} (rol)`);
    } else {
      const nr = { ...r, id: uuid(), system: false };
      setRoles([...roles, nr]);
      pushAudit("audit_create", `${r.name_az} (rol)`);
    }
    setShowForm(false);
    setEditing(null);
  };

  const deleteRole = (r) => {
    if (!confirm(t("confirm_delete"))) return;
    setRoles(roles.filter((x) => x.id !== r.id));
    pushAudit("audit_delete", `${r.name_az} (rol)`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-medium">{t("adm_roles_title")}</h3>
          <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{t("adm_roles_desc")}</p>
        </div>
        {canManage && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-3 py-2 text-xs md:text-sm flex items-center gap-1.5"
            style={{ background: theme.sidebar, color: "#fff" }}>
            <Plus size={14} /> {t("adm_add_role")}
          </button>
        )}
      </div>

      {/* Rol kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map((r) => {
          const userCount = users.filter((u) => u.role_id === r.id).length;
          return (
            <div key={r.id} className="p-4" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{lang === "az" ? r.name_az : r.name_en}</div>
                  <div className="text-[10px] mt-0.5">
                    <span className="px-1.5 py-0.5" style={{
                      background: r.system ? theme.info + "20" : theme.accent + "20",
                      color: r.system ? theme.info : theme.accent,
                    }}>
                      {r.system ? t("adm_role_system") : t("adm_role_custom")}
                    </span>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(r); setShowForm(true); }} className="p-1" style={{ color: theme.text }}>
                      <Edit2 size={13} />
                    </button>
                    {/* Sistem rolları silinə bilməz */}
                    {!r.system && (
                      <button onClick={() => deleteRole(r)} className="p-1" style={{ color: theme.danger }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-4 text-xs mt-3 pt-3"
                style={{ borderTop: `1px solid ${theme.borderSoft}`, color: theme.textMuted }}>
                <span><span className="font-medium tabular-nums" style={{ color: theme.text }}>{r.permissions.length}</span> {t("adm_perm_count")}</span>
                <span><span className="font-medium tabular-nums" style={{ color: theme.text }}>{userCount}</span> {t("adm_users_count")}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && <RoleForm role={editing} onSave={saveRole} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

// Rol form — icazələri kateqoriyalara görə qruplaşdırılmış checkbox-larla göstərir
function RoleForm({ role, onSave, onClose }) {
  const { theme } = useTh();
  const { t } = useT();
  const [r, setR] = useState(role || { name_az: "", name_en: "", permissions: [] });

  const togglePerm = (p) =>
    setR({
      ...r,
      permissions: r.permissions.includes(p)
        ? r.permissions.filter((x) => x !== p)
        : [...r.permissions, p],
    });

  return (
    <Modal title={role ? t("adm_role_modal_edit") : t("adm_role_modal_new")} onClose={onClose} onSave={() => onSave(r)} large>
      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("adm_role_name_az")}>
          <input value={r.name_az} onChange={(e) => setR({ ...r, name_az: e.target.value })} disabled={r.system}
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 }} />
        </FormField>
        <FormField label={t("adm_role_name_en")}>
          <input value={r.name_en} onChange={(e) => setR({ ...r, name_en: e.target.value })} disabled={r.system}
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 }} />
        </FormField>
      </div>

      <FormField label={t("adm_permissions")}>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2" style={{ background: theme.surfaceAlt, padding: "12px" }}>
          {Object.entries(PERM_GROUPS).map(([groupKey, perms]) => (
            <div key={groupKey}>
              <div className="text-[11px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: theme.textMuted }}>
                {t(groupKey)}
              </div>
              <div className="space-y-1 pl-2">
                {perms.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={r.permissions.includes(p)} onChange={() => togglePerm(p)} disabled={r.system} />
                    <span style={{ color: theme.text }}>{t(PERM_LABELS[p])}</span>
                    <span className="ml-auto text-[10px] tabular-nums" style={{ color: theme.textDim }}>{p}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormField>
    </Modal>
  );
}
