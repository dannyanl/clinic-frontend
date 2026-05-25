import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

import { Spinner } from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import { listInventory, createItem, addMovement, type InventoryItem } from "../services/inventory";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n";

export default function Inventory() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);
  const canCreate = role === "admin";
  const qc = useQueryClient();

  const [lowOnly, setLowOnly] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [movItem, setMovItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", unit: "unit", stock: "0", min_stock: "0", cost: "0" });
  const [mov, setMov] = useState({ delta: "", reason: "" });
  const [err, setErr] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory", lowOnly],
    queryFn: () => listInventory(lowOnly),
    refetchInterval: 60_000,
  });

  const create = useMutation({
    mutationFn: () => createItem({ sku: form.sku, name: form.name, unit: form.unit, stock: Number(form.stock), min_stock: Number(form.min_stock), cost: Number(form.cost) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); setCreateOpen(false); setForm({ sku: "", name: "", unit: "unit", stock: "0", min_stock: "0", cost: "0" }); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const move = useMutation({
    mutationFn: () => addMovement(movItem!.id, Number(mov.delta), mov.reason || undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); setMovItem(null); setMov({ delta: "", reason: "" }); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const lowCount = items.filter((i) => i.low).length;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t("inventory.title")}</h1>
          <p className="text-sm text-ink-500">
            {items.length} {t("inventory.items")}
            {lowCount > 0 && <> · <span className="text-amber-600 font-semibold">{lowCount} {t("inventory.lowStock")}</span></>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLowOnly(!lowOnly)}
            className={`btn-secondary btn-sm flex items-center gap-1.5 ${lowOnly ? "border-amber-400 text-amber-700 bg-amber-50" : ""}`}>
            <AlertTriangle className="w-3.5 h-3.5" /> {lowOnly ? t("inventory.showAll") : t("inventory.showLow")}
          </button>
          {canCreate && (
            <button className="btn-gradient" onClick={() => { setErr(null); setCreateOpen(true); }}>
              <Plus className="w-4 h-4" /> {t("inventory.newItem")}
            </button>
          )}
        </div>
      </header>

      {isLoading ? <Spinner /> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">{t("inventory.sku")}</th>
                <th className="text-left px-4 py-3">{t("inventory.name")}</th>
                <th className="text-left px-4 py-3">{t("inventory.unit")}</th>
                <th className="text-right px-4 py-3">{t("inventory.stock")}</th>
                <th className="text-right px-4 py-3">{t("inventory.min")}</th>
                <th className="text-right px-4 py-3">{t("inventory.cost")}</th>
                <th className="text-left px-4 py-3">{t("inventory.status")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={`border-t border-ink-100 hover:bg-ink-50/50 ${item.low ? "bg-amber-50/40" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">{item.sku}</td>
                  <td className="px-4 py-3 font-semibold">{item.name}</td>
                  <td className="px-4 py-3 text-ink-500">{item.unit}</td>
                  <td className="px-4 py-3 text-right font-bold">{item.stock}</td>
                  <td className="px-4 py-3 text-right text-ink-500">{item.min_stock}</td>
                  <td className="px-4 py-3 text-right text-ink-600">$ {item.cost.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {item.low
                      ? <span className="badge badge-amber flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> {t("inventory.lowBadge")}</span>
                      : <span className="badge badge-green">{t("inventory.normal")}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn-secondary btn-sm" onClick={() => { setErr(null); setMov({ delta: "", reason: "" }); setMovItem(item); }}>
                      {t("inventory.movement")}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-ink-400">{t("inventory.noItems")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t("inventory.createModal.title")} size="md">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">{t("inventory.sku")} *</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="MED-001" /></div>
          <div><label className="label">{t("inventory.name")} *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">{t("inventory.unit")}</label><input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder={t("inventory.unitPh")} /></div>
          <div><label className="label">{t("inventory.initialStock")}</label><input className="input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
          <div><label className="label">{t("inventory.minStock")}</label><input className="input" type="number" min="0" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} /></div>
          <div><label className="label">{t("inventory.unitCost")}</label><input className="input" type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
          {err && <div className="sm:col-span-2 text-sm text-rose-600">{err}</div>}
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</button>
            <button className="btn-primary" disabled={!form.sku || !form.name || create.isPending} onClick={() => create.mutate()}>{t("inventory.creating")}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!movItem} onClose={() => setMovItem(null)} title={`${t("inventory.movement")}: ${movItem?.name}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">{t("inventory.movModal.currentStock")}: <strong>{movItem?.stock}</strong> {movItem?.unit}</p>
          <div>
            <label className="label">{t("inventory.movModal.qty")}</label>
            <div className="flex gap-2 items-center">
              <button className="btn-secondary btn-sm px-3" onClick={() => setMov({ ...mov, delta: "-1" })}>
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </button>
              <input className="input text-center font-bold" type="number" value={mov.delta} onChange={(e) => setMov({ ...mov, delta: e.target.value })} placeholder="0" />
              <button className="btn-secondary btn-sm px-3" onClick={() => setMov({ ...mov, delta: "1" })}>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </button>
            </div>
          </div>
          <div>
            <label className="label">{t("inventory.movModal.reason")}</label>
            <input className="input" value={mov.reason} onChange={(e) => setMov({ ...mov, reason: e.target.value })} placeholder={t("inventory.movModal.reasonPh")} />
          </div>
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setMovItem(null)}>{t("common.cancel")}</button>
            <button className="btn-primary" disabled={!mov.delta || mov.delta === "0" || move.isPending} onClick={() => move.mutate()}>{t("inventory.movModal.register")}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
