import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

const PrivacyPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.TermsPage })));
const ContactPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.ContactPage })));

// Admin / Auth Components (lazy-loaded so public visitors never download them)
const Login = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const LiveFeed = lazy(() => import('./pages/admin/LiveFeed'));
const Production = lazy(() => import('./pages/admin/Production'));
const AdminCatalog = lazy(() => import('./pages/admin/Catalog'));
const Clients = lazy(() => import('./pages/admin/Clients'));
const Service = lazy(() => import('./pages/admin/Service'));

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
    <div className="min-h-screen overflow-x-clip bg-[#0A0A0B] text-white selection:bg-[#FF4D00] selection:text-black stark-grid">
      <Helmet>
        <title>Savitha Engineering | Industrial Furnaces &amp; Ovens Since 1976</title>
        <meta name="description" content="Manufacturer of extreme-performance industrial furnaces, specialized melting systems and heavy-duty thermal ovens, built to international standards since 1976." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Savitha Engineering | Industrial Furnaces &amp; Ovens Since 1976" />
        <meta property="og:description" content="Manufacturer of extreme-performance industrial furnaces, specialized melting systems and heavy-duty thermal ovens, built to international standards since 1976." />
      </Helmet>
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
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B]" />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLanding />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/catalog" element={<Navigate to="/products" replace />} />
          <Route path="/products/:productId" element={<PDPPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
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
        </Suspense>
        </BrowserRouter>
      </QuoteProvider>
    </AuthProvider>
  );
}

export default App;

