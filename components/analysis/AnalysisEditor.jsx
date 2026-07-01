import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, ChevronRight, ChevronDown, CheckCircle2, AlertCircle,
  Save, Plus, Trash2, ListChecks,
} from "lucide-react";
import { useTh, useT, useAuth, useToast } from "../../contexts";
import { WORK_DAY_MIN } from "../../permissions";
import { flattenStructure, calcNormSay, recommendation, calcSavings, taskDailyMin, fmt, fmt0, fmtMoney } from "../../lib";
import { SectionTitle, NoAccess } from "../shared";
import { analysesApi, structureApi } from "../../db";
import { JobDescriptionCard } from "./JobDescriptionCard";
import { SalaryCard } from "./SalaryCard";
import { SummaryPanel } from "./SummaryPanel";
import { NumCell, AddTaskRow, MobileAddTask } from "./TaskInputs";

// Əsas analiz redaktoru:
// 1. Başlıq kartı (vəzifə adı, ştat, status, Save düyməsi)
// 2. Vəzifə təlimatı kartı (rəsmi sənəd + öhdəliklər)
// 3. Müsahibə öhdəlikləri (xronometraj cədvəli, JD-dən gətirmə chips)
// 4. Qeyd və tövsiyə
// 5. Sağ panel: norma standartları, gauge, hesablama, müqayisə, audit
export function AnalysisEditor({ pid, setRoute }) {
  const { theme } = useTh();
  const { t, lang } = useT();
  const { structure, analyses, can, inScope, currentUser, pushAudit, reloadData } = useAuth();
  const { addToast } = useToast();

  const meta = useMemo(
    () => flattenStructure(structure, lang).find((r) => r.id === pid),
    [structure, pid, lang]
  );
  const existing = analyses[pid];

  // Local form state — Save basılana qədər persisted deyil
  const [tasks, setTasks] = useState(existing?.tasks || []);
  const [jd, setJd] = useState(existing?.jobDescription || { summary: "", duties: [] });
  const [notes, setNotes] = useState(meta?.qeyd || "");
  const [salary, setSalary] = useState(meta?.salary ?? "");
  const [showAdd, setShowAdd] = useState(!existing && tasks.length === 0);
  const [panelOpen, setPanelOpen] = useState(false);

  // Pid dəyişəndə state-i reset edirik
  useEffect(() => {
    setTasks(existing?.tasks || []);
    setJd(existing?.jobDescription || { summary: "", duties: [] });
    setNotes(meta?.qeyd || "");
    setSalary(meta?.salary ?? "");
  }, [pid]);

  if (!meta) return <div className="p-8">404</div>;
  if (!inScope(meta.dept)) return <NoAccess />;

  const canEdit = can("analysis.edit") || can("analysis.create");

  const calc = calcNormSay(tasks);
  const rec = recommendation(meta.stat, calc.maxNormSay, theme, t);
  const savings = calcSavings({ ...meta, salary: Number(salary) || 0 }, rec);
  const utilPctAvg = (calc.avgDaily / WORK_DAY_MIN) * 100;
  const utilPctMax = (calc.maxDaily / WORK_DAY_MIN) * 100;

  // Maaşı DB-dəki vəzifə sətirində yeniləyir
  const updateSalaryInDB = async (newSalary) => {
    try {
      await structureApi.updatePosition(pid, { salary: newSalary });
    } catch (err) {
      console.error("[YÜKAY] Maaş yenilənmədi:", err);
    }
  };

  // Task CRUD əməliyyatları
  const updateTask = (idx, field, value) => {
    if (!canEdit) return;
    const next = [...tasks];
    next[idx] = { ...next[idx], [field]: value };
    setTasks(next);
  };
  const addTask = (newT) => { setTasks([...tasks, newT]); setShowAdd(false); };
  const removeTask = (idx) => { if (!canEdit) return; setTasks(tasks.filter((_, i) => i !== idx)); };

  // JD-dəki rəsmi öhdəliyi müsahibə cədvəlinə köçür (vaxt göstəriciləri boş qalır)
  const addJdDutyAsTask = (duty) => {
    if (!canEdit) return;
    setTasks([...tasks, {
      task: duty.text, norma: 1, period: "daily",
      dmin: null, dmax: null, fmin: null, fmax: null,
      jdDutyId: duty.id,
    }]);
  };

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      // Analiz → DB
      await analysesApi.save(pid, {
        tasks, jobDescription: jd,
        status: "completed",
        updatedByName: currentUser.full_name,
      });
      // Maaş → DB (dəyişibsə)
      const newSalary = salary === "" ? null : Number(salary);
      if (newSalary !== meta.salary) await updateSalaryInDB(newSalary);

      pushAudit(existing ? "audit_update" : "audit_create", `${meta.pos} (xronometraj)`);
      await reloadData();
      addToast("Analiz yadda saxlandı", "success");
    } catch (err) {
      console.error("[YÜKAY] Analiz saxlanılmadı:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally {
      setSaving(false);
    }
  };

  // JD-də olan, amma hələ müsahibə cədvəlinə əlavə olunmamış öhdəliklər
  const unusedJdDuties = (jd.duties || []).filter(
    (d) => !tasks.some((t) => t.jdDutyId === d.id || t.task === d.text)
  );

  return (
    <div className="flex flex-col xl:flex-row">
      <div className="flex-1 p-4 md:p-8 space-y-4 md:space-y-5 min-w-0">

        {/* Başlıq kartı */}
        <div className="p-4 md:p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <button onClick={() => setRoute({ view: "library" })} className="md:hidden flex items-center gap-1 text-xs mb-2" style={{ color: theme.textMuted }}>
                <ArrowLeft size={12} /> {t("nav_library")}
              </button>
              <div className="text-xs mb-2 hidden md:flex items-center gap-2 flex-wrap" style={{ color: theme.textMuted }}>
                <span>{meta.dept}</span><ChevronRight size={11} /><span>{meta.shobe}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-medium mb-3">{meta.pos}</h2>
              <div className="md:hidden text-xs mb-2" style={{ color: theme.textMuted }}>{meta.dept} → {meta.shobe}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm">
                <div>
                  <span style={{ color: theme.textMuted }}>{t("pos_current_stat")}: </span>
                  <span className="font-medium tabular-nums">{fmt0(meta.stat)}</span>
                </div>
                <div>
                  <span style={{ color: theme.textMuted }}>{t("pos_status")}: </span>
                  {existing
                    ? <span className="inline-flex items-center gap-1" style={{ color: theme.success }}><CheckCircle2 size={12} /> {t("pos_completed")}</span>
                    : <span className="inline-flex items-center gap-1" style={{ color: theme.warn }}><AlertCircle size={12} /> {t("pos_draft")}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setPanelOpen(!panelOpen)} className="xl:hidden px-3 py-2 text-xs flex items-center gap-1.5"
                style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
                <ChevronDown size={14} /> {t("panel_calc")}
              </button>
              {canEdit && (
                <button onClick={save} className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium flex items-center gap-2"
                  style={{ background: theme.sidebar, color: "#fff" }}>
                  <Save size={14} /> {saving ? "..." : t("btn_save")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobil sağ panel (yığılan) */}
        {panelOpen && (
          <div className="xl:hidden">
            <SummaryPanel calc={calc} rec={rec} tasks={tasks} existing={existing} meta={meta} utilPctAvg={utilPctAvg} utilPctMax={utilPctMax} />
          </div>
        )}

        {/* Vəzifə təlimatı kartı */}
        <JobDescriptionCard jd={jd} setJd={setJd} canEdit={canEdit} />

        {/* Maaş və qənaət kartı */}
        <SalaryCard salary={salary} setSalary={setSalary} canEdit={canEdit}
                    rec={rec} savings={savings} currentStat={meta.stat} />

        {/* Müsahibə öhdəlikləri kartı */}
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="p-3 md:p-4 flex items-start md:items-center justify-between gap-2 flex-col sm:flex-row"
            style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
            <div>
              <SectionTitle>{t("tasks_title")}</SectionTitle>
              <p className="text-xs -mt-2" style={{ color: theme.textMuted }}>{t("tasks_desc")}</p>
            </div>
            {canEdit && (
              <button onClick={() => setShowAdd(true)} className="text-xs flex items-center gap-1 px-3 py-1.5"
                style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
                <Plus size={12} /> {t("tasks_add")}
              </button>
            )}
          </div>

          {/* JD-dən gətirmə chips strip-i */}
          {unusedJdDuties.length > 0 && canEdit && (
            <div className="px-3 md:px-4 py-2.5"
              style={{ background: theme.accent + "08", borderBottom: `1px solid ${theme.borderSoft}` }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <ListChecks size={11} style={{ color: theme.accent }} />
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: theme.accent }}>
                  {t("pick_from_jd")}
                </span>
                <span className="text-[10px]" style={{ color: theme.textMuted }}>· {t("pick_from_jd_hint")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {unusedJdDuties.map((d) => (
                  <button key={d.id} onClick={() => addJdDutyAsTask(d)}
                    className="px-2 py-1 text-[11px] flex items-center gap-1"
                    style={{ background: theme.surface, border: `1px dashed ${theme.accent}`, color: theme.text }}>
                    <Plus size={10} style={{ color: theme.accent }} />
                    <span className="truncate max-w-[260px] md:max-w-[340px]">{d.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop cədvəl */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs min-w-[860px]">
              <thead style={{ background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
                <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
                  <th className="text-left font-medium py-2.5 px-3 w-8">{t("tbl_n")}</th>
                  <th className="text-left font-medium py-2.5 px-3">{t("tbl_task")}</th>
                  <th className="text-left font-medium py-2.5 px-2 w-24">{t("tbl_period")}</th>
                  <th className="text-center font-medium py-2.5 px-2" colSpan={2}>{t("tbl_duration")}</th>
                  <th className="text-center font-medium py-2.5 px-2" colSpan={2}>{t("tbl_frequency")}</th>
                  <th className="text-right font-medium py-2.5 px-2 w-24">{t("tbl_avg_day")}</th>
                  <th className="text-right font-medium py-2.5 px-2 w-24">{t("tbl_max_day")}</th>
                  <th className="w-8"></th>
                </tr>
                <tr className="text-[9px] uppercase" style={{ color: theme.textDim, borderBottom: `1px solid ${theme.borderSoft}` }}>
                  <th colSpan={3}></th>
                  <th className="py-1 px-2 font-normal">min</th><th className="py-1 px-2 font-normal">max</th>
                  <th className="py-1 px-2 font-normal">min</th><th className="py-1 px-2 font-normal">max</th>
                  <th colSpan={3}></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => {
                  const avgMin = taskDailyMin(task, false);
                  const maxMin = taskDailyMin(task, true);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
                      <td className="px-3 py-2 tabular-nums" style={{ color: theme.textMuted }}>{i + 1}</td>
                      <td className="px-3 py-2">
                        <input disabled={!canEdit} value={task.task} onChange={(e) => updateTask(i, "task", e.target.value)}
                          className="w-full bg-transparent border-0 focus:outline-none px-1 py-0.5" style={{ color: theme.text }} />
                      </td>
                      <td className="px-2 py-2">
                        <select disabled={!canEdit} value={task.period} onChange={(e) => updateTask(i, "period", e.target.value)}
                          className="bg-transparent border-0 focus:outline-none text-xs" style={{ color: theme.text }}>
                          <option value="daily">{t("period_daily")}</option>
                          <option value="weekly">{t("period_weekly")}</option>
                          <option value="monthly">{t("period_monthly")}</option>
                        </select>
                      </td>
                      <NumCell value={task.dmin} onChange={(v) => updateTask(i, "dmin", v)} disabled={!canEdit} />
                      <NumCell value={task.dmax} onChange={(v) => updateTask(i, "dmax", v)} disabled={!canEdit} />
                      <NumCell value={task.fmin} onChange={(v) => updateTask(i, "fmin", v)} disabled={!canEdit} />
                      <NumCell value={task.fmax} onChange={(v) => updateTask(i, "fmax", v)} disabled={!canEdit} />
                      <td className="px-2 py-2 text-right tabular-nums">{fmt(avgMin, 1)}</td>
                      <td className="px-2 py-2 text-right tabular-nums font-medium">{fmt(maxMin, 1)}</td>
                      <td className="px-2 py-2">
                        {canEdit && <button onClick={() => removeTask(i)} style={{ color: theme.textDim }}><Trash2 size={13} /></button>}
                      </td>
                    </tr>
                  );
                })}
                {showAdd && canEdit && <AddTaskRow onAdd={addTask} onCancel={() => setShowAdd(false)} />}
                {tasks.length === 0 && !showAdd && (
                  <tr><td colSpan={10} className="text-center py-12 text-sm" style={{ color: theme.textDim }}>{t("no_tasks")}</td></tr>
                )}
              </tbody>

              {/* Cəm sətri: günlük dəq, saat, norm-say */}
              {tasks.length > 0 && (
                <tfoot style={{ background: theme.sidebar, color: "#fff" }}>
                  <tr>
                    <td colSpan={7} className="px-3 py-2 text-right text-[10px] uppercase" style={{ opacity: 0.6 }}>{t("total_daily")}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{fmt(calc.avgDaily, 1)}</td>
                    <td className="px-2 py-2 text-right tabular-nums font-semibold">{fmt(calc.maxDaily, 1)}</td>
                    <td></td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <td colSpan={7} className="px-3 py-2 text-right text-[10px] uppercase" style={{ opacity: 0.6 }}>{t("total_hours")}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{fmt(calc.avgHours, 2)}</td>
                    <td className="px-2 py-2 text-right tabular-nums font-semibold">{fmt(calc.maxHours, 2)}</td>
                    <td></td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <td colSpan={7} className="px-3 py-2 text-right text-[10px] uppercase" style={{ color: theme.accent }}>{t("norm_say")}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{fmt(calc.avgNormSay)}</td>
                    <td className="px-2 py-2 text-right tabular-nums font-semibold" style={{ color: theme.accent }}>{fmt(calc.maxNormSay)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Mobil kartlar */}
          <div className="md:hidden">
            {tasks.map((task, i) => {
              const avgMin = taskDailyMin(task, false);
              const maxMin = taskDailyMin(task, true);
              return (
                <div key={i} className="p-3 space-y-2" style={{ borderBottom: `1px solid ${theme.borderSoft}` }}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs tabular-nums pt-0.5" style={{ color: theme.textMuted }}>{i + 1}</span>
                    <textarea disabled={!canEdit} value={task.task} onChange={(e) => updateTask(i, "task", e.target.value)} rows={2}
                      className="flex-1 text-sm bg-transparent border-0 focus:outline-none resize-none" style={{ color: theme.text }} />
                    {canEdit && <button onClick={() => removeTask(i)} className="p-1" style={{ color: theme.textDim }}><Trash2 size={14} /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pl-6">
                    <div>
                      <label className="text-[10px] uppercase block mb-0.5" style={{ color: theme.textMuted }}>{t("tbl_period")}</label>
                      <select disabled={!canEdit} value={task.period} onChange={(e) => updateTask(i, "period", e.target.value)}
                        className="w-full px-2 py-1 text-xs" style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }}>
                        <option value="daily">{t("period_daily")}</option>
                        <option value="weekly">{t("period_weekly")}</option>
                        <option value="monthly">{t("period_monthly")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase block mb-0.5" style={{ color: theme.textMuted }}>{t("tbl_duration")}</label>
                      <div className="flex gap-1">
                        <input disabled={!canEdit} type="number" value={task.dmin ?? ""} onChange={(e) => updateTask(i, "dmin", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs tabular-nums" placeholder="min" style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
                        <input disabled={!canEdit} type="number" value={task.dmax ?? ""} onChange={(e) => updateTask(i, "dmax", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs tabular-nums" placeholder="max" style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase block mb-0.5" style={{ color: theme.textMuted }}>{t("tbl_frequency")}</label>
                      <div className="flex gap-1">
                        <input disabled={!canEdit} type="number" value={task.fmin ?? ""} onChange={(e) => updateTask(i, "fmin", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs tabular-nums" placeholder="min" style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
                        <input disabled={!canEdit} type="number" value={task.fmax ?? ""} onChange={(e) => updateTask(i, "fmax", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs tabular-nums" placeholder="max" style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-between text-xs pt-1" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
                      <span style={{ color: theme.textMuted }}>{t("tbl_avg_day")}: <span className="tabular-nums font-medium" style={{ color: theme.text }}>{fmt(avgMin, 1)}</span></span>
                      <span style={{ color: theme.textMuted }}>{t("tbl_max_day")}: <span className="tabular-nums font-medium" style={{ color: theme.text }}>{fmt(maxMin, 1)}</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
            {showAdd && canEdit && <MobileAddTask onAdd={addTask} onCancel={() => setShowAdd(false)} />}
            {tasks.length === 0 && !showAdd && (
              <div className="text-center py-10 text-xs px-4" style={{ color: theme.textDim }}>{t("no_tasks")}</div>
            )}
            {tasks.length > 0 && (
              <div className="p-3" style={{ background: theme.sidebar, color: "#fff" }}>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] uppercase" style={{ opacity: 0.6 }}>{t("total_daily")}</div>
                    <div className="tabular-nums mt-0.5">{fmt(calc.maxDaily, 1)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase" style={{ opacity: 0.6 }}>{t("total_hours")}</div>
                    <div className="tabular-nums mt-0.5">{fmt(calc.maxHours, 2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase" style={{ color: theme.accent }}>{t("norm_say")}</div>
                    <div className="tabular-nums font-semibold mt-0.5" style={{ color: theme.accent }}>{fmt(calc.maxNormSay)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Qeyd və tövsiyə */}
        <div className="p-4 md:p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <SectionTitle>{t("notes_title")}</SectionTitle>
          <textarea disabled={!canEdit} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder={t("notes_ph")} className="w-full text-sm p-3 focus:outline-none resize-none"
            style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
        </div>
      </div>

      {/* Desktop sağ panel */}
      <aside className="hidden xl:block w-80 p-6 self-start sticky top-0" style={{ background: theme.surface, borderLeft: `1px solid ${theme.border}` }}>
        <SummaryPanel calc={calc} rec={rec} tasks={tasks} existing={existing} meta={meta} utilPctAvg={utilPctAvg} utilPctMax={utilPctMax} />
      </aside>
    </div>
  );
}
