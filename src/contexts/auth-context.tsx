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

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthDataState] = useState<AuthData | null>(() => {
    // In development: try to load from localStorage on mount
    // In production: don't use localStorage, rely on cookies
    if (isDevelopment) {
      const stored = localStorage.getItem("authData");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const logout = () => {
    setAuthDataState(null);
    // In development: clear localStorage
    // In production: cookies are cleared by server
    if (isDevelopment) {
      localStorage.removeItem("authData");
      localStorage.removeItem("isAuthUser");
    }
    sessionStorage.removeItem("otpPhone");
  };

  const setAuthData = (data: AuthData | null) => {
    setAuthDataState(data);
    // In development: save to localStorage
    // In production: don't save to localStorage, rely on cookies set by server
    if (isDevelopment) {
      if (data) {
        localStorage.setItem("authData", JSON.stringify(data));
        localStorage.setItem("isAuthUser", "true");
      } else {
        localStorage.removeItem("authData");
        localStorage.removeItem("isAuthUser");
      }
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
