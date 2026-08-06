import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Lock, Eye, EyeOff, Snowflake, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profiles } from "@/api/entities";

export default function Cards() {
  const [user, setUser] = useState(null);
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    Profiles.me().then(setUser).catch(() => {});
  }, []);

  const cardNumber = "4532 1245 7896 4521";
  const cvv = "***";
  const expiry = "08/29";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Cards</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your virtual and physical cards.</p>
      </div>

      {/* Card Display */}
      <div className="relative max-w-md">
        <div className="relative h-56 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-700 p-6 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
          <div className="relative flex flex-col h-full justify-between">
            <div className="flex items-start justify-between">
              <div className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-300 to-amber-500"></div>
              <Wifi className="w-6 h-6 rotate-90 opacity-80" />
            </div>
            <div>
              <p className="text-xl font-mono tracking-wider mb-3">{showNumber ? cardNumber : "•••• •••• •••• 4521"}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-60 uppercase">Card Holder</p>
                  <p className="font-medium text-sm">{user?.full_name || user?.email || "Account Holder"}</p>
                </div>
                <div>
                  <p className="text-xs opacity-60 uppercase">Expires</p>
                  <p className="font-medium text-sm">{expiry}</p>
                </div>
                <div>
                  <p className="text-xs opacity-60 uppercase">CVV</p>
                  <p className="font-medium text-sm">{showNumber ? "321" : cvv}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => setShowNumber(!showNumber)} variant="outline" size="sm" className="gap-2">
            {showNumber ? <><EyeOff className="w-4 h-4" /> Hide Details</> : <><Eye className="w-4 h-4" /> Show Details</>}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Snowflake className="w-4 h-4" /> Freeze Card
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Lock className="w-4 h-4" /> Lock
          </Button>
        </div>
      </div>

      {/* Card Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Add New Card", desc: "Get a new virtual card", icon: Plus },
          { label: "Card Limits", desc: "Set spending limits", icon: CreditCard },
          { label: "Card Security", desc: "Manage your PIN", icon: Lock },
        ].map((a) => (
          <button key={a.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 transition text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
              <a.icon className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{a.label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{a.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}