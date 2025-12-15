import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductInfo } from '@/data/products';
import { Coupon, calculateDiscount } from '@/data/coupons';

export interface CartItem {
  product: ProductInfo;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  coupon: Coupon | null;
  addItem: (product: ProductInfo, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Inicializar do localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedItems = localStorage.getItem('bem_casado_cart');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });
  
  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const savedCoupon = localStorage.getItem('bem_casado_coupon');
      return savedCoupon ? JSON.parse(savedCoupon) : null;
    } catch {
      return null;
    }
  });

  // Salvar no localStorage quando items mudar
  useEffect(() => {
    localStorage.setItem('bem_casado_cart', JSON.stringify(items));
  }, [items]);

  // Salvar no localStorage quando coupon mudar
  useEffect(() => {
    if (coupon) {
      localStorage.setItem('bem_casado_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('bem_casado_coupon');
    }
  }, [coupon]);

  const addItem = (product: ProductInfo, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('bem_casado_cart');
    localStorage.removeItem('bem_casado_coupon');
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getDiscount = () => {
    if (!coupon) return 0;
    return calculateDiscount(coupon, getSubtotal());
  };

  const getTotalPrice = () => {
    return getSubtotal() - getDiscount();
  };

  const applyCoupon = (newCoupon: Coupon) => {
    setCoupon(newCoupon);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        coupon,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getTotalItems,
        getTotalPrice,
        getSubtotal,
        getDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
