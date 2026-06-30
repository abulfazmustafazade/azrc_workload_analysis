import React, { useMemo } from "react";
import { ChevronRight, Users, BarChart2, TrendingUp, Activity, PiggyBank } from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { flattenStructure, calcNormSay, recommendation, calcTotalSavings, fmt, fmt0, fmtMoney } from "../lib";
import { KPI, SectionTitle, Stat } from "./shared";

export function Dashboard({ setRoute }) {
  const { theme } = useTh();
  const { t, lang } = useT();
  const { structure, analyses, inScope } = useAuth();

  const all = useMemo(
    () => flattenStructure(structure, lang).filter(r => inScope(r.dept)),
    [structure, inScope, lang]
  );
  const visibleDepts = [...new Set(all.map(r => r.dept))];

  const stats = useMemo(() => {
    const completed = all.filter(r => analyses[r.id]?.status === "completed").length;
    const totalStat = all.reduce((s,r) => s + (typeof r.stat === "number" ? r.stat : 0), 0);
    const variance  = all.reduce((s,r) => s + (r.teklif || 0), 0);
    const posUp   = all.filter(r => (r.teklif||0) > 0).length;
    const posDown = all.filter(r => (r.teklif||0) < 0).length;
    return { completed, totalStat, variance, posUp, posDown, total: all.length };
  }, [all, analyses]);

  const deptStats = visibleDepts.map(d => {
    const rows = all.filter(r => r.dept === d);
    return { dept: d,
      positions: rows.length,
      stat:   rows.reduce((s,r) => s+(typeof r.stat==="number"?r.stat:0), 0),
      need:   rows.reduce((s,r) => s+(typeof r.ehtiyac==="number"?r.ehtiyac:0), 0),
      change: rows.reduce((s,r) => s+(r.teklif||0), 0),
      done:   rows.filter(r => analyses[r.id]).length,
    };
  });

  const recentAnalyses = all.filter(r => analyses[r.id]).slice(0, 8);
  const totalSavings = useMemo(() => calcTotalSavings(all, analyses, theme, t), [all, analyses, theme, t]);

  return (
    <div className="p-4 md:p-6 space-y-5 page-enter">

      {/* KPI grid */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <KPI label={t("kpi_positions")} value={stats.total}
             hint={`${visibleDepts.length} ${t("kpi_positions_hint")}`}
             icon={Users} />
        <KPI label={t("kpi_analyzed")}
             value={`${stats.completed}/${stats.total}`}
             hint={`${stats.total ? Math.round(stats.completed/stats.total*100) : 0}% ${t("kpi_analyzed_hint")}`}
             icon={Activity}
             trend={stats.completed > 0 ? "up" : undefined} />
        <KPI label={t("kpi_stat")} value={fmt0(stats.totalStat)}
             hint={t("kpi_stat_hint")} icon={BarChart2} />
        <KPI label={t("kpi_change")}
             value={(stats.variance > 0 ? "+" : "") + stats.variance}
             hint={`+${stats.posUp} artım · ${stats.posDown} azalma`}
             icon={TrendingUp}
             trend={stats.variance > 0 ? "up" : stats.variance < 0 ? "down" : undefined} />
        <KPI label={t("kpi_savings")} value={fmtMoney(totalSavings.annual)}
             hint={`${totalSavings.positionsAffected} ${t("savings_affected")}`}
             icon={PiggyBank}
             trend={totalSavings.annual > 0 ? "up" : undefined} />
      </div>

      {/* Hero CTA */}
      <div className="relative overflow-hidden p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
           style={{ background: `linear-gradient(135deg, #0B3D6B 0%, #082E52 50%, #1E6B3C 100%)`,
                    borderRadius: 2 }}>
        {/* Dekorativ */}
        <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none"
             style={{ background: "radial-gradient(circle at 80% 50%, #fff 0%, transparent 70%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4DC88A" }} />
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium"
                  style={{ color: "rgba(255,255,255,0.6)" }}>
              {t("hero_eyebrow")}
            </span>
          </div>
          <h2 className="text-base md:text-lg font-semibold text-white mb-1">
            {t("hero_title")}
          </h2>
          <p className="text-xs md:text-sm max-w-md" style={{ color: "rgba(255,255,255,0.6)" }}>
            {t("hero_desc")}
          </p>
        </div>
        <button onClick={() => setRoute({ view: "library" })}
                className="relative z-10 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                         borderRadius: 2, backdropFilter: "blur(4px)" }}>
          {t("hero_cta")} <ChevronRight size={15} />
        </button>
      </div>

      {/* Departament kartları */}
      <div>
        <SectionTitle>{t("dept_overview")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {deptStats.map(d => (
            <button key={d.dept} onClick={() => setRoute({ view: "library", dept: d.dept })}
                    className="text-left p-4 card-hover"
                    style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2 }}>
              {/* Başlıq + ok */}
              <div className="flex items-start justify-between mb-3">
                <div className="font-medium text-sm pr-4 leading-tight" style={{ color: theme.text }}>
                  {d.dept}
                </div>
                <ChevronRight size={15} style={{ color: theme.textDim, flexShrink: 0 }} />
              </div>
              {/* Mini progress */}
              <div className="h-0.5 mb-3" style={{ background: theme.border, borderRadius: 99 }}>
                <div className="h-full progress-bar"
                     style={{ width: `${d.positions ? (d.done/d.positions)*100 : 0}%`,
                              background: theme.accent, borderRadius: 99 }} />
              </div>
              {/* Statlar */}
              <div className="grid grid-cols-4 gap-2">
                <Stat label={t("col_positions")} value={d.positions} />
                <Stat label={t("col_stat")}      value={fmt0(d.stat)} />
                <Stat label={t("col_need")}      value={fmt0(d.need)} />
                <Stat label={t("col_change")}
                      value={(d.change > 0 ? "+" : "") + d.change}
                      color={d.change < 0 ? theme.danger : d.change > 0 ? theme.success : theme.textDim} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Son analizlər */}
      <div>
        <SectionTitle>{t("recent_analyses")}</SectionTitle>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2,
                      overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
                <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textDim }}>
                  <th className="text-left font-semibold py-3 px-4">{t("col_position")}</th>
                  <th className="text-left font-semibold py-3 px-4 hidden md:table-cell">{t("col_dept_unit")}</th>
                  <th className="text-right font-semibold py-3 px-4">{t("col_stat")}</th>
                  <th className="text-right font-semibold py-3 px-4">{t("col_normsay")}</th>
                  <th className="text-right font-semibold py-3 px-4">{t("col_recommendation")}</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.map((r, i) => {
                  const an   = analyses[r.id];
                  const calc = calcNormSay(an.tasks);
                  const rec  = recommendation(r.stat, calc.maxNormSay, theme, t);
                  return (
                    <tr key={i} className="hoverable cursor-pointer"
                        onClick={() => setRoute({ view: "analyze", pid: r.id })}
                        style={{ borderBottom: `1px solid ${theme.borderSoft}` }}
                        onMouseEnter={e => e.currentTarget.style.background = theme.surfaceHover}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td className="py-3 px-4 font-medium text-sm" style={{ color: theme.text }}>
                        {r.pos}
                      </td>
                      <td className="px-4 text-xs hidden md:table-cell" style={{ color: theme.textMuted }}>
                        {r.shobe}
                      </td>
                      <td className="px-4 text-right tabular-nums text-sm" style={{ color: theme.text }}>
                        {fmt0(r.stat)}
                      </td>
                      <td className="px-4 text-right tabular-nums text-sm font-semibold" style={{ color: theme.text }}>
                        {fmt(calc.maxNormSay)}
                      </td>
                      <td className="px-4 text-right">
                        <span className="badge text-white" style={{ background: rec.color, borderRadius: 2 }}>
                          {rec.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {recentAnalyses.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: theme.textDim }}>
              Hələ analiz tamamlanmayıb
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
