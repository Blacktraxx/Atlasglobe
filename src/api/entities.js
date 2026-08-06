import { supabase } from "@/lib/supabaseClient";

async function requireUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export const Profiles = {
  /** Returns the current user's profile merged with their auth email, or null if signed out. */
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

  async update(values) {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { ...data, email: user?.email };
  },

  /** Looks up another user's display name by account number, for a "sending to..." preview. */
  async lookupByAccountNumber(accountNumber) {
    const { data, error } = await supabase.rpc("lookup_account", {
      p_account_number: accountNumber,
    });
    if (error) throw error;
    return data?.[0] || null;
  },
};

export const Transactions = {
  async list(limit = 100) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async create(values) {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...values, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Sends money to another Atlas Globe user by their account number. Runs as
   * a single atomic database transaction (see transfer_funds in schema.sql)
   * so the sender's debit and recipient's credit always happen together.
   */
  async transferByAccountNumber({ accountNumber, amount, note }) {
    const { data, error } = await supabase.rpc("transfer_funds", {
      p_recipient_account_number: accountNumber,
      p_amount: amount,
      p_note: note || null,
    });
    if (error) throw error;
    return data;
  },

  /** Demo deposit — credits the caller's own balance via a server-side function (no direct balance writes from the client). */
  async simulateDeposit({ amount, note }) {
    const { data, error } = await supabase.rpc("simulate_deposit", {
      p_amount: amount,
      p_note: note || null,
    });
    if (error) throw error;
    return data;
  },

  /** Demo withdrawal — debits the caller's own balance via a server-side function that checks sufficient balance. */
  async simulateWithdrawal({ amount, destination, note }) {
    const { data, error } = await supabase.rpc("simulate_withdrawal", {
      p_amount: amount,
      p_destination: destination,
      p_note: note || null,
    });
    if (error) throw error;
    return data;
  },
};

export const SupportMessages = {
  async create(values) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("support_messages")
      .insert({ ...values, user_id: user?.id ?? null })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const Applications = {
  /**
   * Demo intake forms only (loan / credit_card / tax_filing). Submissions are
   * stored for record-keeping; there is no payment step anywhere in this flow.
   */
  async create(type, payload) {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("applications")
      .insert({ user_id: userId, type, payload, status: "submitted" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async list(type) {
    let query = supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
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
};

export const Admin = {
  /** Restricted to the admin email at the database level (RLS + function check) regardless of what the client requests. */
  async listUsers() {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) throw error;
    return data;
  },

  async listVisits(limit = 1000) {
    const { data, error } = await supabase
      .from("page_visits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
