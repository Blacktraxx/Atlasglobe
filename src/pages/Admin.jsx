import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldAlert, Users, BarChart3, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { Admin as AdminApi } from "@/api/entities";
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

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    AdminApi.listUsers()
      .then(setUsers)
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.account_number || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={users.length} icon={Users} />
        <StatCard
          label="Total Balance Held"
          value={`$${users.reduce((s, u) => s + (u.balance || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={BarChart3}
        />
        <StatCard label="Admins" value={users.filter((u) => u.role === "admin").length} icon={ShieldAlert} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or account number..." className="pl-10" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">User</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600 hidden sm:table-cell">Account #</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600 hidden sm:table-cell">Role</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600 hidden md:table-cell">Joined</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{u.full_name || "—"}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm hidden sm:table-cell">{u.account_number || "—"}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm hidden md:table-cell">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white">
                    ${(u.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    AdminApi.listVisits()
      .then(setVisits)
      .catch((err) => setError(err.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const uniqueVisitors = useMemo(() => new Set(visits.map((v) => v.visitor_id).filter(Boolean)).size, [visits]);

  const byPage = useMemo(() => {
    const counts = {};
    visits.forEach((v) => {
      counts[v.path] = (counts[v.path] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [visits]);

  const byDay = useMemo(() => {
    const counts = {};
    visits.forEach((v) => {
      const day = new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([day, count]) => ({ day, count }))
      .slice(-14);
  }, [visits]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Page Views" value={visits.length} icon={Eye} />
        <StatCard label="Unique Visitors" value={uniqueVisitors} icon={Users} />
        <StatCard label="Pages Tracked" value={byPage.length} icon={BarChart3} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <p className="font-semibold text-slate-900 dark:text-white mb-4">Visits (recent days)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="font-semibold text-slate-900 dark:text-white">Top Pages</p>
        </div>
        <table className="w-full">
          <tbody>
            {byPage.map((p) => (
              <tr key={p.path} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{p.path}</td>
                <td className="px-6 py-3 text-sm text-right font-semibold text-slate-900 dark:text-white">{p.count}</td>
              </tr>
            ))}
            {byPage.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No visits logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isLoadingAuth } = useAuth();
  const [tab, setTab] = useState("users");

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-600" /> Admin Panel
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Users and site analytics — visible only to the admin account.</p>
      </div>

      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === "users" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Users className="w-4 h-4" /> Users
        </button>
        <button
          onClick={() => setTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === "analytics" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </button>
      </div>

      {tab === "users" ? <UsersTab /> : <AnalyticsTab />}
    </div>
  );
}
