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
    // Check authentication status when component mounts
    getAuthStatus();
  }, []);

  const getAuthStatus = async () => {
    try {
      const { success, data } = await get("/api/auth/status");
      if (success && data) {
        updateUserInfo(data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setIsLoggedIn(false);
    }
  };

  const updateUserInfo = (data: UserInfo) => {
    setUserInfo(data);
  }

  const login = () => {
    setIsLoggedIn(true);
    // Refresh auth status to get user info
    getAuthStatus();
  }

  const logout = async () => {
    try {
      const { success } = await get('/api/auth/logout');
      if (success) {
        setIsLoggedIn(false);
        setUserInfo({ username: '', role: '' });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
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