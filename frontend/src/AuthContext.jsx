import { createContext, useContext, useEffect, useState } from "react";
import { googleLogout, useGoogleOneTapLogin } from "@react-oauth/google";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  function applySession(session) {
    setUser(session.user);
    setMembers(session.members);
    setAuthError(null);
  }

  useEffect(() => {
    let cancelled = false;
    api.getSession()
      .then((session) => {
        if (!cancelled) applySession(session);
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setMembers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setSessionChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCredential(credential) {
    try {
      applySession(await api.loginWithGoogle(credential));
    } catch (e) {
      if (e.message.startsWith("403")) {
        setAuthError("Přístup zamítnut — tvůj účet není v seznamu povolených uživatelů.");
      }
    }
  }

  useGoogleOneTapLogin({
    onSuccess: (res) => handleCredential(res.credential),
    onError: () => console.warn("[OneTap] error"),
    onNotification: (n) => console.info("[OneTap]", n.getMomentType(), n.getNotDisplayedReason() ?? n.getSkippedReason() ?? n.getDismissedReason() ?? ""),
    auto_select: true,
    disabled: !sessionChecked || Boolean(user),
  });

  function login(credentialResponse) {
    handleCredential(credentialResponse.credential);
  }

  async function logout() {
    googleLogout();
    try {
      await api.logout();
    } catch {
      // Local logout should still clear UI state even if the network request fails.
    }
    setUser(null);
    setMembers([]);
    setAuthError(null);
  }

  return (
    <AuthContext.Provider value={{ user, members, authError, sessionChecked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
