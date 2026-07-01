import React, { useState } from "react";
import { UserPlus, Edit2, Trash2 } from "lucide-react";
import { useTh, useT, useAuth, useToast } from "../../contexts";
import { nodeName } from "../../lib";
import { usersApi } from "../../db";
import { Modal, FormField } from "../shared";

export function AdminUsers() {
  const { theme } = useTh();
  const { t, lang } = useT();
  const { users, roles, structure, pushAudit, can, reloadData } = useAuth();
  const canManage = can("admin.users");
  const { addToast } = useToast();

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveUser = async (u) => {
    setSaving(true);
    try {
      if (u.id) {
        await usersApi.update(u.id, {
          full_name: u.full_name, role_id: u.role_id,
          scope: u.scope === "all" ? ["*"] : u.scope,
          status: u.status,
        });
        pushAudit("audit_update", `${u.full_name} (istifadəçi)`);
      } else {
        await usersApi.create({
          email: u.email, password: u.tempPassword || Math.random().toString(36).slice(2, 12),
          full_name: u.full_name, role_id: u.role_id,
          scope: u.scope === "all" ? ["*"] : u.scope,
        });
        pushAudit("audit_create", `${u.full_name} (istifadəçi)`);
      }
      await reloadData();
      addToast("Yadda saxlandı", "success");
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error("[YÜKAY] İstifadəçi saxlanılmadı:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
  };

  const deleteUser = async (u) => {
    if (!confirm(t("confirm_delete"))) return;
    setSaving(true);
    try {
      await usersApi.remove(u.id);
      pushAudit("audit_delete", `${u.full_name} (istifadəçi)`);
      await reloadData();
      addToast("İstifadəçi silindi", "success");
    } catch (err) {
      console.error("[YÜKAY] İstifadəçi silinmədi:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>{t("adm_users_title")}</h3>
          <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{t("adm_users_desc")}</p>
        </div>
        {canManage && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
                  disabled={saving}
                  className="px-3 py-2 text-xs font-semibold flex items-center gap-1.5 text-white disabled:opacity-50"
                  style={{ background: theme.sidebar, borderRadius: 2 }}>
            <UserPlus size={14} /> {t("adm_add_user")}
          </button>
        )}
      </div>

      <div className="overflow-x-auto" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2 }}>
        <table className="w-full text-sm min-w-[800px]">
          <thead style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
            <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
              <th className="text-left font-semibold py-3 px-4">{t("adm_col_name")}</th>
              <th className="text-left font-semibold py-3 px-4">{t("adm_col_role")}</th>
              <th className="text-left font-semibold py-3 px-4">{t("adm_col_scope")}</th>
              <th className="text-left font-semibold py-3 px-4">{t("adm_col_status")}</th>
              <th className="text-left font-semibold py-3 px-4 hidden md:table-cell">{t("adm_col_created")}</th>
              <th className="text-right font-semibold py-3 px-4">{t("adm_col_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const r = roles.find((x) => x.id === u.role_id);
              return (
                <tr key={u.id} style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.full_name}</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5"
                          style={{ background: r?.system ? theme.info + "20" : theme.accent + "20",
                                   color: r?.system ? theme.info : theme.accent, borderRadius: 2 }}>
                      {lang === "az" ? r?.name_az : r?.name_en}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.scope === "all"
                      ? <span style={{ color: theme.success }}>{t("adm_scope_all")}</span>
                      : `${Array.isArray(u.scope) ? u.scope.length : 0} ${t("adm_scope_count")}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs"
                          style={{ color: u.status === "active" ? theme.success : theme.textMuted }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                            style={{ background: u.status === "active" ? theme.success : theme.textMuted }} />
                      {u.status === "active" ? t("adm_status_active") : t("adm_status_inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell" style={{ color: theme.textMuted }}>
                    {u.created_at}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canManage && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(u); setShowForm(true); }} className="p-1" style={{ color: theme.text }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteUser(u)} className="p-1" style={{ color: theme.danger }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <UserForm user={editing} onSave={saveUser} saving={saving}
                  onClose={() => { setShowForm(false); setEditing(null); }}
                  roles={roles} structure={structure} />
      )}
    </div>
  );
}

function UserForm({ user, onSave, onClose, saving, roles, structure }) {
  const { theme } = useTh();
  const { t, lang } = useT();
  const [u, setU] = useState(user || {
    full_name: "", email: "", role_id: "viewer", scope: [], status: "active",
  });
  const allDepts = collectDeptNames(structure, lang);
  const isAllScope = u.scope === "all";
  const st = { background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 };

  return (
    <Modal title={user ? t("adm_user_modal_edit") : t("adm_user_modal_new")}
           onClose={onClose} onSave={() => onSave(u)}>
      <FormField label={t("adm_full_name")}>
        <input value={u.full_name} onChange={(e) => setU({ ...u, full_name: e.target.value })}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
      </FormField>
      <FormField label={t("adm_col_email")}>
        <input type="email" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
      </FormField>
      {!user && (
        <FormField label={t("adm_temp_password")} help={t("adm_temp_password_help")}>
          <input type="text" value={u.tempPassword || ""} onChange={(e) => setU({ ...u, tempPassword: e.target.value })}
                 placeholder="••••••••" autoComplete="off"
                 className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
        </FormField>
      )}
      <FormField label={t("adm_role")}>
        <select value={u.role_id} onChange={(e) => setU({ ...u, role_id: e.target.value })}
                className="w-full px-3 py-2 text-sm focus:outline-none" style={st}>
          {roles.map((r) => <option key={r.id} value={r.id}>{lang === "az" ? r.name_az : r.name_en}</option>)}
        </select>
      </FormField>
      <FormField label={t("adm_scope_label")} help={t("adm_scope_help")}>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isAllScope}
                   onChange={(e) => setU({ ...u, scope: e.target.checked ? "all" : [] })} />
            <span style={{ color: theme.success, fontWeight: 500 }}>{t("adm_scope_all")}</span>
          </label>
          {!isAllScope && allDepts.map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm pl-2">
              <input type="checkbox" checked={Array.isArray(u.scope) && u.scope.includes(d)}
                     onChange={(e) => {
                       const sc = Array.isArray(u.scope) ? u.scope : [];
                       setU({ ...u, scope: e.target.checked ? [...sc, d] : sc.filter((x) => x !== d) });
                     }} />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </FormField>
      <FormField label={t("adm_col_status")}>
        <select value={u.status} onChange={(e) => setU({ ...u, status: e.target.value })}
                className="w-full px-3 py-2 text-sm focus:outline-none" style={st}>
          <option value="active">{t("adm_status_active")}</option>
          <option value="inactive">{t("adm_status_inactive")}</option>
        </select>
      </FormField>
    </Modal>
  );
}

function collectDeptNames(structure, lang) {
  const names = [];
  function walk(nodes) {
    nodes.forEach((n) => {
      if (n.level === "department") names.push(nodeName(n, lang));
      if (n.children?.length) walk(n.children);
    });
  }
  walk(structure);
  return names;
}
