import { create } from 'zustand';

const AUTO_HIDE_MS = 2260;

const EMPTY_TOAST = {
  type: 'info',
  title: '',
  message: '',
  action: null,
};

const showTimedToast = (set, get, timerKey, visibleKey, toastKey, toastValue, duration = AUTO_HIDE_MS) => {
  const existing = get()[timerKey];
  if (existing) clearTimeout(existing);

  set({
    [visibleKey]: true,
    [toastKey]: toastValue,
    [timerKey]: null,
  });

  const timer = setTimeout(() => set({
    [visibleKey]: false,
    [toastKey]: EMPTY_TOAST,
    [timerKey]: null,
  }), duration);

  set({ [timerKey]: timer });
};

export const useToastStore = create((set, get) => ({
  cartVisible: false,
  cartToast: EMPTY_TOAST,
  _cartTimer: null,

  showToast: ({ type = 'info', title = '', message = '', action = null, duration } = {}) => {
    showTimedToast(set, get, '_cartTimer', 'cartVisible', 'cartToast', {
      type,
      title,
      message,
      action,
    }, duration);
  },

  showCartToast: () => {
    showTimedToast(set, get, '_cartTimer', 'cartVisible', 'cartToast', {
      type: 'success',
      title: '🛒 Added to Cart',
      message: '',
      action: 'view-cart',
    });
  },

  hideCartToast: () => {
    const existing = get()._cartTimer;
    if (existing) clearTimeout(existing);
    set({ cartVisible: false, cartToast: EMPTY_TOAST, _cartTimer: null });
  },

  wishlistVisible: false,
  wishlistType: 'add',
  wishlistToast: EMPTY_TOAST,
  _wishlistTimer: null,

  showWishlistToast: (type = 'add') => {
    showTimedToast(set, get, '_wishlistTimer', 'wishlistVisible', 'wishlistToast', (
      type === 'remove'
        ? {
            type: 'info',
            title: '💔 Removed from Wishlist',
            message: '',
            action: null,
          }
        : {
            type: 'success',
            title: '❤️ Added to Wishlist',
            message: '',
            action: null,
          }
    ));

    set({ wishlistType: type });
  },

  hideWishlistToast: () => {
    const existing = get()._wishlistTimer;
    if (existing) clearTimeout(existing);
    set({
      wishlistVisible: false,
      wishlistToast: EMPTY_TOAST,
      _wishlistTimer: null,
    });
  },
}));
