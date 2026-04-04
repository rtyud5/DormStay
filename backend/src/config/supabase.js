const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

let supabase = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  // Optimize: Set auth settings for a backend service role client
  // persistSession and autoRefreshToken should be false for server contexts
  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
} else {
  console.warn("⚠️ WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env");
  console.warn("⚠️ API endpoints using Supabase will return mock data or fail.");
}

// Add a connection checking utility
const checkConnection = async () => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) throw error;
    console.log("✅ Supabase successfully connected.");
    return true;
  } catch (err) {
    console.error("❌ Failed to connect to Supabase:", err.message);
    return false;
  }
};

module.exports = {
  supabase,
  checkConnection,
};
