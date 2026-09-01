/**
 * RegisterForm — production-quality UI upgrade
 *
 * Changes vs previous version:
 *   + PasswordField with show/hide eye toggle on both password fields
 *   + Live password strength meter + checklist (PasswordStrength component)
 *   + Live confirm-password match indicator
 *   + Submit disabled until all password rules pass AND passwords match
 *   + app-wide success toast via toastStore
 *   + Loading label "Creating account..." on button
 *   + Fully theme-variable styled — dark mode safe
 */
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordField from "./PasswordField";
import PasswordStrength, { getPasswordScore, isPasswordValid } from "./PasswordStrength";
import { PATHS } from "@/routes/paths";
import { useRegisterMutation } from "@/features/auth/hooks/useRegisterMutation";
import { useToastStore } from '@/store/toastStore';
import { normalizeRegisterError } from "@/features/auth/utils/authErrorHandling";
import { validateEmail } from "@/utils/validation";

const PHONE_REGEX = /^[6-9]\d{9}$/;

const EMPTY_FIELD_ERRORS = {
  name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const showToast = useToastStore((state) => state.showToast);
  const [generalError, setGeneralError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
  const [touched, setTouched] = useState({});

  const inputRefs = {
    name: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

  const pwValid = isPasswordValid(formData.password);
  const pwMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const submitDisabled = useMemo(() => {
    if (registerMutation.isPending) return true;
    if (!pwValid) return true;
    if (!pwMatch) return true;
    return false;
  }, [registerMutation.isPending, pwMatch, pwValid]);

  const focusFirstInvalidField = (errors) => {
    const firstInvalidField = Object.keys(EMPTY_FIELD_ERRORS).find((field) => errors[field]);
    if (firstInvalidField) {
      inputRefs[firstInvalidField]?.current?.focus();
    }
  };

  const validate = () => {
    const errors = { ...EMPTY_FIELD_ERRORS };

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!PHONE_REGEX.test(formData.phone.trim())) {
      errors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    errors.email = validateEmail(formData.email) ?? "";

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (!pwValid) {
      errors.password = "Password does not meet requirements";
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    const hasErrors = Object.values(errors).some(Boolean);
    setFieldErrors(errors);

    if (hasErrors) {
      focusFirstInvalidField(errors);
    }

    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePasswordBlur = () => {
    if (formData.password && getPasswordScore(formData.password) <= 2) {
      showToast({
        type: "warning",
        title: "Weak Password!",
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (registerMutation.isPending) return;

    setGeneralError("");
    setFieldErrors({ ...EMPTY_FIELD_ERRORS });

    if (!validate()) return;

    const nameParts = formData.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || ".";

    try {
      await registerMutation.mutateAsync({
        firstName,
        lastName,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      showToast({
        type: 'success',
        title: 'Welcome!',
        message: 'Account created successfully.',
      });

      navigate(PATHS.LOGIN, {
        replace: true,
        state: { registered: true, firstName },
      });
    } catch (error) {
      const { fieldErrors: nextFieldErrors, generalError: nextGeneralError } =
        normalizeRegisterError(error);

      if (Object.keys(nextFieldErrors).length > 0) {
        const mergedErrors = { ...EMPTY_FIELD_ERRORS, ...nextFieldErrors };
        setFieldErrors(mergedErrors);
        focusFirstInvalidField(mergedErrors);
      }

      if (nextGeneralError) {
        setGeneralError(nextGeneralError);
      }

    }
  };

  return (
    <div
      className="w-full max-w-lg rounded-2xl p-8 shadow-xl"
      style={{
        backgroundColor: "var(--card-bg-elevated)",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Header */}
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
          Create your account
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Join ShopApp and start shopping
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          ref={inputRefs.name}
          label="Full Name"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          autoComplete="name"
          aria-label="Full name"
          disabled={registerMutation.isPending}
        />

        <Input
          ref={inputRefs.phone}
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="10-digit mobile number"
          value={formData.phone}
          onChange={handleChange}
          error={fieldErrors.phone}
          maxLength={10}
          inputMode="numeric"
          autoComplete="tel"
          aria-label="Phone number"
          disabled={registerMutation.isPending}
        />

        <Input
          ref={inputRefs.email}
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
          autoComplete="email"
          aria-label="Email address"
          disabled={registerMutation.isPending}
        />

        <div className="space-y-2">
          <PasswordField
            inputRef={inputRefs.password}
            label="Password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handlePasswordBlur}
            error={fieldErrors.password}
            autoComplete="new-password"
            disabled={registerMutation.isPending}
          />
          <PasswordStrength password={formData.password} />
        </div>

        <div className="space-y-1.5">
          <PasswordField
            inputRef={inputRefs.confirmPassword}
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Repeat your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            disabled={registerMutation.isPending}
          />
          {touched.confirmPassword && formData.confirmPassword.length > 0 && (
            <p
              className="flex items-center gap-1.5 text-xs"
              style={{ color: pwMatch ? "#22c55e" : "#ef4444" }}
            >
              {!pwMatch && <span className="font-bold">x</span>}
              {pwMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
        </div>

        {generalError && (
          <p
            className="whitespace-pre-line rounded-xl px-3.5 py-2.5 text-sm"
            style={{
              backgroundColor: "var(--error-bg)",
              color: "var(--error-text)",
              border: "1px solid var(--error-border)",
            }}
          >
            {generalError}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          loading={registerMutation.isPending}
          disabled={submitDisabled}
          size="lg"
          className="mt-1"
          style={!submitDisabled ? {
            backgroundColor: "var(--button-primary)",
            color: "var(--button-primary-text)",
            borderColor: "var(--button-primary)",
          } : {}}
        >
          {registerMutation.isPending ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: "var(--border-color)" }} />
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>or</span>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--border-color)" }} />
      </div>

      <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <Link
          to={PATHS.LOGIN}
          className="font-semibold hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;
