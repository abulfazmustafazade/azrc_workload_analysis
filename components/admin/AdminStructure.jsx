import React, { useState } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, FolderTree } from "lucide-react";
import { useTh, useT, useAuth, useToast } from "../../contexts";
import { fmt0, fmtMoney, nodeName, levelLabel, nextLevel } from "../../lib";
import { structureApi } from "../../db";
import { Modal, FormField } from "../shared";

export function AdminStructure() {
  const { theme } = useTh();
  const { t, lang } = useT();
  const { structure, pushAudit, can, reloadData } = useAuth();
  const canManage = can("admin.structure");
  const { addToast } = useToast();

  const [openIds, setOpenIds] = useState(new Set(structure.map((n) => n.id)));
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const toggle = (id) => {
    const next = new Set(openIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenIds(next);
  };

  // ===== Node CRUD — birbaşa DB, sonra full reload =====
  const addRootNode = async (name_az, name_en) => {
    setSaving(true);
    try {
      await structureApi.createNode({ parent_id: null, level: "company", name_az, name_en });
      pushAudit("audit_create", `${name_az} (${levelLabel("company", lang)})`);
      await reloadData();
      addToast(`${name_az} yaradıldı`, "success");
    } catch (err) {
      console.error("[YÜKAY] Node yaradılmadı:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
  };

  const addChildNode = async (parentId, parentLevel, name_az, name_en) => {
    setSaving(true);
    const lvl = nextLevel(parentLevel) || "sub_unit";
    try {
      await structureApi.createNode({ parent_id: parentId, level: lvl, name_az, name_en });
      pushAudit("audit_create", `${name_az} (${levelLabel(lvl, lang)})`);
      await reloadData();
      addToast(`${name_az} yaradıldı`, "success");
    } catch (err) {
      console.error("[YÜKAY] Node yaradılmadı:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
  };

  const editNode = async (id, name_az, name_en) => {
    setSaving(true);
    try {
      await structureApi.updateNode(id, { name_az, name_en });
      pushAudit("audit_update", name_az);
      await reloadData();
      addToast(`${name_az} yeniləndi`, "success");
    } catch (err) {
      console.error("[YÜKAY] Node yenilənmədi:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
  };

  const deleteNode = async (id, label) => {
    if (!confirm(t("confirm_delete"))) return;
    setSaving(true);
    try {
      await structureApi.removeNode(id);
      pushAudit("audit_delete", label);
      await reloadData();
      addToast("Silindi", "success");
    } catch (err) {
      console.error("[YÜKAY] Node silinmədi:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
  };

  // ===== Vəzifə CRUD — birbaşa DB, real id-ni state-ə yazır =====
  const addPosition = async (nodeId, data) => {
    setSaving(true);
    try {
      const created = await structureApi.createPosition(nodeId, {
        name_az: data.name_az, name_en: data.name_en,
        stat: data.stat, salary: data.salary,
      });
      pushAudit("audit_create", `${data.name_az} (vəzifə)`);
      await reloadData();
      addToast(`${data.name_az} yaradıldı`, "success");
    } catch (err) {
      console.error("[YÜKAY] Vəzifə yaradılmadı:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
  };

  const editPosition = async (nodeId, posId, data) => {
    setSaving(true);
    try {
      await structureApi.updatePosition(posId, {
        name_az: data.name_az, name_en: data.name_en || "",
        stat: data.stat, ehtiyac: data.stat, salary: data.salary,
      });
      pushAudit("audit_update", `${data.name_az} (vəzifə)`);
      await reloadData();
      addToast(`${data.name_az} yeniləndi`, "success");
    } catch (err) {
      console.error("[YÜKAY] Vəzifə yenilənmədi:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
  };

  const deletePosition = async (nodeId, pos) => {
    if (!confirm(t("confirm_delete"))) return;
    setSaving(true);
    try {
      await structureApi.removePosition(pos.id);
      pushAudit("audit_delete", `${pos.name_az} (vəzifə)`);
      await reloadData();
      addToast("Vəzifə silindi", "success");
    } catch (err) {
      console.error("[YÜKAY] Vəzifə silinmədi:", err);
      addToast(err.message || "Xəta baş verdi", "error");
    } finally { setSaving(false); }
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

          {canManage && !saving && (
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
            {(node.positions || []).map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 py-2 px-3 group"
                   style={{ paddingLeft: `${12 + (depth + 1) * 22 + 18}px`,
                            borderBottom: `1px solid ${theme.borderSoft}` }}>
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: theme.accent }} />
                <div className="flex-1 min-w-0 text-sm">
                  <span style={{ color: theme.text }}>
                    {lang === "en" ? (p.name_en || p.name_az) : p.name_az}
                  </span>
                  <span className="text-[11px] ml-2 tabular-nums" style={{ color: theme.textMuted }}>
                    · {t("adm_pos_stat")}: {fmt0(p.stat)}
                    {p.salary ? ` · ${fmtMoney(p.salary)}` : ""}
                  </span>
                </div>
                {canManage && !saving && (
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
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs" style={{ color: theme.textMuted }}>Yadda saxlanılır...</span>
          )}
          {canManage && (
            <button onClick={() => setModal({ type: "addRoot" })}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: theme.accent, borderRadius: 2 }}>
              <Plus size={13} /> {t("adm_add_dept")}
            </button>
          )}
        </div>
      </div>

      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2, overflow: "hidden" }}>
        {structure.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: theme.textDim }}>
            {t("adm_struct_empty")}
          </div>
        )}
        {structure.map((node) => renderNode(node, 0))}
      </div>

      {/* Modallar */}
      {modal?.type === "addRoot" && (
        <NodeModal title={`${t("adm_add_dept")} — ${levelLabel("company", lang)}`}
                   onSave={async (az, en) => { setModal(null); await addRootNode(az, en); }}
                   onClose={() => setModal(null)} />
      )}
      {modal?.type === "addChild" && (
        <NodeModal title={`${t("adm_add_child")} — ${levelLabel(nextLevel(modal.parent.level), lang)}`}
                   onSave={async (az, en) => { setModal(null); await addChildNode(modal.parent.id, modal.parent.level, az, en); }}
                   onClose={() => setModal(null)} />
      )}
      {modal?.type === "editNode" && (
        <NodeModal title={t("btn_edit")} initialAz={modal.node.name_az} initialEn={modal.node.name_en}
                   onSave={async (az, en) => { setModal(null); await editNode(modal.node.id, az, en); }}
                   onClose={() => setModal(null)} />
      )}
      {modal?.type === "addPos" && (
        <PositionModal title={t("adm_add_pos")}
                       onSave={async (data) => { setModal(null); await addPosition(modal.nodeId, data); }}
                       onClose={() => setModal(null)} />
      )}
      {modal?.type === "editPos" && (
        <PositionModal title={t("btn_edit")} initial={modal.pos}
                       onSave={async (data) => { setModal(null); await editPosition(modal.nodeId, modal.pos.id, data); }}
                       onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function countPositions(node) {
  let count = (node.positions || []).length;
  (node.children || []).forEach((c) => { count += countPositions(c); });
  return count;
}

function levelColor(level, theme) {
  const map = {
    company: theme.info, division: theme.accent,
    department: theme.warn, sub_department: theme.success,
    unit: theme.neutral, sub_unit: theme.textDim,
  };
  return map[level] || theme.neutral;
}

function IconBtn({ children, onClick, danger, title }) {
  const { theme } = useTh();
  return (
    <button onClick={onClick} title={title} className="p-1.5"
            style={{ border: `1px solid ${theme.border}`, color: danger ? theme.danger : theme.textMuted, borderRadius: 2 }}>
      {children}
    </button>
  );
}

function NodeModal({ title, initialAz, initialEn, onSave, onClose }) {
  const { theme } = useTh();
  const { t } = useT();
  const [az, setAz] = useState(initialAz || "");
  const [en, setEn] = useState(initialEn || "");
  const st = { background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 };
  return (
    <Modal title={title} onClose={onClose} onSave={() => az && onSave(az, en)}>
      <FormField label={t("adm_name_az")} required>
        <input autoFocus value={az} onChange={(e) => setAz(e.target.value)}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
      </FormField>
      <FormField label={t("adm_name_en")} help="Boş buraxılarsa AZ adı istifadə olunur">
        <input value={en} onChange={(e) => setEn(e.target.value)}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
      </FormField>
    </Modal>
  );
}

function PositionModal({ title, initial, onSave, onClose }) {
  const { theme } = useTh();
  const { t } = useT();
  const [p, setP] = useState(initial || { name_az: "", name_en: "", stat: 1, salary: "" });
  const st = { background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 2 };
  return (
    <Modal title={title} onClose={onClose}
           onSave={() => p.name_az && onSave({ ...p, salary: p.salary === "" ? null : Number(p.salary) })}>
      <FormField label={t("adm_pos_name_az")} required>
        <input autoFocus value={p.name_az} onChange={(e) => setP({ ...p, name_az: e.target.value })}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
      </FormField>
      <FormField label={t("adm_pos_name_en")}>
        <input value={p.name_en || ""} onChange={(e) => setP({ ...p, name_en: e.target.value })}
               className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("adm_pos_stat")}>
          <input type="number" min="0" value={p.stat ?? ""}
                 onChange={(e) => setP({ ...p, stat: e.target.value === "" ? null : Number(e.target.value) })}
                 className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
        </FormField>
        <FormField label={t("adm_pos_salary")}>
          <input type="number" min="0" step="50" value={p.salary ?? ""}
                 onChange={(e) => setP({ ...p, salary: e.target.value })}
                 className="w-full px-3 py-2 text-sm focus:outline-none" style={st} />
        </FormField>
      </div>
    </Modal>
  );
}
