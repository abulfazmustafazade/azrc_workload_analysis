import React, { useState } from "react";
import { Activity, Lock, ChevronDown, ChevronUp, ChevronRight, Languages } from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { Field, ThemeToggle } from "./shared";

// HR self-service login + demo istifadəçi seçici.
// Adi form sadəcə demo məqsədilə u2 (HR Direktoru) ilə daxil edir.
// Real Supabase qoşulduqda burada supabase.auth.signInWithPassword() çağırılacaq.
export function Login() {
  const { theme } = useTh();
  const { t, lang, setLang } = useT();
  const { setCurrentUser, users, roles, pushAudit } = useAuth();
  const [showDemo, setShowDemo] = useState(false);

  const loginAs = (user) => {
    setCurrentUser(user);
    setTimeout(() => pushAudit("audit_login", user.email), 0);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sol panel — brend və marketinq mesajı */}
      <div className="md:flex-1 flex flex-col justify-between p-6 md:p-12" style={{ background: theme.sidebar, color: "#fff" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center" style={{ background: theme.accent }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="font-semibold tracking-tight">YÜKAY</div>
            <div className="text-[10px] tracking-[0.18em] uppercase" style={{ opacity: 0.6 }}>{t("brand_tagline")}</div>
          </div>
        </div>
        <div className="max-w-md py-8">
          <div className="text-[11px] uppercase tracking-[0.18em] mb-3" style={{ opacity: 0.6 }}>{t("login_section")}</div>
          <h1 className="text-3xl md:text-4xl font-light leading-tight mb-4">
            {t("login_h1_1")} <span style={{ color: theme.accent }}>{t("login_h1_2")}</span> {t("login_h1_3")}
          </h1>
          <p className="text-sm leading-relaxed" style={{ opacity: 0.7 }}>{t("login_desc")}</p>
        </div>
        <div className="text-[11px] hidden md:block" style={{ opacity: 0.4 }}>{t("login_footer")}</div>
      </div>

      {/* Sağ panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8" style={{ background: theme.bg }}>
        <div className="w-full max-w-sm">
          <div className="text-[11px] uppercase tracking-[0.12em] mb-2" style={{ color: theme.textMuted }}>{t("login_eyebrow")}</div>
          <h2 className="text-2xl font-medium mb-8">{t("login_h2")}</h2>

          <form onSubmit={(e) => { e.preventDefault(); loginAs(users[1]); }} className="space-y-4">
            <Field label={t("login_email")} type="email" defaultValue="nigar.aliyeva@sirket.az" />
            <Field label={t("login_password")} type="password" defaultValue="••••••••" />
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2" style={{ color: theme.textMuted }}>
                <input type="checkbox" defaultChecked /> {t("login_remember")}
              </label>
              <a style={{ color: theme.text, cursor: "pointer" }}>{t("login_forgot")}</a>
            </div>
            <button type="submit" className="w-full py-2.5 text-sm font-medium mt-2" style={{ background: theme.sidebar, color: "#fff" }}>
              {t("login_submit")}
            </button>
            <button type="button" className="w-full py-2.5 text-sm flex items-center justify-center gap-2" style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
              <Lock size={14} /> {t("login_sso")}
            </button>
          </form>

          {/* Demo istifadəçi seçici — RBAC test etmək üçün */}
          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${theme.border}` }}>
            <button onClick={() => setShowDemo(!showDemo)} className="text-[11px] flex items-center gap-1" style={{ color: theme.textMuted }}>
              {showDemo ? <ChevronUp size={11} /> : <ChevronDown size={11} />} {t("login_demo_label")}
            </button>
            {showDemo && (
              <div className="mt-3 space-y-1.5">
                {users.map((u) => {
                  const r = roles.find((x) => x.id === u.role_id);
                  return (
                    <button key={u.id} onClick={() => loginAs(u)} className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                      style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
                      <div>
                        <div className="font-medium" style={{ color: theme.text }}>{u.full_name}</div>
                        <div className="text-[10px]" style={{ color: theme.textMuted }}>{lang === "az" ? r?.name_az : r?.name_en}</div>
                      </div>
                      <ChevronRight size={12} style={{ color: theme.textDim }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 text-[11px]" style={{ color: theme.textMuted }}>{t("login_role_note")}</div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button onClick={() => setLang(lang === "az" ? "en" : "az")} className="px-2.5 py-2 text-xs flex items-center gap-1.5" style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
              <Languages size={13} /> {lang.toUpperCase()}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
