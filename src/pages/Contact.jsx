import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Mail, User, MessageSquare, Send, Phone, Clock, Headphones, Send as TelegramIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { SupportMessages } from "@/api/entities";

export default function Contact() {
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: location.state?.subject || "",
    message: location.state?.message || "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await SupportMessages.create({ ...form, status: "open" });
      toast({ title: "Message sent! We'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast({ title: err.message || "Failed to send message", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Center</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Need help? Contact our digital support team.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">24/7 Support</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Always here to help</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Email Us</p>
              <a href="mailto:talonkahn1@gmail.com" className="text-xs text-slate-400 dark:text-slate-500 hover:underline">talonkahn1@gmail.com</a>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <TelegramIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Telegram</p>
              <a href="https://t.me/Talonkahn" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 dark:text-slate-500 hover:underline">@Talonkahn</a>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Phone className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Call Us</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">+1 (800) 555-0100</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Response Time</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="pl-10" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your query..." rows={5}
                  className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              {loading ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}