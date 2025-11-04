import { createContext, ReactNode, useContext, useState } from "react";

export interface TokenData {
  expiresIn: number;
  accessToken: string;
}

export interface UserData {
  createdAt: string;
  updatedAt: string;
  uuid: string;
  registrationSource: string | null;
  referralCode: string;
  phoneNumber: string;
}

export interface AuthData {
  token: TokenData;
  user: UserData;
}

interface AuthContextType {
  authData: AuthData | null;
  setAuthData: (data: AuthData | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthDataState] = useState<AuthData | null>(() => {
    // Try to load from localStorage on mount
    const stored = localStorage.getItem("authData");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const logout = () => {
    setAuthDataState(null);
    localStorage.removeItem("authData");
    localStorage.removeItem("isAuthUser");
    sessionStorage.removeItem("otpPhone");
  };

  const setAuthData = (data: AuthData | null) => {
    setAuthDataState(data);
    if (data) {
      localStorage.setItem("authData", JSON.stringify(data));
      localStorage.setItem("isAuthUser", "true");
    } else {
      localStorage.removeItem("authData");
      localStorage.removeItem("isAuthUser");
    }
  };

  const value: AuthContextType = {
    authData,
    setAuthData,
    isAuthenticated: !!authData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// const { authData, isAuthenticated, logout } = useAuth();
// const accessToken = authData?.token.accessToken;
