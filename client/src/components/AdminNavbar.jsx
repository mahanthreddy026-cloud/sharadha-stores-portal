import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar({ title }) {
  const { admin } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 transition-colors duration-200">
      <div>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
          {title || 'Dashboard'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-355 relative p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary-500 rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-850"></div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {admin?.username || 'System Admin'}
            </p>
            <p className="text-[10px] text-gray-400">Sharadha Stores</p>
          </div>
        </div>
      </div>
    </header>
  );
}
