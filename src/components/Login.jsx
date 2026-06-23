import React, { useState } from "react";
import { Lock, ChevronDown, ChevronUp, ChevronRight, Eye, EyeOff, Languages } from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { AzerconnectLogo, ThemeToggle, Field } from "./shared";

// ============================================================================
// Korporativ Login — Azerconnect Group HR sistemi
// ============================================================================
export function Login() {
  const { theme } = useTh();
  const { t, lang, setLang } = useT();
  const { setCurrentUser, users, roles, pushAudit } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginAs = (user) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser(user);
      pushAudit("audit_login", user.email);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex" style={{ background: theme.bg }}>

      {/* ===== Sol panel — brend ===== */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden"
           style={{ background: `linear-gradient(145deg, #082E52 0%, #0B3D6B 50%, #0E4F89 100%)` }}>

        {/* Arxa fon dekorativ element */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
               style={{ background: "#1E6B3C", filter: "blur(80px)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-8"
               style={{ background: "#1A5490", filter: "blur(60px)", transform: "translate(-20%,20%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 400 400">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* İçəri */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <div className="slide-in">
            <AzerconnectLogo style={{ height: 40, width: "auto", filter: "brightness(0) invert(1)" }} />
          </div>

          {/* Məzmun */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <div className="fade-in" style={{ animationDelay: "100ms" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[11px] uppercase tracking-[0.15em] font-medium"
                   style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)",
                            borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#2A8A4E" }} />
                {t("login_section")}
              </div>
              <h1 className="text-4xl xl:text-5xl font-light text-white leading-tight mb-5">
                {t("login_h1_1")}<br />
                <span className="font-semibold" style={{ color: "#4DC88A" }}>
                  {t("login_h1_2")}
                </span>{" "}
                {t("login_h1_3")}
              </h1>
              <p className="text-sm xl:text-base leading-relaxed max-w-sm"
                 style={{ color: "rgba(255,255,255,0.6)" }}>
                {t("login_desc")}
              </p>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 mt-8 fade-in" style={{ animationDelay: "200ms" }}>
              {["Xronometraj analizi", "Norm-say hesablaması", "RBAC idarəetmə", "Supabase inteqrasiya"].map((f) => (
                <span key={f} className="px-3 py-1 text-[11px] font-medium"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
                               border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Alt */}
          <div className="fade-in text-[11px]" style={{ color: "rgba(255,255,255,0.3)", animationDelay: "300ms" }}>
            {t("login_footer")}
          </div>
        </div>
      </div>

      {/* ===== Sağ panel — form ===== */}
      <div className="flex-1 flex flex-col">
        {/* Yuxarı bar */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-10"
             style={{ borderBottom: `1px solid ${theme.border}` }}>
          {/* Mobil logo */}
          <div className="lg:hidden">
            <AzerconnectLogo style={{ height: 28, width: "auto" }} />
          </div>
          <div className="hidden lg:block" />
          {/* Dil + mövzu */}
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "az" ? "en" : "az")}
                    className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium"
                    style={{ border: `1px solid ${theme.border}`, color: theme.textMuted,
                             borderRadius: 2 }}>
              <Languages size={13} />
              {lang === "az" ? "AZ" : "EN"}
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-16">
          <div className="w-full max-w-[400px] page-enter">

            {/* Başlıq */}
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.12em] font-medium mb-2"
                 style={{ color: theme.accent }}>
                {t("login_eyebrow")}
              </p>
              <h2 className="text-2xl font-semibold" style={{ color: theme.text }}>
                {t("login_h2")}
              </h2>
              <p className="text-sm mt-1.5" style={{ color: theme.textMuted }}>
                {t("login_role_note")}
              </p>
            </div>

            {/* Form sahələri */}
            <form onSubmit={(e) => { e.preventDefault(); loginAs(users[1]); }}
                  className="space-y-4">

              <Field label={t("login_email")} type="email" defaultValue="nigar.aliyeva@sirket.az" />

              {/* Parol sahəsi ilə göstər/gizlə */}
              <div>
                <label className="text-xs font-medium block mb-1.5"
                       style={{ color: theme.textMuted }}>
                  {t("login_password")}
                </label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} defaultValue="••••••••"
                         className="w-full px-3.5 py-2.5 text-sm pr-10"
                         style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
                                  color: theme.text, borderRadius: 2 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: theme.textDim }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: theme.textMuted }}>
                  <input type="checkbox" defaultChecked
                         className="w-3.5 h-3.5 accent-[#0B3D6B]" />
                  {t("login_remember")}
                </label>
                <button type="button" className="font-medium hover:underline"
                        style={{ color: theme.accent }}>
                  {t("login_forgot")}
                </button>
              </div>

              {/* Giriş düyməsi */}
              <button type="submit" disabled={loading}
                      className="w-full py-3 text-sm font-semibold text-white relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, #0B3D6B, #1E6B3C)`,
                               borderRadius: 2, opacity: loading ? 0.8 : 1 }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Giriş edilir...
                  </span>
                ) : t("login_submit")}
              </button>

              {/* Ayırıcı */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: theme.border }} />
                <span className="text-[11px]" style={{ color: theme.textDim }}>yaxud</span>
                <div className="flex-1 h-px" style={{ background: theme.border }} />
              </div>

              {/* SSO */}
              <button type="button"
                      className="w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                      style={{ border: `1px solid ${theme.border}`, color: theme.textMuted,
                               background: theme.surface, borderRadius: 2 }}>
                <Lock size={14} /> {t("login_sso")}
              </button>
            </form>

            {/* Demo istifadəçi seçici */}
            <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${theme.border}` }}>
              <button onClick={() => setShowDemo(!showDemo)}
                      className="w-full flex items-center justify-between text-xs font-medium py-2 px-3"
                      style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                               color: theme.textMuted, borderRadius: 2 }}>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
                  {t("login_demo_label")}
                </span>
                {showDemo ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showDemo && (
                <div className="mt-2 space-y-1 fade-in">
                  {users.map((u) => {
                    const r = roles.find((x) => x.id === u.role_id);
                    return (
                      <button key={u.id} onClick={() => loginAs(u)}
                              className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 card-hover"
                              style={{ border: `1px solid ${theme.border}`, background: theme.surface,
                                       borderRadius: 2 }}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white"
                               style={{ background: `linear-gradient(135deg, #0B3D6B, #1E6B3C)`,
                                        borderRadius: "50%" }}>
                            {u.full_name.split(" ").map(s => s[0]).join("").slice(0,2)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate" style={{ color: theme.text }}>
                              {u.full_name}
                            </div>
                            <div className="text-[10px] truncate" style={{ color: theme.textMuted }}>
                              {lang === "az" ? r?.name_az : r?.name_en}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={12} style={{ color: theme.textDim, flexShrink: 0 }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
