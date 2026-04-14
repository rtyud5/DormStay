import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { setToken, clearToken } from "../lib/storage";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log("AuthContext user:", user);
  }, [user]);

  useEffect(() => {
    console.log("AuthContext profile:", profile);
  }, [profile]);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setToken(session.access_token);
        fetchProfile(session.user.id);
      } else {
        clearToken();
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setToken(session.access_token);
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          clearToken();
          setLoading(false);
        }
      }
    );

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

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
