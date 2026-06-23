import { WORK_DAY_MIN, WORK_WEEK_DAYS, WORK_MONTH_DAYS } from "./permissions";

// Hierarchic strukturu (departments → units → positions) düz bir array-ə çevirir.
// Cədvəl və filter görünüşləri bu formatla işləyir.
export function flattenStructure(structure) {
  const rows = [];
  structure.forEach((d) =>
    d.units.forEach((u) =>
      u.positions.forEach((p) => {
        rows.push({
          ...p,
          dept: d.name_az,
          dept_id: d.id,
          shobe: u.name_az,
          unit_id: u.id,
          pos: p.name_az,
        });
      })
    )
  );
  return rows;
}

// Bir tapşırığın günlük dəq miqdarını hesablayır.
// useMax=true → maksimum yük (ən pis halın hesablanması)
export function taskDailyMin(t, useMax) {
  const dur = useMax ? t.dmax : t.dmin;
  const freq = useMax ? t.fmax : t.fmin;
  if (!dur || !freq) return 0;
  const total = dur * freq;
  if (t.period === "daily") return total;
  if (t.period === "weekly") return total / WORK_WEEK_DAYS;
  if (t.period === "monthly") return total / WORK_MONTH_DAYS;
  return total;
}

// Excel metodologiyası ilə eyni: norm-say = günlük dəq cəmi / 420 dəq
export function calcNormSay(tasks) {
  const avgDaily = tasks.reduce((s, t) => s + taskDailyMin(t, false), 0);
  const maxDaily = tasks.reduce((s, t) => s + taskDailyMin(t, true), 0);
  return {
    avgDaily,
    maxDaily,
    avgNormSay: avgDaily / WORK_DAY_MIN,
    maxNormSay: maxDaily / WORK_DAY_MIN,
    avgHours: avgDaily / 60,
    maxHours: maxDaily / 60,
  };
}

// Cari ştat ilə hesablanmış norm-say-ı müqayisə edir.
// 20%-dən çox fərq olarsa artırma/azaldma tövsiyə edilir.
export function recommendation(currentStat, normSay, theme, t) {
  if (typeof currentStat !== "number")
    return { code: "new", label: t("rec_new"), color: theme.info };
  const diff = normSay - currentStat;
  const pct = currentStat === 0 ? 100 : (diff / currentStat) * 100;
  if (pct > 20) return { code: "up", label: t("rec_up"), color: theme.success, diff: Math.ceil(diff) };
  if (pct < -20) return { code: "down", label: t("rec_down"), color: theme.danger, diff: Math.floor(diff) };
  return { code: "keep", label: t("rec_keep"), color: theme.neutral, diff: 0 };
}

// Ədəd formatlayıcılar
export const fmt = (n, d = 2) =>
  n != null && !isNaN(n)
    ? Number(n).toLocaleString("az", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

export const fmt0 = (n) => (typeof n === "number" ? Number(n).toLocaleString("az") : "—");

// Demo modunda yeni id-lər üçün (Supabase-də uuid auto generated)
export const uuid = () => "x" + Math.random().toString(36).slice(2, 10);
