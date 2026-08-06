import React, { useState } from "react";
import { Wallet, Landmark, Copy, Check, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Transactions } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

// Sample / placeholder addresses for demo purposes only — these are not
// monitored wallets and nothing sent to them will be credited automatically.
// A real deployment would replace this with a licensed payment processor
// (e.g. Coinbase Commerce) rather than static addresses.
const CRYPTO_OPTIONS = [
  { code: "BTC", label: "Bitcoin", address: "bc1qycjtdc2uw67d6emqwyxeg7l54qu9mst36u27jr" },
  { code: "ETH", label: "Ethereum", address: "0xBF2E883e609195587F7f86C82687573fB43bf890" },
  { code: "SOL", label: "Solana", address: "7gGTWUvu4ExnsmhzLfoBY3VYcDg8Qcc3Vr7w1Fv72fMu" },
  { code: "USDT-ERC20", label: "USDT (Ethereum / ERC-20)", address: "0xBF2E883e609195587F7f86C82687573fB43bf890" },
  { code: "USDT-TRC20", label: "USDT (Tron / TRC-20)", address: "TNXTZAPR78SkvAwjHezHDMKA2NtRgP5STG" },
];

const BANK_DETAILS = {
  bank_name: "BANKCORP",
  account_number: "450032626528300",
  routing_number: "031101279",
  swift_bic: "XXXX",
  account_type: "Checking",
};

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
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
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

export default function Deposit() {
  const [tab, setTab] = useState("crypto");
  const [selectedCoin, setSelectedCoin] = useState(CRYPTO_OPTIONS[0].code);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const coin = CRYPTO_OPTIONS.find((c) => c.code === selectedCoin);

  const handleSimulateDeposit = async (method) => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      toast({ title: "Enter an amount", description: "Please enter a deposit amount greater than $0.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await Transactions.simulateDeposit({
        amount: parsed,
        note: method === "crypto" ? `Simulated ${coin.label} deposit (demo)` : "Simulated bank transfer deposit (demo)",
      });
      toast({ title: "Deposit added", description: `$${parsed.toFixed(2)} was added to your balance.` });
      setAmount("");
    } catch (err) {
      toast({ title: "Couldn't process deposit", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Funds</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Deposit money into your account.</p>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs rounded-xl p-3">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        Clicking "Deposit" credits your balance
      </div>

      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        <button
          onClick={() => setTab("crypto")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === "crypto" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Wallet className="w-4 h-4" /> Crypto
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === "bank" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Landmark className="w-4 h-4" /> Bank Transfer
        </button>
      </div>

      {tab === "crypto" ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div className="space-y-2">
            <Label>Select currency</Label>
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background dark:bg-slate-800 px-3 text-sm"
            >
              {CRYPTO_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <CopyableRow label={`${coin.label} deposit address (demo)`} value={coin.address} />
          </div>

          <div className="space-y-2">
            <Label>Amount to simulate ($)</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <Button
            onClick={() => handleSimulateDeposit("crypto")}
            className="w-full h-12 font-medium bg-indigo-600 hover:bg-indigo-700"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              "Simulate deposit"
            )}
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <CopyableRow label="Bank name" value={BANK_DETAILS.bank_name} />
            <CopyableRow label="Account number" value={BANK_DETAILS.account_number} />
            <CopyableRow label="Routing number" value={BANK_DETAILS.routing_number} />
            <CopyableRow label="SWIFT / BIC (for international wires)" value={BANK_DETAILS.swift_bic} />
            <CopyableRow label="Account type" value={BANK_DETAILS.account_type} />
          </div>

          <div className="space-y-2">
            <Label>Amount($)</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <Button
            onClick={() => handleSimulateDeposit("bank")}
            className="w-full h-12 font-medium bg-indigo-600 hover:bg-indigo-700"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              "Simulate deposit"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
