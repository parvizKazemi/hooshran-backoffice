import { useAuth, type AuthData } from "@/contexts/auth-context";
import { ApiError, apiPost } from "@/services/api";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AUTH_ENDPOINTS } from "../api/endpoints";

export type LoginMode = "otp" | "password";

export function useLogin() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<LoginMode>("otp");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const changeMode = (next: LoginMode) => {
    setMode(next);
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      toast.error(t("login.phoneRequired"));
      return;
    }

    if (mode === "password" && !password) {
      toast.error(t("login.passwordRequired"));
      return;
    }

    setLoading(true);
    try {
      if (mode === "password") {
        const data = await apiPost<AuthData>(AUTH_ENDPOINTS.loginWithPassword, {
          phone: trimmedPhone,
          password,
        });

        setAuthData({ user: data.user });
        setPassword("");
        navigate("/");
        return;
      }

      const result = await apiPost<boolean | string>(
        AUTH_ENDPOINTS.sendOtp,
        { phone: trimmedPhone },
        {
          headers: {
            accept: "*/*",
          },
        }
      );

      if (result === true || result === "true") {
        sessionStorage.setItem("otpPhone", trimmedPhone);
        navigate("/otp");
      } else {
        throw new Error(t("login.errorSendOtp"));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(
          mode === "password"
            ? t("login.errorPassword")
            : t("login.errorSendOtp")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode: changeMode,
    phone,
    setPhone,
    password,
    setPassword,
    loading,
    handleLogin,
  };
}
