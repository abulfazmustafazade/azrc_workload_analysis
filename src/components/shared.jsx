import React from "react";
import { X, Sun, Moon, ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTh, useT } from "../contexts";
import { fmt } from "../lib";
import logoSrc from "../assets/logo.png";

// ============================================================================
// Logo komponenti — Azerconnect Group logosu
// ============================================================================
export function AzerconnectLogo({ className = "", style = {} }) {
  return (
    <img
      src={logoSrc}
      alt="Azerconnect Group"
      className={className}
      style={{ objectFit: "contain", ...style }}
      draggable={false}
    />
  );
}

// ============================================================================
// YÜKAY brend logosu — sidebar və login üçün kombinə görünüş
// ============================================================================
export function YukayBrand({ collapsed = false }) {
  const { theme } = useTh();
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="flex-shrink-0">
        <AzerconnectLogo style={{ height: 32, width: "auto" }} />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase leading-tight"
               style={{ color: "#fff" }}>
            YÜKAY
          </div>
          <div className="text-[9px] tracking-[0.12em] uppercase leading-tight"
               style={{ color: theme.sidebarText, opacity: 0.65 }}>
            Workload Intelligence
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// KPI kartı
// ============================================================================
export function KPI({ label, value, hint, trend, icon: Icon }) {
  const { theme } = useTh();
  const trendColor = trend === "up" ? theme.success : trend === "down" ? theme.danger : theme.neutral;
  return (
    <div className="p-4 md:p-5 card-hover"
         style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2 }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="text-[10px] md:text-[11px] uppercase tracking-[0.1em] font-medium leading-tight"
             style={{ color: theme.textMuted }}>
          {label}
        </div>
        {Icon && (
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
               style={{ background: theme.infoBg, borderRadius: 2 }}>
            <Icon size={14} style={{ color: theme.info }} />
          </div>
        )}
      </div>
      <div className="text-2xl md:text-3xl font-light tabular-nums tracking-tight mb-2"
           style={{ color: theme.text }}>
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: theme.textMuted }}>
        {trend === "up" && <TrendingUp size={11} style={{ color: trendColor }} />}
        {trend === "down" && <TrendingDown size={11} style={{ color: trendColor }} />}
        {hint}
      </div>
    </div>
  );
}

// ============================================================================
// Bölmə başlığı
// ============================================================================
export function SectionTitle({ children, action }) {
  const { theme } = useTh();
  return (
    <div className="flex items-center justify-between mb-4 gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: theme.textMuted }}>
        {children}
      </h3>
      {action}
    </div>
  );
}

// ============================================================================
// Mini stat (departament kartında)
// ============================================================================
export function Stat({ label, value, color }) {
  const { theme } = useTh();
  return (
    <div>
      <div className="text-[9px] md:text-[10px] uppercase tracking-wider truncate mb-1"
           style={{ color: theme.textDim }}>
        {label}
      </div>
      <div className="text-sm md:text-base tabular-nums font-medium"
           style={{ color: color || theme.text }}>
        {value}
      </div>
    </div>
  );
}

// ============================================================================
// Modal pəncərə
// ============================================================================
export function Modal({ title, onClose, onSave, children, large, saving }) {
  const { theme } = useTh();
  const { t } = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in"
         style={{ background: "rgba(11,29,51,0.6)", backdropFilter: "blur(4px)" }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:mx-4 modal-enter"
           style={{ maxWidth: large ? "640px" : "480px", background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "8px 8px 0 0",
                    boxShadow: "0 -4px 40px rgba(11,29,51,0.25)", overflow: "hidden",
                    maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <style>{`@media(min-width:640px){.modal-enter{border-radius:4px!important;box-shadow:0 20px 60px rgba(11,29,51,0.25)!important}}`}</style>
        {/* Başlıq */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 flex-shrink-0"
             style={{ borderBottom: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
          <h3 className="text-sm font-semibold truncate pr-2" style={{ color: theme.text }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 flex-shrink-0 hover:opacity-70"
                  style={{ color: theme.textMuted }}>
            <X size={16} />
          </button>
        </div>
        {/* Məzmun — scroll edir */}
        <div className="px-4 sm:px-5 py-4 space-y-4 overflow-y-auto flex-1">{children}</div>
        {/* Footer — sabit */}
        <div className="px-4 sm:px-5 py-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 flex-shrink-0"
             style={{ borderTop: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
          <button onClick={onClose} className="px-4 py-2.5 sm:py-2 text-sm font-medium text-center"
                  style={{ border: `1px solid ${theme.border}`, color: theme.textMuted, borderRadius: 2 }}>
            {t("btn_cancel")}
          </button>
          <button onClick={onSave} disabled={saving}
                  className="px-4 py-2.5 sm:py-2 text-sm font-semibold text-white text-center disabled:opacity-50"
                  style={{ background: theme.accent, borderRadius: 2 }}>
            {saving ? "..." : t("btn_save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Form sahəsi wrapper
// ============================================================================
export function FormField({ label, help, required, children }) {
  const { theme } = useTh();
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-medium mb-1.5"
             style={{ color: theme.textMuted }}>
        {label}
        {required && <span style={{ color: theme.danger }}>*</span>}
      </label>
      {children}
      {help && (
        <div className="text-[10px] mt-1.5 leading-relaxed" style={{ color: theme.textDim }}>
          {help}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// İnput (login-də)
// ============================================================================
export function Field({ label, ...props }) {
  const { theme } = useTh();
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5" style={{ color: theme.textMuted }}>
        {label}
      </label>
      <input {...props} className="w-full px-3.5 py-2.5 text-sm"
             style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
                      color: theme.text, borderRadius: 2 }} />
    </div>
  );
}

// ============================================================================
// Mövzu dəyişdirici
// ============================================================================
export function ThemeToggle({ compact = false }) {
  const { theme, dark, setDark } = useTh();
  const { t } = useT();
  return (
    <button onClick={() => setDark(!dark)}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium"
            style={{ border: `1px solid ${theme.border}`, color: theme.textMuted,
                     borderRadius: 2 }}>
      {dark ? <Sun size={13} /> : <Moon size={13} />}
      {!compact && (dark ? t("theme_light") : t("theme_dark"))}
    </button>
  );
}

// ============================================================================
// İcazə yoxdur
// ============================================================================
export function NoAccess() {
  const { theme } = useTh();
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center p-16 fade-in">
      <div className="w-14 h-14 flex items-center justify-center mb-4"
           style={{ background: theme.infoBg, borderRadius: "50%" }}>
        <ShieldCheck size={24} style={{ color: theme.info }} />
      </div>
      <div className="text-sm font-medium mb-1" style={{ color: theme.text }}>{t("no_permission")}</div>
      <div className="text-xs text-center max-w-xs" style={{ color: theme.textMuted }}>
        Əlaqə üçün sistem administratoruna müraciət edin.
      </div>
    </div>
  );
}

// ============================================================================
// Gauge (iş yükü göstəricisi)
// ============================================================================
export function Gauge({ label, pct, accent }) {
  const { theme } = useTh();
  const cap = Math.min(pct, 200);
  const color =
    pct < 60  ? theme.neutral :
    pct < 80  ? theme.info :
    pct < 105 ? theme.success :
    pct < 130 ? theme.warn : theme.danger;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span style={{ color: accent ? theme.text : theme.textMuted,
                       fontWeight: accent ? 600 : 400 }}>
          {label}
        </span>
        <span className="tabular-nums font-semibold" style={{ color }}>
          {fmt(pct, 1)}%
        </span>
      </div>
      <div className="h-1.5 relative overflow-hidden"
           style={{ background: theme.border, borderRadius: 99 }}>
        <div className="absolute top-0 bottom-0 w-px"
             style={{ left: "50%", background: theme.borderSoft }} />
        <div className="h-full gauge-fill"
             style={{ width: `${cap / 2}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ============================================================================
// Status badge
// ============================================================================
export function StatusBadge({ children, color, bg }) {
  return (
    <span className="badge" style={{ background: bg, color, borderRadius: 2 }}>
      {children}
    </span>
  );
}

// ============================================================================
// Divider
// ============================================================================
export function Divider() {
  const { theme } = useTh();
  return <div style={{ borderTop: `1px solid ${theme.borderSoft}`, margin: "4px 0" }} />;
}

// ============================================================================
// Toast Notification sistemi
// ============================================================================
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
         style={{ pointerEvents: "none" }}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { theme } = useTh();
  const bgMap = { success: theme.successBg, error: theme.dangerBg, info: theme.infoBg, warn: theme.warnBg };
  const colorMap = { success: theme.success, error: theme.danger, info: theme.info, warn: theme.warn };
  const bg = bgMap[toast.type] || theme.surfaceAlt;
  const color = colorMap[toast.type] || theme.text;

  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fade-in flex items-start gap-2.5 px-4 py-3 text-sm shadow-lg"
         style={{ background: bg, border: `1px solid ${color}30`, color: theme.text,
                  borderRadius: 4, pointerEvents: "auto" }}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />
      <span className="flex-1 text-xs leading-relaxed">{toast.message}</span>
      <button onClick={onClose} className="flex-shrink-0 opacity-50 hover:opacity-100"
              style={{ color: theme.textMuted }}>
        <X size={12} />
      </button>
    </div>
  );
}
