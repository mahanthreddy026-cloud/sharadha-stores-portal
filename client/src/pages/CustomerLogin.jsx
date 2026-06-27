import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, ShieldAlert, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CustomerLogin() {
  const { customerLogin, customerRegister, customer } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (customer) {
      navigate('/customer/dashboard');
    }
  }, [customer, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      if (!name || !phone || !email || !password) {
        toast.warning('Please complete all mandatory fields.');
        setLoading(false);
        return;
      }
      const res = await customerRegister(name, company, phone, email, password);
      if (res.success) {
        toast.success(res.message || 'Account created successfully! Please log in.');
        setIsRegister(false);
      } else {
        toast.error(res.message);
      }
    } else {
      if (!email || !password) {
        toast.warning('Please specify your credentials.');
        setLoading(false);
        return;
      }
      const res = await customerLogin(email, password);
      if (res.success) {
        toast.success('Welcome back to Sharadha Stores!');
        navigate('/customer/dashboard');
      } else {
        toast.error(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
        
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 font-semibold transition">
          <ArrowLeft className="h-3 w-3" /> Home
        </button>

        <div className="text-center space-y-2">
          <span className="text-3xl">🛍️</span>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
            {isRegister ? 'Create Customer Account' : 'Customer Gifting Portal'}
          </h2>
          <p className="text-xs text-gray-450">
            {isRegister ? 'Register to manage all bulk enquiries in one place' : 'Sign in to review quotes and track timelines'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="block text-gray-500 font-bold mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 pl-10 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-500 font-bold mb-1">Mobile Contact Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 pl-10 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-500 font-bold mb-1">Company / Organization (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 pl-10 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="block text-gray-500 font-bold mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="customer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 pl-10 rounded-xl focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-gray-500 font-bold mb-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 pl-10 rounded-xl focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl shadow-md transition duration-200 mt-2"
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Log In'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-primary-500 hover:underline font-semibold"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account yet? Register"}
          </button>
        </div>

        {/* Info panel */}
        {!isRegister && (
          <div className="flex gap-2 p-3 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/40 rounded-xl text-[10px] text-primary-700 dark:text-primary-400">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <p>
              Use seeded customer credentials: <span className="font-bold">customer@gmail.com</span> with password <span className="font-bold">customer123</span>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
