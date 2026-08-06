import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  TrendingUp,
  Wallet,
  Send,
  Plus,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profiles, Transactions } from "@/api/entities";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    Promise.all([
      Profiles.me().catch(() => null),
      Transactions.list(5).catch(() => []),
    ]).then(([u, txns]) => {
      setUser(u);
      setTransactions(txns || []);
      setLoading(false);
    });
  }, []);

  const balance = user?.balance ?? 0;

  const stats = [
    { label: "Money Sent", value: `$${transactions.filter(t => t.type === "transfer").reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: ArrowUpRight, color: "from-blue-500 to-cyan-500" },
    { label: "Money Received", value: `$${transactions.filter(t => t.type === "deposit").reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: ArrowDownLeft, color: "from-green-500 to-emerald-500" },
    { label: "Total Fees", value: `$${transactions.reduce((s, t) => s + (t.fee || 0), 0).toFixed(2)}`, icon: TrendingUp, color: "from-purple-500 to-pink-500" },
  ];

  const quickActions = [
    { label: "Send", to: "/transfer", icon: Send, desc: "Transfer to anyone" },
    { label: "Receive", to: "/receive", icon: ArrowDownLeft, desc: "Get paid" },
    { label: "Add Funds", to: "/deposit", icon: Plus, desc: "Deposit money" },
    { label: "Withdraw", to: "/withdraw", icon: ArrowUpRight, desc: "Cash out" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's what's happening with your account today.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/20 dark:shadow-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-100">
            <Wallet className="w-4 h-4" />
            <p className="text-sm">Available Balance</p>
          </div>
          <button
            onClick={() => setShowBalance((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-4xl sm:text-5xl font-bold mt-2 tracking-tight">
          {showBalance ? `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
        </p>
        <div className="flex items-center justify-between mt-6">
          <div>
            <p className="text-xs text-indigo-200">{user?.full_name || user?.email || "Account holder"}</p>
            <p className="text-xs text-indigo-200 mt-0.5">
              Account: ••••{user?.account_number?.slice(-4) || "0000"} • {user?.currency || "USD"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6 pt-6 border-t border-white/15">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition">
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-white">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
          <Link to="/transactions">
            <Button variant="ghost" size="sm" className="text-indigo-600 gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions yet</p>
            <Link to="/transfer">
              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                Send Money <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {transactions.map((t) => {
              const isCredit = t.type === "deposit";
              return (
                <div key={t.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? "bg-green-50 dark:bg-green-950" : "bg-blue-50 dark:bg-blue-950"}`}>
                      {isCredit ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> : <ArrowUpRight className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{t.recipient_name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{t.type} • {new Date(t.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${isCredit ? "text-green-600" : "text-slate-900 dark:text-white"}`}>
                      {isCredit ? "+" : "-"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t.currency}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}