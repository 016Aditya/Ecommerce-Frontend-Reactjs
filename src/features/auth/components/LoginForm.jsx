/**
 * LoginForm — production-quality UI
 *
 * Fix: navigate() called directly after successful login.
 * No longer relies on PublicRoute re-render to redirect — that caused
 * an infinite /login bounce when Zustand state settled after commit.
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import TurnstileWidget from "@/components/common/TurnstileWidget";
import PasswordField from "./PasswordField";
import useAuth from "@/features/auth/hooks/useAuth";
import { PATHS } from "@/routes/paths";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from '@/store/toastStore';
import { getFriendlyLoginMessage, useLoginMutation } from "@/features/auth/hooks/useLoginMutation";

function LoginForm() {
  const { error, clearError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const showToast = useToastStore((state) => state.showToast);
  const isLocked = useAuthStore((state) => state.isLocked);
  const remainingSeconds = useAuthStore((state) => state.remainingSeconds);
  const lockoutCount = useAuthStore((state) => state.lockoutCount);
  const loginSecurityCode = useAuthStore((state) => state.loginSecurityCode);
  const requiresCaptcha = useAuthStore((state) => state.requiresCaptcha);
  const captchaToken = useAuthStore((state) => state.captchaToken);
  const setCaptchaToken = useAuthStore((state) => state.setCaptchaToken);
  const isRetryBlocked = loginSecurityCode === "TOO_SOON" && remainingSeconds > 0;
  const isCaptchaBlocked = requiresCaptcha && !captchaToken;
  const isSubmitBlocked = isLocked || isRetryBlocked || isCaptchaBlocked;

  // If PrivateRoute redirected here, state.from is a full location object
  // ({ pathname, search, hash, ... }). If a page-level guard (e.g. Cart's
  // checkout button) redirected here, state.from may instead be a plain
  // path string. Support both shapes and fall back to Home otherwise.
  const resolveFrom = (redirectFrom) => {
    if (!redirectFrom) return PATHS.HOME;
    if (typeof redirectFrom === "string") return redirectFrom;
    if (typeof redirectFrom.pathname === "string") {
      return `${redirectFrom.pathname}${redirectFrom.search || ""}${redirectFrom.hash || ""}`;
    }
    return PATHS.HOME;
  };
  const from = resolveFrom(location.state?.from);

  const regState = location.state;
  const [showBanner, setShowBanner] = useState(() => !!(regState?.registered));
  const registeredName = regState?.firstName ?? "";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const turnstileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) clearError?.();
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = "Email is required";
    if (!formData.password.trim()) errs.password = "Password is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (requiresCaptcha && !captchaToken) {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: 'Please complete the CAPTCHA.',
      });
      return;
    }
    if (isSubmitBlocked) return;

    try {
      await loginMutation.mutateAsync({
        ...formData,
        captchaToken,
      });

      showToast({
        type: 'success',
        title: 'Welcome Back',
        message: "You're signed in.",
      });

      navigate(from, { replace: true });
    } catch {
      setCaptchaToken("");
      turnstileRef.current?.reset?.();
    }
  };

  const displayError = loginSecurityCode
    ? getFriendlyLoginMessage({
        code: loginSecurityCode,
        remainingSeconds,
      })
    : error;

  const showResetBanner = lockoutCount >= 2 && Boolean(displayError);

  return (
    <div
      className="w-full max-w-md rounded-2xl p-8 shadow-xl"
      style={{
        backgroundColor: "var(--card-bg-elevated)",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Logo mark */}
      <div className="mb-6 flex flex-col items-center gap-1">
        <div
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-text)",
          }}
        >
          S
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Sign in to your ShopApp account
        </p>
      </div>

      {/* Registration success banner */}
      {showBanner && (
        <div
          className="mb-5 flex items-start gap-3 rounded-xl p-3.5"
          style={{
            background: "rgba(34,197,94,.12)",
            border: "1px solid rgba(34,197,94,.3)",
          }}
          role="alert"
          aria-live="polite"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
              Account Created Successfully
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {registeredName
                ? `Welcome, ${registeredName}! Please sign in.`
                : "Please sign in using your email and password."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss"
            className="ml-1 text-lg leading-none opacity-50 hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-primary)" }}
          >
            x
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          autoComplete="email"
          aria-label="Email address"
          disabled={loginMutation.isPending}
        />

        <div className="space-y-1.5">
          <PasswordField
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            autoComplete="current-password"
            disabled={loginMutation.isPending || isSubmitBlocked}
          />
          <div className="flex justify-end">
            <Link
              to={PATHS.FORGOT_PASSWORD}
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {displayError && (
          <p
            className="rounded-xl px-3.5 py-2.5 text-sm"
            style={{
              backgroundColor: "var(--error-bg)",
              color: "var(--error-text)",
              border: "1px solid var(--error-border)",
            }}
          >
            {displayError}
          </p>
        )}

        {showResetBanner && (
          <div
            className="rounded-xl px-3.5 py-3 text-sm"
            style={{
              backgroundColor: "var(--warning-bg)",
              color: "var(--warning-text)",
              border: "1px solid var(--warning-border)",
            }}
            role="status"
            aria-live="polite"
          >
            <p className="font-semibold">Having trouble signing in? Reset your password.</p>
            <div className="mt-2">
              <Link
                to={PATHS.FORGOT_PASSWORD}
                className="font-semibold hover:underline"
                style={{ color: "var(--accent)" }}
              >
                Reset Password
              </Link>
            </div>
          </div>
        )}

        {requiresCaptcha && (
          <div className="space-y-2">
            <TurnstileWidget
              ref={turnstileRef}
              onVerify={(token) => {
                setCaptchaToken(token);
                if (error) clearError?.();
              }}
              onExpire={() => {
                setCaptchaToken("");
                turnstileRef.current?.reset?.();
              }}
              onError={() => {
                setCaptchaToken("");
                turnstileRef.current?.reset?.();
              }}
            />
            {!captchaToken && (
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Complete the security check to continue.
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={loginMutation.isPending}
          disabled={isSubmitBlocked}
          size="lg"
          className="mt-1"
          style={{
            backgroundColor: "var(--button-primary)",
            color: "var(--button-primary-text)",
            borderColor: "var(--button-primary)",
          }}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: "var(--border-color)" }} />
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>or</span>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--border-color)" }} />
      </div>

      <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        Don&apos;t have an account?{" "}
        <Link
          to={PATHS.REGISTER}
          className="font-semibold hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
