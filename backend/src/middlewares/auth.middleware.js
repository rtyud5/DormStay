const { supabase } = require("../config/supabase");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    // 1. Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }

    // 2. Fetch additional profile info (full_name, role) from our public.profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // 3. Attach user and profile to request object
    req.user = {
      ...user,
      profile: profile || {},
      role: profile?.role || "customer",
    };

    return next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during authentication",
    });
  }
}

module.exports = authMiddleware;

