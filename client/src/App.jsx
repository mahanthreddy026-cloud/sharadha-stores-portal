import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Shop from './pages/Shop';
import GiftPackages from './pages/GiftPackages';
import BulkOrderForm from './pages/BulkOrderForm';
import TrackRequest from './pages/TrackRequest';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';

// Administrative Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OrderManagement from './pages/OrderManagement';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import Reports from './pages/Reports';

// 404 Page Component
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4 space-y-6">
      <h1 className="text-6xl font-black text-primary-600">404</h1>
      <h2 className="text-2xl font-serif font-bold text-gray-900">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        The folder destination or request link you navigated to could not be discovered on this portal.
      </p>
      <a
        href="/"
        className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow transition"
      >
        Return to Home Page
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Customer Facing Paths */}
            <Route path="/" element={<CustomerLayout><LandingPage /></CustomerLayout>} />
            <Route path="/shop" element={<CustomerLayout><Shop /></CustomerLayout>} />
            <Route path="/packages" element={<CustomerLayout><GiftPackages /></CustomerLayout>} />
            <Route path="/request" element={<CustomerLayout><BulkOrderForm /></CustomerLayout>} />
            <Route path="/track" element={<CustomerLayout><TrackRequest /></CustomerLayout>} />
            <Route path="/customer/login" element={<CustomerLayout><CustomerLogin /></CustomerLayout>} />
            <Route path="/customer/dashboard" element={<CustomerLayout><CustomerDashboard /></CustomerLayout>} />

            {/* Secure Admin Authentication Gate */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Administrative Dashboard Layouts */}
            <Route path="/admin/dashboard" element={<AdminLayout title="Dashboard Overview"><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/orders" element={<AdminLayout title="Enquiries & Quote Manager"><OrderManagement /></AdminLayout>} />
            <Route path="/admin/products" element={<AdminLayout title="Product Catalogue CRUD"><ProductManagement /></AdminLayout>} />
            <Route path="/admin/categories" element={<AdminLayout title="Categories Manager"><CategoryManagement /></AdminLayout>} />
            <Route path="/admin/reports" element={<AdminLayout title="Reports & CSV Exporters"><Reports /></AdminLayout>} />

            {/* Fallback 404 Handler */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CartProvider>

      {/* Global alert notifications trigger */}
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored"
      />
    </AuthProvider>
  );
}
