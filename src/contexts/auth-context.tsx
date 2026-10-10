import { getCookie, removeCookie, setCookie } from "@/lib/cookies";
import { clearReturnPath } from "@/lib/auth/return-path";
import {
  clearRefreshRejection,
  requestAdminLogout,
  resumeAdminRefresh,
  suspendAdminRefresh,
} from "@/lib/auth/refresh-admin-session";
import {
  clearSessionClock,
  isRefreshExpired,
  readSessionClock,
  writeSessionClock,
} from "@/lib/auth/session-clock";
import { watchAdminSession } from "@/lib/auth/session-refresh-scheduler";
import {
  notifySessionEnded,
  publishSessionSignal,
  registerSessionEndedHandler,
  resetSessionEnded,
} from "@/lib/auth/session-events";
import {
  ADMIN_SESSION_COOKIE_DAYS,
  USER_DATA_COOKIE,
} from "@/lib/auth/token-policy";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface TokenData {
  expiresIn: number;
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
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
  token?: TokenData;
  user: UserData;
}

interface AuthContextType {
  authData: AuthData | null;
  setAuthData: (data: AuthData | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): UserData | null {
  const userDataCookie = getCookie(USER_DATA_COOKIE);
  if (!userDataCookie) return null;
  try {
    return JSON.parse(userDataCookie) as UserData;
  } catch {
    return null;
  }
}

function clearStoredSession(): void {
  removeCookie(USER_DATA_COOKIE);
  clearSessionClock();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation("common");
  const [authData, setAuthDataState] = useState<AuthData | null>(() => {
    const user = readStoredUser();
    if (!user) return null;
    const clock = readSessionClock();
    if (clock && isRefreshExpired(clock)) {
      clearStoredSession();
      publishSessionSignal("ended");
      notifySessionEnded();
      return null;
    }
    return { user };
  });

  const clearClientSession = () => {
    setAuthDataState(null);
    clearStoredSession();
  };

  const logout = () => {
    suspendAdminRefresh();
    void requestAdminLogout();
    publishSessionSignal("logged-out");
    clearReturnPath();
    clearClientSession();
  };

  const setAuthData = (data: AuthData | null) => {
    if (!data?.user) {
      clearClientSession();
      return;
    }

    setAuthDataState({ user: data.user });
    setCookie(
      USER_DATA_COOKIE,
      JSON.stringify(data.user),
      ADMIN_SESSION_COOKIE_DAYS
    );
    if (data.token) {
      writeSessionClock(data.token.expiresIn, data.token.refreshTokenExpiresIn);
    }
    clearRefreshRejection();
    resumeAdminRefresh();
    resetSessionEnded();
  };

  useEffect(() => {
    return registerSessionEndedHandler(() => {
      publishSessionSignal("ended");
      clearClientSession();
      toast.error(t("session.expired"), { id: "admin-session-ended" });
    });
  }, [t]);

  useEffect(() => {
    if (!authData) return;
    return watchAdminSession({
      onRemoteLogout: () => {
        suspendAdminRefresh();
        clearClientSession();
        toast.error(t("session.signedOut"), { id: "admin-session-signed-out" });
      },
    });
  }, [authData, t]);

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
