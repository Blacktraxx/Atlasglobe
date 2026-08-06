import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Download, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transactions as TransactionsApi } from "@/api/entities";

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    TransactionsApi.list(100)
      .then((data) => setTransactions(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesSearch = (t.recipient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.reference || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || t.type === filter || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalSent = transactions.filter(t => t.type === "transfer").reduce((s, t) => s + (t.amount || 0), 0);
  const totalFees = transactions.reduce((s, t) => s + (t.fee || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage your transaction history.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Transactions</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{transactions.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Sent</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">${totalSent.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Fees</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">${totalFees.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or reference..." className="pl-10" />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 p-1">
          {["all", "transfer", "completed", "pending"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${filter === f ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Recipient</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600 hidden sm:table-cell">Reference</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600 hidden sm:table-cell">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const isCredit = t.type === "deposit";
                  return (
                    <tr key={t.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCredit ? "bg-green-50 dark:bg-green-950" : "bg-blue-50 dark:bg-blue-950"}`}>
                            {isCredit ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{t.recipient_name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{t.recipient_email || "—"}</p>
                            {t.type === "withdrawal" && (
                              <button
                                onClick={() =>
                                  navigate("/contact", {
                                    state: {
                                      subject: `Help with withdrawal ${t.reference || ""}`,
                                      message: `I need help with my withdrawal (reference: ${t.reference || "N/A"}, amount: $${t.amount?.toFixed(2)}) to ${t.recipient_name}.`,
                                    },
                                  })
                                }
                                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
                              >
                                <HelpCircle className="w-3 h-3" /> Need help with this transaction?
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm hidden sm:table-cell">{t.reference || "—"}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{new Date(t.created_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${t.status === "completed" ? "bg-green-50 text-green-700" : t.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={`font-semibold ${isCredit ? "text-green-600" : "text-slate-900 dark:text-white"}`}>
                          {isCredit ? "+" : "-"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{t.currency}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}