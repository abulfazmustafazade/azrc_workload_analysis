import React from "react";
import { Wallet, PiggyBank, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useTh, useT } from "../../contexts";
import { fmtMoney } from "../../lib";

// Maaş daxiletmə + real-time qənaət hesablaması.
// Tövsiyə "azaldılsın" olduqda yaşıl qənaət kartı görünür,
// "artırılsın" olduqda narıncı "əlavə xərc" kartı, "saxlanılsın"da heç biri.
export function SalaryCard({ salary, setSalary, canEdit, rec, savings, currentStat }) {
  const { theme } = useTh();
  const { t } = useT();

  const hasSalary = salary !== "" && Number(salary) > 0;

  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2, overflow: "hidden" }}>
      {/* Başlıq */}
      <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: theme.surfaceAlt }}>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
             style={{ background: theme.successBg, borderRadius: 2 }}>
          <Wallet size={14} style={{ color: theme.success }} />
        </div>
        <div className="text-sm font-semibold" style={{ color: theme.text }}>{t("salary_title")}</div>
      </div>

      <div className="p-4" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Maaş input */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5"
                   style={{ color: theme.textDim }}>
              {t("salary_current")}
            </label>
            <div className="relative">
              <input disabled={!canEdit} type="number" min="0" step="50"
                     value={salary}
                     onChange={(e) => setSalary(e.target.value)}
                     placeholder={t("salary_ph")}
                     className="w-full px-3.5 py-2.5 text-sm pr-14 tabular-nums"
                     style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
                              color: theme.text, borderRadius: 2 }} />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium"
                    style={{ color: theme.textDim }}>
                AZN
              </span>
            </div>
            <div className="text-[10px] mt-1.5" style={{ color: theme.textDim }}>
              {currentStat ? `× ${currentStat} ${t("salary_per_position")}` : t("salary_per_position")}
            </div>
          </div>

          {/* Qənaət / xərc göstəricisi */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5"
                   style={{ color: theme.textDim }}>
              {t("savings_title")}
            </label>

            {!hasSalary ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs"
                   style={{ background: theme.neutralBg, borderRadius: 2, color: theme.textMuted }}>
                <Minus size={13} /> {t("savings_no_salary")}
              </div>
            ) : rec?.code === "down" ? (
              <div className="px-3.5 py-2.5" style={{ background: theme.successBg, borderRadius: 2,
                                                        border: `1px solid ${theme.success}30` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <PiggyBank size={13} style={{ color: theme.success }} />
                  <span className="text-[11px] font-medium" style={{ color: theme.success }}>
                    {Math.abs(rec.diff)} {t("savings_headcount")}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <div>
                    <div className="text-lg font-bold tabular-nums" style={{ color: theme.success }}>
                      {fmtMoney(savings.monthly)}
                    </div>
                    <div className="text-[10px]" style={{ color: theme.textMuted }}>{t("savings_monthly")}</div>
                  </div>
                  <div className="opacity-50">→</div>
                  <div>
                    <div className="text-sm font-semibold tabular-nums" style={{ color: theme.success }}>
                      {fmtMoney(savings.annual)}
                    </div>
                    <div className="text-[10px]" style={{ color: theme.textMuted }}>{t("savings_annual")}</div>
                  </div>
                </div>
              </div>
            ) : rec?.code === "up" ? (
              <div className="px-3.5 py-2.5" style={{ background: theme.warnBg, borderRadius: 2,
                                                        border: `1px solid ${theme.warn}30` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={13} style={{ color: theme.warn }} />
                  <span className="text-[11px] font-medium" style={{ color: theme.warn }}>
                    +{Math.abs(rec.diff)} {t("savings_headcount_add")}
                  </span>
                </div>
                <div className="text-lg font-bold tabular-nums" style={{ color: theme.warn }}>
                  {fmtMoney(Math.abs(rec.diff) * Number(salary))}
                </div>
                <div className="text-[10px]" style={{ color: theme.textMuted }}>{t("savings_extra_cost")}</div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs"
                   style={{ background: theme.neutralBg, borderRadius: 2, color: theme.textMuted }}>
                <Minus size={13} /> {t("rec_keep")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
