import React, { useState } from "react";
import { BookOpen, ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useTh, useT } from "../../contexts";

// Vəzifə təlimatı kartı — rəsmi sənədin ümumi təsviri və öhdəlikləri.
// Müsahibə öhdəliklərindən ayrı saxlanılır: bu rəsmi sənəddir, o isə reallıq.
// Açıb-bağlanabilen kart kimi davranır.
export function JobDescriptionCard({ jd, setJd, canEdit }) {
  const { theme } = useTh();
  const { t } = useT();

  const hasContent = (jd.summary && jd.summary.length > 0) || (jd.duties && jd.duties.length > 0);
  const [open, setOpen] = useState(hasContent);

  // Öhdəlik CRUD əməliyyatları
  const addDuty = () =>
    setJd({
      ...jd,
      duties: [...(jd.duties || []), { id: "jd_" + Math.random().toString(36).slice(2, 8), text: "" }],
    });

  const updateDuty = (id, text) =>
    setJd({ ...jd, duties: jd.duties.map((d) => (d.id === id ? { ...d, text } : d)) });

  const removeDuty = (id) =>
    setJd({ ...jd, duties: jd.duties.filter((d) => d.id !== id) });

  // Sıra dəyişdirmə (yuxarı/aşağı)
  const moveDuty = (idx, dir) => {
    const next = [...jd.duties];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setJd({ ...jd, duties: next });
  };

  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
      {/* Başlıq — kart yığ/aç düyməsi */}
      <button onClick={() => setOpen(!open)} className="w-full p-3 md:p-4 flex items-center gap-3 text-left">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: theme.accent + "15" }}>
          <BookOpen size={15} style={{ color: theme.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.1em]">{t("jd_title")}</h3>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: theme.textMuted }}>
            {(jd.duties?.length || 0) > 0
              ? `${jd.duties.length} ${t("jd_n_duties")}`
              : t("jd_subtitle")}
          </p>
        </div>
        {open ? <ChevronUp size={16} style={{ color: theme.textMuted }} /> : <ChevronDown size={16} style={{ color: theme.textMuted }} />}
      </button>

      {/* Açıq olanda — ümumi təsvir və rəsmi öhdəliklər siyahısı */}
      {open && (
        <div className="p-3 md:p-4 space-y-4" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
          {/* Ümumi təsvir */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1.5 font-medium" style={{ color: theme.textMuted }}>
              {t("jd_summary_label")}
            </label>
            <textarea disabled={!canEdit} value={jd.summary || ""}
              onChange={(e) => setJd({ ...jd, summary: e.target.value })}
              placeholder={t("jd_summary_ph")} rows={3}
              className="w-full text-sm p-3 focus:outline-none resize-none"
              style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
          </div>

          {/* Rəsmi öhdəliklər siyahısı */}
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: theme.textMuted }}>
                {t("jd_duties_title")}
              </label>
              {canEdit && (
                <button onClick={addDuty} className="text-[11px] flex items-center gap-1 px-2 py-1"
                  style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
                  <Plus size={11} /> {t("jd_duty_add")}
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {(jd.duties || []).map((d, i) => (
                <div key={d.id} className="flex items-start gap-2 group">
                  {/* Sıra nömrəsi və yuxarı/aşağı oxları */}
                  <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
                    <span className="text-[11px] tabular-nums font-medium" style={{ color: theme.textMuted }}>{i + 1}</span>
                    {canEdit && jd.duties.length > 1 && (
                      <div className="flex flex-col opacity-0 group-hover:opacity-100">
                        <button onClick={() => moveDuty(i, -1)} disabled={i === 0} className="text-[8px]" style={{ color: theme.textDim }}>▲</button>
                        <button onClick={() => moveDuty(i, 1)} disabled={i === jd.duties.length - 1} className="text-[8px]" style={{ color: theme.textDim }}>▼</button>
                      </div>
                    )}
                  </div>

                  <textarea disabled={!canEdit} value={d.text}
                    onChange={(e) => updateDuty(d.id, e.target.value)}
                    placeholder={t("jd_duty_ph")} rows={1}
                    className="flex-1 text-sm px-3 py-2 focus:outline-none resize-none"
                    style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text, minHeight: "38px" }} />

                  {canEdit && (
                    <button onClick={() => removeDuty(d.id)} className="p-2 flex-shrink-0" style={{ color: theme.textDim }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}

              {(jd.duties || []).length === 0 && (
                <div className="text-center py-6 text-xs" style={{ color: theme.textDim, border: `1px dashed ${theme.border}` }}>
                  {t("jd_empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
