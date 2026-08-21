import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldAlert, Package, ClipboardList, BarChart3, Plus, Pencil, Trash2, Eye, Users, X, Loader2, Upload, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { Products, Orders, Visits } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ADMIN_EMAIL = "talonkahn1@gmail.com";
const CATEGORIES = ["basic", "standard", "premium"];

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-[4px_4px_0_hsl(var(--border))]">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

const emptyForm = { name: "", description: "", price: "", category: "basic", image_url: "", active: true };

function ProductForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await Products.uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      toast({ title: "Couldn't upload photo", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form, price: parseFloat(form.price) });
      }}
      className="border-2 border-border rounded-2xl bg-card p-5 space-y-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <p className="font-display font-bold">{initial ? "Edit product" : "New product"}</p>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Price ($)</Label>
          <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-10 rounded-md border-2 border-border bg-background px-3 text-sm font-mono capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Photo</Label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg border-2 border-border bg-secondary shrink-0 overflow-hidden flex items-center justify-center">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
              )}
            </div>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border bg-background hover:bg-secondary transition text-sm font-medium cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading..." : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
        Active (visible in the shop)
      </label>
      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl border-2 border-border shadow-[3px_3px_0_hsl(var(--border))] flex items-center gap-2 disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {initial ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | product
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => Products.listAll().then(setProducts).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editing === "new") {
        await Products.create(values);
        toast({ title: "Product created" });
      } else {
        await Products.update(editing.id, values);
        toast({ title: "Product updated" });
      }
      setEditing(null);
      load();
    } catch (err) {
      toast({ title: "Couldn't save product", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await Products.remove(product.id);
      toast({ title: "Product deleted" });
      load();
    } catch (err) {
      toast({ title: "Couldn't delete product", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editing ? (
        <ProductForm
          initial={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      ) : (
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl border-2 border-border shadow-[3px_3px_0_hsl(var(--border))]"
        >
          <Plus className="w-4 h-4" /> Add product
        </button>
      )}

      <div className="border-2 border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary border-b-2 border-border">
              <th className="text-left px-5 py-3 text-sm font-semibold">Product</th>
              <th className="text-left px-5 py-3 text-sm font-semibold hidden sm:table-cell">Category</th>
              <th className="text-left px-5 py-3 text-sm font-semibold hidden sm:table-cell">Status</th>
              <th className="text-right px-5 py-3 text-sm font-semibold">Price</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b-2 border-border/50 last:border-0">
                <td className="px-5 py-3 font-medium text-sm">{p.name}</td>
                <td className="px-5 py-3 text-sm capitalize hidden sm:table-cell">{p.category}</td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border-2 border-border ${p.active ? "bg-primary/10" : "bg-muted"}`}>
                    {p.active ? "active" : "hidden"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono font-bold text-sm">${p.price.toFixed(2)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditing(p)} className="p-1.5 rounded-lg hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-secondary text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Orders.adminList().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusColor = { paid: "bg-primary/10", pending: "bg-amber-100 text-amber-800", expired: "bg-muted", cancelled: "bg-muted" };

  return (
    <div className="border-2 border-border rounded-2xl bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary border-b-2 border-border">
              <th className="text-left px-5 py-3 text-sm font-semibold">Order</th>
              <th className="text-left px-5 py-3 text-sm font-semibold hidden sm:table-cell">Guest</th>
              <th className="text-left px-5 py-3 text-sm font-semibold hidden sm:table-cell">Asset</th>
              <th className="text-left px-5 py-3 text-sm font-semibold">Status</th>
              <th className="text-right px-5 py-3 text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b-2 border-border/50 last:border-0">
                <td className="px-5 py-3">
                  <p className="font-mono text-sm">{o.reference}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                </td>
                <td className="px-5 py-3 text-sm hidden sm:table-cell">
                  <p>{o.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{o.guest_email}</p>
                </td>
                <td className="px-5 py-3 text-sm font-mono hidden sm:table-cell">{o.crypto_asset}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border-2 border-border ${statusColor[o.status] || ""}`}>{o.status}</span>
                </td>
                <td className="px-5 py-3 text-right font-mono font-bold text-sm">${o.total.toFixed(2)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    Visits.list().then(setVisits).catch(() => {}).finally(() => setLoading(false));

    const unsubscribe = Visits.subscribe((newVisit) => {
      setVisits((prev) => [newVisit, ...prev]);
      setLive(true);
      setTimeout(() => setLive(false), 1500);
    });

    return unsubscribe;
  }, []);

  const uniqueVisitors = useMemo(() => new Set(visits.map((v) => v.visitor_id).filter(Boolean)).size, [visits]);

  const byDay = useMemo(() => {
    const counts = {};
    visits.forEach((v) => {
      const day = new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts).map(([day, count]) => ({ day, count })).slice(-14);
  }, [visits]);

  const byPage = useMemo(() => {
    const counts = {};
    visits.forEach((v) => { counts[v.path] = (counts[v.path] || 0) + 1; });
    return Object.entries(counts).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [visits]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-ping" : "bg-green-500"}`} />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Live</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total Page Views" value={visits.length} icon={Eye} />
        <StatCard label="Unique Visitors" value={uniqueVisitors} icon={Users} />
        <StatCard label="Pages Tracked" value={byPage.length} icon={BarChart3} />
      </div>

      <div className="border-2 border-border rounded-2xl bg-card p-5">
        <p className="font-display font-bold mb-4">Visits (recent days)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-2 border-border rounded-2xl bg-card overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-border font-display font-bold">Top Pages</div>
        <table className="w-full">
          <tbody>
            {byPage.map((p) => (
              <tr key={p.path} className="border-b-2 border-border/50 last:border-0">
                <td className="px-5 py-3 text-sm">{p.path}</td>
                <td className="px-5 py-3 text-sm text-right font-mono font-bold">{p.count}</td>
              </tr>
            ))}
            {byPage.length === 0 && <tr><td className="px-5 py-8 text-center text-muted-foreground text-sm">No visits logged yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isLoadingAuth } = useAuth();
  const [tab, setTab] = useState("products");

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user?.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" /> Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage products, view orders, and track site visits.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border font-mono text-xs font-bold uppercase tracking-wide transition ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductsTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}
