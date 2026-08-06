import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Users,
  Shield,
  Zap,
  Globe,
  CreditCard,
  TrendingUp,
  Clock,
  Lock,
  Headphones,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const cryptoRates = [
  { currency: "Bitcoin", code: "BTC", rate: "$64,382.10", change: "+1.24%", up: true },
  { currency: "Ethereum", code: "ETH", rate: "$3,142.55", change: "+0.87%", up: true },
  { currency: "Solana", code: "SOL", rate: "$168.22", change: "-0.42%", up: false },
  { currency: "Tether (ERC-20)", code: "USDT", rate: "$1.0001", change: "+0.01%", up: true },
  { currency: "Tether (TRC-20)", code: "USDT-TRX", rate: "$0.9998", change: "+0.00%", up: true },
  { currency: "US Dollar", code: "USD", rate: "$1.0000", change: "+0.00%", up: true },
];

const features = [
  { icon: Zap, title: "Instant Swaps", desc: "Convert your balance to crypto in seconds, no waiting around." },
  { icon: Globe, title: "Withdraw To Any Wallet", desc: "Send BTC, ETH, SOL, or USDT straight to your own wallet address." },
  { icon: Headphones, title: "Real Human Support", desc: "Reach our team anytime by email or Telegram." },
  { icon: TrendingUp, title: "Live Market Rates", desc: "Swap at up-to-date rates with minimal spread." },
  { icon: Clock, title: "Fast Processing", desc: "Withdrawals are processed quickly, with clear status updates." },
  { icon: Lock, title: "Bank-Level Security", desc: "Your balance is protected with 256-bit encryption." },
];

const cryptoAssets = [
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ" },
  { code: "SOL", name: "Solana", symbol: "◎" },
  { code: "USDT", name: "Tether (ERC-20)", symbol: "₮" },
  { code: "USDT-TRX", name: "Tether (TRC-20)", symbol: "₮" },
  { code: "USD", name: "US Dollar Balance", symbol: "$" },
];

const testimonials = [
  { name: "Tom Harris", role: "Engineer, Olleo", text: "I've been swapping through Atlas Globe for months. Rates are fair and withdrawals to my wallet are fast." },
  { name: "Sarah Chen", role: "Freelancer", text: "Turning my balance into crypto takes seconds, and support actually answers on Telegram." },
  { name: "Michael Brown", role: "Business Owner", text: "Atlas Globe made it simple to move between USD and crypto without the usual exchange hassle." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Atlas Globe" className="w-9 h-9 rounded-lg object-contain" />
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">ATLAS GLOBE</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition">Home</Link>
              <a href="#features" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition">Features</a>
              <a href="#rates" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition">Market Rates</a>
              <a href="#contact" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition">Support</a>
            </div>
            <Link to="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                Exchange APP <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wider uppercase">
                <Shield className="w-3.5 h-3.5" /> Simple, Quick, Secured
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-amber-400 leading-[1.1] tracking-tight">
                Swap Your Balance Into Crypto, Instantly
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                Atlas Globe is a crypto exchange platform built for speed and simplicity. Convert your
                balance to BTC, ETH, SOL, or USDT and withdraw straight to your own wallet — with real
                support on the other end when you need it.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/login">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-7 py-6 text-base">
                    Launch Exchange <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="https://www.youtube.com/watch?v=oDDbVC3Hekc" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 px-6 py-6 text-base">
                    <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </span>
                    Watch Video
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">18.5M+ Active Users</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=500&fit=crop"
                    alt="Banking"
                    className="rounded-2xl shadow-xl w-full h-64 object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"
                    alt="Finance"
                    className="rounded-2xl shadow-xl w-full h-40 object-cover"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">18.5M+</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Active Users</p>
                      </div>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&h=400&fit=crop"
                    alt="Card"
                    className="rounded-2xl shadow-xl w-full h-56 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=500&fit=crop" alt="About" className="rounded-2xl shadow-lg w-full h-64 object-cover" />
              <img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=400&fit=crop" alt="About" className="rounded-2xl shadow-lg w-full h-48 object-cover mt-8" />
            </div>
            <div className="space-y-6">
              <span className="text-indigo-600 font-bold text-sm tracking-wider uppercase">About Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">We Simplified Crypto Exchange</h2>
              <p className="text-slate-600 leading-relaxed">
                Atlas Globe is built for people who want to move between USD and crypto without the
                usual friction — swap your balance for BTC, ETH, SOL, or USDT and withdraw straight to
                your own wallet, with real support whenever you need it.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Powerful Mobile & Online App</h3>
                    <p className="text-sm text-slate-600">Our app is quick and easy to use, available on all your devices.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Brings More Transparency & Speed</h3>
                    <p className="text-sm text-slate-600">Live rates and clear status updates, every step of the way.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crypto Rates */}
      <section id="rates" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-bold text-sm tracking-wider uppercase">Live Market Rates</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-2">Swap At Live Rates With Minimal Fees</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Asset</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Rate (USD)</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Change (24h)</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoRates.map((r) => (
                    <tr key={r.code} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {r.code.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{r.currency}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{r.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{r.rate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${r.up ? "text-green-600" : "text-red-500"}`}>
                          {r.up ? "▲" : "▼"} {r.change}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to="/login">
                          <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                            Swap
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-bold text-sm tracking-wider uppercase">Your Benefits</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-2">Your One-Stop Crypto Exchange</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 hover:shadow-lg transition-all bg-white dark:bg-slate-900">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Assets */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-bold text-sm tracking-wider uppercase">Supported Assets</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-2">Swap Between USD And Major Crypto Assets</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {cryptoAssets.map((c) => (
              <div key={c.code} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold">
                  {c.symbol}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{c.code}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-bold text-sm tracking-wider uppercase">Our Reviews</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-2">More Than 18M+ Happy Customers Trust Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Create Your Free Account Today</h2>
          <p className="text-indigo-100 mb-8 text-lg">Swap your balance for crypto and withdraw to your own wallet, with support when you need it.</p>
          <Link to="/register">
            <Button className="bg-white dark:bg-slate-900 text-indigo-700 hover:bg-indigo-50 gap-2 px-8 py-6 text-base">
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 dark:text-slate-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Atlas Globe" className="w-9 h-9 rounded-lg object-contain" />
                <span className="font-bold text-lg text-white">ATLAS GLOBE</span>
              </Link>
              <p className="text-sm">The crypto exchange platform for fast, secure swaps and wallet withdrawals.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#rates" className="hover:text-white transition">Market Rates</a></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition">Launch Exchange</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Swap & Withdraw</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Market Rates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Headphones className="w-4 h-4" /> Email & Telegram Support</li>
                <li className="flex items-center gap-2"><Lock className="w-4 h-4" /> Bank-Level Security</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Secure & Reliable</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>© 2026 Atlas Globe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}