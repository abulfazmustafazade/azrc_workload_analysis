import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { flattenStructure, calcNormSay, recommendation, fmt, fmt0 } from "../lib";
import { KPI, SectionTitle, Stat } from "./shared";

// İcmal səhifəsi — KPI-lar, departament breakdown və son analizlər.
// Bütün məlumatlar istifadəçinin scope-una görə filtrlənir (`inScope()`).
export function Dashboard({ setRoute }) {
  const { theme } = useTh();
  const { t } = useT();
  const { structure, analyses, inScope } = useAuth();

  // Yalnız scope-da olan vəzifələr
  const all = useMemo(
    () => flattenStructure(structure).filter((r) => inScope(r.dept)),
    [structure, inScope]
  );
  const visibleDepts = Array.from(new Set(all.map((r) => r.dept)));

  // KPI ümumi statistikaları
  const stats = useMemo(() => {
    const completed = all.filter((r) => analyses[r.id]?.status === "completed").length;
    const totalStat = all.reduce((s, r) => s + (typeof r.stat === "number" ? r.stat : 0), 0);
    const variance = all.reduce((s, r) => s + (r.teklif || 0), 0);
    const positionsToReduce = all.filter((r) => (r.teklif || 0) < 0).length;
    const positionsToAdd = all.filter((r) => (r.teklif || 0) > 0).length;
    return { completed, totalStat, variance, positionsToReduce, positionsToAdd, total: all.length };
  }, [all, analyses]);

  // Departament üzrə breakdown
  const deptStats = visibleDepts.map((d) => {
    const rows = all.filter((r) => r.dept === d);
    return {
      dept: d,
      positions: rows.length,
      stat: rows.reduce((s, r) => s + (typeof r.stat === "number" ? r.stat : 0), 0),
      need: rows.reduce((s, r) => s + (typeof r.ehtiyac === "number" ? r.ehtiyac : 0), 0),
      change: rows.reduce((s, r) => s + (r.teklif || 0), 0),
    };
  });

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <KPI label={t("kpi_positions")} value={stats.total} hint={`${visibleDepts.length} ${t("kpi_positions_hint")}`} />
        <KPI label={t("kpi_analyzed")} value={`${stats.completed}/${stats.total}`}
          hint={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% ${t("kpi_analyzed_hint")}`} />
        <KPI label={t("kpi_stat")} value={fmt0(stats.totalStat)} hint={t("kpi_stat_hint")} />
        <KPI label={t("kpi_change")} value={(stats.variance > 0 ? "+" : "") + stats.variance}
          hint={`+${stats.positionsToAdd} / ${stats.positionsToReduce}`} />
      </div>

      {/* Hero CTA */}
      <div className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: theme.sidebar, color: "#fff" }}>
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] mb-1" style={{ opacity: 0.5 }}>{t("hero_eyebrow")}</div>
          <h2 className="text-base md:text-lg font-medium mb-1">{t("hero_title")}</h2>
          <p className="text-xs md:text-sm" style={{ opacity: 0.7 }}>{t("hero_desc")}</p>
        </div>
        <button onClick={() => setRoute({ view: "library" })}
          className="px-4 py-2 text-sm font-medium flex items-center gap-2 whitespace-nowrap"
          style={{ background: theme.accent, color: "#fff" }}>
          {t("hero_cta")} <ChevronRight size={15} />
        </button>
      </div>

      {/* Departament icmalı */}
      <div>
        <SectionTitle>{t("dept_overview")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {deptStats.map((d) => (
            <button key={d.dept} onClick={() => setRoute({ view: "library", dept: d.dept })}
              className="p-4 md:p-5 text-left"
              style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="font-medium leading-tight pr-4 text-sm md:text-base">{d.dept}</div>
                <ChevronRight size={16} style={{ color: theme.textDim }} />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <Stat label={t("col_positions")} value={d.positions} />
                <Stat label={t("col_stat")} value={fmt0(d.stat)} />
                <Stat label={t("col_need")} value={fmt0(d.need)} />
                <Stat label={t("col_change")} value={(d.change > 0 ? "+" : "") + d.change}
                  color={d.change < 0 ? theme.danger : d.change > 0 ? theme.success : undefined} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Son analizlər */}
      <div>
        <SectionTitle>{t("recent_analyses")}</SectionTitle>
        <div className="overflow-x-auto" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <table className="w-full text-sm min-w-[640px]">
            <thead style={{ borderBottom: `1px solid ${theme.border}` }}>
              <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
                <th className="text-left font-medium py-3 px-4">{t("col_position")}</th>
                <th className="text-left font-medium py-3 px-4 hidden md:table-cell">{t("col_dept_unit")}</th>
                <th className="text-right font-medium py-3 px-4">{t("col_stat")}</th>
                <th className="text-right font-medium py-3 px-4">{t("col_normsay")}</th>
                <th className="text-right font-medium py-3 px-4">{t("col_recommendation")}</th>
              </tr>
            </thead>
            <tbody>
              {all.filter((r) => analyses[r.id]).map((r, i) => {
                const an = analyses[r.id];
                const calc = calcNormSay(an.tasks);
                const rec = recommendation(r.stat, calc.maxNormSay, theme, t);
                return (
                  <tr key={i} className="cursor-pointer" onClick={() => setRoute({ view: "analyze", pid: r.id })}
                    style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
                    <td className="py-3 px-4 font-medium">{r.pos}</td>
                    <td className="px-4 text-xs hidden md:table-cell" style={{ color: theme.textMuted }}>{r.shobe}</td>
                    <td className="px-4 text-right tabular-nums">{fmt0(r.stat)}</td>
                    <td className="px-4 text-right tabular-nums font-medium">{fmt(calc.maxNormSay)}</td>
                    <td className="px-4 text-right">
                      <span className="text-[10px] px-2 py-0.5 text-white" style={{ background: rec.color }}>{rec.label}</span>
                    </td>
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
