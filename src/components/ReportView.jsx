import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useTh, useT, useAuth } from "../contexts";
import { flattenStructure, calcNormSay, fmt, fmt0 } from "../lib";
import { KPI, SectionTitle } from "./shared";

// Yekun hesabat — KPI-lar, bar chart və bütün vəzifələri əhatə edən cədvəl.
// Scope-a görə avtomatik filtrlənir.
export function ReportView({ setRoute }) {
  const { theme } = useTh();
  const { t } = useT();
  const { structure, analyses, inScope } = useAuth();

  const all = useMemo(
    () => flattenStructure(structure).filter((r) => inScope(r.dept)),
    [structure, inScope]
  );
  const visibleDepts = Array.from(new Set(all.map((r) => r.dept)));

  // Hər vəzifə üçün norm-say hesablamasını əlavə edirik
  const rows = all.map((r) => ({
    ...r,
    calc: analyses[r.id] ? calcNormSay(analyses[r.id].tasks) : null,
    status: analyses[r.id]?.status,
  }));

  const summary = {
    total: rows.length,
    totalStat: rows.reduce((s, r) => s + (typeof r.stat === "number" ? r.stat : 0), 0),
    totalNeed: rows.reduce((s, r) => s + (typeof r.ehtiyac === "number" ? r.ehtiyac : 0), 0),
    increase: rows.filter((r) => (r.teklif || 0) > 0).reduce((s, r) => s + r.teklif, 0),
    decrease: rows.filter((r) => (r.teklif || 0) < 0).reduce((s, r) => s + r.teklif, 0),
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <KPI label={t("rpt_kpi_total")} value={summary.total} hint={`${visibleDepts.length} ${t("rpt_kpi_total_hint")}`} />
        <KPI label={t("rpt_kpi_stat")} value={fmt0(summary.totalStat)} hint={t("kpi_stat_hint")} />
        <KPI label={t("rpt_kpi_need")} value={fmt0(summary.totalNeed)} hint={t("rpt_kpi_need_hint")} />
        <KPI label={t("rpt_kpi_net")}
          value={`${summary.increase + summary.decrease > 0 ? "+" : ""}${summary.increase + summary.decrease}`}
          hint={`+${summary.increase} / ${summary.decrease}`} />
      </div>

      {/* Bar chart: cari ştat vs norm-say departament üzrə */}
      <div className="p-4 md:p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
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
            <Bar dataKey={t("rpt_stat")} fill={theme.neutral} />
            <Bar dataKey={t("rpt_need")} fill={theme.sidebar} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yekun cədvəl */}
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
          <SectionTitle>{t("rpt_final")}</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
              <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
                <th className="text-left font-medium py-2.5 px-3">{t("tbl_n")}</th>
                <th className="text-left font-medium py-2.5 px-3">{t("rpt_col_dept")}</th>
                <th className="text-left font-medium py-2.5 px-3 hidden md:table-cell">{t("rpt_col_shobe")}</th>
                <th className="text-left font-medium py-2.5 px-3">{t("rpt_col_pos")}</th>
                <th className="text-right font-medium py-2.5 px-3">{t("col_stat")}</th>
                <th className="text-right font-medium py-2.5 px-3">{t("col_normsay")}</th>
                <th className="text-right font-medium py-2.5 px-3">{t("rpt_col_offer")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="cursor-pointer" onClick={() => setRoute({ view: "analyze", pid: r.id })}
                  style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
