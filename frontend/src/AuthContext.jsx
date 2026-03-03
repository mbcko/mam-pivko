import { createContext, useContext, useState } from "react";
import { googleLogout, useGoogleOneTapLogin } from "@react-oauth/google";
import { api } from "./api.js";

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [authError, setAuthError] = useState(null);

  async function handleCredential(credential) {
    api.setToken(credential);
    try {
      const membersList = await api.listMembers();
      const payload = decodeJwt(credential);
      setUser({ email: payload.email, name: payload.name, picture: payload.picture });
      setMembers(membersList);
      setAuthError(null);
    } catch (e) {
      api.setToken(null);
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
  });

  function login(credentialResponse) {
    handleCredential(credentialResponse.credential);
  }

  function logout() {
    googleLogout();
    api.setToken(null);
    setUser(null);
    setMembers([]);
    setAuthError(null);
  }

  return (
    <AuthContext.Provider value={{ user, members, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
