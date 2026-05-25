import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getMe, login as apiLogin, register as apiRegister } from "../services/auth";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { accessToken, user, setTokens, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken && !user) {
      getMe().then(setUser).catch(() => logout());
    }
  }, [accessToken, user, setUser, logout]);

  async function signIn(email: string, password: string) {
    const tokens = await apiLogin(email, password);
    setTokens(tokens.access_token, tokens.refresh_token);
    const me = await getMe();
    setUser(me);
    navigate("/dashboard");
  }

  async function signUp(payload: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    dni?: string;
    birth_date?: string;
    role?: string;
  }) {
    const tokens = await apiRegister(payload);
    setTokens(tokens.access_token, tokens.refresh_token);
    const me = await getMe();
    setUser(me);
    navigate("/dashboard");
  }

  function signOut() {
    logout();
    navigate("/login");
  }

  return { user, signIn, signUp, signOut, isAuthenticated: !!accessToken };
}
