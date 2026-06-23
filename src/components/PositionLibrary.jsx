import React, { useState, useMemo } from "react";
import { Filter, CheckCircle2, Circle, ChevronRight, Search } from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { flattenStructure, calcNormSay, fmt, fmt0 } from "../lib";

export function PositionLibrary({ setRoute, initialDept }) {
  const { theme } = useTh();
  const { t } = useT();
  const { structure, analyses, inScope } = useAuth();

  const all = useMemo(
    () => flattenStructure(structure).filter(r => inScope(r.dept)),
    [structure, inScope]
  );
  const visibleDepts = [...new Set(all.map(r => r.dept))];

  const [filterDept, setFilterDept] = useState(initialDept || "all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => all.filter(r => {
    if (filterDept !== "all" && r.dept !== filterDept) return false;
    const hasAn = !!analyses[r.id];
    if (filterStatus === "done" && !hasAn) return false;
    if (filterStatus === "pending" && hasAn) return false;
    if (q && !(r.pos.toLowerCase().includes(q.toLowerCase()) || r.shobe.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [all, filterDept, filterStatus, q, analyses]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(r => {
      const k = r.dept + "|" + r.shobe;
      if (!map.has(k)) map.set(k, { dept: r.dept, shobe: r.shobe, items: [] });
      map.get(k).items.push(r);
    });
    return [...map.values()];
  }, [filtered]);

  return (
    <div className="p-4 md:p-6 space-y-4 page-enter">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 p-3"
           style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2 }}>
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <Filter size={13} style={{ color: theme.textDim }} />
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                  className="text-xs px-2.5 py-1.5 flex-1 sm:flex-initial"
                  style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                           color: theme.text, borderRadius: 2 }}>
            <option value="all">{t("filter_all_depts")}</option>
            {visibleDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex overflow-hidden" style={{ border: `1px solid ${theme.border}`, borderRadius: 2 }}>
            {[{ id:"all", label:t("filter_all") },
              { id:"done", label:t("filter_done") },
              { id:"pending", label:t("filter_pending") }
            ].map((it, i) => (
              <button key={it.id} onClick={() => setFilterStatus(it.id)}
                      className="px-3 py-1.5 text-xs font-medium"
                      style={{ background: filterStatus === it.id ? theme.sidebar : "transparent",
                               color: filterStatus === it.id ? "#fff" : theme.textMuted,
                               borderLeft: i > 0 ? `1px solid ${theme.border}` : "none" }}>
                {it.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: theme.textDim }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("filter_search_pos")}
                 className="w-full pl-8 pr-3 py-1.5 text-xs"
                 style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                          color: theme.text, borderRadius: 2 }} />
        </div>
        <span className="text-xs self-center" style={{ color: theme.textDim }}>
          {filtered.length} {t("results")}
        </span>
      </div>

      {/* Qruplar */}
      <div className="space-y-3">
        {grouped.map((g, gi) => (
          <div key={gi} style={{ background: theme.surface, border: `1px solid ${theme.border}`,
                                  borderRadius: 2, overflow: "hidden" }}>
            {/* Şöbə başlığı */}
            <div className="px-4 py-2.5"
                 style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.borderSoft}` }}>
              <div className="text-[10px] uppercase tracking-wider font-medium mb-0.5"
                   style={{ color: theme.accent }}>
                {g.dept}
              </div>
              <div className="text-sm font-semibold" style={{ color: theme.text }}>{g.shobe}</div>
            </div>
            {/* Vəzifələr */}
            {g.items.map((r, i) => {
              const an   = analyses[r.id];
              const calc = an ? calcNormSay(an.tasks) : null;
              return (
                <div key={r.id} className="px-4 py-3 flex items-start gap-3 cursor-pointer hoverable"
                     onClick={() => setRoute({ view: "analyze", pid: r.id })}
                     style={{ borderBottom: i < g.items.length-1 ? `1px solid ${theme.borderSoft}` : "none" }}
                     onMouseEnter={e => e.currentTarget.style.background = theme.surfaceHover}
                     onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div className="pt-0.5 flex-shrink-0">
                    {an
                      ? <CheckCircle2 size={15} style={{ color: theme.success }} />
                      : <Circle size={15} style={{ color: theme.border }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-0.5" style={{ color: theme.text }}>{r.pos}</div>
                    {r.qeyd && (
                      <div className="text-xs line-clamp-1 mb-1.5" style={{ color: theme.textMuted }}>
                        {r.qeyd}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: theme.textDim }}>
                      <span>
                        {t("col_stat")}:{" "}
                        <span className="font-semibold tabular-nums" style={{ color: theme.text }}>
                          {fmt0(r.stat)}
                        </span>
                      </span>
                      <span>
                        {t("col_normsay")}:{" "}
                        <span className="font-semibold tabular-nums" style={{ color: theme.text }}>
                          {calc ? fmt(calc.maxNormSay) : "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: theme.textDim, flexShrink: 0, marginTop: 2 }} />
                </div>
              );
            })}
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="py-16 text-center" style={{ color: theme.textDim }}>
            <Search size={28} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">Heç nə tapılmadı</div>
          </div>
        )}
      </div>
    </div>
  );
}
