import { ApiError, apiPost } from "@/services/api";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useLogin() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast.error(t("login.phoneRequired") || "شماره تلفن الزامی است");
      return;
    }

    setLoading(true);
    try {
      const result = await apiPost<boolean | string>(
        "/admin/auth/sendOtp",
        { phone: phone.trim() },
        {
          headers: {
            accept: "*/*",
          },
        }
      );

      if (result === true || result === "true") {
        // Store phone in sessionStorage for OTP verification
        sessionStorage.setItem("otpPhone", phone.trim());
        navigate("/otp");
      } else {
        throw new Error("درخواست ناموفق بود");
      }
    } catch (error) {
      // Error handling is centralized in api.ts
      // Here we just display the error message
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ارسال کد تایید");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    phone,
    setPhone,
    loading,
    handleLogin,
  };
}
