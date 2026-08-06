import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Loader2, Info, CheckCircle2, Landmark, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profiles, Transactions } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import SupportContact from "@/components/SupportContact";
import {
  isMetaMaskAvailable,
  isCoinbaseWalletAvailable,
  isPhantomAvailable,
  connectMetaMask,
  connectCoinbaseWallet,
  connectPhantom,
} from "@/lib/walletConnect";

// Which wallet connectors make sense for each asset's chain.
const COIN_CONNECTORS = {
  BTC: [],
  ETH: ["metamask", "coinbase"],
  SOL: ["phantom"],
  "USDT-ERC20": ["metamask", "coinbase"],
  "USDT-TRC20": [],
};

const CONNECTOR_META = {
  metamask: { label: "MetaMask", isAvailable: isMetaMaskAvailable, connect: connectMetaMask },
  coinbase: { label: "Coinbase Wallet", isAvailable: isCoinbaseWalletAvailable, connect: connectCoinbaseWallet },
  phantom: { label: "Phantom", isAvailable: isPhantomAvailable, connect: connectPhantom },
};

const METHODS = [
  { code: "crypto", label: "Crypto Wallet" },
  { code: "cashapp", label: "Cash App" },
  { code: "venmo", label: "Venmo" },
  { code: "zelle", label: "Zelle" },
  { code: "bank", label: "Bank" },
];

const CRYPTO_OPTIONS = [
  { code: "BTC", label: "Bitcoin (BTC)", coingeckoId: "bitcoin" },
  { code: "ETH", label: "Ethereum (ETH)", coingeckoId: "ethereum" },
  { code: "SOL", label: "Solana (SOL)", coingeckoId: "solana" },
  { code: "USDT-ERC20", label: "USDT (Ethereum / ERC-20)", coingeckoId: "tether" },
  { code: "USDT-TRC20", label: "USDT (Tron / TRC-20)", coingeckoId: "tether" },
];

const initialFields = {
  crypto_asset: "BTC",
  wallet_address: "",
  cashtag: "",
  venmo_username: "",
  zelle_contact: "",
  account_number: "",
  routing_number: "",
};

export default function Withdraw() {
  const [user, setUser] = useState(null);
  const [method, setMethod] = useState("crypto");
  const [fields, setFields] = useState(initialFields);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Profiles.me().then(setUser).catch(() => {});
  }, []);

  const balance = user?.balance ?? 0;
  const selectedCoin = CRYPTO_OPTIONS.find((c) => c.code === fields.crypto_asset);

  // Live market rate lookup (CoinGecko's free public API, no key required).
  useEffect(() => {
    if (method !== "crypto" || !selectedCoin) return;
    let cancelled = false;
    setRateLoading(true);
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCoin.coingeckoId}&vs_currencies=usd`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const price = data?.[selectedCoin.coingeckoId]?.usd;
        setRate(price || null);
      })
      .catch(() => {
        if (!cancelled) setRate(null);
      })
      .finally(() => {
        if (!cancelled) setRateLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [method, fields.crypto_asset]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field) => (e) => setFields((f) => ({ ...f, [field]: e.target.value }));

  const handleConnectWallet = async (connectorKey) => {
    const connector = CONNECTOR_META[connectorKey];
    setConnecting(connectorKey);
    try {
      const address = await connector.connect();
      setFields((f) => ({ ...f, wallet_address: address }));
      toast({ title: `${connector.label} connected`, description: address });
    } catch (err) {
      toast({ title: `Couldn't connect ${connector.label}`, description: err.message, variant: "destructive" });
    } finally {
      setConnecting(null);
    }
  };

  const estimatedCrypto = () => {
    const parsed = parseFloat(amount);
    if (!parsed || !rate) return null;
    return parsed / rate;
  };

  const destinationSummary = () => {
    switch (method) {
      case "crypto":
        return fields.wallet_address ? `${selectedCoin?.code} wallet ${fields.wallet_address.slice(0, 6)}…${fields.wallet_address.slice(-4)}` : "";
      case "cashapp":
        return fields.cashtag ? `Cash App ${fields.cashtag.startsWith("$") ? fields.cashtag : `$${fields.cashtag}`}` : "";
      case "venmo":
        return fields.venmo_username ? `Venmo @${fields.venmo_username.replace(/^@/, "")}` : "";
      case "zelle":
        return fields.zelle_contact ? `Zelle (${fields.zelle_contact})` : "";
      case "bank":
        return fields.account_number ? `Bank ••••${fields.account_number.slice(-4)}` : "";
      default:
        return "";
    }
  };

  const validateFields = () => {
    if (method === "crypto") return !!fields.wallet_address;
    if (method === "cashapp") return !!fields.cashtag;
    if (method === "venmo") return !!fields.venmo_username;
    if (method === "zelle") return !!fields.zelle_contact;
    if (method === "bank") return !!fields.account_number && !!fields.routing_number;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      toast({ title: "Enter an amount", description: "Please enter a withdrawal amount greater than $0.", variant: "destructive" });
      return;
    }
    if (parsed > balance) {
      toast({ title: "Insufficient balance", description: "You can't withdraw more than your available balance.", variant: "destructive" });
      return;
    }
    if (!validateFields()) {
      toast({ title: "Missing details", description: "Please fill in the required fields for this withdrawal method.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const destination = destinationSummary();
      const cryptoAmount = method === "crypto" ? estimatedCrypto() : null;

      const rpcResult = await Transactions.simulateWithdrawal({
        amount: parsed,
        destination,
        note:
          method === "crypto"
            ? `Simulated swap & withdrawal to ${selectedCoin?.code} wallet (demo)`
            : `Simulated withdrawal via ${METHODS.find((m) => m.code === method)?.label} (demo)`,
      });
      const updated = await Profiles.me();
      setUser(updated);

      setResult({
        reference: rpcResult.reference,
        amount: parsed,
        destination,
        method: METHODS.find((m) => m.code === method)?.label,
        cryptoAmount,
        cryptoCode: selectedCoin?.code,
      });
    } catch (err) {
      toast({ title: "Couldn't process withdrawal", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Withdrawal submitted</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your withdrawal to {result.destination} is on its way. Withdrawals usually take 1–3 business days to
            complete.
          </p>
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Reference</span>
              <span className="font-medium text-slate-900 dark:text-white">{result.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Method</span>
              <span className="font-medium text-slate-900 dark:text-white">{result.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Destination</span>
              <span className="font-medium text-slate-900 dark:text-white">{result.destination}</span>
            </div>
            {result.cryptoAmount != null && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-sm">Estimated {result.cryptoCode}</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ≈ {result.cryptoAmount.toFixed(6)} {result.cryptoCode?.split("-")[0]}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Amount</span>
              <span className="font-bold text-slate-900 dark:text-white">${result.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Status</span>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                Processing
              </span>
            </div>
          </div>

          <div className="text-left mb-6">
            <SupportContact title="Need help with this withdrawal?" />
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/dashboard")} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
              Back to Dashboard
            </Button>
            <Button onClick={() => navigate("/transactions")} variant="outline" className="flex-1">
              View Transactions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ArrowUpRight className="w-6 h-6 text-indigo-600" /> Swap & Withdraw
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Available balance: ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs rounded-xl p-3">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        This initiates withdrawal against your balance.. Crypto rates are live market data for reference only.
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="space-y-2">
          <Label>Withdrawal method</Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {METHODS.map((m) => (
              <button
                type="button"
                key={m.code}
                onClick={() => setMethod(m.code)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                  method === m.code
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {method === "crypto" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <select
                value={fields.crypto_asset}
                onChange={updateField("crypto_asset")}
                className="w-full h-10 rounded-md border border-input bg-background dark:bg-slate-800 px-3 text-sm"
              >
                {CRYPTO_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            {COIN_CONNECTORS[fields.crypto_asset]?.length > 0 && (
              <div className="space-y-2">
                <Label>Connect a wallet (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {COIN_CONNECTORS[fields.crypto_asset].map((key) => (
                    <Button
                      key={key}
                      type="button"
                      variant="outline"
                      onClick={() => handleConnectWallet(key)}
                      disabled={connecting === key}
                      className="gap-2"
                    >
                      {connecting === key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                      {CONNECTOR_META[key].label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Your {selectedCoin?.code} wallet address</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Input value={fields.wallet_address} onChange={updateField("wallet_address")} placeholder="Paste your wallet address, or connect a wallet above" className="pl-10" required />
              </div>
            </div>
          </div>
        )}

        {method === "cashapp" && (
          <div className="space-y-2">
            <Label>Cash App $Cashtag</Label>
            <Input value={fields.cashtag} onChange={updateField("cashtag")} placeholder="$yourcashtag" required />
          </div>
        )}

        {method === "venmo" && (
          <div className="space-y-2">
            <Label>Venmo username</Label>
            <Input value={fields.venmo_username} onChange={updateField("venmo_username")} placeholder="@yourusername" required />
          </div>
        )}

        {method === "zelle" && (
          <div className="space-y-2">
            <Label>Zelle email or phone number</Label>
            <Input value={fields.zelle_contact} onChange={updateField("zelle_contact")} placeholder="you@example.com or (555) 123-4567" required />
          </div>
        )}

        {method === "bank" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account number</Label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Input value={fields.account_number} onChange={updateField("account_number")} placeholder="000123456789" className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Routing number</Label>
              <Input value={fields.routing_number} onChange={updateField("routing_number")} placeholder="021000021" required />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Amount ($)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="pl-10" required />
          </div>
          {method === "crypto" && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {rateLoading
                ? "Fetching live rate..."
                : rate && amount
                ? `≈ ${estimatedCrypto()?.toFixed(6)} ${selectedCoin?.code.split("-")[0]} at $${rate.toLocaleString()} / ${selectedCoin?.code.split("-")[0]}`
                : rate
                ? `Live rate: $${rate.toLocaleString()} / ${selectedCoin?.code.split("-")[0]}`
                : "Rate unavailable right now"}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full h-12 font-medium bg-indigo-600 hover:bg-indigo-700" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
            </>
          ) : method === "crypto" ? (
            "Swap & Withdraw"
          ) : (
            "Withdraw"
          )}
        </Button>
      </form>
    </div>
  );
}
