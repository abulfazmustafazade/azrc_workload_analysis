import { WORK_DAY_MIN, WORK_WEEK_DAYS, WORK_MONTH_DAYS } from "./permissions";

// ============================================================================
// STRUKTUR — rekursiv ağac modeli
// ============================================================================
// Hər node: { id, name_az, name_en, level, children: [Node], positions: [Position] }
// Səviyyə sırası: company → division → department → sub_department → unit → sub_unit
// Yalnız son (yarpaq) node-larda `positions` mənalıdır, amma texniki olaraq
// istənilən səviyyədə birbaşa vəzifə əlavə etmək mümkündür (məs. kiçik şirkətdə
// Department səviyyəsindən sonra birbaşa vəzifələr ola bilər).
export const LEVELS = [
  { id: "company",        az: "Şirkət",          en: "Company" },
  { id: "division",       az: "Bölmə",            en: "Division" },
  { id: "department",     az: "Departament",      en: "Department" },
  { id: "sub_department", az: "Alt-departament",  en: "Sub-department" },
  { id: "unit",           az: "Bölük",            en: "Unit" },
  { id: "sub_unit",       az: "Alt-bölük",        en: "Sub-unit" },
];

export const levelLabel = (levelId, lang) => {
  const l = LEVELS.find((x) => x.id === levelId);
  return l ? (lang === "az" ? l.az : l.en) : levelId;
};

export const nextLevel = (levelId) => {
  const i = LEVELS.findIndex((l) => l.id === levelId);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1].id : null;
};

// Node adını dilə görə qaytarır, əgər EN boşdursa AZ-a fallback edir
export const nodeName = (node, lang) =>
  (lang === "en" ? node.name_en : node.name_az) || node.name_az || node.name_en || "—";

// ----------------------------------------------------------------------------
// Strukturu (ağacı) düz array-ə çevirir — hər sətir bir vəzifədir,
// öz üzərindəki bütün ata node-ların adlarını "path" kimi daşıyır.
// Bu, cədvəl/filter görünüşlərinin işlədiyi əsas formatdır.
// ----------------------------------------------------------------------------
export function flattenStructure(structure, lang = "az") {
  const rows = [];

  function walk(node, ancestors) {
    const path = [...ancestors, node];

    // Bu node-un birbaşa vəzifələri varsa, onları sətir kimi çıxar
    (node.positions || []).forEach((p) => {
      rows.push({
        ...p,
        pos: lang === "en" ? (p.name_en || p.name_az) : p.name_az,
        pos_az: p.name_az,
        pos_en: p.name_en,
        path,                                   // [Company, Division, ..., bu node]
        pathNames: path.map((n) => nodeName(n, lang)),
        dept: nodeName(path[Math.min(2, path.length - 1)], lang), // geriyə uyğunluq üçün "departament"
        dept_id: path[Math.min(2, path.length - 1)]?.id,
        shobe: path[path.length - 1] ? nodeName(path[path.length - 1], lang) : "",
        unit_id: node.id,
        topDept: nodeName(path[0], lang),
      });
    });

    (node.children || []).forEach((child) => walk(child, path));
  }

  structure.forEach((root) => walk(root, []));
  return rows;
}

// Bütün ağacdan unikal "Department" səviyyəsi (və ya 3-cü səviyyə) adlarını çıxarır —
// filter dropdown-larında istifadə üçün (geriyə uyğunluq: köhnə "departments" filtri)
export function topLevelNames(structure, lang = "az") {
  return structure.map((n) => nodeName(n, lang));
}

// Node-u id-yə görə tapır (rekursiv axtarış), tapılan node-un valideyn zəncirini də qaytarır
export function findNodeById(structure, id, ancestors = []) {
  for (const node of structure) {
    if (node.id === id) return { node, ancestors };
    if (node.children?.length) {
      const found = findNodeById(node.children, id, [...ancestors, node]);
      if (found) return found;
    }
  }
  return null;
}

// Yeni node əlavə etmək üçün dərin immutable update
export function updateNodeById(structure, id, updater) {
  return structure.map((node) => {
    if (node.id === id) return updater(node);
    if (node.children?.length) {
      return { ...node, children: updateNodeById(node.children, id, updater) };
    }
    return node;
  });
}

// Node-u silmək üçün dərin immutable update
export function removeNodeById(structure, id) {
  return structure
    .filter((node) => node.id !== id)
    .map((node) => (node.children?.length
      ? { ...node, children: removeNodeById(node.children, id) }
      : node));
}

// ============================================================================
// XRONOMETRAJ HESABLAMALARI
// ============================================================================
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

export function calcNormSay(tasks) {
  const avgDaily = tasks.reduce((s, t) => s + taskDailyMin(t, false), 0);
  const maxDaily = tasks.reduce((s, t) => s + taskDailyMin(t, true), 0);
  return {
    avgDaily, maxDaily,
    avgNormSay: avgDaily / WORK_DAY_MIN,
    maxNormSay: maxDaily / WORK_DAY_MIN,
    avgHours: avgDaily / 60,
    maxHours: maxDaily / 60,
  };
}

export function recommendation(currentStat, normSay, theme, t) {
  if (typeof currentStat !== "number")
    return { code: "new", label: t("rec_new"), color: theme.info };
  const diff = normSay - currentStat;
  const pct = currentStat === 0 ? 100 : (diff / currentStat) * 100;
  if (pct > 20) return { code: "up", label: t("rec_up"), color: theme.success, diff: Math.ceil(diff) };
  if (pct < -20) return { code: "down", label: t("rec_down"), color: theme.danger, diff: Math.floor(diff) };
  return { code: "keep", label: t("rec_keep"), color: theme.neutral, diff: 0 };
}

// ============================================================================
// MAAŞ VƏ QƏNAƏT HESABLAMALARI
// ============================================================================
// Bir vəzifə üçün illik/aylıq qənaət — yalnız azalma tövsiyəsi olduqda mənalıdır.
// Qənaət = |təklif edilən dəyişiklik| × aylıq maaş (vergi/sığorta əlavələri xaric, sadə model)
export function calcSavings(position, rec) {
  const salary = position.salary || 0;
  if (!salary || !rec || rec.diff === undefined) {
    return { monthly: 0, annual: 0, headcountDiff: 0, isReduction: false };
  }
  // Yalnız azaldılan vəziyyətdə qənaət var; artımda bu "əlavə xərc"dir (mənfi qənaət)
  const headcountDiff = Math.abs(rec.diff);
  const monthly = rec.code === "down" ? headcountDiff * salary : 0;
  const annual = monthly * 12;
  return { monthly, annual, headcountDiff, isReduction: rec.code === "down" };
}

// Bütün strukturda ümumi potensial qənaəti hesablayır (yalnız "down" tövsiyəli vəzifələr üçün)
export function calcTotalSavings(rows, analyses, theme, t) {
  let monthly = 0, annual = 0, positionsAffected = 0;
  rows.forEach((r) => {
    const an = analyses[r.id];
    if (!an) return;
    const calc = calcNormSay(an.tasks);
    const rec = recommendation(r.stat, calc.maxNormSay, theme, t);
    const sav = calcSavings(r, rec);
    if (sav.isReduction) {
      monthly += sav.monthly;
      annual += sav.annual;
      positionsAffected++;
    }
  });
  return { monthly, annual, positionsAffected };
}

// ============================================================================
// FORMATLAYICILAR
// ============================================================================
export const fmt = (n, d = 2) =>
  n != null && !isNaN(n)
    ? Number(n).toLocaleString("az", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

export const fmt0 = (n) => (typeof n === "number" ? Number(n).toLocaleString("az") : "—");

// Pul formatı — AZN, min ayırıcı ilə
export const fmtMoney = (n, currency = "AZN") =>
  n != null && !isNaN(n)
    ? `${Number(n).toLocaleString("az", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`
    : "—";

export const uuid = () => "x" + Math.random().toString(36).slice(2, 10);
