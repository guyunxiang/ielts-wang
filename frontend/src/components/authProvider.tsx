import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { get } from "../utils/fetch";
import { toast } from "react-toastify";

interface AuthContextType {
  isLoggedIn: boolean;
  userInfo: UserInfo;
  updateUserInfo: (object: UserInfo) => void;
  login: () => void;
  logout: () => void;
}

interface UserInfo {
  username: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [userInfo, setUserInfo] = useState<UserInfo>({ username: '', role: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getAuthStatus = async () => {
      const { success, data } = await get("/api/auth/status");
      if (success) {
        updateUserInfo(data);
        login();
      }
    }
    getAuthStatus();
  }, []);

  const updateUserInfo = (data: UserInfo) => {
    setUserInfo(data);
  }

  const login = () => {
    setIsLoggedIn(true);
  }

  const logout = async () => {
    await get('/api/auth/logout');
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, updateUserInfo, userInfo, login, logout }}>
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