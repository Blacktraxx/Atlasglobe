import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, Loader2 } from "lucide-react";
import StoreNav from "@/components/StoreNav";
import { useAuth } from "@/lib/AuthContext";
import { Orders } from "@/api/entities";

const statusColor = {
  paid: "bg-primary/10",
  pending: "bg-amber-100 text-amber-800",
  expired: "bg-muted",
  cancelled: "bg-muted",
};

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Orders.myOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreNav />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl">Your account</h1>
            <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border bg-card hover:bg-secondary transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>

        <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" /> Order history
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground text-sm">No orders yet — anything you buy while signed in will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => navigate(`/order/${o.reference}`)}
                className="w-full text-left border-2 border-border rounded-2xl bg-card p-4 flex items-center justify-between hover:shadow-[3px_3px_0_hsl(var(--border))] transition-all"
              >
                <div>
                  <p className="font-mono text-sm">{o.reference}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">${o.total.toFixed(2)}</p>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border-2 border-border ${statusColor[o.status] || ""}`}>
                    {o.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
