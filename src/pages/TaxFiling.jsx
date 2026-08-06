import React, { useState } from "react";
import { FileText, CheckCircle2, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Applications } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  ssn: "",
  tax_year: new Date().getFullYear() - 1,
  filing_status: "Single",
  dependents: "0",
  total_income: "",
  refund_method: "Direct deposit",
};

export default function TaxFiling() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await Applications.create("tax_filing", form);
      setSubmitted(true);
    } catch (err) {
      toast({
        title: "Couldn't submit filing",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Filing submitted</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Thanks, {form.full_name || "there"} — we've received your {form.tax_year} tax filing information. A
          preparer will review it and reach out by email.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" /> File Your Taxes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Give us the basics and we'll take it from here.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs rounded-xl p-3">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        Please Enter Tax Information.
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={update("full_name")} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={update("phone")} required />
          </div>
          <div className="space-y-2">
            <Label>SSN</Label>
            <Input value={form.ssn} onChange={update("ssn")} placeholder="XXX-XX-XXXX" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mailing address</Label>
          <Input value={form.address} onChange={update("address")} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax year</Label>
            <Input type="number" value={form.tax_year} onChange={update("tax_year")} required />
          </div>
          <div className="space-y-2">
            <Label>Filing status</Label>
            <select
              value={form.filing_status}
              onChange={update("filing_status")}
              className="w-full h-10 rounded-md border border-input bg-background dark:bg-slate-800 px-3 text-sm"
            >
              <option>Single</option>
              <option>Married filing jointly</option>
              <option>Married filing separately</option>
              <option>Head of household</option>
              <option>Qualifying widow(er)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Dependents</Label>
            <Input type="number" min="0" value={form.dependents} onChange={update("dependents")} />
          </div>
          <div className="space-y-2">
            <Label>Total income for the year ($)</Label>
            <Input type="number" min="0" value={form.total_income} onChange={update("total_income")} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Refund method</Label>
          <select
            value={form.refund_method}
            onChange={update("refund_method")}
            className="w-full h-10 rounded-md border border-input bg-background dark:bg-slate-800 px-3 text-sm"
          >
            <option>Direct deposit</option>
            <option>Paper check</option>
            <option>Apply to next year's taxes</option>
          </select>
        </div>

        <Button type="submit" className="w-full h-12 font-medium bg-indigo-600 hover:bg-indigo-700" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit filing"
          )}
        </Button>
      </form>
    </div>
  );
}
