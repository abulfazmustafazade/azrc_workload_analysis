import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PiggyBank, TrendingDown } from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { flattenStructure, calcNormSay, recommendation, calcSavings, calcTotalSavings, fmt, fmt0, fmtMoney } from "../lib";
import { KPI, SectionTitle } from "./shared";

// Yekun hesabat — KPI-lar, bar chart, qənaət xülasəsi və bütün vəzifələri əhatə edən cədvəl.
export function ReportView({ setRoute }) {
  const { theme } = useTh();
  const { t, lang } = useT();
  const { structure, analyses, inScope } = useAuth();

  const all = useMemo(
    () => flattenStructure(structure, lang).filter((r) => inScope(r.dept)),
    [structure, inScope, lang]
  );
  const visibleDepts = [...new Set(all.map((r) => r.dept))];

  // Hər vəzifə üçün norm-say + tövsiyə + qənaət hesablaması
  const rows = all.map((r) => {
    const an = analyses[r.id];
    const calc = an ? calcNormSay(an.tasks) : null;
    const rec = calc ? recommendation(r.stat, calc.maxNormSay, theme, t) : null;
    const savings = rec ? calcSavings(r, rec) : { monthly: 0, annual: 0, isReduction: false };
    return { ...r, calc, rec, savings, status: an?.status };
  });

  const summary = {
    total: rows.length,
    totalStat: rows.reduce((s, r) => s + (typeof r.stat === "number" ? r.stat : 0), 0),
    totalNeed: rows.reduce((s, r) => s + (typeof r.ehtiyac === "number" ? r.ehtiyac : 0), 0),
    increase: rows.filter((r) => (r.teklif || 0) > 0).reduce((s, r) => s + r.teklif, 0),
    decrease: rows.filter((r) => (r.teklif || 0) < 0).reduce((s, r) => s + r.teklif, 0),
  };

  const totalSavings = calcTotalSavings(all, analyses, theme, t);

  return (
    <div className="p-4 md:p-6 space-y-4 page-enter">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label={t("rpt_kpi_total")} value={summary.total} hint={`${visibleDepts.length} ${t("rpt_kpi_total_hint")}`} />
        <KPI label={t("rpt_kpi_stat")} value={fmt0(summary.totalStat)} hint={t("kpi_stat_hint")} />
        <KPI label={t("rpt_kpi_need")} value={fmt0(summary.totalNeed)} hint={t("rpt_kpi_need_hint")} />
        <KPI label={t("kpi_savings")} value={fmtMoney(totalSavings.annual)}
             hint={`${totalSavings.positionsAffected} ${t("savings_affected")}`}
             icon={PiggyBank} trend={totalSavings.annual > 0 ? "up" : undefined} />
      </div>

      {/* Qənaət xülasə kartı */}
      {totalSavings.annual > 0 && (
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
             style={{ background: `linear-gradient(135deg, ${theme.successBg}, ${theme.surface})`,
                      border: `1px solid ${theme.success}30`, borderRadius: 2 }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                 style={{ background: theme.success, borderRadius: 2 }}>
              <PiggyBank size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: theme.text }}>
                {t("savings_summary_title")}
              </div>
              <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                {t("savings_summary_desc")} · {totalSavings.positionsAffected} {t("savings_affected")}
              </div>
            </div>
          </div>
          <div className="flex gap-6 flex-shrink-0">
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: theme.textDim }}>
                {t("savings_monthly")}
              </div>
              <div className="text-xl font-semibold tabular-nums" style={{ color: theme.success }}>
                {fmtMoney(totalSavings.monthly)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: theme.textDim }}>
                {t("savings_annual")}
              </div>
              <div className="text-xl font-semibold tabular-nums" style={{ color: theme.success }}>
                {fmtMoney(totalSavings.annual)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bar chart */}
      <div className="p-4 md:p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2 }}>
        <SectionTitle>{t("rpt_chart_title")}</SectionTitle>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={visibleDepts.map((d) => {
              const rs = rows.filter((r) => r.dept === d);
              return {
                dept: d.length > 18 ? d.slice(0, 15) + "…" : d,
                [t("rpt_stat")]: rs.reduce((s, r) => s + (typeof r.stat === "number" ? r.stat : 0), 0),
                [t("rpt_need")]: rs.reduce((s, r) => s + (typeof r.ehtiyac === "number" ? r.ehtiyac : 0), 0),
              };
            })}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke={theme.chartGrid} vertical={false} />
            <XAxis dataKey="dept" tick={{ fontSize: 10, fill: theme.textMuted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: theme.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text }} />
            <Bar dataKey={t("rpt_stat")} fill={theme.chartBar1} radius={[2,2,0,0]} />
            <Bar dataKey={t("rpt_need")} fill={theme.chartBar2} radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yekun cədvəl */}
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2, overflow: "hidden" }}>
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
          <SectionTitle>{t("rpt_final")}</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[920px]">
            <thead style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
              <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textDim }}>
                <th className="text-left font-semibold py-2.5 px-3">{t("tbl_n")}</th>
                <th className="text-left font-semibold py-2.5 px-3">{t("rpt_col_dept")}</th>
                <th className="text-left font-semibold py-2.5 px-3 hidden md:table-cell">{t("rpt_col_shobe")}</th>
                <th className="text-left font-semibold py-2.5 px-3">{t("rpt_col_pos")}</th>
                <th className="text-right font-semibold py-2.5 px-3">{t("col_stat")}</th>
                <th className="text-right font-semibold py-2.5 px-3">{t("col_normsay")}</th>
                <th className="text-right font-semibold py-2.5 px-3">{t("rpt_col_offer")}</th>
                <th className="text-right font-semibold py-2.5 px-3 hidden lg:table-cell">{t("rpt_col_salary")}</th>
                <th className="text-right font-semibold py-2.5 px-3">{t("rpt_col_savings")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="cursor-pointer hoverable" onClick={() => setRoute({ view: "analyze", pid: r.id })}
                    style={{ borderBottom: `1px solid ${theme.borderSoft}` }}
                    onMouseEnter={e => e.currentTarget.style.background = theme.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-3 py-2 tabular-nums" style={{ color: theme.textDim }}>{i + 1}</td>
                  <td className="px-3 py-2">{r.dept}</td>
                  <td className="px-3 py-2 hidden md:table-cell" style={{ color: theme.textMuted }}>{r.shobe}</td>
                  <td className="px-3 py-2 font-medium">{r.pos}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmt0(r.stat)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{r.calc ? fmt(r.calc.maxNormSay) : "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium"
                      style={{ color: r.teklif < 0 ? theme.danger : r.teklif > 0 ? theme.success : theme.textMuted }}>
                    {r.teklif > 0 ? "+" : ""}{r.teklif || "0"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums hidden lg:table-cell" style={{ color: theme.textMuted }}>
                    {r.salary ? fmtMoney(r.salary) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">
                    {r.savings.isReduction ? (
                      <span className="inline-flex items-center gap-1" style={{ color: theme.success }}>
                        <TrendingDown size={11} />
                        {fmtMoney(r.savings.monthly)}
                      </span>
                    ) : (
                      <span style={{ color: theme.textDim }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
