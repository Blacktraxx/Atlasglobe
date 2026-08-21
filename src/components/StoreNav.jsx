import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, ShieldAlert } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TelegramLink from "@/components/TelegramLink";

const ADMIN_EMAIL = "talonkahn1@gmail.com";

export default function StoreNav() {
  const { count, setOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.email === ADMIN_EMAIL;

  return (
    <nav className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b-2 border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Atlas Globe" className="w-9 h-9 rounded-lg object-contain" />
          <span className="font-display font-bold text-lg tracking-tight">ATLAS GLOBE SHOP</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <TelegramLink
            to="support"
            showIcon={false}
            className="hidden sm:inline-block text-sm font-medium px-3 py-2 rounded-lg hover:bg-secondary transition"
          >
            Support
          </TelegramLink>
          <LanguageSwitcher />
          <ThemeToggle />

          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-border bg-primary text-primary-foreground font-bold text-sm"
            >
              <ShieldAlert className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : isAuthenticated ? (
            <Link
              to="/account"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-border bg-card hover:bg-secondary transition text-sm font-medium"
            >
              <User className="w-4 h-4" /> <span className="hidden sm:inline">Account</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-border bg-card hover:bg-secondary transition text-sm font-medium"
            >
              <User className="w-4 h-4" /> <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}

          <button
            onClick={() => setOpen(true)}
            className="relative p-2.5 rounded-xl border-2 border-border bg-card hover:bg-secondary transition"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold border-2 border-border">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
