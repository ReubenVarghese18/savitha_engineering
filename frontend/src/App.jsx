import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuoteProvider } from './context/QuoteContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Page Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import TqmSection from './components/TqmSection';
import Infrastructure from './components/Infrastructure';
import RFQFooter from './components/RFQFooter';
import ProductsPage from './pages/Products';
import PDPPage from './pages/PDP';

// Admin / Auth Components
import Login from './pages/admin/Login';
import AdminLayout from './layouts/AdminLayout';
import LiveFeed from './pages/admin/LiveFeed';
import Production from './pages/admin/Production';
import AdminCatalog from './pages/admin/Catalog';
import Clients from './pages/admin/Clients';
import Service from './pages/admin/Service';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname === '/' && hash) {
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function PublicLanding() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#FF4D00] selection:text-black stark-grid">
      <Navbar />
      <main>
        <Hero />
        <Catalog />
        <TqmSection />
        <Infrastructure />
      </main>
      <RFQFooter />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QuoteProvider>
        <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLanding />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/catalog" element={<Navigate to="/products" replace />} />
          <Route path="/products/:productId" element={<PDPPage />} />
          <Route path="/admin/login" element={<Login />} />

          {/* Secure Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect /admin directly to /admin/live-feed */}
            <Route index element={<Navigate to="/admin/live-feed" replace />} />
            <Route path="live-feed" element={<LiveFeed />} />
            <Route path="production" element={<Production />} />
            <Route path="catalog" element={<AdminCatalog />} />
            <Route path="clients" element={<Clients />} />
            <Route path="service" element={<Service />} />
          </Route>

          {/* Fallback Catch-All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </QuoteProvider>
    </AuthProvider>
  );
}

export default App;

