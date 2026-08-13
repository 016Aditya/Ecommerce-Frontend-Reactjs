import { useEffect, useRef, useState } from 'react';
import './AppToast.css';

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const VARIANT_CONFIG = {
  success: {
    bgColor: '#22c55e',
    shadowColor: 'rgba(34, 197, 94, 0.45)',
    icon: <CheckIcon />,
    ariaLabel: 'Success notification',
    role: 'status',
    live: 'polite',
  },
  warning: {
    bgColor: '#f59e0b',
    shadowColor: 'rgba(245, 158, 11, 0.40)',
    icon: <WarningIcon />,
    ariaLabel: 'Warning notification',
    role: 'alert',
    live: 'assertive',
  },
  error: {
    bgColor: '#ef4444',
    shadowColor: 'rgba(239, 68, 68, 0.40)',
    icon: <ErrorIcon />,
    ariaLabel: 'Error notification',
    role: 'alert',
    live: 'assertive',
  },
  info: {
    bgColor: '#3b82f6',
    shadowColor: 'rgba(59, 130, 246, 0.40)',
    icon: <InfoIcon />,
    ariaLabel: 'Information notification',
    role: 'status',
    live: 'polite',
  },
};

const AppToast = ({
  visible,
  type = 'success',
  title = '',
  message,
  icon,
  action,
  bgColor,
  shadowColor,
  bottomOffset = '28px',
}) => {
  const [show, setShow] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const timerRef = useRef(null);
  const variant = VARIANT_CONFIG[type] ?? VARIANT_CONFIG.success;
  const resolvedIcon = icon ?? variant.icon;
  const resolvedBgColor = bgColor ?? variant.bgColor;
  const resolvedShadowColor = shadowColor ?? variant.shadowColor;

  useEffect(() => {
    if (visible) {
      clearTimeout(timerRef.current);
      setAnimOut(false);
      setShow(true);
    } else if (show) {
      setAnimOut(true);
      timerRef.current = setTimeout(() => {
        setShow(false);
        setAnimOut(false);
      }, 260);
    }

    return () => clearTimeout(timerRef.current);
  }, [show, visible]);

  if (!show) return null;

  return (
    <div
      className={`app-toast${animOut ? ' app-toast--out' : ''}`}
      role={variant.role}
      aria-live={variant.live}
      aria-label={variant.ariaLabel}
      style={{
        '--toast-bg': resolvedBgColor,
        '--toast-shadow': resolvedShadowColor,
        bottom: `calc(${bottomOffset} + env(safe-area-inset-bottom, 0px) + var(--toast-mobile-lift, 0px))`,
      }}
    >
      {resolvedIcon && (
        <span className="app-toast__icon" aria-hidden="true">{resolvedIcon}</span>
      )}
      <span className="app-toast__text">
        {title && <strong>{title} </strong>}
        {message}
      </span>
      {action && action}
    </div>
  );
};

export default AppToast;
