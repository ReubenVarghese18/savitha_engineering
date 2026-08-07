import React, { createContext, useContext, useState, useEffect } from 'react';

const QuoteContext = createContext(null);

export function QuoteProvider({ children }) {
  const [selectedProducts, setSelectedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('quoteCart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse quoteCart from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('quoteCart', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const addProductToQuote = (product) => {
    setSelectedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeProductFromQuote = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearQuote = () => {
    setSelectedProducts([]);
  };

  const isProductInQuote = (productId) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  return (
    <QuoteContext.Provider
      value={{
        selectedProducts,
        addProductToQuote,
        removeProductFromQuote,
        clearQuote,
        isProductInQuote,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}
