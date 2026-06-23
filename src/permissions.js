// Sistemdəki bütün icazə açarları
export const ALL_PERMS = [
  "dashboard.view",
  "library.view",
  "analysis.view", "analysis.create", "analysis.edit", "analysis.delete", "analysis.approve",
  "report.view", "report.export",
  "admin.users", "admin.roles", "admin.structure", "admin.audit",
];

// Rol redaktəsində UI-da göstərmək üçün qruplaşdırma
export const PERM_GROUPS = {
  adm_perm_dashboard: ["dashboard.view"],
  adm_perm_library: ["library.view"],
  adm_perm_analysis: ["analysis.view", "analysis.create", "analysis.edit", "analysis.delete", "analysis.approve"],
  adm_perm_report: ["report.view", "report.export"],
  adm_perm_admin: ["admin.users", "admin.roles", "admin.structure", "admin.audit"],
};

// İcazə açarı → tərcümə açarı
export const PERM_LABELS = {
  "dashboard.view": "p_dashboard_view",
  "library.view": "p_library_view",
  "analysis.view": "p_analysis_view",
  "analysis.create": "p_analysis_create",
  "analysis.edit": "p_analysis_edit",
  "analysis.delete": "p_analysis_delete",
  "analysis.approve": "p_analysis_approve",
  "report.view": "p_report_view",
  "report.export": "p_report_export",
  "admin.users": "p_admin_users",
  "admin.roles": "p_admin_roles",
  "admin.structure": "p_admin_structure",
  "admin.audit": "p_admin_audit",
};

// İş günü standartları
export const WORK_DAY_MIN = 420;       // 7 saat
export const WORK_WEEK_DAYS = 5;
export const WORK_MONTH_DAYS = 22;
