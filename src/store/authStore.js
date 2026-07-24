import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
} from '@/services/authService';
import { syncWishlist } from '@/features/wishlist/utils/wishlistSync';

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
 * Guest wishlist sync:
 *   After a successful login or register, syncWishlist(userId) is awaited
 *   BEFORE resolving the login action. This ensures the TanStack Query
 *   wishlist cache is invalidated and prefetched before the component
 *   navigates, so merged wishlist data is visible without a page refresh.
 *
 *   If sync fails (network error, backend error), the error is caught and
 *   treated as non-fatal — auth state is already set and the user proceeds.
 *   Guest LocalStorage is preserved by wishlistSync.js on failure, so
 *   the items will be retried on the next login.
 *
 * Login flow order (required for correct wishlist merge):
 *   1. Authenticate → receive { token, user }
 *   2. Store JWT + user in Zustand + localStorage
 *   3. await syncWishlist(userId)   ← merges guest items into MongoDB
 *                                     + invalidates wishlist cache
 *                                     + prefetches updated wishlist
 *   4. Return normalisedUser         ← caller navigates here
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

      // ── Login ────────────────────────────────────────────────────────────────
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          /**
           * loginService returns the full backend LoginResponse:
           *   { token: string, user: UserDto.Response }
           */
          const { token, user } = await loginService(credentials);

          // Normalise: guarantee user.id is always the string used for API calls.
          const normalisedUser = {
            ...user,
            id: user.id ?? user._id,
          };

          const loginAt = Date.now();

          // Write token to localStorage directly so the Axios interceptor can
          // read it immediately on the next request, before Zustand rehydrates.
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

          // ── Guest wishlist sync (awaited) ──────────────────────────────────
          // Auth state is already set above so the Axios interceptor has the
          // token for the sync POST. We await here so the query cache is
          // invalidated + prefetched BEFORE the caller navigates.
          // On failure we catch silently — guest items remain in LocalStorage.
          try {
            await syncWishlist(normalisedUser.id);
          } catch {
            // Non-fatal: guest items preserved in LocalStorage for next login.
          }

          return normalisedUser;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ── Register ─────────────────────────────────────────────────────────────
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const data = await registerService(userData);

          // Store only email + phone for the Forgot-Password flow pre-fill.
          // NEVER store the password — /api/users/verify-identity handles
          // identity verification server-side using email + phoneNumber.
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

          // ── Guest wishlist sync after register ────────────────────────────
          // If register returns { token, user } (auto-login flow), sync guest
          // wishlist before the caller navigates. Gracefully skip if register
          // does not auto-login (data.user is undefined).
          if (data?.user?.id ?? data?.user?._id) {
            const userId = data.user.id ?? data.user._id;
            try {
              await syncWishlist(userId);
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

      // ── Logout ───────────────────────────────────────────────────────────────
      logout: () => {
        logoutService();                          // clears localStorage auth_token + auth_user
        set({ user: null, token: null, loginAt: null });
      },

      // ── Helpers ──────────────────────────────────────────────────────────────
      updateUser: (partial) =>
        set((state) => ({ user: { ...state.user, ...partial } })),

      updateRegisteredUser: (email, partial) =>
        set((state) => ({
          // Filter out any stale entries with a password field (migration safety)
          registeredUsers: state.registeredUsers.map((u) => {
            if (u.email !== email) return u;
            const { password: _removed, ...safe } = u; // strip password if present
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
          if (state.remainingSeconds <= 0) {
            return state;
          }

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
          // ── Session TTL check ──────────────────────────────────────────────
          // If more than 7 days have passed since login, wipe the session so
          // the user is redirected to /login on the next PrivateRoute access.
          if (state.loginAt && Date.now() - state.loginAt > SESSION_TTL_MS) {
            logoutService();   // clears localStorage auth_token + auth_user
            state.user    = null;
            state.token   = null;
            state.loginAt = null;
            state.setHydrated();
            return;
          }

          // Normalise user.id from stale localStorage (pre-JWT sessions)
          if (state.user && !state.user.id && state.user._id) {
            state.user = { ...state.user, id: state.user._id };
          }

          // Migration: strip any password field from registeredUsers
          // that may have been persisted by a previous version of this store.
          if (Array.isArray(state.registeredUsers)) {
            state.registeredUsers = state.registeredUsers.map(
              ({ password: _removed, ...safe }) => safe
            );
          }

          // Keep localStorage auth_token in sync with the rehydrated Zustand token
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
