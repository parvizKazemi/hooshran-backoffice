import { useAuth, type AuthData } from "@/contexts/auth-context";
import { ApiError, apiPost } from "@/services/api";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RESEND_COOLDOWN_SECONDS = 120; // 2 minutes

export function useOtp() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown when component mounts
  useEffect(() => {
    setCountdown(RESEND_COOLDOWN_SECONDS);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
      const data = await apiPost<AuthData>("/admin/auth/login", {
        phone: phone.trim(),
        otp: otp.trim(),
      });

      // Server sets token in cookie automatically
      // We only need to save user data to cookie via context
      // Create auth data with only user (token is in server cookie)
      setAuthData({ user: data.user });
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

  const handleResend = async () => {
    if (countdown > 0) return;

    const phone = sessionStorage.getItem("otpPhone");
    if (!phone) {
      toast.error("شماره تلفن یافت نشد. لطفا دوباره وارد شوید");
      navigate("/login");
      return;
    }

    try {
      // Call resend OTP endpoint (you may need to adjust this endpoint)
      await apiPost("/admin/auth/resend-otp", {
        phone: phone.trim(),
      });
      toast.success("کد تایید مجدداً ارسال شد");

      // Reset countdown
      setCountdown(RESEND_COOLDOWN_SECONDS);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ارسال مجدد کد");
      }
    }
  };

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const canResend = countdown === 0;

  return {
    otp,
    setOtp,
    loading,
    handleVerify,
    handleResend,
    countdown,
    countdownFormatted: formatCountdown(countdown),
    canResend,
  };
}
