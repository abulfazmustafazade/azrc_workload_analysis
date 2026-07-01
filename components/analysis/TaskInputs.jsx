import React, { useState } from "react";
import { useTh, useT } from "../../contexts";

// Sadə nömrə xanası (cədvəldə)
export function NumCell({ value, onChange, disabled }) {
  const { theme } = useTh();
  return (
    <td className="px-1 py-2 text-center">
      <input disabled={disabled} type="number" value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-14 text-center bg-transparent border-0 focus:outline-none tabular-nums px-1 py-0.5"
        style={{ color: theme.text }} />
    </td>
  );
}

// Cədvəl içində yeni öhdəlik əlavə etmək üçün sətir (desktop)
export function AddTaskRow({ onAdd, onCancel }) {
  const { theme } = useTh();
  const { t } = useT();
  const [task, setTask] = useState({ task: "", norma: 1, period: "daily", dmin: null, dmax: null, fmin: null, fmax: null });
  const ok = task.task && task.dmin != null && task.dmax != null && task.fmin != null && task.fmax != null;
  const ist = { background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text };

  return (
    <tr style={{ background: theme.accent + "12" }}>
      <td className="px-3 py-2" style={{ color: theme.textMuted }}>+</td>
      <td className="px-3 py-2">
        <input autoFocus value={task.task} onChange={(e) => setTask({ ...task, task: e.target.value })}
          placeholder={t("new_task_ph")} className="w-full px-2 py-1 text-xs focus:outline-none" style={ist} />
      </td>
      <td className="px-2 py-2">
        <select value={task.period} onChange={(e) => setTask({ ...task, period: e.target.value })} className="px-1 text-xs" style={ist}>
          <option value="daily">{t("period_daily")}</option>
          <option value="weekly">{t("period_weekly")}</option>
          <option value="monthly">{t("period_monthly")}</option>
        </select>
      </td>
      <td className="px-1 py-2"><input type="number" value={task.dmin ?? ""} onChange={(e) => setTask({ ...task, dmin: Number(e.target.value) })} className="w-14 text-center text-xs px-1 py-0.5" style={ist} /></td>
      <td className="px-1 py-2"><input type="number" value={task.dmax ?? ""} onChange={(e) => setTask({ ...task, dmax: Number(e.target.value) })} className="w-14 text-center text-xs px-1 py-0.5" style={ist} /></td>
      <td className="px-1 py-2"><input type="number" value={task.fmin ?? ""} onChange={(e) => setTask({ ...task, fmin: Number(e.target.value) })} className="w-14 text-center text-xs px-1 py-0.5" style={ist} /></td>
      <td className="px-1 py-2"><input type="number" value={task.fmax ?? ""} onChange={(e) => setTask({ ...task, fmax: Number(e.target.value) })} className="w-14 text-center text-xs px-1 py-0.5" style={ist} /></td>
      <td colSpan={2}></td>
      <td className="px-2 py-2">
        <div className="flex gap-1">
          <button disabled={!ok} onClick={() => ok && onAdd(task)} className="text-[10px] px-2 py-1"
            style={{ background: ok ? theme.sidebar : theme.border, color: ok ? "#fff" : theme.textDim }}>
            {t("btn_add")}
          </button>
          <button onClick={onCancel} className="text-[10px] px-2 py-1" style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
            {t("btn_cancel")}
          </button>
        </div>
      </td>
    </tr>
  );
}

// Mobil görünüş üçün öhdəlik əlavə etmə formu (kart şəklində)
export function MobileAddTask({ onAdd, onCancel }) {
  const { theme } = useTh();
  const { t } = useT();
  const [task, setTask] = useState({ task: "", norma: 1, period: "daily", dmin: null, dmax: null, fmin: null, fmax: null });
  const ok = task.task && task.dmin != null && task.dmax != null && task.fmin != null && task.fmax != null;
  const ist = { background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text };

  return (
    <div className="p-3 space-y-2" style={{ background: theme.accent + "10", borderBottom: `1px solid ${theme.borderSoft}` }}>
      <input autoFocus value={task.task} onChange={(e) => setTask({ ...task, task: e.target.value })}
        placeholder={t("new_task_ph")} className="w-full px-2 py-1.5 text-sm" style={ist} />
      <div className="grid grid-cols-2 gap-2 text-xs">
        <select value={task.period} onChange={(e) => setTask({ ...task, period: e.target.value })} className="px-2 py-1.5" style={ist}>
          <option value="daily">{t("period_daily")}</option>
          <option value="weekly">{t("period_weekly")}</option>
          <option value="monthly">{t("period_monthly")}</option>
        </select>
        <div></div>
        <div>
          <div className="text-[10px] uppercase mb-0.5" style={{ color: theme.textMuted }}>{t("tbl_duration")}</div>
          <div className="flex gap-1">
            <input type="number" placeholder="min" value={task.dmin ?? ""} onChange={(e) => setTask({ ...task, dmin: Number(e.target.value) })} className="w-full px-2 py-1" style={ist} />
            <input type="number" placeholder="max" value={task.dmax ?? ""} onChange={(e) => setTask({ ...task, dmax: Number(e.target.value) })} className="w-full px-2 py-1" style={ist} />
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase mb-0.5" style={{ color: theme.textMuted }}>{t("tbl_frequency")}</div>
          <div className="flex gap-1">
            <input type="number" placeholder="min" value={task.fmin ?? ""} onChange={(e) => setTask({ ...task, fmin: Number(e.target.value) })} className="w-full px-2 py-1" style={ist} />
            <input type="number" placeholder="max" value={task.fmax ?? ""} onChange={(e) => setTask({ ...task, fmax: Number(e.target.value) })} className="w-full px-2 py-1" style={ist} />
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button disabled={!ok} onClick={() => ok && onAdd(task)} className="flex-1 py-1.5 text-xs"
          style={{ background: ok ? theme.sidebar : theme.border, color: ok ? "#fff" : theme.textDim }}>{t("btn_add")}</button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs" style={{ border: `1px solid ${theme.border}`, color: theme.text }}>{t("btn_cancel")}</button>
      </div>
    </div>
  );
}
