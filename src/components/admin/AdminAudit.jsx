import React from "react";
import { useTh, useT, useAuth } from "../../contexts";

export function AdminAudit() {
  const { theme } = useTh();
  const { t } = useT();
  const { auditLog } = useAuth();

  const actionMeta = {
    audit_create:  { label: t("audit_create"),  bg: theme.successBg, color: theme.success },
    audit_update:  { label: t("audit_update"),  bg: theme.infoBg,    color: theme.info },
    audit_delete:  { label: t("audit_delete"),  bg: theme.dangerBg,  color: theme.danger },
    audit_login:   { label: t("audit_login"),   bg: theme.neutralBg, color: theme.neutral },
    audit_logout:  { label: t("audit_logout"),  bg: theme.neutralBg, color: theme.neutral },
  };

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h3 className="text-base font-semibold" style={{ color: theme.text }}>{t("adm_audit_title")}</h3>
        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{t("adm_audit_desc")}</p>
      </div>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2, overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
              <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textDim }}>
                <th className="text-left font-semibold py-3 px-4">{t("adm_audit_when")}</th>
                <th className="text-left font-semibold py-3 px-4">{t("adm_audit_who")}</th>
                <th className="text-left font-semibold py-3 px-4">{t("adm_audit_action")}</th>
                <th className="text-left font-semibold py-3 px-4">{t("adm_audit_target")}</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map(e => {
                const m = actionMeta[e.action] || { label: e.action, bg: theme.neutralBg, color: theme.neutral };
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
                    <td className="px-4 py-3 text-xs tabular-nums" style={{ color: theme.textMuted }}>{e.at}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: theme.text }}>{e.actor}</td>
                    <td className="px-4 py-3">
                      <span className="badge" style={{ background: m.bg, color: m.color, borderRadius: 2 }}>
                        {m.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: theme.textMuted }}>{e.target}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
