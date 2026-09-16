import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [tableId, setTableId] = useState(() => {
    return localStorage.getItem('tableId') || '';
  });

  const [lastOrder, setLastOrder] = useState(() => {
    const saved = localStorage.getItem('lastOrder');
    return saved ? JSON.parse(saved) : null;
  });

  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (tableId) {
      localStorage.setItem('tableId', tableId);
    } else {
      localStorage.removeItem('tableId');
    }
  }, [tableId]);

  useEffect(() => {
    if (lastOrder) {
      localStorage.setItem('lastOrder', JSON.stringify(lastOrder));
    }
  }, [lastOrder]);

  const addToCart = (menuItem, quantity = 1, note = '') => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.menuItem.id === menuItem.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        if (note) updated[existingIndex].note = note;
        return updated;
      }
      return [...prevItems, { menuItem, quantity, note }];
    });
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (menuItemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.menuItem.id !== menuItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const submitOrder = async ({ customerNote = '', orderType = 'DINE_IN', overrideTableId = null, deliveryAddress = '', contactPhone = '' } = {}) => {
    if (cartItems.length === 0) {
      throw new Error("Giỏ hàng của bạn đang trống!");
    }

    setSubmittingOrder(true);
    try {
      const chosenTable = overrideTableId || tableId || null;
      const payload = {
        orderType,
        // Ăn tại bàn: dùng bàn được chọn (overrideTableId hoặc tableId) nếu có
        tableId: orderType === 'DINE_IN' && chosenTable ? Number(chosenTable) : null,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : null,
        contactPhone: orderType !== 'DINE_IN' ? contactPhone : null,
        customerNote,
        items: cartItems.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          note: item.note || '',
        })),
      };

      const response = await axiosClient.post('/customer/orders', payload);
      setLastOrder(response);
      clearCart();
      return response;
    } catch (err) {
      console.error("Lỗi đặt món:", err);
      throw err;
    } finally {
      setSubmittingOrder(false);
    }
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        tableId,
        setTableId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        submitOrder,
        submittingOrder,
        lastOrder,
        setLastOrder,
        totalItemsCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
