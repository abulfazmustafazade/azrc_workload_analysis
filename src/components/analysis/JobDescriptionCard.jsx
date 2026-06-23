import React, { useState } from "react";
import { BookOpen, ChevronUp, ChevronDown, Plus, Trash2, GripVertical } from "lucide-react";
import { useTh, useT } from "../../contexts";

export function JobDescriptionCard({ jd, setJd, canEdit }) {
  const { theme } = useTh();
  const { t } = useT();
  const hasContent = (jd.summary?.length > 0) || (jd.duties?.length > 0);
  const [open, setOpen] = useState(hasContent);

  const addDuty  = () => setJd({ ...jd, duties: [...(jd.duties||[]), { id: "jd_"+Math.random().toString(36).slice(2,8), text:"" }] });
  const updDuty  = (id, text) => setJd({ ...jd, duties: jd.duties.map(d => d.id===id ? {...d,text} : d) });
  const delDuty  = (id) => setJd({ ...jd, duties: jd.duties.filter(d => d.id!==id) });
  const moveDuty = (idx, dir) => {
    const next=[...jd.duties], sw=idx+dir;
    if (sw<0||sw>=next.length) return;
    [next[idx],next[sw]]=[next[sw],next[idx]];
    setJd({...jd,duties:next});
  };

  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2, overflow: "hidden" }}>
      {/* Başlıq */}
      <button onClick={() => setOpen(!open)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
              style={{ background: open ? theme.surfaceAlt : theme.surface }}
              onMouseEnter={e => e.currentTarget.style.background = theme.surfaceHover}
              onMouseLeave={e => e.currentTarget.style.background = open ? theme.surfaceAlt : theme.surface}>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
             style={{ background: theme.infoBg, borderRadius: 2 }}>
          <BookOpen size={14} style={{ color: theme.info }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: theme.text }}>{t("jd_title")}</div>
          <div className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
            {(jd.duties?.length||0) > 0 ? `${jd.duties.length} ${t("jd_n_duties")}` : t("jd_subtitle")}
          </div>
        </div>
        {open ? <ChevronUp size={15} style={{ color: theme.textDim }} />
              : <ChevronDown size={15} style={{ color: theme.textDim }} />}
      </button>

      {/* Açıq bölmə */}
      {open && (
        <div className="p-4 space-y-4 fade-in" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
          {/* Ümumi təsvir */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5"
                   style={{ color: theme.textDim }}>
              {t("jd_summary_label")}
            </label>
            <textarea disabled={!canEdit} value={jd.summary||""}
                      onChange={e => setJd({...jd,summary:e.target.value})}
                      placeholder={t("jd_summary_ph")} rows={3}
                      className="w-full text-sm px-3.5 py-2.5"
                      style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
                               color: theme.text, borderRadius: 2, resize: "vertical" }} />
          </div>

          {/* Rəsmi öhdəliklər */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold"
                     style={{ color: theme.textDim }}>
                {t("jd_duties_title")}
              </label>
              {canEdit && (
                <button onClick={addDuty}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium"
                        style={{ border: `1px solid ${theme.border}`, color: theme.textMuted,
                                 borderRadius: 2 }}>
                  <Plus size={11} /> {t("jd_duty_add")}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {(jd.duties||[]).map((d, i) => (
                <div key={d.id} className="flex items-start gap-2 group">
                  {/* Sıra + sürüklə */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-2.5 gap-0.5">
                    <span className="text-[11px] tabular-nums font-medium w-5 text-center"
                          style={{ color: theme.textDim }}>{i+1}</span>
                    {canEdit && jd.duties.length > 1 && (
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveDuty(i,-1)} disabled={i===0}
                                className="text-[10px] px-0.5 disabled:opacity-30"
                                style={{ color: theme.textDim }}>▲</button>
                        <button onClick={() => moveDuty(i,1)} disabled={i===jd.duties.length-1}
                                className="text-[10px] px-0.5 disabled:opacity-30"
                                style={{ color: theme.textDim }}>▼</button>
                      </div>
                    )}
                  </div>
                  <textarea disabled={!canEdit} value={d.text}
                            onChange={e => updDuty(d.id,e.target.value)}
                            placeholder={t("jd_duty_ph")} rows={1}
                            className="flex-1 text-sm px-3 py-2"
                            style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
                                     color: theme.text, borderRadius: 2,
                                     minHeight: "38px", resize: "vertical" }} />
                  {canEdit && (
                    <button onClick={() => delDuty(d.id)} className="p-2 flex-shrink-0 mt-0.5 opacity-50 hover:opacity-100"
                            style={{ color: theme.danger }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
              {(jd.duties||[]).length === 0 && (
                <div className="py-8 text-center text-xs" style={{ color: theme.textDim,
                     border: `1px dashed ${theme.border}`, borderRadius: 2 }}>
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
