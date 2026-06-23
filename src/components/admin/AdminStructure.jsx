import React, { useState } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useTh, useT, useAuth } from "../../contexts";
import { uuid, fmt0 } from "../../lib";
import { Modal, FormField } from "../shared";

// Şirkət strukturu redaktoru — Departament → Şöbə/Bölmə → Vəzifə ağacı.
// Hər səviyyədə əlavə/düzəliş/silmə əməliyyatları var.
// Bütün dəyişikliklər avtomatik audit jurnalına düşür.
export function AdminStructure() {
  const { theme } = useTh();
  const { t } = useT();
  const { structure, setStructure, pushAudit, can } = useAuth();
  const canManage = can("admin.structure");

  // Hansı departamentlər açıqdır — başlanğıcda hamısı açıq
  const [openDepts, setOpenDepts] = useState(new Set(structure.map((d) => d.id)));
  const [modal, setModal] = useState(null);

  const toggleDept = (id) => {
    const next = new Set(openDepts);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenDepts(next);
  };

  // ===== Departament CRUD =====
  const addDept = (name_az) => {
    setStructure([...structure, { id: uuid(), name_az, name_en: name_az, units: [] }]);
    pushAudit("audit_create", `${name_az} (departament)`);
  };
  const editDept = (id, name_az) => {
    setStructure(structure.map((d) => (d.id === id ? { ...d, name_az } : d)));
    pushAudit("audit_update", `${name_az} (departament)`);
  };
  const delDept = (d) => {
    if (!confirm(t("confirm_delete"))) return;
    setStructure(structure.filter((x) => x.id !== d.id));
    pushAudit("audit_delete", `${d.name_az} (departament)`);
  };

  // ===== Şöbə/Bölmə (unit) CRUD =====
  const addUnit = (dept_id, name_az) => {
    setStructure(structure.map((d) => d.id === dept_id
      ? { ...d, units: [...d.units, { id: uuid(), name_az, positions: [] }] }
      : d));
    pushAudit("audit_create", `${name_az} (şöbə)`);
  };
  const editUnit = (dept_id, unit_id, name_az) => {
    setStructure(structure.map((d) => d.id === dept_id
      ? { ...d, units: d.units.map((u) => (u.id === unit_id ? { ...u, name_az } : u)) }
      : d));
    pushAudit("audit_update", `${name_az} (şöbə)`);
  };
  const delUnit = (dept_id, u) => {
    if (!confirm(t("confirm_delete"))) return;
    setStructure(structure.map((d) => d.id === dept_id
      ? { ...d, units: d.units.filter((x) => x.id !== u.id) }
      : d));
    pushAudit("audit_delete", `${u.name_az} (şöbə)`);
  };

  // ===== Vəzifə (position) CRUD =====
  const addPos = (dept_id, unit_id, data) => {
    setStructure(structure.map((d) => d.id === dept_id
      ? {
          ...d, units: d.units.map((u) => u.id === unit_id
            ? { ...u, positions: [...u.positions, { id: uuid(), ...data, ehtiyac: data.stat, teklif: 0, qeyd: null }] }
            : u),
        }
      : d));
    pushAudit("audit_create", `${data.name_az} (vəzifə)`);
  };
  const editPos = (dept_id, unit_id, pos_id, data) => {
    setStructure(structure.map((d) => d.id === dept_id
      ? {
          ...d, units: d.units.map((u) => u.id === unit_id
            ? { ...u, positions: u.positions.map((p) => (p.id === pos_id ? { ...p, ...data } : p)) }
            : u),
        }
      : d));
    pushAudit("audit_update", `${data.name_az} (vəzifə)`);
  };
  const delPos = (dept_id, unit_id, p) => {
    if (!confirm(t("confirm_delete"))) return;
    setStructure(structure.map((d) => d.id === dept_id
      ? {
          ...d, units: d.units.map((u) => u.id === unit_id
            ? { ...u, positions: u.positions.filter((x) => x.id !== p.id) }
            : u),
        }
      : d));
    pushAudit("audit_delete", `${p.name_az} (vəzifə)`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-medium">{t("adm_struct_title")}</h3>
          <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{t("adm_struct_desc")}</p>
        </div>
        {canManage && (
          <button onClick={() => setModal({ type: "addDept" })}
            className="px-3 py-2 text-xs md:text-sm flex items-center gap-1.5"
            style={{ background: theme.sidebar, color: "#fff" }}>
            <Plus size={14} /> {t("adm_add_dept")}
          </button>
        )}
      </div>

      {/* Ağac strukturu */}
      <div className="space-y-3">
        {structure.map((d) => (
          <div key={d.id} style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            {/* Departament başlığı */}
            <div className="px-4 py-3 flex items-center gap-3"
              style={{ background: theme.surfaceAlt, borderBottom: openDepts.has(d.id) ? `1px solid ${theme.border}` : "none" }}>
              <button onClick={() => toggleDept(d.id)}>
                {openDepts.has(d.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{d.name_az}</div>
                <div className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                  {d.units.length} {t("adm_struct_units")} · {d.units.reduce((s, u) => s + u.positions.length, 0)} {t("adm_struct_positions")}
                </div>
              </div>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => setModal({ type: "addUnit", dept_id: d.id })}
                    className="p-1.5 text-[10px] flex items-center gap-1"
                    style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
                    <Plus size={11} /> {t("adm_add_unit")}
                  </button>
                  <button onClick={() => setModal({ type: "editDept", dept: d })} className="p-1.5" style={{ color: theme.text }}>
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => delDept(d)} className="p-1.5" style={{ color: theme.danger }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Departament açıqdırsa — şöbə/bölmələri göstər */}
            {openDepts.has(d.id) && (
              <div>
                {d.units.map((u) => (
                  <div key={u.id} className="px-4 py-3 pl-10" style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{u.name_az}</div>
                        <div className="text-[11px]" style={{ color: theme.textMuted }}>
                          {u.positions.length} {t("adm_struct_positions")}
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <button onClick={() => setModal({ type: "addPos", dept_id: d.id, unit_id: u.id })}
                            className="p-1.5 text-[10px] flex items-center gap-1"
                            style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
                            <Plus size={11} /> {t("adm_add_pos")}
                          </button>
                          <button onClick={() => setModal({ type: "editUnit", dept_id: d.id, unit: u })} className="p-1.5" style={{ color: theme.text }}>
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => delUnit(d.id, u)} className="p-1.5" style={{ color: theme.danger }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Vəzifələr siyahısı */}
                    {u.positions.length > 0 && (
                      <div className="space-y-1 pl-4 mt-2" style={{ borderLeft: `2px solid ${theme.borderSoft}` }}>
                        {u.positions.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 py-1.5 px-2">
                            <div className="flex-1 min-w-0 text-sm">
                              <span>{p.name_az}</span>
                              <span className="text-[11px] ml-2 tabular-nums" style={{ color: theme.textMuted }}>
                                · {t("adm_pos_stat")}: {fmt0(p.stat)}
                              </span>
                            </div>
                            {canManage && (
                              <div className="flex gap-1">
                                <button onClick={() => setModal({ type: "editPos", dept_id: d.id, unit_id: u.id, pos: p })} className="p-1" style={{ color: theme.text }}>
                                  <Edit2 size={11} />
                                </button>
                                <button onClick={() => delPos(d.id, u.id, p)} className="p-1" style={{ color: theme.danger }}>
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal dispatch */}
      {modal?.type === "addDept" && (
        <SimpleNameModal title={t("adm_add_dept")} label={t("adm_dept_name")}
          onSave={(name) => { addDept(name); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === "editDept" && (
        <SimpleNameModal title={t("btn_edit")} label={t("adm_dept_name")} initial={modal.dept.name_az}
          onSave={(name) => { editDept(modal.dept.id, name); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === "addUnit" && (
        <SimpleNameModal title={t("adm_add_unit")} label={t("adm_unit_name")}
          onSave={(name) => { addUnit(modal.dept_id, name); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === "editUnit" && (
        <SimpleNameModal title={t("btn_edit")} label={t("adm_unit_name")} initial={modal.unit.name_az}
          onSave={(name) => { editUnit(modal.dept_id, modal.unit.id, name); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === "addPos" && (
        <PositionModal title={t("adm_add_pos")}
          onSave={(data) => { addPos(modal.dept_id, modal.unit_id, data); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === "editPos" && (
        <PositionModal title={t("btn_edit")} initial={modal.pos}
          onSave={(data) => { editPos(modal.dept_id, modal.unit_id, modal.pos.id, data); setModal(null); }} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// Yalnız ad sahəsi olan sadə modal (departament/şöbə üçün)
function SimpleNameModal({ title, label, initial, onSave, onClose }) {
  const { theme } = useTh();
  const [v, setV] = useState(initial || "");
  return (
    <Modal title={title} onClose={onClose} onSave={() => v && onSave(v)}>
      <FormField label={label}>
        <input autoFocus value={v} onChange={(e) => setV(e.target.value)}
          className="w-full px-3 py-2 text-sm focus:outline-none"
          style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 }} />
      </FormField>
    </Modal>
  );
}

// Vəzifə yarat/düzəlt modalı — ad və cari ştat
function PositionModal({ title, initial, onSave, onClose }) {
  const { theme } = useTh();
  const { t } = useT();
  const [p, setP] = useState(initial || { name_az: "", stat: 1 });
  return (
    <Modal title={title} onClose={onClose} onSave={() => p.name_az && onSave(p)}>
      <FormField label={t("adm_pos_name")}>
        <input autoFocus value={p.name_az} onChange={(e) => setP({ ...p, name_az: e.target.value })}
          className="w-full px-3 py-2 text-sm focus:outline-none"
          style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 }} />
      </FormField>
      <FormField label={t("adm_pos_stat")}>
        <input type="number" value={p.stat ?? ""}
          onChange={(e) => setP({ ...p, stat: e.target.value === "" ? null : Number(e.target.value) })}
          className="w-full px-3 py-2 text-sm focus:outline-none"
          style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 }} />
      </FormField>
    </Modal>
  );
}
