import React from "react";
import { Plus } from "lucide-react";
import { useCart } from "@/lib/CartContext";

const CATEGORY_LABEL = { basic: "Basic", standard: "Standard", premium: "Premium" };
const CATEGORY_ROTATE = { basic: "-rotate-2", standard: "rotate-1", premium: "-rotate-1" };

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="group bg-card border-2 border-border rounded-2xl overflow-hidden shadow-[5px_5px_0_hsl(var(--border))] hover:shadow-[7px_7px_0_hsl(var(--border))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex flex-col">
      <div className="relative aspect-square bg-secondary overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-display font-bold text-muted-foreground/30">
            {product.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <span
          className={`absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full border-2 border-dashed border-border bg-background/90 font-mono text-[10px] font-bold uppercase tracking-wider ${CATEGORY_ROTATE[product.category] || ""}`}
        >
          {CATEGORY_LABEL[product.category] || product.category}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-foreground leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-dashed border-border/50">
          <span className="font-mono font-bold text-lg text-foreground">${product.price.toFixed(2)}</span>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold text-sm px-3 py-2 rounded-xl border-2 border-border shadow-[3px_3px_0_hsl(var(--border))] hover:shadow-[1px_1px_0_hsl(var(--border))] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
