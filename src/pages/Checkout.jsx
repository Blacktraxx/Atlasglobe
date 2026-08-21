import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import StoreNav from "@/components/StoreNav";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { Orders } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const CRYPTO_OPTIONS = [
  { code: "BTC", label: "Bitcoin (BTC)" },
  { code: "ETH", label: "Ethereum (ETH)" },
  { code: "SOL", label: "Solana (SOL)" },
  { code: "USDT-ERC20", label: "USDT (Ethereum / ERC-20)" },
  { code: "USDT-TRC20", label: "USDT (Tron / TRC-20)" },
];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cryptoAsset, setCryptoAsset] = useState("BTC");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      setName((n) => n || user.full_name || "");
      setEmail((e) => e || user.email || "");
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Your cart is empty", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const order = await Orders.create({
        items: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
        guestName: name,
        guestEmail: email,
        cryptoAsset,
      });
      clearCart();
      navigate(`/order/${order.reference}`);
    } catch (err) {
      toast({ title: "Couldn't place order", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNav />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="font-display font-bold text-xl">Your cart is empty</p>
          <p className="text-muted-foreground text-sm mt-2">Add something from the shop before checking out.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-6 font-mono text-sm font-bold uppercase hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreNav />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display font-bold text-3xl mb-1">Checkout</h1>
        <p className="text-muted-foreground text-sm mb-8">
          {isAuthenticated ? `Signed in as ${user?.email} — this order will show up in your account.` : "Guest checkout — no account needed."}
        </p>

        <div className="border-2 border-border rounded-2xl bg-card p-5 mb-6">
          <p className="font-display font-bold mb-3">Order summary</p>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.product_id} className="flex justify-between text-sm">
                <span>{i.name} <span className="font-mono text-muted-foreground">×{i.qty}</span></span>
                <span className="font-mono">${(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-display font-bold text-lg mt-3 pt-3 border-t-2 border-dashed border-border/50">
            <span>Total</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-2 border-border rounded-2xl bg-card p-5 space-y-5">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For your order confirmation" required />
          </div>
          <div className="space-y-2">
            <Label>Pay with</Label>
            <select
              value={cryptoAsset}
              onChange={(e) => setCryptoAsset(e.target.value)}
              className="w-full h-10 rounded-md border-2 border-border bg-background px-3 text-sm font-mono"
            >
              {CRYPTO_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl border-2 border-border shadow-[4px_4px_0_hsl(var(--border))] hover:shadow-[2px_2px_0_hsl(var(--border))] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Placing order...
              </>
            ) : (
              `Place order — $${total.toFixed(2)}`
            )}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            You'll get a payment address and a 5-minute window to send your crypto.
          </p>
        </form>
      </div>
    </div>
  );
}
