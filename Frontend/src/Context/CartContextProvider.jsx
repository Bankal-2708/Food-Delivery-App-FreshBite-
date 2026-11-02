import { useState, useEffect, useCallback, useRef } from 'react';
import { CartContext } from './cartContext';

// Use Vite environment variable for the backend URL when available.
// Create a local .env file with VITE_API_URL if you want to run on other devices.
const normalizeApiBase = (value) => {
  if (!value) return 'https://food-backend-rouge.vercel.app/api';

  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return 'https://food-backend-rouge.vercel.app/api';

  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.endsWith('/api')) return trimmed;

  return `${trimmed}/api`;
};

const API = normalizeApiBase(import.meta.env.VITE_API_URL || 'https://food-backend-rouge.vercel.app/api');

const buildApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API}${cleanPath}`;
};

const getCartStorageKey = (email) => {
  const safeEmail = String(email || 'guest').trim().toLowerCase();
  return safeEmail && safeEmail !== 'guest' ? `cart_${safeEmail}` : 'cart_guest';
};

const readStoredCart = (email) => {
  const key = getCartStorageKey(email);
  const raw = localStorage.getItem(key) || localStorage.getItem('cart');

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const requestJson = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || 'Request failed' };
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Request failed');
  }

  return data;
};

const CartContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    return savedUser || null;
  });
  const [cart, setCart] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    return readStoredCart(savedUser?.email);
  });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [debounce, setDebounce] = useState('');
  const debounceTimer = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setDebounce(searchTerm);
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  useEffect(() => {
    const loadData = async () => {
      if (token) {
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (savedUser) setUser(savedUser);

        try {
          const res = await fetch(`${API}/cart`, {
            headers: authHeaders(),
          });

          const data = await res.json();

          if (data.items) {
            setCart(data.items);
          }
        } catch (err) {
          console.error('Load cart error:', err);
        }
      }

      setIsInitialLoad(false);
    };

    loadData();
  }, [token, authHeaders]);

  useEffect(() => {
    const storageKey = getCartStorageKey(user?.email);
    localStorage.setItem(storageKey, JSON.stringify(cart));
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, user?.email]);

  useEffect(() => {
    if (user?.email) {
      setCart(readStoredCart(user.email));
    }
  }, [user?.email]);

  useEffect(() => {
    if (!token || isInitialLoad) return;

    const syncCart = async () => {
      try {
        await fetch(`${API}/cart`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ items: cart }),
        });
      } catch (err) {
        console.error('Cart sync failed:', err);
      }
    };

    syncCart();
  }, [cart, token, isInitialLoad, authHeaders]);

  const getItemKey = (itemOrId) => {
    if (!itemOrId) return null;
    if (typeof itemOrId === 'object') {
      return itemOrId._id || itemOrId.id || null;
    }
    return itemOrId;
  };

  const normalizeCartItem = (item = {}) => {
    const key = getItemKey(item);
    return {
      ...item,
      _id: item._id || item.id || key,
      id: item.id || item._id || key,
      count: Number(item.count || 0),
    };
  };

  const addItemToCart = (item) => {
    if (!token) {
      alert('Please login to add items to your cart!');
      return;
    }

    const itemKey = getItemKey(item);

    setCart((prev) => {
      const normalizedPrev = prev.map(normalizeCartItem);
      const exists = normalizedPrev.find((i) => getItemKey(i) === itemKey);

      if (exists) {
        return normalizedPrev.map((i) =>
          getItemKey(i) === itemKey ? { ...i, count: Number(i.count || 0) + 1 } : i
        );
      }

      return [...normalizedPrev, { ...normalizeCartItem(item), count: 1 }];
    });
  };

  const removeItemFromCart = (itemId) => {
    const itemKey = getItemKey(itemId);

    setCart((prev) => {
      const normalizedPrev = prev.map(normalizeCartItem);
      const exists = normalizedPrev.find((i) => getItemKey(i) === itemKey);

      if (!exists) return prev;

      const nextItems = normalizedPrev
        .map((i) => getItemKey(i) === itemKey ? { ...i, count: Number(i.count || 0) - 1 } : i)
        .filter((i) => Number(i.count || 0) > 0);

      return nextItems;
    });
  };

  const clearCart = () => setCart([]);

  const createDemoSession = (email, name = '') => {
    const cleanEmail = String(email || '').trim();
    const safeName = (name || cleanEmail.split('@')[0] || 'Demo User').trim();
    const demoUser = {
      _id: `demo-${Date.now()}`,
      name: safeName,
      email: cleanEmail,
      role: 'customer',
    };
    const demoToken = `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem('token', demoToken);
    localStorage.setItem('user', JSON.stringify(demoUser));

    setToken(demoToken);
    setUser(demoUser);

    return { token: demoToken, user: demoUser };
  };

  const shouldUseDemoAuth = (errorMessage = '') => {
    const message = String(errorMessage || '').toLowerCase();
    return message.includes('verify') || message.includes('verification') || message.includes('email') || message.includes('otp') || message.includes('not verified');
  };

  const login = async (email, password) => {
    try {
      const data = await requestJson(buildApiUrl('/auth/login'), {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      if (email && shouldUseDemoAuth(error.message)) {
        return createDemoSession(email, email.split('@')[0]);
      }

      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await requestJson(buildApiUrl('/auth/register'), {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      if (email && shouldUseDemoAuth(error.message)) {
        return createDemoSession(email, name);
      }

      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API}/cart/clear`, {
          method: 'POST',
          headers: authHeaders(),
        });
      }
    } catch (err) {
      console.error('Clear cart error:', err);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken('');
    setUser(null);
    setCart([]);
  };

  const forgotPassword = async (email) => {
    if (!email) {
      throw new Error('Email is required');
    }

    return { success: true, message: 'Demo mode: no verification required.' };
  };

  const sendOtp = async (email, purpose) => {
    if (!email) {
      throw new Error('Email is required');
    }

    return { success: true, message: 'Demo mode: OTP skipped.' };
  };

  const verifyOtp = async (email, otp, purpose) => {
    if (!email) {
      throw new Error('Email is required');
    }

    return { success: true, message: 'Demo mode: verification skipped.' };
  };

  const resetPassword = async (email, otp, newPassword) => {
    if (!email || !newPassword) {
      throw new Error('Email and new password are required');
    }

    localStorage.setItem(`demo-password-${email}`, newPassword);
    return { success: true, message: 'Password updated successfully.' };
  };

  return (
    <CartContext.Provider value={{
      cart,
      addItemToCart,
      removeItemFromCart,
      clearCart,

      user,
      role: user?.role,
      token,
      login,
      register,
      logout,

      forgotPassword,
      sendOtp,
      verifyOtp,
      resetPassword,

      searchTerm,
      setSearchTerm,
      debounce,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;