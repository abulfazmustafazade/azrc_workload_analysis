// ============================================================================
// QEYD: Bu fayl artıq tətbiq tərəfindən İSTİFADƏ OLUNMUR.
// Bütün data indi Supabase-dən gəlir (bax: src/db.js, src/App.jsx).
// Fayl yalnız referans üçün saxlanılıb — supabase_schema.sql-dəki SEED bölməsi
// məhz bu datadan hazırlanıb. Lazım olmasa silə bilərsiniz.
// ============================================================================

import { ALL_PERMS } from "./permissions";

// ============================================================================
// Sistem rolları
// ============================================================================
export const INITIAL_ROLES = [
  { id: "super_admin", name_az: "Super Admin", name_en: "Super Admin", system: true, permissions: [...ALL_PERMS] },
  { id: "hr_director", name_az: "HR Direktoru", name_en: "HR Director", system: true,
    permissions: ["dashboard.view","library.view","analysis.view","analysis.create","analysis.edit","analysis.delete","analysis.approve","report.view","report.export","admin.users","admin.structure","admin.audit"] },
  { id: "hrbp", name_az: "HR Business Partner", name_en: "HR Business Partner", system: true,
    permissions: ["dashboard.view","library.view","analysis.view","analysis.create","analysis.edit","report.view","report.export"] },
  { id: "dept_head", name_az: "Departament rəhbəri", name_en: "Department Head", system: true,
    permissions: ["dashboard.view","library.view","analysis.view","report.view"] },
  { id: "viewer", name_az: "Müşahidəçi", name_en: "Viewer", system: true,
    permissions: ["dashboard.view","library.view","analysis.view","report.view"] },
];

// ============================================================================
// Demo istifadəçilər
// ============================================================================
export const INITIAL_USERS = [
  { id: "u1", full_name: "Elnur Vəliyev", email: "elnur.veliyev@sirket.az", role_id: "super_admin", scope: "all", status: "active", created_at: "2026-01-15" },
  { id: "u2", full_name: "Nigar Əliyeva", email: "nigar.aliyeva@sirket.az", role_id: "hr_director", scope: "all", status: "active", created_at: "2026-01-20" },
  { id: "u3", full_name: "Rauf Məmmədov", email: "rauf.mammadov@sirket.az", role_id: "hrbp",
    scope: ["Anbar Təsərrüfatı və Nəqliyyat Departamenti", "Satınalma departamenti"], status: "active", created_at: "2026-02-03" },
  { id: "u4", full_name: "Aysel Hüseynova", email: "aysel.huseynova@sirket.az", role_id: "dept_head",
    scope: ["Anbar Təsərrüfatı və Nəqliyyat Departamenti"], status: "active", created_at: "2026-02-10" },
  { id: "u5", full_name: "Tural Cəfərov", email: "tural.cafarov@sirket.az", role_id: "viewer",
    scope: ["Xarici Logistika Departamenti", "Tədarük və Tələb Planlama Departamenti"], status: "active", created_at: "2026-03-01" },
];

// ============================================================================
// ŞİRKƏT STRUKTURU — rekursiv ağac modeli
// ============================================================================
// Səviyyə zənciri: Company → Division → Department → Sub-department → Unit → Sub-unit
// Hər node: { id, name_az, name_en, level, children: [], positions: [] }
// Hər vəzifə: { id, name_az, name_en, stat, ehtiyac, teklif, qeyd, salary }
//
// Qeyd: real təşkilatda hər səviyyə doldurulmaya bilər — bəzi departamentlər
// birbaşa Unit-ə keçə bilər, sub-department olmadan. Struktur bunu dəstəkləyir,
// çünki `children` və `positions` hər node-da paralel mövcuddur.
export const INITIAL_STRUCTURE = [
  {
    id: "c1", level: "company",
    name_az: "Şirkət", name_en: "Company",
    children: [
      {
        id: "div1", level: "division",
        name_az: "Satınalma və Tədarük Bölməsi", name_en: "Procurement & Supply Division",
        children: [
          {
            id: "d1", level: "department",
            name_az: "Satınalma departamenti", name_en: "Procurement Department",
            children: [
              {
                id: "u1", level: "unit",
                name_az: "Hazır Məhsul, Xammal Satınalma şöbəsi", name_en: "Finished Goods & Raw Materials Procurement Unit",
                children: [],
                positions: [
                  { id: "p1", name_az: "Hazır məhsul / xammal satınalma şöbəsinin rəhbəri", name_en: "Head of Finished Goods/Raw Materials Procurement", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 2800 },
                  { id: "p2", name_az: "Layihələr üzrə satınalma bölməsinin rəhbəri", name_en: "Head of Project Procurement Unit", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 2600 },
                  { id: "p3", name_az: "Hazır məhsul / xammal bölməsinin rəhbəri", name_en: "Head of Finished Goods/Raw Materials Unit", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 2400 },
                  { id: "p4", name_az: "Satınalma üzrə böyük mütəxəssis", name_en: "Senior Procurement Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 1600 },
                  { id: "p5", name_az: "Satınalma üzrə mütəxəssis", name_en: "Procurement Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 1200 },
                ],
              },
              {
                id: "u2", level: "unit",
                name_az: "Mal-material, Avadanlıq və Xidmət üzrə Satınalma şöbəsi", name_en: "Goods, Equipment & Services Procurement Unit",
                children: [],
                positions: [
                  { id: "p6", name_az: "Mal-material, avadanlıq və xidmət üzrə satınalma şöbəsinin rəhbəri", name_en: "Head of Goods/Equipment/Services Procurement", stat: 1, ehtiyac: null, teklif: -1, qeyd: "Ştatın ləğvi uyğun. 2 şöbənin birləşdirilməsi tövsiyə olunur.", salary: 2700 },
                  { id: "p7", name_az: "Satınalma üzrə aparıcı mütəxəssis", name_en: "Lead Procurement Specialist", stat: 3, ehtiyac: 3, teklif: 0, qeyd: null, salary: 1500 },
                  { id: "p8", name_az: "Satınalma üzrə mütəxəssis", name_en: "Procurement Specialist", stat: 4, ehtiyac: 4, teklif: 0, qeyd: "ERP optimallaşdırma araşdırılır.", salary: 1200 },
                  { id: "p9", name_az: "Satınalma üzrə kiçik mütəxxəssis", name_en: "Junior Procurement Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 900 },
                ],
              },
            ],
            positions: [],
          },
          {
            id: "d2", level: "department",
            name_az: "Tədarük və Tələb Planlama Departamenti", name_en: "Supply & Demand Planning Department",
            children: [
              {
                id: "u3", level: "unit",
                name_az: "Tələb Planlama şöbəsi", name_en: "Demand Planning Unit",
                children: [],
                positions: [
                  { id: "p10", name_az: "Tələb Planlama şöbəsinin rəhbəri", name_en: "Head of Demand Planning Unit", stat: null, ehtiyac: null, teklif: -1, qeyd: "Ştatın ləğvi uyğun hesab edilir.", salary: 2500 },
                  { id: "p11", name_az: "Planlama mütəxəssisi", name_en: "Planning Specialist", stat: 2, ehtiyac: 2, teklif: 0, qeyd: null, salary: 1300 },
                ],
              },
              {
                id: "u4", level: "unit",
                name_az: "Tədarük Planlama şöbəsi", name_en: "Supply Planning Unit",
                children: [],
                positions: [
                  { id: "p12", name_az: "Tədarük Planlama şöbəsinin rəhbəri", name_en: "Head of Supply Planning Unit", stat: null, ehtiyac: null, teklif: -1, qeyd: "Ştatın ləğvi uyğun hesab edilir.", salary: 2500 },
                  { id: "p13", name_az: "Aparıcı planlama mütəxəssisi", name_en: "Lead Planning Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: "Optimallaşdırma araşdırılır.", salary: 1500 },
                  { id: "p14", name_az: "Planlama mütəxəssisi", name_en: "Planning Specialist", stat: 4, ehtiyac: 4, teklif: 0, qeyd: "1 ştat vahidi vakantdır.", salary: 1300 },
                ],
              },
            ],
            positions: [],
          },
        ],
      },
      {
        id: "div2", level: "division",
        name_az: "Logistika və Anbar Bölməsi", name_en: "Logistics & Warehouse Division",
        children: [
          {
            id: "d3", level: "department",
            name_az: "Xarici Logistika Departamenti", name_en: "Foreign Logistics Department",
            children: [
              {
                id: "u5", level: "unit",
                name_az: "Xarici Logistika bölməsi", name_en: "Foreign Logistics Unit",
                children: [],
                positions: [
                  { id: "p15", name_az: "Xarici logistika bölməsinin rəhbəri", name_en: "Head of Foreign Logistics Unit", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 2400 },
                  { id: "p16", name_az: "Logistika üzrə aparıcı mütəxəssis", name_en: "Lead Logistics Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 1500 },
                  { id: "p17", name_az: "Logistika üzrə mütəxəssis", name_en: "Logistics Specialist", stat: 2, ehtiyac: 2, teklif: 1, qeyd: "+1 ştat artırılır.", salary: 1200 },
                  { id: "p18", name_az: "Logistika üzrə kiçik mütəxəssis", name_en: "Junior Logistics Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 950 },
                ],
              },
              {
                id: "u6", level: "unit",
                name_az: "Gömrük prosesləri Bölməsi", name_en: "Customs Processes Unit",
                children: [
                  {
                    id: "su1", level: "sub_unit",
                    name_az: "Deklorasiya Qrupu", name_en: "Declaration Group",
                    children: [],
                    positions: [
                      { id: "p20", name_az: "Deklorasiya üzrə böyük mühasib", name_en: "Senior Declaration Accountant", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 1700 },
                      { id: "p23", name_az: "Deklorasiya üzrə mütəxəssis", name_en: "Declaration Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 1100 },
                    ],
                  },
                ],
                positions: [
                  { id: "p19", name_az: "Gömrük prosesləri bölməsinin rəhbəri", name_en: "Head of Customs Processes Unit", stat: 1, ehtiyac: 1, teklif: 0, qeyd: "Öhdəliklərin mütəxəssis kateqoriyalı heyətə ötürülməsi.", salary: 2300 },
                  { id: "p21", name_az: "Gömrük və Nəqliyyat prosesləri üzrə mütəxəssis", name_en: "Customs & Transport Processes Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 1200 },
                  { id: "p22", name_az: "Nəqliyyat prosesləri üzrə kiçik mütəxəssis", name_en: "Junior Transport Processes Specialist", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 950 },
                ],
              },
            ],
            positions: [],
          },
          {
            id: "d4", level: "department",
            name_az: "Anbar Təsərrüfatı və Nəqliyyat Departamenti", name_en: "Warehouse & Transport Department",
            children: [
              {
                id: "u7", level: "unit",
                name_az: "Mərkəz Anbar şöbəsi", name_en: "Central Warehouse Unit",
                children: [],
                positions: [
                  { id: "p24", name_az: "Növbə rəisi", name_en: "Shift Supervisor", stat: 3, ehtiyac: 3, teklif: 0, qeyd: null, salary: 1400 },
                  { id: "p25", name_az: "Sifariş sayım operatoru", name_en: "Order Counting Operator", stat: 15, ehtiyac: 15, teklif: 0, qeyd: null, salary: 750 },
                  { id: "p26", name_az: "Sifariş toplama operatoru", name_en: "Order Picking Operator", stat: 70, ehtiyac: 71, teklif: 1, qeyd: "Çəllək pivə anbarı üzrə ləğv edilən ştat artırılması uyğundur.", salary: 700 },
                  { id: "p27", name_az: "Avtokar sürücüsü", name_en: "Forklift Driver", stat: 25, ehtiyac: 25, teklif: 0, qeyd: null, salary: 800 },
                  { id: "p28", name_az: "Fəhlə (bantlama)", name_en: "Worker (Banding)", stat: 22, ehtiyac: 12, teklif: -10, qeyd: "Bantlama sahəsində 10 fəhlə ştatının azaldılması uyğun görülür.", salary: 600 },
                  { id: "p29", name_az: "Fəhlə", name_en: "Worker", stat: 76, ehtiyac: 85, teklif: 9, qeyd: "9 fəhlə ştatının mərkəzi anbara artırılması uyğun görülür.", salary: 600 },
                ],
              },
              {
                id: "u8", level: "unit",
                name_az: "Təmir və Yanacaq Bölməsi", name_en: "Repair & Fuel Unit",
                children: [],
                positions: [
                  { id: "p30", name_az: "Bölmə rəhbəri", name_en: "Unit Head", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 2200 },
                  { id: "p31", name_az: "Avto-elektrik", name_en: "Auto Electrician", stat: 3, ehtiyac: 1, teklif: -2, qeyd: "Norm-say göstəricisi aşağı.", salary: 1000 },
                  { id: "p32", name_az: "Avtokarların Təmiri üzrə mexanik", name_en: "Forklift Repair Mechanic", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 1100 },
                  { id: "p33", name_az: "Çilingər", name_en: "Locksmith/Mechanic", stat: 6, ehtiyac: 2, teklif: -4, qeyd: "Norm-say göstəricisi əhəmiyyətli aşağıdır.", salary: 950 },
                  { id: "p34", name_az: "Ehtiyyat hissələri üzrə operator", name_en: "Spare Parts Operator", stat: 1, ehtiyac: 1, teklif: 0, qeyd: null, salary: 850 },
                ],
              },
            ],
            positions: [],
          },
        ],
      },
    ],
    positions: [],
  },
];

// ============================================================================
// Pre-loaded analizlər (vəzifə id-ləri dəyişməyib, struktur dəyişib)
// ============================================================================
export const INITIAL_ANALYSES = {
  p30: {
    tasks: [
      { task: "Əraziyə gün ərzində çıxacaq maşınların hansı vəziyyətdə olduğunu yoxlayıram", norma: 1, period: "daily", dmin: 60, dmax: 60, fmin: 1, fmax: 1 },
      { task: "Əraziyə çıxacaq yüklə dolu maşınların sənədlərini yoxlayıram", norma: 1, period: "weekly", dmin: 40, dmax: 40, fmin: 2, fmax: 3 },
      { task: "Təmirə dayanan yük maşınlarının problemlərini aşkar edirəm", norma: 1, period: "daily", dmin: 60, dmax: 120, fmin: 2, fmax: 2 },
      { task: "Avtokarların ehtiyat hissələrinin alınmasını təmin edirəm", norma: 1, period: "daily", dmin: 60, dmax: 120, fmin: 1, fmax: 1 },
      { task: "Region maşınlarının kənar servislərdə təmirini təşkil edirəm", norma: 1, period: "daily", dmin: 60, dmax: 60, fmin: 1, fmax: 1 },
      { task: "Yol Polisi tərəfindən cərimə meydançasına aparılan maşınların çıxarılmasına kömək edirəm", norma: 1, period: "daily", dmin: 60, dmax: 90, fmin: 1, fmax: 1 },
    ],
    jobDescription: {
      summary: "Təmir və Yanacaq Bölməsinin gündəlik fəaliyyətini idarə edir, bölmə əməkdaşlarının işini koordinasiya edir və avtopark texniki vəziyyətinə cavabdehlik daşıyır.",
      duties: [
        { id: "jd30_1", text: "Bölmə əməkdaşlarının iş axınını idarə etmək və koordinasiya etmək" },
        { id: "jd30_2", text: "Avtopark üzrə texniki vəziyyəti monitorinq etmək və problemləri aşkar etmək" },
        { id: "jd30_3", text: "Ehtiyat hissələrinin və avadanlıqların satınalma proseslərini təşkil etmək" },
        { id: "jd30_4", text: "Kənar servis mərkəzləri ilə əlaqəni təmin etmək" },
        { id: "jd30_5", text: "Səlahiyyətli orqanlarla əməkdaşlıq və hüquqi məsələləri həll etmək" },
        { id: "jd30_6", text: "Aylıq və rüblük hesabatların hazırlanması və təqdim edilməsi" },
      ],
    },
    status: "completed", updatedAt: "2026-06-12", updatedBy: "Nigar Əliyeva",
  },
  p31: {
    tasks: [
      { task: "08:00 işə başlama, yüklənmiş avtomobillərin elektrik problemini həll etmək", norma: 1, period: "daily", dmin: 20, dmax: 40, fmin: 7, fmax: 8 },
      { task: "Ərazidə nasaz olan maşınların təmir edilməsi", norma: 1, period: "weekly", dmin: 120, dmax: 120, fmin: 2, fmax: 3 },
    ],
    jobDescription: {
      summary: "Anbar avtoparkının və yük maşınlarının elektrik sistemlərinin diaqnostikası, təmiri və texniki xidmətini həyata keçirir.",
      duties: [
        { id: "jd31_1", text: "Avtomobillərin elektrik sistemlərinin diaqnostikası və problemlərin aşkar edilməsi" },
        { id: "jd31_2", text: "Akkumulyator, generator, starter və işıqlandırma sistemlərinin yoxlanması" },
        { id: "jd31_3", text: "Elektrik sistemlərinin profilaktik təmiri və zəruri hissələrin dəyişdirilməsi" },
        { id: "jd31_4", text: "Ərazidə (saytda) baş verən təcili elektrik problemlərinin operativ həlli" },
        { id: "jd31_5", text: "Görülmüş işlərə dair gündəlik qeydlərin aparılması" },
      ],
    },
    status: "completed", updatedAt: "2026-06-12", updatedBy: "Nigar Əliyeva",
  },
  p33: {
    tasks: [
      { task: "08:00 işə başlama, sürücülərin maşınlarına texniki baxış", norma: 1, period: "daily", dmin: 30, dmax: 90, fmin: 2, fmax: 3 },
      { task: "Avtokarların təmiri", norma: 1, period: "daily", dmin: 120, dmax: 120, fmin: 1, fmax: 1 },
      { task: "TT-lərin təmiri", norma: 1, period: "daily", dmin: 120, dmax: 120, fmin: 1, fmax: 1 },
      { task: "Maşınların yağ dəyişimi", norma: 1, period: "daily", dmin: 30, dmax: 30, fmin: 3, fmax: 5 },
    ],
    jobDescription: {
      summary: "Anbar avtoparkına daxil olan avtokarların, yük maşınlarının və texnikanın mexaniki təmiri və texniki xidməti ilə məşğul olur.",
      duties: [
        { id: "jd33_1", text: "Avtokarların və texnikanın mexaniki təmiri" },
        { id: "jd33_2", text: "Profilaktik texniki baxış və müntəzəm xidmət" },
        { id: "jd33_3", text: "Yağ, filtr və köməkçi materialların dəyişdirilməsi" },
        { id: "jd33_4", text: "Hidravlik sistem üzərində iş və problemlərin aradan qaldırılması" },
        { id: "jd33_5", text: "İş təhlükəsizliyi qaydalarına riayət etmək" },
        { id: "jd33_6", text: "Görülmüş işlərə dair hesabatların aparılması" },
      ],
    },
    status: "completed", updatedAt: "2026-06-12", updatedBy: "Nigar Əliyeva",
  },
  p32: {
    tasks: [
      { task: "08:00 işə başlama, sürücülərlə iclas keçirilir", norma: 1, period: "daily", dmin: 15, dmax: 15, fmin: 1, fmax: 1 },
      { task: "Avtokarlar təmirinin keçirilməsi", norma: 1, period: "daily", dmin: 40, dmax: 60, fmin: 3, fmax: 4 },
      { task: "Avtokarlara baxış keçirilməsi", norma: 1, period: "daily", dmin: 15, dmax: 15, fmin: 3, fmax: 4 },
      { task: "Avtokar baxımını etmək (yağ, filter və s.)", norma: 1, period: "daily", dmin: 60, dmax: 60, fmin: 3, fmax: 4 },
      { task: "Hesabat hazırlanması və təqdim edilməsi", norma: 1, period: "weekly", dmin: 40, dmax: 40, fmin: 1, fmax: 1 },
      { task: "Servislə əlaqə yaratmaq və problemləri həll etmək", norma: 1, period: "daily", dmin: 60, dmax: 60, fmin: 1, fmax: 1 },
    ],
    jobDescription: {
      summary: "Avtokar parkının texniki idarə olunması, sürücülərin işinin koordinasiyası və profilaktik texniki xidmətin təşkilinə cavabdehdir.",
      duties: [
        { id: "jd32_1", text: "Avtokar parkının texniki vəziyyətinin monitorinqi və idarə edilməsi" },
        { id: "jd32_2", text: "Sürücülərlə iş təşkili və gündəlik iclasların aparılması" },
        { id: "jd32_3", text: "Avtokarların profilaktik texniki xidmətinin (yağ, filtr) planlaşdırılması" },
        { id: "jd32_4", text: "Müntəzəm texniki baxışların həyata keçirilməsi" },
        { id: "jd32_5", text: "Kənar servis mərkəzləri ilə koordinasiya və problemlərin həlli" },
        { id: "jd32_6", text: "Həftəlik və aylıq hesabatların hazırlanması" },
      ],
    },
    status: "completed", updatedAt: "2026-06-12", updatedBy: "Nigar Əliyeva",
  },
};

// ============================================================================
// Demo audit jurnalı
// ============================================================================
export const INITIAL_AUDIT_LOG = [
  { id: "a1", at: "2026-06-19 09:12", actor: "Nigar Əliyeva", action: "audit_update", target: "Çilingər (vəzifə xronometrajı)" },
  { id: "a2", at: "2026-06-18 16:40", actor: "Elnur Vəliyev", action: "audit_create", target: "Rauf Məmmədov (istifadəçi)" },
  { id: "a3", at: "2026-06-18 11:22", actor: "Elnur Vəliyev", action: "audit_update", target: "HRBP rolu (icazələr)" },
  { id: "a4", at: "2026-06-17 14:05", actor: "Nigar Əliyeva", action: "audit_create", target: "Avto-elektrik (analiz)" },
];
