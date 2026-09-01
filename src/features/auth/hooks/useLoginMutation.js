import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { getBackendErrorMessage, getFriendlyGeneralError } from '@/features/auth/utils/authErrorHandling';

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Fallback used when the backend reports ACCOUNT_LOCKED but doesn't send a
// usable remainingSeconds (e.g. 0 or missing) — locks the UI for 15 minutes
// instead of showing "0 seconds" and leaving the form submittable.
const DEFAULT_LOCKOUT_SECONDS = 15 * 60;

export function formatLockoutDuration(totalSeconds = 0) {
  const seconds = Math.max(toNumber(totalSeconds, 0), 0);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  if (minutes > 0 && remainder > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ${remainder} second${remainder === 1 ? '' : 's'}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  return `${seconds} second${seconds === 1 ? '' : 's'}`;
}

export function getFriendlyLoginMessage({ code, remainingSeconds }) {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password.';
    case 'ACCOUNT_LOCKED':
      return `Your account is temporarily locked. Try again in ${formatLockoutDuration(remainingSeconds)}.`;
    case 'TOO_SOON':
      return `Too many attempts. Please wait ${formatLockoutDuration(remainingSeconds)} before trying again.`;
    case 'CAPTCHA_REQUIRED':
      return 'Please complete the security check to continue.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many login attempts. Please try again later.';
    default:
      return 'Unable to sign in right now. Please try again.';
  }
}

function extractSecurityPayload(error) {
  const payload = error?.response?.data ?? {};
  const code =
    payload.code ??
    payload.errorCode ??
    payload.error?.code ??
    null;

  let remainingSeconds = toNumber(
    payload.remainingSeconds ??
    payload.retryAfterSeconds ??
    payload.details?.remainingSeconds ??
    payload.retryAfter,
    0
  );

  if (code === 'ACCOUNT_LOCKED' && remainingSeconds <= 0) {
    remainingSeconds = DEFAULT_LOCKOUT_SECONDS;
  }

  const lockoutCount = toNumber(
    payload.lockoutCount ??
    payload.details?.lockoutCount,
    0
  );

  return {
    code,
    remainingSeconds,
    lockoutCount,
    retryAfter: payload.retryAfter ?? null,
    isLocked: code === 'ACCOUNT_LOCKED' && remainingSeconds > 0,
  };
}

export function useLoginMutation() {
  const login = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);
  const clearError = useAuthStore((state) => state.clearError);
  const setError = useAuthStore((state) => state.setError);
  const setLoginSecurity = useAuthStore((state) => state.setLoginSecurity);
  const clearLoginSecurity = useAuthStore((state) => state.clearLoginSecurity);
  const setCaptchaRequirement = useAuthStore((state) => state.setCaptchaRequirement);
  const setCaptchaToken = useAuthStore((state) => state.setCaptchaToken);
  const clearCaptcha = useAuthStore((state) => state.clearCaptcha);
  const isLocked = useAuthStore((state) => state.isLocked);
  const remainingSeconds = useAuthStore((state) => state.remainingSeconds);
  const tickLoginSecurity = useAuthStore((state) => state.tickLoginSecurity);

  useEffect(() => {
    if (remainingSeconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      tickLoginSecurity();
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLocked, remainingSeconds, tickLoginSecurity]);

  return useMutation({
    mutationFn: login,
    onMutate: () => {
      clearError();
      clearLoginSecurity();
    },
    onSuccess: () => {
      clearError();
      clearLoginSecurity();
      clearCaptcha();
    },
    onError: (error) => {
      const backendMessage = getBackendErrorMessage(
        error,
        'Unable to sign in right now. Please try again.'
      );
      const security = extractSecurityPayload(error);
      if (security.code === 'CAPTCHA_REQUIRED') {
        setCaptchaRequirement(true);
        setCaptchaToken('');
      }

      if (security.code === 'ACCOUNT_LOCKED') {
        showToast({ type: 'error', title: 'Account locked for 15 mins', duration: 3000 });
      } else if (
        security.code === 'INVALID_CREDENTIALS' ||
        (!security.code && error?.response?.status === 401)
      ) {
        showToast({ type: 'warning', title: 'Incorrect password or email', duration: 3000 });
      }

      if (security.code) {
        setLoginSecurity(security);
        setError(backendMessage);
        return;
      }

      clearLoginSecurity();
      const message = getFriendlyGeneralError(error, 'Unable to sign in right now. Please try again.');
      setError(message);
    },
  });
}
