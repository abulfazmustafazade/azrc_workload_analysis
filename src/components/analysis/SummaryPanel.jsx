import React from "react";
import { useTh, useT } from "../../contexts";
import { WORK_DAY_MIN, WORK_WEEK_DAYS, WORK_MONTH_DAYS } from "../../permissions";
import { fmt, fmt0 } from "../../lib";
import { Gauge } from "../shared";

// Analiz redaktorunun sağ tərəfindəki xülasə paneli.
// İş günü standartları, yük göstəriciləri, norm-say hesablanması və tövsiyə.
export function SummaryPanel({ calc, rec, tasks, existing, meta, utilPctAvg, utilPctMax }) {
  const { theme } = useTh();
  const { t } = useT();

  return (
    <div className="space-y-5" style={{ background: theme.surface }}>
      {/* İş günü standartları */}
      <div className="p-4 md:p-0">
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>{t("panel_norms")}</div>
        <div className="text-xs space-y-1.5" style={{ color: theme.textMuted }}>
          <div className="flex justify-between"><span>{t("norm_workday")}</span><span className="tabular-nums" style={{ color: theme.text }}>{WORK_DAY_MIN} dəq · 7h</span></div>
          <div className="flex justify-between"><span>{t("norm_workweek")}</span><span className="tabular-nums" style={{ color: theme.text }}>{WORK_WEEK_DAYS}</span></div>
          <div className="flex justify-between"><span>{t("norm_workmonth")}</span><span className="tabular-nums" style={{ color: theme.text }}>{WORK_MONTH_DAYS}</span></div>
        </div>
      </div>

      {/* Yük göstəriciləri (orta və maks.) */}
      <div className="p-4 md:p-0" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
        <div className="text-[10px] uppercase tracking-wider mb-3 pt-4 md:pt-0" style={{ color: theme.textMuted }}>{t("panel_load")}</div>
        <Gauge label={t("load_avg")} pct={utilPctAvg} />
        <Gauge label={t("load_max")} pct={utilPctMax} accent />
      </div>

      {/* Norm-say hesablanması */}
      <div className="p-4 md:p-0" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
        <div className="text-[10px] uppercase tracking-wider mb-3 pt-4 md:pt-0" style={{ color: theme.textMuted }}>{t("panel_calc")}</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3" style={{ background: theme.surfaceAlt }}>
            <div className="text-[10px] uppercase" style={{ color: theme.textMuted }}>{t("calc_avg")}</div>
            <div className="text-2xl font-light tabular-nums mt-1">{fmt(calc.avgNormSay)}</div>
          </div>
          <div className="p-3" style={{ background: theme.surfaceAlt }}>
            <div className="text-[10px] uppercase" style={{ color: theme.textMuted }}>{t("calc_max")}</div>
            <div className="text-2xl font-light tabular-nums mt-1">{fmt(calc.maxNormSay)}</div>
          </div>
        </div>
      </div>

      {/* Cari ştat ilə müqayisə və tövsiyə */}
      <div className="p-4 md:p-0" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
        <div className="text-[10px] uppercase tracking-wider mb-3 pt-4 md:pt-0" style={{ color: theme.textMuted }}>{t("panel_compare")}</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-baseline">
            <span style={{ color: theme.textMuted }}>{t("pos_current_stat")}</span>
            <span className="text-2xl font-light tabular-nums">{fmt0(meta.stat)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span style={{ color: theme.textMuted }}>{t("rec_round")}</span>
            <span className="text-2xl font-light tabular-nums">{Math.round(calc.maxNormSay) || "—"}</span>
          </div>
        </div>
        {tasks.length > 0 && (
          <div className="mt-4 p-3" style={{ borderLeft: `2px solid ${rec.color}`, background: rec.color + "12" }}>
            <div className="text-xs uppercase tracking-wider font-medium" style={{ color: rec.color }}>{t("rec_label")}</div>
            <div className="text-base font-medium mt-0.5">{rec.label}</div>
            {rec.diff !== undefined && rec.diff !== 0 && (
              <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
                {rec.diff > 0 ? `+${rec.diff}` : rec.diff} {t("rec_change_unit")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit izi */}
      {existing && (
        <div className="p-4 md:p-0" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
          <div className="text-[10px] uppercase tracking-wider mb-2 pt-4 md:pt-0" style={{ color: theme.textMuted }}>{t("panel_audit")}</div>
          <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
            <div>{t("audit_last")}: {existing.updatedAt} · {existing.updatedBy}</div>
            <div>{t("audit_tasks")}: {tasks.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
