import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  Landmark,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const ADMIN_EMAIL = "talonkahn1@gmail.com";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transfer", label: "Transfer Money", icon: ArrowLeftRight },
  { to: "/exchange", label: "Exchange Rates", icon: TrendingUp },
  { to: "/transactions", label: "Transactions", icon: Clock },
  { to: "/cards", label: "Cards", icon: CreditCard },
  { to: "/loans", label: "Loans", icon: Landmark },
  { to: "/credit-cards", label: "Apply for Credit Card", icon: CreditCard },
  { to: "/taxes", label: "File Taxes", icon: FileText },
  { to: "/contact", label: "Support", icon: HelpCircle },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const balance = user?.balance ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="Atlas Globe" className="w-9 h-9 rounded-lg object-contain" />
            <span className="font-bold text-lg tracking-tight">ATLAS GLOBE</span>
          </Link>

          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Available Balance</p>
            <p className="text-2xl font-bold">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Account: ••••{user?.account_number?.slice(-4) || "4521"}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    active ? "bg-indigo-600 text-white" : "text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            {user?.email === ADMIN_EMAIL && (
              <Link
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  location.pathname === "/admin" ? "bg-indigo-600 text-white" : "text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-800"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-800 transition mt-4 w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden lg:block">
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</p>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.full_name || user?.email || "User"}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}