import React from "react";
import { Mail, Send as TelegramIcon } from "lucide-react";

export default function SupportContact({ title = "Need help?" }) {
  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-5">
      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{title}</p>
      <div className="space-y-2">
        <a
          href="mailto:talonkahn1@gmail.com"
          className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300 hover:underline"
        >
          <Mail className="w-4 h-4" /> talonkahn1@gmail.com
        </a>
        <a
          href="https://t.me/Talonkahn"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300 hover:underline"
        >
          <TelegramIcon className="w-4 h-4" /> @Talonkahn on Telegram
        </a>
      </div>
    </div>
  );
}
