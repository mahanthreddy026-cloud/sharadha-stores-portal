import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ShoppingBag, 
  Hourglass, 
  CheckSquare, 
  XSquare, 
  BadgeIndianRupee, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { toast } from 'react-toastify';

const COLORS = ['#ea580c', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#64748b', '#ef4444'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard metrics.');
        // Set mock dashboard data in case backend is loading/empty
        setStats({
          counters: { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0, revenue: 0 },
          charts: { monthly: [], status: [] },
          latestOrders: []
        });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const counters = stats?.counters || { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0, revenue: 0 };
  const monthlyData = stats?.charts?.monthly || [];
  const statusData = stats?.charts?.status || [];
  const latestOrders = stats?.latestOrders || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-3xl text-white shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold">Sharadha Store Dashboard</h2>
          <p className="text-xs text-gray-400">Traditional food operations and corporate gift portal metrics overview.</p>
        </div>
        <Link 
          to="/admin/orders" 
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 transition"
        >
          Manage Enquiries <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Enquiries</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{counters.total}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Pending</p>
            <p className="text-2xl font-black text-amber-500">{counters.pending}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-55/10 text-amber-600 flex items-center justify-center">
            <Hourglass className="h-5 w-5" />
          </div>
        </div>

        {/* Processing */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Approved</p>
            <p className="text-2xl font-black text-blue-500">{counters.approved}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-55/10 text-blue-600 flex items-center justify-center">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Completed</p>
            <p className="text-2xl font-black text-emerald-500">{counters.completed}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-55/10 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Settled Rev.</p>
            <p className="text-xl font-black text-primary-600 dark:text-primary-400">Rs. {counters.revenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary-55/10 text-primary-600 flex items-center justify-center">
            <BadgeIndianRupee className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trend Area Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            Monthly Revenue Trend (Rs.)
          </h3>
          <div className="h-72">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No chart data logged.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={10} stroke="#94a3b8" />
                  <YAxis fontSize={10} stroke="#94a3b8" />
                  <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Status Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold">Order Status Distribution</h3>
          <div className="h-72 flex justify-center items-center">
            {statusData.length === 0 ? (
              <div className="text-xs text-gray-400">No status division records.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} fontSize={10} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Latest Enquiries Table */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold">Recent Bulk Requests</h3>
          <Link to="/admin/orders" className="text-xs text-primary-500 font-bold hover:underline">View All Orders</Link>
        </div>
        
        <div className="overflow-x-auto">
          {latestOrders.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center italic">No bulk order enquiries submitted yet.</p>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-3 font-semibold">Request ID</th>
                  <th className="py-3 font-semibold">Customer</th>
                  <th className="py-3 font-semibold">Event</th>
                  <th className="py-3 font-semibold">Budget</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {latestOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/40">
                    <td className="py-4 font-mono font-bold text-gray-850 dark:text-gray-200">{ord.request_id}</td>
                    <td className="py-4 font-medium">{ord.customer_name}</td>
                    <td className="py-4">{ord.event_type}</td>
                    <td className="py-4">Rs. {parseFloat(ord.quote_grand_total || ord.budget).toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        ord.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        ord.status === 'Quotation Sent' ? 'bg-blue-100 text-blue-700' :
                        ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders?search=${ord.request_id}`)}
                        className="bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg transition"
                      >
                        Inspect
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
