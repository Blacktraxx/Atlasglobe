import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, Check, Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import StoreNav from "@/components/StoreNav";
import TelegramLink from "@/components/TelegramLink";
import { Orders } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

function formatTime(ms) {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function OrderStatus() {
  const { reference } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remainingMs, setRemainingMs] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const loadOrder = useCallback(() => {
    Orders.getByReference(reference)
      .then((o) => {
        if (!o) {
          setError("We couldn't find that order.");
        } else {
          setOrder(o);
        }
      })
      .catch((err) => setError(err.message || "Couldn't load this order."))
      .finally(() => setLoading(false));
  }, [reference]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!order || order.status !== "pending") return;
    const tick = () => setRemainingMs(new Date(order.expires_at).getTime() - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const isExpired = order?.status === "expired" || (order?.status === "pending" && remainingMs <= 0);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const handleConfirmPaid = async () => {
    setConfirming(true);
    try {
      const updated = await Orders.markPaid(reference);
      setOrder(updated);
    } catch (err) {
      toast({ title: "Couldn't confirm payment", description: err.message || "Please try again.", variant: "destructive" });
      loadOrder();
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNav />
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNav />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-display font-bold text-xl">{error || "Order not found"}</p>
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
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
        <div className="border-2 border-border rounded-2xl bg-card p-6 shadow-[5px_5px_0_hsl(var(--border))]">
          {order.status === "paid" ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-3" />
              <h1 className="font-display font-bold text-2xl">Payment confirmed</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Thanks, {order.guest_name}! We'll follow up at {order.guest_email}.
              </p>
              <div className="mt-6 text-left border-t-2 border-dashed border-border/50 pt-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono">{order.reference}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-mono font-bold">${order.total.toFixed(2)}</span></div>
              </div>
            </div>
          ) : isExpired ? (
            <div className="text-center py-4">
              <AlertTriangle className="w-14 h-14 text-destructive mx-auto mb-3" />
              <h1 className="font-display font-bold text-2xl">Payment window expired</h1>
              <p className="text-muted-foreground text-sm mt-2">This order's 5-minute window has passed. Start a new checkout to try again.</p>
              <Link
                to="/"
                className="inline-block mt-6 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl border-2 border-border shadow-[3px_3px_0_hsl(var(--border))]"
              >
                Back to shop
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Time remaining</p>
                <p className="font-display font-bold text-4xl mt-1 tabular-nums">{formatTime(remainingMs)}</p>
              </div>

              <div className="bg-secondary border-2 border-border rounded-xl p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Send exactly</p>
                <p className="font-mono font-bold text-lg">${order.total.toFixed(2)} in {order.crypto_asset}</p>
              </div>

              <div className="bg-secondary border-2 border-border rounded-xl p-4 mb-5">
                <p className="text-xs text-muted-foreground mb-1">To this address</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm break-all flex-1">{order.wallet_address}</code>
                  <button onClick={handleCopy} className="shrink-0 p-2 rounded-lg hover:bg-background border-2 border-border">
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirmPaid}
                disabled={confirming}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl border-2 border-border shadow-[4px_4px_0_hsl(var(--border))] hover:shadow-[2px_2px_0_hsl(var(--border))] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Confirming...
                  </>
                ) : (
                  "I've sent payment"
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Reference: <span className="font-mono">{order.reference}</span>
              </p>
            </>
          )}

          <div className="mt-6 pt-5 border-t-2 border-dashed border-border/50 text-center">
            <TelegramLink to="support" showIcon={false} className="text-sm font-medium hover:underline">
              Need help with this order? Message @blacktraxx
            </TelegramLink>
          </div>
        </div>
      </div>
    </div>
  );
}
