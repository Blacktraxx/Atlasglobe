import React, { useState } from "react";
import { Landmark, CheckCircle2, Loader2, Info } from "lucide-react";
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
  employment_status: "Employed",
  employer_name: "",
  monthly_income: "",
  loan_amount: "",
  loan_purpose: "Debt consolidation",
  ssn: "",
};

export default function Loans() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await Applications.create("loan", form);
      setSubmitted(true);
    } catch (err) {
      toast({
        title: "Couldn't submit application",
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application submitted</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Thanks, {form.full_name || "there"} — we've received your loan application. Our team will review it and
          follow up by email.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Landmark className="w-6 h-6 text-indigo-600" /> Apply for a Loan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Tell us about yourself and what you need — we'll review and get back to you.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs rounded-xl p-3">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        Please EnterPersonal Information.
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
          <Label>Home address</Label>
          <Input value={form.address} onChange={update("address")} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Employment status</Label>
            <select
              value={form.employment_status}
              onChange={update("employment_status")}
              className="w-full h-10 rounded-md border border-input bg-background dark:bg-slate-800 px-3 text-sm"
            >
              <option>Employed</option>
              <option>Self-employed</option>
              <option>Unemployed</option>
              <option>Retired</option>
              <option>Student</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Employer name</Label>
            <Input value={form.employer_name} onChange={update("employer_name")} />
          </div>
          <div className="space-y-2">
            <Label>Monthly income ($)</Label>
            <Input type="number" min="0" value={form.monthly_income} onChange={update("monthly_income")} required />
          </div>
          <div className="space-y-2">
            <Label>Loan amount requested ($)</Label>
            <Input type="number" min="0" value={form.loan_amount} onChange={update("loan_amount")} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Loan purpose</Label>
          <select
            value={form.loan_purpose}
            onChange={update("loan_purpose")}
            className="w-full h-10 rounded-md border border-input bg-background dark:bg-slate-800 px-3 text-sm"
          >
            <option>Debt consolidation</option>
            <option>Home improvement</option>
            <option>Auto purchase</option>
            <option>Medical expenses</option>
            <option>Business</option>
            <option>Other</option>
          </select>
        </div>

        <Button type="submit" className="w-full h-12 font-medium bg-indigo-600 hover:bg-indigo-700" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit application"
          )}
        </Button>
      </form>
    </div>
  );
}
