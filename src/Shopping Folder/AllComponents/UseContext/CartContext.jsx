import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzuNOEQ1PfE2ISH_yi_09QFtCmrWgaVa4d9HG3A0NniNKj8FvFD7xBaSajCuM6W7FS2/exec";

  // Initialize user state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('raya_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Initialize cart state
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('raya_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Initialize tracking state
  const [placedOrderCoordinates, setPlacedOrderCoordinates] = useState(() => {
    const savedCoords = localStorage.getItem('active_order_coords');
    return savedCoords ? JSON.parse(savedCoords) : null;
  });

  // Keep a reference to the latest user to prevent stale dependency closures
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Local storage synchronization hooks
  useEffect(() => {
    localStorage.setItem('raya_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('raya_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('raya_user');
    }
  }, [user]);

  useEffect(() => {
    if (placedOrderCoordinates) {
      localStorage.setItem('active_order_coords', JSON.stringify(placedOrderCoordinates));
    } else {
      localStorage.removeItem('active_order_coords');
    }
  }, [placedOrderCoordinates]);

  // Push updates to Google Sheets/Properties database
  const syncUserToCloud = async (email, fullProfileBundle) => {
    if (!email) return;
    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "syncUser",
          email: email.toLowerCase().trim(),
          profile: fullProfileBundle
        })
      });
      console.log("Cloud backup synced successfully.");
    } catch (e) {
      console.error("Cloud backup sync failed:", e);
    }
  };

  // AUTOMATIC REAL-TIME CLOUD BACKUP: Triggers every time the cart or coords modify
  useEffect(() => {
    const currentUser = userRef.current;
    if (currentUser && currentUser.email) {
      const updatedProfileBundle = {
        ...currentUser,
        savedCart: cart,
        savedCoords: placedOrderCoordinates
      };
      syncUserToCloud(currentUser.email, updatedProfileBundle);
    }
  }, [cart, placedOrderCoordinates]);

  // RESTORE EVERYTHING UPON LOGIN
  const handleUserDeviceLogin = async (email) => {
    try {
      const targetUrl = `${WEB_APP_URL}?action=getUserData&email=${encodeURIComponent(email)}`;
      const response = await fetch(targetUrl);
      const data = await response.json();
      
      if (data && !data.error) {
        // Core User data restored
        setUser(data);
        
        // Restore their items if they left any in their cart before logging out!
        if (data.savedCart && Array.isArray(data.savedCart)) {
          setCart(data.savedCart);
        } else {
          setCart([]);
        }
        
        // Restore active tracking if the order hasn't been marked delivered yet
        if (data.savedCoords) {
          setPlacedOrderCoordinates(data.savedCoords);
        } else {
          setPlacedOrderCoordinates(null);
        }
        
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error pulling database records:", error);
      return null;
    }
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === itemId);
      if (existingItem && existingItem.quantity === 1) {
        return prevCart.filter((i) => i.id !== itemId);
      }
      return prevCart.map((i) => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const clearCart = () => setCart([]);

  const login = (userData) => {
    setUser(userData);
    // If they already had items in their cart as a guest before logging in, preserve them up to the cloud bundle
    const initialBundle = { 
      ...userData, 
      savedCart: cart, 
      savedCoords: placedOrderCoordinates 
    };
    syncUserToCloud(userData.email, initialBundle);
  };

  // Absolute cleanup on Logout
  const logout = () => {
    setUser(null);
    setCart([]); 
    setPlacedOrderCoordinates(null); 
    localStorage.removeItem('raya_user');
    localStorage.removeItem('raya_cart');
    localStorage.removeItem('active_order_coords');
    alert("Logged out successfully. All local data cleared safely.");
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart, 
      user, login, logout, handleUserDeviceLogin,
      placedOrderCoordinates, setPlacedOrderCoordinates
    }}>
      {children}
      <div className="blurred-bg-layer"></div>
    </CartContext.Provider>
  );
};

export const useCart = () =>
   useContext(CartContext);