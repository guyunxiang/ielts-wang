import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { get } from "../utils/fetch";

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let getStatus = false;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // for useEffect be called 2 times
    if (getStatus) return;
    getStatus = true;
    get('/api/auth/status').then(({ success, data }) => {
      if (success && data) {
        login();
      }
    });
  }, []);

  const login = () => {
    setIsLoggedIn(true);
  }

  const logout = async () => {
    await get('/api/auth/logout');
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}