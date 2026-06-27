import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileDown, Download, Award, Users, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.get('/reports');
        setReportData(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to aggregate report files.');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // Utility helper to export JavaScript objects array to CSV
  const downloadCSV = (arrayData, headers, filename) => {
    if (!arrayData || !arrayData.length) {
      toast.warning('No data records available to compile CSV.');
      return;
    }

    const csvRows = [];
    // Add header row
    csvRows.push(headers.join(','));

    // Map content rows
    for (const row of arrayData) {
      const values = headers.map(header => {
        const val = row[header.toLowerCase().replace(/ /g, '_')];
        const escaped = ('' + (val === undefined || val === null ? '' : val)).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}-${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Download started.');
  };

  const exportOrders = () => {
    const data = reportData?.orders || [];
    const headers = ['Request ID', 'Customer Name', 'Company Name', 'Phone', 'Email', 'Event Type', 'Event Date', 'Quantity', 'Budget', 'Status', 'Quote Grand Total'];
    // Map headers to DB matches
    const mapped = data.map(o => ({
      request_id: o.request_id,
      customer_name: o.customer_name,
      company_name: o.company_name || 'N/A',
      phone: o.phone,
      email: o.email,
      event_type: o.event_type,
      event_date: o.event_date,
      quantity: o.quantity,
      budget: o.budget,
      status: o.status,
      quote_grand_total: o.quote_grand_total || o.budget
    }));
    downloadCSV(mapped, ['Request_ID', 'Customer_Name', 'Company_Name', 'Phone', 'Email', 'Event_Type', 'Event_Date', 'Quantity', 'Budget', 'Status', 'Quote_Grand_Total'], 'orders-summary');
  };

  const exportCustomers = () => {
    const data = reportData?.customers || [];
    const headers = ['Name', 'Email', 'Phone', 'Company Name', 'Total Orders', 'Total Spend'];
    const mapped = data.map(c => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      company_name: c.company_name || 'N/A',
      total_orders: c.total_orders,
      total_spend: c.total_spend
    }));
    downloadCSV(mapped, ['Name', 'Email', 'Phone', 'Company_Name', 'Total_Orders', 'Total_Spend'], 'customers-ledger');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const topProducts = reportData?.topProducts || [];
  const customers = reportData?.customers || [];
  const orders = reportData?.orders || [];

  return (
    <div className="space-y-8">
      
      {/* Cards header triggers */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-sm flex justify-between items-center">
          <div className="space-y-2">
            <Users className="h-8 w-8 text-primary-55" />
            <h3 className="text-base font-bold">Client Accounts Summary</h3>
            <p className="text-[10px] text-gray-400">Ledgers tracking lifetime ordering histories and budgets settled.</p>
          </div>
          <button 
            onClick={exportCustomers}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-900 dark:text-gray-250 font-bold text-xs p-3 rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-sm flex justify-between items-center">
          <div className="space-y-2">
            <ShoppingBag className="h-8 w-8 text-secondary-55" />
            <h3 className="text-base font-bold">Bulk Orders Ledger</h3>
            <p className="text-[10px] text-gray-400">Total sheet records of enquiries, client parameters, and final invoices.</p>
          </div>
          <button 
            onClick={exportOrders}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-900 dark:text-gray-250 font-bold text-xs p-3 rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top selling sweets */}
        <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-primary-500" />
            Top Selling Food Products
          </h3>
          <div className="overflow-x-auto">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-450 italic py-6 text-center">No catalog items sold in bulk orders yet.</p>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="py-2.5 font-semibold">Product Name</th>
                    <th className="py-2.5 font-semibold">Base Price</th>
                    <th className="py-2.5 font-semibold text-right">Volume Ordered</th>
                    <th className="py-2.5 font-semibold text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                  {topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/20">
                      <td className="py-3 font-semibold">{p.name}</td>
                      <td className="py-3">Rs. {parseFloat(p.price).toFixed(2)}</td>
                      <td className="py-3 text-right">{p.total_quantity} units</td>
                      <td className="py-3 text-right font-bold text-emerald-600">Rs. {parseFloat(p.total_revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Top spending customers */}
        <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-primary-500" />
            Customer Spend Ledgers
          </h3>
          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <p className="text-xs text-gray-455 italic py-6 text-center">No customer logs recorded.</p>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="py-2.5 font-semibold">Client Name</th>
                    <th className="py-2.5 font-semibold">Company</th>
                    <th className="py-2.5 font-semibold text-right">Total Enquiries</th>
                    <th className="py-2.5 font-semibold text-right">Settled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                  {customers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/20">
                      <td className="py-3">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-[10px] text-gray-400">{c.email}</p>
                      </td>
                      <td className="py-3">{c.company_name || 'Individual'}</td>
                      <td className="py-3 text-right">{c.total_orders} orders</td>
                      <td className="py-3 text-right font-bold text-emerald-600">Rs. {parseFloat(c.total_spend).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
