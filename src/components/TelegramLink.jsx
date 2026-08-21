import React from "react";
import { Send } from "lucide-react";

const DESTINATIONS = {
  support: "https://t.me/blacktraxx",
  lounge: "https://t.me/atlasglobe",
};

export default function TelegramLink({ children, className = "", showIcon = true, to = "support" }) {
  const href = DESTINATIONS[to] || to;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {showIcon && <Send className="w-4 h-4" />}
      {children}
    </a>
  );
}
