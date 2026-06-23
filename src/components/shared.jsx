import React from "react";
import { X, Sun, Moon, ShieldCheck } from "lucide-react";
import { useTh, useT } from "../contexts";
import { fmt } from "../lib";

// ============================================================================
// KPI kartı (dashboard və report-da istifadə olunur)
// ============================================================================
export function KPI({ label, value, hint }) {
  const { theme } = useTh();
  return (
    <div className="p-3 md:p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
      <div className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: theme.textMuted }}>{label}</div>
      <div className="mt-2 md:mt-3 text-2xl md:text-4xl font-light tabular-nums tracking-tight">{value}</div>
      <div className="mt-1 md:mt-2 text-[10px] md:text-xs" style={{ color: theme.textMuted }}>{hint}</div>
    </div>
  );
}

// ============================================================================
// Bölmə başlığı (UPPERCASE ETIKET stili)
// ============================================================================
export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-end justify-between mb-3 gap-2">
      <h3 className="text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.1em]">{children}</h3>
      {action}
    </div>
  );
}

// ============================================================================
// Statistik kiçik göstərici (departament icmalında istifadə olunur)
// ============================================================================
export function Stat({ label, value, color }) {
  const { theme } = useTh();
  return (
    <div>
      <div className="text-[9px] md:text-[10px] uppercase tracking-wider truncate" style={{ color: theme.textMuted }}>{label}</div>
      <div className="text-base md:text-lg tabular-nums mt-0.5" style={{ color: color || theme.text }}>{value}</div>
    </div>
  );
}

// ============================================================================
// Modal pəncərə (form və təsdiqlər üçün)
// ============================================================================
export function Modal({ title, onClose, onSave, children, large }) {
  const { theme } = useTh();
  const { t } = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-h-[90vh] overflow-y-auto" style={{ maxWidth: large ? "640px" : "480px", background: theme.surface, border: `1px solid ${theme.border}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <h3 className="text-base font-medium">{title}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
          <button onClick={onClose} className="px-3 py-2 text-sm" style={{ border: `1px solid ${theme.border}`, color: theme.text }}>{t("btn_cancel")}</button>
          <button onClick={onSave} className="px-3 py-2 text-sm font-medium" style={{ background: theme.sidebar, color: "#fff" }}>{t("btn_save")}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Form sahəsi wrapper (label + input + help text)
// ============================================================================
export function FormField({ label, help, children }) {
  const { theme } = useTh();
  return (
    <div>
      <label className="text-xs block mb-1.5 font-medium" style={{ color: theme.textMuted }}>{label}</label>
      {children}
      {help && <div className="text-[10px] mt-1" style={{ color: theme.textDim }}>{help}</div>}
    </div>
  );
}

// ============================================================================
// Sadə input wrapper (login-də)
// ============================================================================
export function Field({ label, ...props }) {
  const { theme } = useTh();
  return (
    <div>
      <label className="text-xs block mb-1.5" style={{ color: theme.textMuted }}>{label}</label>
      <input {...props} className="w-full px-3 py-2.5 text-sm focus:outline-none"
        style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
    </div>
  );
}

// ============================================================================
// Mövzu dəyişdirici düymə
// ============================================================================
export function ThemeToggle() {
  const { theme, dark, setDark } = useTh();
  return (
    <button onClick={() => setDark(!dark)} className="p-2 flex items-center" style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
      {dark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

// ============================================================================
// İcazə yoxdur səhifəsi (scope və ya permission xaricindəki giriş)
// ============================================================================
export function NoAccess() {
  const { theme } = useTh();
  const { t } = useT();
  return (
    <div className="p-12 text-center">
      <ShieldCheck size={32} className="mx-auto mb-3" style={{ color: theme.textDim }} />
      <div className="text-sm" style={{ color: theme.textMuted }}>{t("no_permission")}</div>
    </div>
  );
}

// ============================================================================
// Yük göstəricisi (gauge) — analizin sağ panelində
// ============================================================================
export function Gauge({ label, pct, accent }) {
  const { theme } = useTh();
  const cap = Math.min(pct, 200);
  const color =
    pct < 70 ? theme.neutral :
    pct < 90 ? theme.info :
    pct < 110 ? theme.success :
    pct < 130 ? theme.warn : theme.danger;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: accent ? theme.text : theme.textMuted, fontWeight: accent ? 500 : 400 }}>{label}</span>
        <span className="tabular-nums" style={{ color }}>{fmt(pct, 1)}%</span>
      </div>
      <div className="h-2 relative" style={{ background: theme.borderSoft }}>
        <div className="absolute top-0 bottom-0 w-px" style={{ left: "50%", background: theme.textDim }} />
        <div className="h-full" style={{ width: `${cap / 2}%`, background: color }} />
      </div>
    </div>
  );
}
