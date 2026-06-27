import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  FolderPlus, 
  FileBarChart, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Product Catalogue', path: '/admin/products', icon: Utensils },
    { name: 'Categories Manager', path: '/admin/categories', icon: FolderPlus },
    { name: 'Reports & Export', path: '/admin/reports', icon: FileBarChart }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-gray-950 text-gray-300 min-h-screen flex flex-col justify-between border-r border-gray-800 shrink-0">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-gray-850">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <span className="text-xl">📦</span>
            <span className="font-serif font-bold tracking-tight text-lg bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
              Sharadha Admin
            </span>
          </Link>
        </div>
        
        <div className="px-4 py-6">
          <div className="mb-4 px-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
            Core Panel
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'hover:bg-gray-900 hover:text-white text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-850 space-y-4">
        <div className="px-2 py-1.5 bg-gray-900 rounded-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
            {admin?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="truncate">
            <p className="text-xs text-white font-bold leading-tight truncate">{admin?.username || 'Admin User'}</p>
            <p className="text-[10px] text-gray-500 truncate">{admin?.email || 'admin@sharadha.com'}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
