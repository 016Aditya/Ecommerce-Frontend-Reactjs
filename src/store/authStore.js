import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
} from '@/services/authService';
import postLoginSync from '@/features/auth/utils/postLoginSync';

/** 7 days in milliseconds */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * authStore
 *
 * Auth state lives here (Zustand + persist).
 * AuthContext is a thin re-export so existing imports keep working.
 *
 * Backend LoginResponse shape (after JWT implementation):
 *   {
 *     token: "<signed JWT>",
 *     user:  { id, firstName, lastName, email, phoneNumber, role, createdAt }
 *   }
 *
 * The JWT token is stored in:
 *   1. Zustand state (token field) — persisted to localStorage via zustand/persist
 *   2. localStorage['auth_token']  — direct write for the Axios interceptor to
 *      read during the brief pre-hydration window on page reload
 *
 * Session expiry:
 *   loginAt is persisted alongside token. On rehydration, if
 *   Date.now() - loginAt > SESSION_TTL_MS (7 days) the session is
 *   cleared client-side so the user is sent to /login.
 *   The backend JWT also expires at 7 days, so both guards agree.
 *
 * PrivateRoute guards on `user !== null`.
 * Axios interceptor guards on `token` (Zustand store → localStorage fallback).
 *
 * Security note — registeredUsers:
 *   Only { email, phone } are stored. Passwords are NEVER written to localStorage.
 *   The backend /api/users/verify-identity endpoint validates identity using
 *   email + phoneNumber server-side; no client-side password check is needed.
 *
 * Post-login sync:
 *   After a successful login or register, postLoginSync(userId) is awaited
 *   BEFORE resolving the login action. This runs wishlist sync and cart sync
 *   in parallel via Promise.allSettled so both guest stores are merged before
 *   the component navigates.
 *
 *   If either sync fails (network error, backend error), the failure is
 *   treated as non-fatal — auth state is already set and the user proceeds.
 *   Failed guest LocalStorage items are preserved by the respective sync
 *   utilities and will be retried on the next login.
 *
 *   authStore imports ONLY postLoginSync — it has no knowledge of
 *   guestCartService, cartSync, guestWishlistService, or wishlistSync.
 *   Adding a new guest-data migration (saved items, coupons, etc.) only
 *   requires extending postLoginSync.js, not this file.
 *
 * Login flow order:
 *   1. Authenticate → receive { token, user }
 *   2. Store JWT + user in Zustand + localStorage
 *   3. await postLoginSync(userId)   ← merges guest wishlist + cart, invalidates
 *                                       query caches, prefetches updated data
 *   4. Return normalisedUser          ← caller navigates here
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      loginAt:   null,
      loading:   false,
      error:     null,
      loginSecurityCode: null,
      isLocked: false,
      remainingSeconds: 0,
      lockoutCount: 0,
      retryAfter: null,
      requiresCaptcha: false,
      captchaToken: '',
      _hydrated: false,

      /**
       * Local registry for Forgot-Password email+phone pre-fill.
       * Stores only { email, phone } — never credentials.
       */
      registeredUsers: [],

      setHydrated: () => set({ _hydrated: true }),

      isLoggedIn: () => !!get().user,
      isAdmin:    () => get().user?.role === 'ADMIN',

      // ── Login ─────────────────────────────────────────────────────────────
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { token, user } = await loginService(credentials);

          const normalisedUser = {
            ...user,
            id: user.id ?? user._id,
          };

          const loginAt = Date.now();

          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(normalisedUser));

          set({
            user:    normalisedUser,
            token,
            loginAt,
            loading: false,
            requiresCaptcha: false,
            captchaToken: '',
          });

          // ── Guest data sync (wishlist + cart in parallel) ──────────────
          // Auth state is already committed above so the Axios interceptor
          // has the token for sync POSTs. We await here so query caches are
          // invalidated + prefetched BEFORE the caller navigates.
          // On failure we catch silently — guest items remain for next login.
          try {
            await postLoginSync(normalisedUser.id);
          } catch {
            // Non-fatal: individual sync failures already logged by postLoginSync.
          }

          return normalisedUser;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ── Register ──────────────────────────────────────────────────────────
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const data = await registerService(userData);

          set((state) => ({
            loading: false,
            registeredUsers: [
              ...state.registeredUsers.filter((u) => u.email !== userData.email),
              {
                email: userData.email,
                phone: userData.phone ?? userData.phoneNumber ?? '',
              },
            ],
          }));

          // If register returns { token, user } (auto-login flow), store auth
          // state and run postLoginSync before the caller navigates.
          if (data?.token && (data?.user?.id ?? data?.user?._id)) {
            const normalisedUser = {
              ...data.user,
              id: data.user.id ?? data.user._id,
            };
            const loginAt = Date.now();

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(normalisedUser));

            set({
              user:    normalisedUser,
              token:   data.token,
              loginAt,
            });

            try {
              await postLoginSync(normalisedUser.id);
            } catch {
              // Non-fatal.
            }
          }

          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ── Logout ────────────────────────────────────────────────────────────
      logout: () => {
        logoutService();
        set({ user: null, token: null, loginAt: null });
      },

      // ── Helpers ───────────────────────────────────────────────────────────
      updateUser: (partial) =>
        set((state) => ({ user: { ...state.user, ...partial } })),

      updateRegisteredUser: (email, partial) =>
        set((state) => ({
          registeredUsers: state.registeredUsers.map((u) => {
            if (u.email !== email) return u;
            const { password: _removed, ...safe } = u;
            return { ...safe, ...partial };
          }),
        })),

      setError: (error) => set({ error }),

      setLoginSecurity: ({
        code = null,
        isLocked = false,
        remainingSeconds = 0,
        lockoutCount = 0,
        retryAfter = null,
      }) => set({
        loginSecurityCode: code,
        isLocked,
        remainingSeconds: Math.max(Number(remainingSeconds) || 0, 0),
        lockoutCount: Math.max(Number(lockoutCount) || 0, 0),
        retryAfter,
      }),

      setCaptchaRequirement: (requiresCaptcha) =>
        set({
          requiresCaptcha: Boolean(requiresCaptcha),
          captchaToken: requiresCaptcha ? '' : get().captchaToken,
        }),

      setCaptchaToken: (captchaToken) =>
        set({ captchaToken: captchaToken ?? '' }),

      tickLoginSecurity: () =>
        set((state) => {
          if (state.remainingSeconds <= 0) return state;
          const nextSeconds = Math.max(state.remainingSeconds - 1, 0);
          return {
            remainingSeconds: nextSeconds,
            isLocked: state.loginSecurityCode === 'ACCOUNT_LOCKED' && nextSeconds > 0,
            retryAfter: nextSeconds > 0 ? state.retryAfter : null,
            loginSecurityCode: nextSeconds > 0 ? state.loginSecurityCode : null,
          };
        }),

      clearLoginSecurity: () =>
        set({
          loginSecurityCode: null,
          isLocked: false,
          remainingSeconds: 0,
          lockoutCount: 0,
          retryAfter: null,
        }),

      clearCaptcha: () =>
        set({
          requiresCaptcha: false,
          captchaToken: '',
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        loginAt:         state.loginAt,
        registeredUsers: state.registeredUsers,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.loginAt && Date.now() - state.loginAt > SESSION_TTL_MS) {
            logoutService();
            state.user    = null;
            state.token   = null;
            state.loginAt = null;
            state.setHydrated();
            return;
          }

          if (state.user && !state.user.id && state.user._id) {
            state.user = { ...state.user, id: state.user._id };
          }

          if (Array.isArray(state.registeredUsers)) {
            state.registeredUsers = state.registeredUsers.map(
              ({ password: _removed, ...safe }) => safe
            );
          }

          if (state.token) {
            localStorage.setItem('auth_token', state.token);
          } else {
            localStorage.removeItem('auth_token');
          }
          state.setHydrated();
        }
      },
    }
  )
);
