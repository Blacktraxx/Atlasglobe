import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/CartContext";

export default function CartDrawer() {
  const { items, open, setOpen, updateQty, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md h-full bg-background border-l-2 border-border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-border">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Cart
          </h2>
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-secondary" aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-16">Your cart is empty. Go add something good.</p>
          )}
          {items.map((item) => (
            <div key={item.product_id} className="flex gap-3 border-2 border-border rounded-xl p-3 bg-card">
              <div className="w-16 h-16 rounded-lg bg-secondary shrink-0 overflow-hidden flex items-center justify-center font-display font-bold text-muted-foreground/40">
                {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : item.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.name}</p>
                <p className="font-mono text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={() => updateQty(item.product_id, item.qty - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md border-2 border-border hover:bg-secondary"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-sm w-5 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.product_id, item.qty + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md border-2 border-border hover:bg-secondary"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t-2 border-border p-5 space-y-3">
            <div className="flex items-center justify-between font-display font-bold text-lg">
              <span>Total</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/checkout");
              }}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl border-2 border-border shadow-[4px_4px_0_hsl(var(--border))] hover:shadow-[2px_2px_0_hsl(var(--border))] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
