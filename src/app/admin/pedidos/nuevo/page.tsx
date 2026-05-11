"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    description: "",
    totalAmount: "",
    deliveryDate: "",
    notes: "",
  });

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName || !form.description || !form.totalAmount || !form.deliveryDate) return;
    setSaving(true);
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        totalAmount: parseFloat(form.totalAmount),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/pedidos/${data.id}`);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/pedidos" className="text-on-surface-muted hover:text-on-surface">
          <span className="material-symbol" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <h1 className="text-2xl font-bold text-on-surface font-serif">Nuevo pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-outline-variant p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">
            Nombre del cliente *
          </label>
          <input
            required value={form.clientName} onChange={(e) => set("clientName", e.target.value)}
            placeholder="Ej: Laura González"
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">
            Teléfono
          </label>
          <input
            type="tel" value={form.clientPhone} onChange={(e) => set("clientPhone", e.target.value)}
            placeholder="55 1234 5678"
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">
            Descripción del pedido *
          </label>
          <textarea
            required rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Ej: 4 totebags con diseño personalizado, logo de boda"
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">
              Total MXN *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-sm">$</span>
              <input
                required type="number" min="1" step="0.01"
                value={form.totalAmount} onChange={(e) => set("totalAmount", e.target.value)}
                placeholder="800"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">
              Fecha de entrega *
            </label>
            <input
              required type="date" min={today}
              value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">
            Notas internas
          </label>
          <textarea
            rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
            placeholder="Recordatorios, preferencias del cliente..."
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </div>

        <button
          type="submit" disabled={saving}
          className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="material-symbol" style={{ fontSize: 18 }}>{saving ? "hourglass_empty" : "save"}</span>
          {saving ? "Guardando..." : "Registrar pedido"}
        </button>
      </form>
    </div>
  );
}
