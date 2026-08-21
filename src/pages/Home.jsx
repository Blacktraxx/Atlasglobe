import React, { useEffect, useState } from "react";
import { ArrowDown, Zap, ShieldCheck, Clock, Star } from "lucide-react";
import StoreNav from "@/components/StoreNav";
import DiceGame from "@/components/DiceGame";
import ProductCard from "@/components/ProductCard";
import TelegramLink from "@/components/TelegramLink";
import { Products } from "@/api/entities";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "basic", label: "Basic" },
  { id: "standard", label: "Standard" },
  { id: "premium", label: "Premium" },
];

const REVIEWS = [
  { name: "Dara O.", stars: 5, text: "Fast checkout, paid in USDT, done in two minutes. Exactly what it says on the tin." },
  { name: "Marcus L.", stars: 5, text: "No account, no forms, just picked what I wanted and paid. This is how buying stuff online should work." },
  { name: "Priya K.", stars: 4, text: "Clean shop, clear pricing tiers. Wish there were more Premium items but what's there is solid." },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    Products.list(category)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-background">
      <StoreNav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-dashed border-border font-mono text-xs uppercase tracking-wider -rotate-1 mb-6">
          <Zap className="w-3.5 h-3.5" /> Guest checkout · Pay in crypto
        </span>
        <h1 className="font-display font-bold text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl mx-auto">
          Pick something. Pay in crypto. Done in under 5 minutes.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mt-5">
          No account required. Browse Basic, Standard, and Premium goods, check out as a guest, and pay with BTC, ETH, SOL, or USDT.
        </p>
        <a href="#shop" className="inline-flex items-center gap-2 mt-8 font-mono text-sm font-bold uppercase tracking-wide hover:underline">
          Start browsing <ArrowDown className="w-4 h-4" />
        </a>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, title: "No account needed", desc: "Checkout as a guest, every time." },
            { icon: Clock, title: "5-minute payment window", desc: "Your price is locked while you pay." },
            { icon: Zap, title: "Crypto only", desc: "BTC, ETH, SOL, or USDT — your call." },
          ].map((f) => (
            <div key={f.title} className="border-2 border-border rounded-2xl p-5 bg-card shadow-[4px_4px_0_hsl(var(--border))]">
              <f.icon className="w-6 h-6 mb-3" />
              <p className="font-display font-bold">{f.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <DiceGame />

      {/* Shop */}
      <section id="shop" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 scroll-mt-20">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h2 className="font-display font-bold text-2xl">Shop</h2>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-4 py-2 rounded-full border-2 border-border font-mono text-xs font-bold uppercase tracking-wide transition ${
                  category === c.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl border-2 border-border bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <p className="font-display font-bold text-lg">Nothing here yet</p>
            <p className="text-muted-foreground text-sm mt-1">Check back soon — new items are on the way.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="font-display font-bold text-2xl mb-2">What people say</h2>
        <p className="text-muted-foreground text-sm mb-6">Tap a review to chat with us on Telegram.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {REVIEWS.map((r) => (
            <TelegramLink
              key={r.name}
              to="lounge"
              showIcon={false}
              className="block border-2 border-border rounded-2xl p-5 bg-card shadow-[4px_4px_0_hsl(var(--border))] hover:shadow-[6px_6px_0_hsl(var(--border))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.stars ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <p className="text-sm leading-relaxed">"{r.text}"</p>
              <p className="font-mono text-xs text-muted-foreground mt-3">— {r.name}</p>
            </TelegramLink>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Atlas Globe" className="w-7 h-7 rounded-md object-contain" />
            <span className="font-display font-bold">ATLAS GLOBE SHOP</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <TelegramLink to="lounge" showIcon={false} className="hover:underline font-medium">Atlas Globe Lounge</TelegramLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
