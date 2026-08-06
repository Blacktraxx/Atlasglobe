import React, { useEffect, useState } from "react";
import { ArrowDownLeft, Copy, Check } from "lucide-react";
import { Profiles } from "@/api/entities";

function CopyableRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — ignore
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Receive() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    Profiles.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ArrowDownLeft className="w-6 h-6 text-indigo-600" /> Receive Money
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Share these details with someone sending you money on Atlas Globe.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <CopyableRow label="Account holder" value={user?.full_name || user?.email || "—"} />
        <CopyableRow label="Email" value={user?.email || "—"} />
        <CopyableRow label="Account number" value={user?.account_number || "—"} />
      </div>
    </div>
  );
}
