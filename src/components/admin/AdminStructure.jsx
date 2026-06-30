import React, { useState } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, FolderTree } from "lucide-react";
import { useTh, useT, useAuth } from "../../contexts";
import { uuid, fmt0, fmtMoney, nodeName, levelLabel, nextLevel, updateNodeById, removeNodeById } from "../../lib";
import { Modal, FormField } from "../shared";

// Şirkət strukturu redaktoru — rekursiv ağac (Company → Division → Department →
// Sub-department → Unit → Sub-unit), hər səviyyədə uşaq node əlavə etmək,
// silmək, düzəliş etmək mümkündür. Yarpaq node-larda (və ya istənilən node-da)
// birbaşa vəzifələr əlavə edilə bilər.
export function AdminStructure() {
  const { theme } = useTh();
  const { t, lang } = useT();
  const { structure, setStructure, pushAudit, can } = useAuth();
  const canManage = can("admin.structure");

  const [openIds, setOpenIds] = useState(new Set(structure.map((n) => n.id)));
  const [modal, setModal] = useState(null);

  const toggle = (id) => {
    const next = new Set(openIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenIds(next);
  };

  // ===== Node CRUD (rekursiv) =====
  const addRootNode = (name_az, name_en) => {
    const node = { id: uuid(), level: "company", name_az, name_en, children: [], positions: [] };
    setStructure([...structure, node]);
    pushAudit("audit_create", `${name_az} (${levelLabel("company", lang)})`);
  };

  const addChildNode = (parentId, parentLevel, name_az, name_en) => {
    const lvl = nextLevel(parentLevel) || "sub_unit";
    setStructure(updateNodeById(structure, parentId, (node) => ({
      ...node,
      children: [...(node.children || []), { id: uuid(), level: lvl, name_az, name_en, children: [], positions: [] }],
    })));
    pushAudit("audit_create", `${name_az} (${levelLabel(lvl, lang)})`);
  };

  const editNode = (id, name_az, name_en) => {
    setStructure(updateNodeById(structure, id, (node) => ({ ...node, name_az, name_en })));
    pushAudit("audit_update", `${name_az}`);
  };

  const deleteNode = (id, label) => {
    if (!confirm(t("confirm_delete"))) return;
    setStructure(removeNodeById(structure, id));
    pushAudit("audit_delete", label);
  };

  // ===== Vəzifə CRUD =====
  const addPosition = (nodeId, data) => {
    setStructure(updateNodeById(structure, nodeId, (node) => ({
      ...node,
      positions: [...(node.positions || []), { id: uuid(), ...data, ehtiyac: data.stat, teklif: 0, qeyd: null }],
    })));
    pushAudit("audit_create", `${data.name_az} (vəzifə)`);
  };

  const editPosition = (nodeId, posId, data) => {
    setStructure(updateNodeById(structure, nodeId, (node) => ({
      ...node,
      positions: node.positions.map((p) => (p.id === posId ? { ...p, ...data } : p)),
    })));
    pushAudit("audit_update", `${data.name_az} (vəzifə)`);
  };

  const deletePosition = (nodeId, pos) => {
    if (!confirm(t("confirm_delete"))) return;
    setStructure(updateNodeById(structure, nodeId, (node) => ({
      ...node,
      positions: node.positions.filter((p) => p.id !== pos.id),
    })));
    pushAudit("audit_delete", `${pos.name_az} (vəzifə)`);
  };

  // ===== Rekursiv render =====
  const renderNode = (node, depth = 0) => {
    const isOpen = openIds.has(node.id);
    const childCount = (node.children || []).length;
    const posCount = (node.positions || []).length;
    const totalPosInSubtree = countPositions(node);

    return (
      <div key={node.id}>
        <div className="flex items-center gap-2.5 py-2.5 px-3 group"
             style={{
               paddingLeft: `${12 + depth * 22}px`,
               borderBottom: `1px solid ${theme.borderSoft}`,
               background: depth === 0 ? theme.surfaceAlt : "transparent",
             }}>
          {(childCount > 0 || posCount > 0) ? (
            <button onClick={() => toggle(node.id)} className="flex-shrink-0" style={{ color: theme.textMuted }}>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <div className="w-3.5 flex-shrink-0" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: levelColor(node.level, theme) + "18",
                             color: levelColor(node.level, theme), borderRadius: 2 }}>
                {levelLabel(node.level, lang)}
              </span>
              <span className="font-medium text-sm truncate" style={{ color: theme.text }}>
                {nodeName(node, lang)}
              </span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: theme.textDim }}>
              {lang === "az" ? node.name_en : node.name_az}
              {totalPosInSubtree > 0 && ` · ${totalPosInSubtree} ${t("adm_struct_positions")}`}
            </div>
          </div>

          {canManage && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {nextLevel(node.level) && (
                <IconBtn title={t("adm_add_child")} onClick={() => setModal({ type: "addChild", parent: node })}>
                  <Plus size={12} />
                </IconBtn>
              )}
              <IconBtn title={t("adm_add_pos")} onClick={() => setModal({ type: "addPos", nodeId: node.id })}>
                <FolderTree size={12} />
              </IconBtn>
              <IconBtn title={t("btn_edit")} onClick={() => setModal({ type: "editNode", node })}>
                <Edit2 size={11} />
              </IconBtn>
              <IconBtn title={t("btn_delete")} danger onClick={() => deleteNode(node.id, nodeName(node, lang))}>
                <Trash2 size={11} />
              </IconBtn>
            </div>
          )}
        </div>

        {isOpen && (
          <>
            {/* Bu node-un birbaşa vəzifələri */}
            {(node.positions || []).map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 py-2 px-3 group"
                   style={{ paddingLeft: `${12 + (depth + 1) * 22 + 18}px`,
                            borderBottom: `1px solid ${theme.borderSoft}` }}>
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: theme.accent }} />
                <div className="flex-1 min-w-0 text-sm">
                  <span style={{ color: theme.text }}>{lang === "en" ? (p.name_en || p.name_az) : p.name_az}</span>
                  <span className="text-[11px] ml-2 tabular-nums" style={{ color: theme.textMuted }}>
                    · {t("adm_pos_stat")}: {fmt0(p.stat)}
                    {p.salary ? ` · ${fmtMoney(p.salary)}` : ""}
                  </span>
                </div>
                {canManage && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <IconBtn title={t("btn_edit")} onClick={() => setModal({ type: "editPos", nodeId: node.id, pos: p })}>
                      <Edit2 size={11} />
                    </IconBtn>
                    <IconBtn title={t("btn_delete")} danger onClick={() => deletePosition(node.id, p)}>
                      <Trash2 size={11} />
                    </IconBtn>
                  </div>
                )}
              </div>
            ))}
            {/* Alt node-lar */}
            {(node.children || []).map((child) => renderNode(child, depth + 1))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold" style={{ color: theme.text }}>{t("adm_struct_title")}</h3>
          <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{t("adm_struct_desc")}</p>
        </div>
        {canManage && (
          <button onClick={() => setModal({ type: "addRoot" })}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white"
                  style={{ background: theme.accent, borderRadius: 2 }}>
            <Plus size={13} /> {t("adm_add_dept")}
          </button>
        )}
      </div>

      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2, overflow: "hidden" }}>
        {structure.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: theme.textDim }}>
            {t("adm_struct_empty")}
          </div>
        )}
        {structure.map((node) => renderNode(node, 0))}
      </div>

      {/* ===== Modallar ===== */}
      {modal?.type === "addRoot" && (
        <NodeModal title={`${t("adm_add_dept")} — ${levelLabel("company", lang)}`}
                   onSave={(az, en) => { addRootNode(az, en); setModal(null); }}
                   onClose={() => setModal(null)} />
      )}
      {modal?.type === "addChild" && (
        <NodeModal title={`${t("adm_add_child")} — ${levelLabel(nextLevel(modal.parent.level), lang)}`}
                   onSave={(az, en) => { addChildNode(modal.parent.id, modal.parent.level, az, en); setModal(null); }}
                   onClose={() => setModal(null)} />
      )}
      {modal?.type === "editNode" && (
        <NodeModal title={t("btn_edit")} initialAz={modal.node.name_az} initialEn={modal.node.name_en}
                   onSave={(az, en) => { editNode(modal.node.id, az, en); setModal(null); }}
                   onClose={() => setModal(null)} />
      )}
      {modal?.type === "addPos" && (
        <PositionModal title={t("adm_add_pos")}
                        onSave={(data) => { addPosition(modal.nodeId, data); setModal(null); }}
                        onClose={() => setModal(null)} />
      )}
      {modal?.type === "editPos" && (
        <PositionModal title={t("btn_edit")} initial={modal.pos}
                        onSave={(data) => { editPosition(modal.nodeId, modal.pos.id, data); setModal(null); }}
                        onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// Subtree-dəki bütün vəzifələrin sayını rekursiv hesablayır
function countPositions(node) {
  let count = (node.positions || []).length;
  (node.children || []).forEach((c) => { count += countPositions(c); });
  return count;
}

// Səviyyəyə görə rəng (vizual iyerarxiya üçün)
function levelColor(level, theme) {
  const map = {
    company: theme.info,
    division: theme.accent,
    department: theme.warn,
    sub_department: theme.success,
    unit: theme.neutral,
    sub_unit: theme.textDim,
  };
  return map[level] || theme.neutral;
}

function IconBtn({ children, onClick, danger, title }) {
  const { theme } = useTh();
  return (
    <button onClick={onClick} title={title} className="p-1.5"
            style={{ border: `1px solid ${theme.border}`, color: danger ? theme.danger : theme.textMuted,
                     borderRadius: 2 }}>
      {children}
    </button>
  );
}

// Bilingual ad modalı — Company/Division/Department/Unit yaratmaq/düzəltmək üçün
function NodeModal({ title, initialAz, initialEn, onSave, onClose }) {
  const { theme } = useTh();
  const { t } = useT();
  const [az, setAz] = useState(initialAz || "");
  const [en, setEn] = useState(initialEn || "");
  const inputStyle = { background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 };

  return (
    <Modal title={title} onClose={onClose} onSave={() => az && onSave(az, en)}>
      <FormField label={t("adm_name_az")} required>
        <input autoFocus value={az} onChange={(e) => setAz(e.target.value)}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
      </FormField>
      <FormField label={t("adm_name_en")}
                 help="Boş buraxılarsa, ingilis dilində Azərbaycan adı göstəriləcək">
        <input value={en} onChange={(e) => setEn(e.target.value)}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
      </FormField>
    </Modal>
  );
}

// Vəzifə yarat/düzəlt modalı — bilingual ad, ştat, maaş
function PositionModal({ title, initial, onSave, onClose }) {
  const { theme } = useTh();
  const { t } = useT();
  const [p, setP] = useState(initial || { name_az: "", name_en: "", stat: 1, salary: "" });
  const inputStyle = { background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 };

  return (
    <Modal title={title} onClose={onClose}
           onSave={() => p.name_az && onSave({ ...p, salary: p.salary === "" ? null : Number(p.salary) })}>
      <FormField label={t("adm_pos_name_az")} required>
        <input autoFocus value={p.name_az} onChange={(e) => setP({ ...p, name_az: e.target.value })}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
      </FormField>
      <FormField label={t("adm_pos_name_en")}>
        <input value={p.name_en || ""} onChange={(e) => setP({ ...p, name_en: e.target.value })}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("adm_pos_stat")}>
          <input type="number" min="0" value={p.stat ?? ""}
                 onChange={(e) => setP({ ...p, stat: e.target.value === "" ? null : Number(e.target.value) })}
                 className="w-full px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
        </FormField>
        <FormField label={t("adm_pos_salary")}>
          <input type="number" min="0" step="50" value={p.salary ?? ""}
                 onChange={(e) => setP({ ...p, salary: e.target.value })}
                 className="w-full px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
        </FormField>
      </div>
    </Modal>
  );
}
