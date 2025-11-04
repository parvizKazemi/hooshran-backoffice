import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, type AuthData } from "@/contexts/auth-context";
import { apiPost, ApiError } from "@/services/api";

export function useOtp() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.length !== 5) {
      toast.error(t("otp.invalidCode") || "کد تایید باید 5 رقم باشد");
      return;
    }

    const phone = sessionStorage.getItem("otpPhone");
    if (!phone) {
      toast.error("شماره تلفن یافت نشد. لطفا دوباره وارد شوید");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost<AuthData>("/auth/register", {
        phone: phone.trim(),
        otp: otp.trim(),
      });

      // Success - save auth data to context
      setAuthData(data);
      sessionStorage.removeItem("otpPhone");
      navigate("/");
    } catch (error) {
      // Error handling is centralized in api.ts
      // Here we just display the error message
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در تایید کد");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    otp,
    setOtp,
    loading,
    handleVerify,
  };
}
