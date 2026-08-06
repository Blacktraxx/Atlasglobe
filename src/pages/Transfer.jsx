import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, CheckCircle2, Hash, DollarSign, FileText, Loader2, UserCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Profiles, Transactions } from "@/api/entities";

export default function Transfer() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ account_number: "", amount: "", note: "" });
  const [recipient, setRecipient] = useState(null); // { full_name } | null | "not_found"
  const [looking, setLooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const lookupTimeout = useRef(null);

  useEffect(() => {
    Profiles.me().then(setUser).catch(() => {});
  }, []);

  const balance = user?.balance ?? 0;

  useEffect(() => {
    clearTimeout(lookupTimeout.current);
    const accountNumber = form.account_number.trim();
    if (!accountNumber) {
      setRecipient(null);
      return;
    }
    lookupTimeout.current = setTimeout(async () => {
      setLooking(true);
      try {
        const found = await Profiles.lookupByAccountNumber(accountNumber);
        setRecipient(found || "not_found");
      } catch {
        setRecipient("not_found");
      } finally {
        setLooking(false);
      }
    }, 500);
    return () => clearTimeout(lookupTimeout.current);
  }, [form.account_number]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.account_number || !form.amount) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!recipient || recipient === "not_found") {
      toast({ title: "Enter a valid recipient account number", variant: "destructive" });
      return;
    }
    const amount = parseFloat(form.amount);
    if (amount <= 0) {
      toast({ title: "Amount must be greater than zero", variant: "destructive" });
      return;
    }
    if (amount > balance) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await Transactions.transferByAccountNumber({
        accountNumber: form.account_number.trim(),
        amount,
        note: form.note,
      });

      const updated = await Profiles.me();
      setUser(updated);

      setSuccess({
        reference: result.reference,
        recipient_name: result.recipient_name || recipient.full_name,
        amount,
      });
      setForm({ account_number: "", amount: "", note: "" });
      setRecipient(null);
      toast({ title: "Transfer completed successfully!", variant: "success" });
    } catch (err) {
      toast({ title: err.message || "Transfer failed", variant: "destructive" });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Transfer Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your money has been sent to {success.recipient_name || "the recipient"}.
          </p>
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 text-left space-y-2 mb-6">
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 text-sm">Reference</span><span className="font-medium text-slate-900 dark:text-white">{success.reference}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 text-sm">Recipient</span><span className="font-medium text-slate-900 dark:text-white">{success.recipient_name}</span></div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2"><span className="text-slate-500 dark:text-slate-400 text-sm">Amount</span><span className="font-bold text-slate-900 dark:text-white">${success.amount.toFixed(2)}</span></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setSuccess(null)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">New Transfer</Button>
            <Button onClick={() => navigate("/transactions")} variant="outline" className="flex-1">View Transactions</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Send Money</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Send money instantly to another Atlas Globe user using their account number.
        </p>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 mb-6 text-white">
        <p className="text-indigo-100 text-sm">Available Balance</p>
        <p className="text-3xl font-bold">${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="space-y-2">
          <Label>Recipient Account Number *</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              placeholder="e.g. PGP202601230001"
              className="pl-10"
            />
          </div>
          {looking && (
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Looking up account...
            </p>
          )}
          {!looking && recipient && recipient !== "not_found" && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Sending to {recipient.full_name || "Atlas Globe user"}
            </p>
          )}
          {!looking && recipient === "not_found" && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <XCircle className="w-3 h-3" /> No account found with that number
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Amount *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Note (Optional)</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What's this for?" rows={3}
              className="w-full rounded-md border border-input bg-background dark:bg-slate-800 pl-10 pr-3 py-2 text-sm" />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 flex justify-between">
          <span className="font-semibold text-slate-900 dark:text-white">Total</span>
          <span className="font-bold text-slate-900 dark:text-white">${parseFloat(form.amount || 0).toFixed(2)}</span>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 py-6">
          {loading ? "Processing..." : <>Send Money <Send className="w-4 h-4" /></>}
        </Button>
      </form>
    </div>
  );
}
