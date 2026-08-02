import { useAuth, type AuthData } from "@/contexts/auth-context";
import { ApiError, apiPost } from "@/services/api";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AUTH_ENDPOINTS } from "../api/endpoints";

const OTP_LENGTH = 5;
const RESEND_COOLDOWN_SECONDS = 120;

export function useOtp() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const submittingRef = useRef(false);

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

  const verifyOtp = async (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length !== OTP_LENGTH) {
      toast.error(t("otp.invalidCode") || "کد تایید باید 5 رقم باشد");
      return;
    }

    if (submittingRef.current) return;

    const phone = sessionStorage.getItem("otpPhone");
    if (!phone) {
      toast.error("شماره تلفن یافت نشد. لطفا دوباره وارد شوید");
      navigate("/login");
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const data = await apiPost<AuthData>(AUTH_ENDPOINTS.login, {
        phone: phone.trim(),
        otp: trimmedCode,
      });

      setAuthData({ user: data.user });
      sessionStorage.removeItem("otpPhone");
      navigate("/");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در تایید کد");
      }
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === OTP_LENGTH) {
      void verifyOtp(value);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtp(otp);
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
      await apiPost(AUTH_ENDPOINTS.resendOtp, {
        phone: phone.trim(),
      });
      toast.success("کد تایید مجدداً ارسال شد");

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

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const canResend = countdown === 0;

  return {
    otp,
    setOtp: handleOtpChange,
    loading,
    handleVerify,
    handleResend,
    countdown,
    countdownFormatted: formatCountdown(countdown),
    canResend,
  };
}
