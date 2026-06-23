import React from "react";
import { useTh, useT, useAuth } from "../../contexts";

// Audit jurnalı — sistemdəki bütün admin əməliyyatları.
// Real Supabase qoşulduqda audit_log cədvəlindən gəlir (DB trigger-i ilə avtomatik).
export function AdminAudit() {
  const { theme } = useTh();
  const { t } = useT();
  const { auditLog } = useAuth();

  // Hər əməliyyat tipi üçün rəng kodu
  const actionColor = {
    audit_create: theme.success,
    audit_update: theme.info,
    audit_delete: theme.danger,
    audit_login: theme.neutral,
    audit_logout: theme.neutral,
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{t("adm_audit_title")}</h3>
        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{t("adm_audit_desc")}</p>
      </div>

      <div className="overflow-x-auto" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
        <table className="w-full text-sm min-w-[600px]">
          <thead style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
            <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
              <th className="text-left font-medium py-3 px-4">{t("adm_audit_when")}</th>
              <th className="text-left font-medium py-3 px-4">{t("adm_audit_who")}</th>
              <th className="text-left font-medium py-3 px-4">{t("adm_audit_action")}</th>
              <th className="text-left font-medium py-3 px-4">{t("adm_audit_target")}</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((e) => (
              <tr key={e.id} style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
                <td className="px-4 py-2.5 text-xs tabular-nums" style={{ color: theme.textMuted }}>{e.at}</td>
                <td className="px-4 py-2.5 text-sm">{e.actor}</td>
                <td className="px-4 py-2.5">
                  <span className="text-[10px] px-2 py-0.5" style={{
                    background: (actionColor[e.action] || theme.neutral) + "20",
                    color: actionColor[e.action] || theme.neutral,
                  }}>
                    {t(e.action)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-sm" style={{ color: theme.text }}>{e.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
