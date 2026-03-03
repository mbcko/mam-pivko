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

  function handleCredential(credential) {
    const payload = decodeJwt(credential);
    api.setToken(credential);
    setUser({ email: payload.email, name: payload.name, picture: payload.picture });
    api.listMembers().then(setMembers).catch(() => {});
  }

  useGoogleOneTapLogin({
    onSuccess: (res) => handleCredential(res.credential),
    onError: () => {},
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
  }

  return (
    <AuthContext.Provider value={{ user, members, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
