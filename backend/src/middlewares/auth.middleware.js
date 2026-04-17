const { supabase } = require("../config/supabase");
const { normalizeRole } = require("../utils/roleUtils");

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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }

    // 2. Read role and profile data from the app table first so backend honors business roles like KE_TOAN.
    const { data: hoSo } = await supabase.from("ho_so").select("*").eq("ma_nguoi_dung_xac_thuc", user.id).maybeSingle();

    // 3. Keep the legacy profiles lookup as a fallback because existing auth responses still read from it.
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

    const mergedProfile = hoSo || profile || {};
    const role = normalizeRole(hoSo?.vai_tro || profile?.role || "KHACH_HANG");

    // 4. Attach a normalized user object so downstream services can do role checks safely.
    req.user = {
      ...user,
      profile: mergedProfile,
      legacyProfile: profile || null,
      profileId: hoSo?.ma_ho_so || null,
      role,
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
