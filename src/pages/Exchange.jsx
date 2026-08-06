import React, { useState } from "react";
import { ArrowLeftRight, TrendingUp, TrendingDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const rates = [
  { code: "USD", name: "US Dollar", rate: 1, change: 0 },
  { code: "EUR", name: "Euro", rate: 0.9234, change: 0.32 },
  { code: "GBP", name: "British Pound", rate: 0.7891, change: -0.18 },
  { code: "JPY", name: "Japanese Yen", rate: 149.82, change: 0.45 },
  { code: "CAD", name: "Canadian Dollar", rate: 1.3621, change: -0.12 },
  { code: "AUD", name: "Australian Dollar", rate: 1.5213, change: 0.21 },
  { code: "CHF", name: "Swiss Franc", rate: 0.8812, change: 0.26 },
  { code: "CNY", name: "Chinese Yuan", rate: 7.2415, change: -0.08 },
  { code: "INR", name: "Indian Rupee", rate: 83.25, change: 0.15 },
  { code: "KRW", name: "South Korean Won", rate: 1312.5, change: -0.22 },
];

export default function Exchange() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("100");
  const { toast } = useToast();

  const fromRate = rates.find((r) => r.code === from)?.rate || 1;
  const toRate = rates.find((r) => r.code === to)?.rate || 1;
  const converted = (parseFloat(amount || 0) / fromRate) * toRate;

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const createAlert = () => {
    toast({ title: `Rate alert created for ${from}/${to}`, description: "We'll notify you when the rate changes." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Currency Exchange</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Convert money across the world with real-time rates and lowest fees.</p>
      </div>

      {/* Converter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <select value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-24 h-10 rounded-md border border-input bg-background px-2 text-sm">
                {rates.map((r) => <option key={r.code} value={r.code}>{r.code}</option>)}
              </select>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" className="flex-1" />
            </div>
          </div>
          <button onClick={handleSwap} className="w-10 h-10 mx-auto rounded-full bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
          </button>
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <select value={to} onChange={(e) => setTo(e.target.value)}
                className="w-24 h-10 rounded-md border border-input bg-background px-2 text-sm">
                {rates.map((r) => <option key={r.code} value={r.code}>{r.code}</option>)}
              </select>
              <Input value={converted.toFixed(4)} readOnly className="flex-1 bg-slate-50 dark:bg-slate-950 font-semibold" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950 rounded-xl p-4">
          <p className="text-sm text-slate-600">
            1 {from} = <span className="font-bold text-slate-900 dark:text-white">{(toRate / fromRate).toFixed(4)}</span> {to}
          </p>
          <Button onClick={createAlert} variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200">
            <Bell className="w-4 h-4" /> Create Alert
          </Button>
        </div>
      </div>

      {/* Rate Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">Live Exchange Rates</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Base: USD • Last updated just now</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Currency</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Code</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Rate</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Change (24h)</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.code} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {r.code.slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{r.code}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{r.rate.toFixed(4)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${r.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {r.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {r.change >= 0 ? "+" : ""}{r.change}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}