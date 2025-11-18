import { getCookie, removeCookie, setCookie } from "@/lib/cookies";
import { createContext, ReactNode, useContext, useState } from "react";

export interface TokenData {
  expiresIn: number;
  accessToken: string;
}

export interface UserData {
  createdAt: string;
  updatedAt: string;
  uuid: string;
  registrationSource?: string | null;
  referralCode: string;
  phoneNumber: string;
}

export interface AuthData {
  token?: TokenData; // Token is optional - stored in cookie by server
  user: UserData;
}

interface AuthContextType {
  authData: AuthData | null;
  setAuthData: (data: AuthData | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie name for storing user data
const USER_DATA_COOKIE = "userData";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthDataState] = useState<AuthData | null>(() => {
    // Load user data from cookie on mount
    // Token is stored in cookie by server, we don't need to store it
    const userDataCookie = getCookie(USER_DATA_COOKIE);
    if (userDataCookie) {
      try {
        const userData: UserData = JSON.parse(userDataCookie);
        // Return auth data with only user (token is in server cookie)
        return { user: userData };
      } catch {
        return null;
      }
    }
    return null;
  });

  const logout = () => {
    setAuthDataState(null);
    // Remove user data cookie
    // Token cookie is cleared by server on logout
    removeCookie(USER_DATA_COOKIE);
    sessionStorage.removeItem("otpPhone");
  };

  const setAuthData = (data: AuthData | null) => {
    setAuthDataState(data);
    // Store only user data in cookie (token is stored by server in its own cookie)
    if (data?.user) {
      setCookie(USER_DATA_COOKIE, JSON.stringify(data.user), 7); // 7 days
    } else {
      removeCookie(USER_DATA_COOKIE);
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
