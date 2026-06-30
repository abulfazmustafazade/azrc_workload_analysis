import React from "react";
import { useTh, useT } from "../../contexts";
import { WORK_DAY_MIN, WORK_WEEK_DAYS, WORK_MONTH_DAYS } from "../../permissions";
import { fmt, fmt0 } from "../../lib";
import { Gauge } from "../shared";

export function SummaryPanel({ calc, rec, tasks, existing, meta, utilPctAvg, utilPctMax }) {
  const { theme } = useTh();
  const { t } = useT();

  const Section = ({ title, children, first }) => (
    <div className={first ? "" : "pt-4 mt-4"} style={first ? {} : { borderTop: `1px solid ${theme.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-[0.1em] font-semibold mb-3"
           style={{ color: theme.textDim }}>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-0">
      {/* Norma standartları */}
      <Section title={t("panel_norms")} first>
        <div className="space-y-2">
          {[
            [t("norm_workday"),   `${WORK_DAY_MIN} dəq · 7h`],
            [t("norm_workweek"),  `${WORK_WEEK_DAYS} gün`],
            [t("norm_workmonth"), `${WORK_MONTH_DAYS} gün`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center text-xs"
                 style={{ color: theme.textMuted }}>
              <span>{label}</span>
              <span className="tabular-nums font-medium" style={{ color: theme.text }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Yük göstəriciləri */}
      <Section title={t("panel_load")}>
        <Gauge label={t("load_avg")} pct={utilPctAvg} />
        <Gauge label={t("load_max")} pct={utilPctMax} accent />
      </Section>

      {/* Norm-say */}
      <Section title={t("panel_calc")}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            [t("calc_avg"), fmt(calc.avgNormSay)],
            [t("calc_max"), fmt(calc.maxNormSay)],
          ].map(([label, value]) => (
            <div key={label} className="p-3"
                 style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: 2 }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: theme.textDim }}>{label}</div>
              <div className="text-2xl font-light tabular-nums" style={{ color: theme.text }}>{value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Müqayisə */}
      <Section title={t("panel_compare")}>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs" style={{ color: theme.textMuted }}>{t("pos_current_stat")}</span>
            <span className="text-2xl font-light tabular-nums" style={{ color: theme.text }}>
              {fmt0(meta.stat)}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs" style={{ color: theme.textMuted }}>{t("rec_round")}</span>
            <span className="text-2xl font-light tabular-nums" style={{ color: theme.text }}>
              {Math.round(calc.maxNormSay) || "—"}
            </span>
          </div>
        </div>
        {tasks.length > 0 && (
          <div className="p-3" style={{ borderLeft: `3px solid ${rec.color}`,
                                         background: rec.color + "12", borderRadius: "0 2px 2px 0" }}>
            <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
                 style={{ color: rec.color }}>
              {t("rec_label")}
            </div>
            <div className="text-sm font-semibold" style={{ color: theme.text }}>{rec.label}</div>
            {rec.diff !== undefined && rec.diff !== 0 && (
              <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
                {rec.diff > 0 ? `+${rec.diff}` : rec.diff} {t("rec_change_unit")}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Audit izi */}
      {existing && (
        <Section title={t("panel_audit")}>
          <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
            <div className="flex justify-between">
              <span>{t("audit_last")}</span>
              <span className="font-medium" style={{ color: theme.text }}>{existing.updatedAt}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("audit_tasks")}</span>
              <span className="font-medium tabular-nums" style={{ color: theme.text }}>{tasks.length}</span>
            </div>
            {existing.updatedBy && (
              <div className="flex justify-between">
                <span>Kim</span>
                <span className="font-medium" style={{ color: theme.text }}>{existing.updatedBy}</span>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
