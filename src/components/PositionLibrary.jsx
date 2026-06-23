import React, { useState, useMemo } from "react";
import { Filter, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { flattenStructure, calcNormSay, fmt, fmt0 } from "../lib";

// Vəzifə kataloqu — istifadəçinin scope-undakı vəzifələri
// departament/şöbə/bölmə üzrə qruplaşdırılmış formada göstərir.
// Status filter (Hamısı / Tamamlanıb / Gözləyir) və axtarış var.
export function PositionLibrary({ setRoute, initialDept }) {
  const { theme } = useTh();
  const { t } = useT();
  const { structure, analyses, inScope } = useAuth();

  // Scope-da olan vəzifələr
  const all = useMemo(
    () => flattenStructure(structure).filter((r) => inScope(r.dept)),
    [structure, inScope]
  );
  const visibleDepts = Array.from(new Set(all.map((r) => r.dept)));

  const [filterDept, setFilterDept] = useState(initialDept || "all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [q, setQ] = useState("");

  // Filter tətbiqi
  const filtered = useMemo(
    () =>
      all.filter((r) => {
        if (filterDept !== "all" && r.dept !== filterDept) return false;
        const hasAn = !!analyses[r.id];
        if (filterStatus === "done" && !hasAn) return false;
        if (filterStatus === "pending" && hasAn) return false;
        if (q && !(r.pos.toLowerCase().includes(q.toLowerCase()) || r.shobe.toLowerCase().includes(q.toLowerCase()))) return false;
        return true;
      }),
    [all, filterDept, filterStatus, q, analyses]
  );

  // Departament/şöbə üzrə qruplaşdırma
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const k = r.dept + " | " + r.shobe;
      if (!map.has(k)) map.set(k, { dept: r.dept, shobe: r.shobe, items: [] });
      map.get(k).items.push(r);
    });
    return Array.from(map.values());
  }, [filtered]);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-5">
      {/* Filter paneli */}
      <div className="p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-wrap"
        style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <Filter size={14} style={{ color: theme.textMuted }} />
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className="text-sm px-2 py-1.5 focus:outline-none flex-1 md:flex-initial"
            style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }}>
            <option value="all">{t("filter_all_depts")}</option>
            {visibleDepts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex flex-shrink-0" style={{ border: `1px solid ${theme.border}` }}>
            {[
              { id: "all", label: t("filter_all") },
              { id: "done", label: t("filter_done") },
              { id: "pending", label: t("filter_pending") },
            ].map((it, i) => (
              <button key={it.id} onClick={() => setFilterStatus(it.id)}
                className="px-2 md:px-3 py-1.5 text-xs whitespace-nowrap"
                style={{
                  background: filterStatus === it.id ? theme.sidebar : theme.surface,
                  color: filterStatus === it.id ? "#fff" : theme.text,
                  borderLeft: i > 0 ? `1px solid ${theme.border}` : "none",
                }}>
                {it.label}
              </button>
            ))}
          </div>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("filter_search_pos")}
          className="px-3 py-1.5 text-sm focus:outline-none w-full md:w-auto md:flex-1 md:max-w-xs"
          style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
        <span className="text-xs tabular-nums" style={{ color: theme.textMuted }}>
          {filtered.length} {t("results")}
        </span>
      </div>

      {/* Qruplaşdırılmış vəzifə siyahısı */}
      <div className="space-y-3">
        {grouped.map((g, gi) => (
          <div key={gi} style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <div className="px-3 md:px-4 py-3" style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.borderSoft}` }}>
              <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>{g.dept}</div>
              <div className="text-sm font-medium">{g.shobe || "—"}</div>
            </div>
            <div>
              {g.items.map((r, i) => {
                const an = analyses[r.id];
                const calc = an ? calcNormSay(an.tasks) : null;
                return (
                  <div key={r.id} className="px-3 md:px-4 py-3 flex items-start gap-2 md:gap-3 cursor-pointer"
                    onClick={() => setRoute({ view: "analyze", pid: r.id })}
                    style={{ borderBottom: i < g.items.length - 1 ? `1px solid ${theme.borderSoft}` : "none" }}>
                    <div className="pt-0.5">
                      {an
                        ? <CheckCircle2 size={15} style={{ color: theme.success }} />
                        : <Circle size={15} style={{ color: theme.textDim }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{r.pos}</div>
                      {r.qeyd && <div className="text-xs mt-0.5 line-clamp-1" style={{ color: theme.textMuted }}>{r.qeyd}</div>}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px]" style={{ color: theme.textMuted }}>
                        <span>{t("col_stat")}: <span className="tabular-nums font-medium" style={{ color: theme.text }}>{fmt0(r.stat)}</span></span>
                        <span>{t("col_normsay")}: <span className="tabular-nums font-medium" style={{ color: theme.text }}>{calc ? fmt(calc.maxNormSay) : "—"}</span></span>
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: theme.textDim }} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
