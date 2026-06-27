import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShoppingBag, ArrowRight, User, Phone, Mail, Landmark } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CustomerDashboard() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerOrders() {
      try {
        const res = await api.get('/customer/orders');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load your bulk orders history.');
      } finally {
        setLoading(false);
      }
    }
    if (customer) {
      loadCustomerOrders();
    }
  }, [customer]);

  const handleLogout = () => {
    logout();
    navigate('/customer/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Aggregate numbers
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Rejected').length;
  const totalSpend = orders
    .filter(o => o.status !== 'Rejected')
    .reduce((sum, o) => sum + parseFloat(o.quote_grand_total || o.budget || 0), 0);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold">Welcome Back, {customer?.name}!</h2>
          <p className="text-xs text-gray-400">Manage your traditional food bulk order quotes and track timelines.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/request"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition"
          >
            New Bulk Request
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-5 rounded-2xl shadow-sm text-xs space-y-2">
          <p className="font-bold text-primary-600">Client Profile Details</p>
          <div className="space-y-1 text-gray-500 dark:text-gray-450">
            <p className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
              <User className="h-3.5 w-3.5" /> {customer?.name}
            </p>
            {customer?.company_name && <p className="text-[10px] italic">({customer.company_name})</p>}
            <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {customer?.email}</p>
            <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {customer?.phone}</p>
          </div>
        </div>

        {/* Counter cards */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Enquiries</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{totalOrders}</p>
          </div>
          <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Requests</p>
            <p className="text-2xl font-black text-amber-500">{activeOrders}</p>
          </div>
          <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-amber-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Cost</p>
            <p className="text-xl font-black text-emerald-600">Rs. {totalSpend.toLocaleString('en-IN')}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-600">
            <Landmark className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold">Your Bulk Enquiries history</h3>
        
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <p className="text-xs text-gray-400 py-10 text-center italic">
              You haven't submitted any bulk order requests yet. Click "New Bulk Request" to begin!
            </p>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-3 font-semibold">Request ID</th>
                  <th className="py-3 font-semibold">Event Type</th>
                  <th className="py-3 font-semibold">Event Date</th>
                  <th className="py-3 font-semibold">Quantity</th>
                  <th className="py-3 font-semibold">Total Cost</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850 text-gray-700 dark:text-gray-300">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/40">
                    <td className="py-4 font-mono font-bold text-gray-850 dark:text-gray-200">{ord.request_id}</td>
                    <td className="py-4 font-semibold">{ord.event_type}</td>
                    <td className="py-4">{new Date(ord.event_date).toLocaleDateString('en-IN')}</td>
                    <td className="py-4">{ord.quantity} packs</td>
                    <td className="py-4">Rs. {parseFloat(ord.quote_grand_total || ord.budget).toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        ord.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        ord.status === 'Quotation Sent' ? 'bg-blue-100 text-blue-700' :
                        ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                        ord.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate(`/track?requestId=${ord.request_id}`)}
                        className="bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                      >
                        Track Timeline <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </div>
  );
}
