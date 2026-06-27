import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function Login() {
  const { login, admin } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.message || 'Login failed.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.warning('Please specify your registered email.');
      return;
    }

    setSendingReset(true);
    try {
      const res = await api.post('/forgot-password', { email: forgotEmail });
      toast.success(res.data.message || 'Password reset details dispatched.');
      setShowForgot(false);
      setForgotEmail('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Password recovery failed.');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-primary-100 dark:bg-primary-950/40 text-primary-650 dark:text-primary-500 items-center justify-center mx-auto">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Admin Portal Login</h2>
          <p className="text-xs text-gray-400">Sharadha Stores Bulk Management Console</p>
        </div>

        {showForgot ? (
          /* Forgot Password Interface */
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="email"
                  placeholder="admin@sharadhastores.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 pl-10 rounded-xl focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingReset}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl text-xs transition duration-200"
            >
              {sendingReset ? 'Sending Recovery Mail...' : 'Send Recovery Email'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="w-full text-center text-xs text-gray-400 hover:text-primary-500 font-semibold mt-2"
            >
              Cancel and Return
            </button>
          </form>
        ) : (
          /* Standard Login Interface */
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500">Username or Email</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="admin / admin@sharadha.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 pl-10 rounded-xl focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-gray-500">Master Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[10px] text-primary-500 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 pl-10 rounded-xl focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg hover:shadow-xl transition duration-200"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Info panel */}
        <div className="flex gap-2 p-3 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/40 rounded-xl text-[10px] text-primary-700 dark:text-primary-400">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <p>
            Default credentials for this prototype evaluation are: <span className="font-bold">admin</span> with password <span className="font-bold">admin123</span>.
          </p>
        </div>

      </div>
    </div>
  );
}
