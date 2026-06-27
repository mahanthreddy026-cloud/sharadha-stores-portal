import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogIn, LogOut, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { customer, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Gift Packages', path: '/packages' },
    { name: 'Bulk Enquiry', path: '/request' },
    customer ? { name: 'My Dashboard', path: '/customer/dashboard' } : { name: 'Track Request', path: '/track' }
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const totalCartItemsCount = cart.reduce((count, item) => count + 1, 0); // Unique items in cart

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">📦</span>
              <span className="font-serif font-bold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Sharadha Stores
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-primary-600 dark:text-primary-500 border-b-2 border-primary-500 pb-1'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-4 w-px bg-gray-200 dark:bg-gray-800"></div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-550 dark:hover:text-primary-400 transition"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalCartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white font-extrabold text-[8px] h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {totalCartItemsCount}
                  </span>
                )}
              </button>

              {customer ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <User className="h-4 w-4 text-primary-500" />
                    {customer.name.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-650 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/customer/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 transition"
                >
                  <LogIn className="h-3.5 w-3.5" /> Customer Login
                </Link>
              )}

              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-2 rounded-lg shadow-sm transition"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            </div>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-650 dark:text-gray-350"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary-600 text-white font-bold text-[8px] h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white">
                  {totalCartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium transition ${
                location.pathname === link.path
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-55 dark:text-gray-300 dark:hover:bg-gray-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-900 space-y-2">
            {customer ? (
              <div className="px-3 py-2 flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <User className="h-4 w-4 text-primary-500" /> {customer.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/customer/login"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center gap-1 w-full text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-900 font-medium py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800"
              >
                <LogIn className="h-4 w-4" /> Customer Login
              </Link>
            )}
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="flex justify-center items-center gap-1.5 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm shadow transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
