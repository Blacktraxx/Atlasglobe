import { supabase } from "@/lib/supabaseClient";

export const Profiles = {
  /** Returns the current signed-in user's profile merged with their auth email, or null if signed out. Used to check admin access. */
  async me() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;

    return { ...data, email: user.email };
  },
};

export const Products = {
  /** Storefront listing — active products only (enforced by RLS regardless of what's requested). */
  async list(category) {
    let query = supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
    if (category && category !== "all") query = query.eq("category", category);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /** Admin-only: includes inactive products. RLS still enforces the admin-email check server-side. */
  async listAll() {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(values) {
    const { data, error } = await supabase.from("products").insert(values).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, values) {
    const { data, error } = await supabase.from("products").update(values).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  /** Uploads a product photo to the public product-images bucket and returns its public URL. */
  async uploadImage(file) {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  },
};

export const Orders = {
  /**
   * Creates a guest order. Runs through a server-side function that
   * recomputes the total from real product prices (never trusts a
   * client-supplied price) and issues a 5-minute payment window.
   */
  async create({ items, guestName, guestEmail, cryptoAsset }) {
    const { data, error } = await supabase.rpc("create_order", {
      p_items: items,
      p_guest_name: guestName,
      p_guest_email: guestEmail,
      p_crypto_asset: cryptoAsset,
    });
    if (error) throw error;
    return data;
  },

  /** Guest order status lookup — no auth required, scoped to a single order by its reference. */
  async getByReference(reference) {
    const { data, error } = await supabase.rpc("get_order_by_reference", { p_reference: reference });
    if (error) throw error;
    return data?.[0] || null;
  },

  /** Demo "I've sent payment" confirmation. Server-side also rejects this once the 5-minute window has passed. */
  async markPaid(reference) {
    const { data, error } = await supabase.rpc("mark_order_paid", { p_reference: reference });
    if (error) throw error;
    return data;
  },

  /** Admin-only order list. */
  async adminList() {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  /** Order history for the currently signed-in shopper (empty for guests). */
  async myOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};

function getVisitorId() {
  const key = "pgp-visitor-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export const Visits = {
  /** Logs a pageview for the admin analytics dashboard. Fails silently — never blocks the page. */
  async log(path) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("page_visits").insert({
        path,
        visitor_id: getVisitorId(),
        user_id: user?.id ?? null,
        referrer: document.referrer || null,
      });
    } catch {
      // analytics is best-effort only
    }
  },

  /** Admin-only. */
  async list(limit = 1000) {
    const { data, error } = await supabase
      .from("page_visits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  /** Admin-only. Subscribes to new visits in real time; returns an unsubscribe function. */
  subscribe(onInsert) {
    const channel = supabase
      .channel("page_visits_live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_visits" }, (payload) => {
        onInsert(payload.new);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
