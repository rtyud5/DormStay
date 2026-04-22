import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { setToken, clearToken } from "../lib/storage";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserRef = useRef(null);

  useEffect(() => {
    currentUserRef.current = user;
  }, [user]);

  useEffect(() => {
    console.log("AuthContext profile:", profile);
  }, [profile]);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        setToken(session.access_token);
        fetchProfile(session.user.id);
      } else {
        clearToken();
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth event:", _event);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Chỉ trigger loading screen nếu là lần đầu hoặc mới đăng nhập thật sự (trước đó chưa có user)
        if ((_event === "SIGNED_IN" && !currentUserRef.current) || _event === "INITIAL_SESSION") {
          setLoading(true);
        }
        setToken(session.access_token);
        // Vẫn gọi fetchProfile ngầm để cập nhật thông tin nếu cần (không gây re-mount)
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        clearToken();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("ho_so")
        .select("*")
        .eq("ma_nguoi_dung_xac_thuc", userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    loading,
    logout,
    fetchProfile: () => user && fetchProfile(user.id),
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
