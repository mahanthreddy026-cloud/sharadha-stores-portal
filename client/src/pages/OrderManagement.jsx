import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, 
  Filter, 
  FileText, 
  Truck, 
  CreditCard, 
  Trash2, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight,
  User,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function OrderManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Detail view state
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeOrderDetails, setActiveOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Quote form state
  const [quoteDiscount, setQuoteDiscount] = useState(0);
  const [quoteTaxRate, setQuoteTaxRate] = useState(18);
  const [quoteDelivery, setQuoteDelivery] = useState(0);
  const [quoteItems, setQuoteItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Status form state
  const [statusVal, setStatusVal] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [assignedEmp, setAssignedEmp] = useState('');

  // Dispatch form state
  const [dispPartner, setDispPartner] = useState('');
  const [dispTrack, setDispTrack] = useState('');
  const [dispEstDate, setDispEstDate] = useState('');

  // Fetch orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', {
        params: {
          search,
          status: statusFilter,
          page,
          limit: 10
        }
      });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, page]);

  // Load products list for quote items dropdown
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get('/products');
        setAllProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadProducts();
  }, []);

  // Inspect order details
  const inspectOrder = async (order) => {
    setActiveOrder(order);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/orders/${order.id}`);
      setActiveOrderDetails(res.data);
      
      // Sync form states
      setStatusVal(res.data.order.status);
      setStatusNotes('');
      setAssignedEmp(res.data.order.assigned_employee || '');
      
      if (res.data.dispatch) {
        setDispPartner(res.data.dispatch.delivery_partner || '');
        setDispTrack(res.data.dispatch.tracking_number || '');
        setDispEstDate(res.data.dispatch.estimated_delivery || '');
      } else {
        setDispPartner('');
        setDispTrack('');
        setDispEstDate('');
      }

      // Populate quote configuration draft items
      if (res.data.items && res.data.items.length > 0) {
        setQuoteItems(res.data.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })));
      } else {
        // Start with 1 empty item config
        setQuoteItems([{ product_id: '', quantity: 100, unit_price: 0 }]);
      }
      
      if (res.data.quote) {
        setQuoteDiscount(res.data.quote.discount);
        setQuoteTaxRate(res.data.quote.tax_rate);
        setQuoteDelivery(res.data.quote.delivery_charge);
      } else {
        setQuoteDiscount(0);
        setQuoteTaxRate(18);
        setQuoteDelivery(0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order inspection logs.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this bulk order request?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Order deleted successfully.');
      setActiveOrder(null);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete bulk order.');
    }
  };

  // Generate Quotation handler
  const handleGenerateQuote = async (e) => {
    e.preventDefault();
    if (!activeOrderDetails) return;

    // Filter valid items
    const validItems = quoteItems.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      toast.warning('Please configure at least one valid product item.');
      return;
    }

    try {
      const orderId = activeOrderDetails.order.id;
      const res = await api.post(`/orders/${orderId}/quote`, {
        discount: parseFloat(quoteDiscount),
        tax_rate: parseFloat(quoteTaxRate),
        delivery_charge: parseFloat(quoteDelivery),
        items: validItems
      });

      toast.success('Quotation compiled and emailed to client!');
      inspectOrder(activeOrderDetails.order);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate quotation.');
    }
  };

  // Update Status handler
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeOrderDetails) return;

    try {
      const orderId = activeOrderDetails.order.id;
      await api.put(`/orders/${orderId}/status`, {
        status: statusVal,
        notes: statusNotes,
        assigned_employee: assignedEmp
      });

      toast.success('Order status updated.');
      inspectOrder(activeOrderDetails.order);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  };

  // Update Dispatch handler
  const handleUpdateDispatch = async (e) => {
    e.preventDefault();
    if (!activeOrderDetails) return;

    try {
      const orderId = activeOrderDetails.order.id;
      await api.put(`/orders/${orderId}/dispatch`, {
        delivery_partner: dispPartner,
        tracking_number: dispTrack,
        estimated_delivery: dispEstDate,
        status: statusVal // aligns dispatch log status
      });

      toast.success('Shipping tracker details updated.');
      inspectOrder(activeOrderDetails.order);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update dispatch details.');
    }
  };

  // Quote items form handlers
  const addQuoteItemRow = () => {
    setQuoteItems([...quoteItems, { product_id: '', quantity: 100, unit_price: 0 }]);
  };

  const removeQuoteItemRow = (idx) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== idx));
  };

  const updateQuoteItemField = (idx, field, val) => {
    const nextItems = [...quoteItems];
    nextItems[idx][field] = val;
    
    // Auto populate unit price if product is selected
    if (field === 'product_id') {
      const prod = allProducts.find(p => p.id.toString() === val.toString());
      if (prod) {
        nextItems[idx]['unit_price'] = parseFloat(prod.price);
      }
    }
    setQuoteItems(nextItems);
  };

  return (
    <div className="space-y-6">
      
      {/* Search & filters bar */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, ID, company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs border border-gray-250 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 p-2.5 pl-10 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-250 dark:border-gray-850 bg-white dark:bg-gray-950 p-2.5 rounded-xl focus:outline-none flex-1 md:flex-initial"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Quotation Sent">Quotation Sent</option>
            <option value="Payment Pending">Payment Pending</option>
            <option value="Processing">Processing</option>
            <option value="Packing">Packing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </section>

      {/* Main View Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table View List */}
        <section className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm ${activeOrder ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center italic">No bulk orders found matching selection filters.</p>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="py-3 font-semibold">Request ID</th>
                    <th className="py-3 font-semibold">Customer</th>
                    {!activeOrder && <th className="py-3 font-semibold">Event</th>}
                    <th className="py-3 font-semibold">Qty</th>
                    <th className="py-3 font-semibold">Budget</th>
                    <th className="py-3 font-semibold">Status</th>
                    <th className="py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                  {orders.map((ord) => (
                    <tr 
                      key={ord.id} 
                      className={`hover:bg-gray-50/50 dark:hover:bg-gray-850/40 cursor-pointer ${activeOrder?.id === ord.id ? 'bg-primary-50/30 dark:bg-primary-950/10' : ''}`}
                      onClick={() => inspectOrder(ord)}
                    >
                      <td className="py-4 font-mono font-bold text-gray-800 dark:text-gray-200">{ord.request_id}</td>
                      <td className="py-4">
                        <p className="font-semibold">{ord.customer_name}</p>
                        <p className="text-[10px] text-gray-400">{ord.company_name || 'Individual'}</p>
                      </td>
                      {!activeOrder && <td className="py-4">{ord.event_type}</td>}
                      <td className="py-4">{ord.quantity}</td>
                      <td className="py-4">Rs. {parseFloat(ord.quote_grand_total || ord.budget).toLocaleString('en-IN')}</td>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            inspectOrder(ord);
                          }}
                          className="text-primary-650 font-bold hover:underline"
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

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-400">Page {pagination.page} of {pagination.pages}</span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPage(pagination.page - 1)}
                  className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPage(pagination.page + 1)}
                  className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Detailed Inspector Drawer */}
        {activeOrder && (
          <section className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm space-y-6 relative">
            <button 
              onClick={() => setActiveOrder(null)} 
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            {loadingDetails ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : !activeOrderDetails ? (
              <p className="text-xs text-gray-400 py-10 text-center">Failed to load detailed logs.</p>
            ) : (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="border-b border-gray-100 dark:border-gray-850 pb-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enquiry Inspector</span>
                  <h2 className="text-xl font-bold font-mono text-gray-950 dark:text-white mt-1">
                    {activeOrderDetails.order.request_id}
                  </h2>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs font-semibold text-gray-500">Status: <span className="text-primary-600">{activeOrderDetails.order.status}</span></p>
                    <button
                      onClick={() => handleDeleteOrder(activeOrderDetails.order.id)}
                      className="text-red-500 hover:text-red-600 flex items-center gap-1 text-xs font-bold transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Wipe Request
                    </button>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-gray-400">Customer Name</p>
                    <p className="font-bold flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-gray-500" />
                      {activeOrderDetails.order.customer_name}
                    </p>
                    {activeOrderDetails.order.company_name && <p className="text-[10px] text-gray-400">({activeOrderDetails.order.company_name})</p>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400">Contact Channels</p>
                    <p className="font-semibold">{activeOrderDetails.order.phone} | {activeOrderDetails.order.email}</p>
                    <p className="text-[10px] text-gray-400">Prefers: {activeOrderDetails.order.preferred_contact}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400">Event details</p>
                    <p className="font-semibold">{activeOrderDetails.order.event_type} (Date: {new Date(activeOrderDetails.order.event_date).toLocaleDateString('en-IN')})</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400">Volume & Budget</p>
                    <p className="font-semibold">{activeOrderDetails.order.quantity} packs | Target Budget: Rs. {parseFloat(activeOrderDetails.order.budget).toFixed(2)}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-1 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                    <p className="text-gray-400">Delivery Location</p>
                    <p className="font-semibold leading-relaxed">
                      {activeOrderDetails.order.delivery_address}, {activeOrderDetails.order.city}, {activeOrderDetails.order.state} - {activeOrderDetails.order.pincode}
                    </p>
                  </div>
                  {activeOrderDetails.order.message && (
                    <div className="sm:col-span-2 space-y-1">
                      <p className="text-gray-400 font-bold">Client Instructions:</p>
                      <p className="italic text-gray-500 bg-amber-50/40 p-3.5 rounded-xl border border-amber-100/30">"{activeOrderDetails.order.message}"</p>
                    </div>
                  )}
                </div>

                {/* Quotation Configurator Form */}
                <form onSubmit={handleGenerateQuote} className="border-t border-gray-150 dark:border-gray-850 pt-4 space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <FileText className="text-primary-500 h-4.5 w-4.5" />
                    Configure Quotation Details
                  </h3>
                  
                  {/* Items editor grid */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400">Line Items List</span>
                      <button
                        type="button"
                        onClick={addQuoteItemRow}
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-[10px] font-bold px-2 py-1 rounded-lg transition"
                      >
                        + Add Row
                      </button>
                    </div>

                    {quoteItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <select
                            value={item.product_id}
                            onChange={(e) => updateQuoteItemField(idx, 'product_id', e.target.value)}
                            className="w-full text-xs border border-gray-250 dark:border-gray-850 bg-gray-55 dark:bg-gray-950 p-2 rounded-lg"
                            required
                          >
                            <option value="">-- Choose product --</option>
                            {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} (Rs. {p.price})</option>)}
                          </select>
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateQuoteItemField(idx, 'quantity', parseInt(e.target.value, 10))}
                            className="w-full text-xs border border-gray-250 dark:border-gray-850 bg-gray-55 dark:bg-gray-950 p-2 rounded-lg"
                            required
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            step="any"
                            placeholder="Rate"
                            value={item.unit_price}
                            onChange={(e) => updateQuoteItemField(idx, 'unit_price', parseFloat(e.target.value))}
                            className="w-full text-xs border border-gray-250 dark:border-gray-850 bg-gray-55 dark:bg-gray-950 p-2 rounded-lg"
                            required
                          />
                        </div>
                        {quoteItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuoteItemRow(idx)}
                            className="text-red-500 p-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quote inputs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Discount (Rs.)</label>
                      <input
                        type="number"
                        value={quoteDiscount}
                        onChange={(e) => setQuoteDiscount(e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">GST Rate (%)</label>
                      <input
                        type="number"
                        value={quoteTaxRate}
                        onChange={(e) => setQuoteTaxRate(e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Delivery Charge</label>
                      <input
                        type="number"
                        value={quoteDelivery}
                        onChange={(e) => setQuoteDelivery(e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Generate & Email Quotation
                  </button>
                </form>

                {/* Workflow Status Modifier */}
                <form onSubmit={handleUpdateStatus} className="border-t border-gray-150 dark:border-gray-850 pt-4 space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Clock className="text-primary-500 h-4.5 w-4.5" />
                    Update Workflow Status Timeline
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Select Status Node</label>
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="w-full text-xs border border-gray-250 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg"
                      >
                        <option value="Pending">Pending Review</option>
                        <option value="Quotation Sent">Quotation Sent</option>
                        <option value="Approved">Approved (Awaiting deposit)</option>
                        <option value="Payment Pending">Payment Pending</option>
                        <option value="Processing">Processing (Baking)</option>
                        <option value="Packing">Packing (Baskets)</option>
                        <option value="Dispatched">Dispatched (Courier)</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Rejected">Rejected / Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Assign Employee / Staff Owner</label>
                      <input
                        type="text"
                        placeholder="Employee Name"
                        value={assignedEmp}
                        onChange={(e) => setAssignedEmp(e.target.value)}
                        className="w-full text-xs border border-gray-250 dark:border-gray-850 bg-gray-55 dark:bg-gray-950 p-2.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Timeline Transition Notes (Emailed to customer)</label>
                    <input
                      type="text"
                      placeholder="Notes for status transition timeline logs..."
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      className="w-full text-xs border border-gray-250 dark:border-gray-850 bg-gray-55 dark:bg-gray-950 p-2.5 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-750 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Update Order Status Node
                  </button>
                </form>

                {/* Dispatch updates panel */}
                {(statusVal === 'Processing' || statusVal === 'Packing' || statusVal === 'Dispatched' || statusVal === 'Delivered') && (
                  <form onSubmit={handleUpdateDispatch} className="border-t border-gray-150 dark:border-gray-850 pt-4 space-y-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Truck className="text-primary-500 h-4.5 w-4.5" />
                      Manage Shipping & Courier Dispatch logs
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Courier Partner</label>
                        <input
                          type="text"
                          placeholder="e.g. DTDC, Delhivery"
                          value={dispPartner}
                          onChange={(e) => setDispPartner(e.target.value)}
                          className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">AWB Tracking #</label>
                        <input
                          type="text"
                          placeholder="Tracking ID"
                          value={dispTrack}
                          onChange={(e) => setDispTrack(e.target.value)}
                          className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Est. Arrival Date</label>
                        <input
                          type="date"
                          value={dispEstDate ? dispEstDate.substring(0, 10) : ''}
                          onChange={(e) => setDispEstDate(e.target.value)}
                          className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2 rounded-lg"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                    >
                      Update Logistics Tracker
                    </button>
                  </form>
                )}

                {/* Payments logged list */}
                {activeOrderDetails.payments && activeOrderDetails.payments.length > 0 && (
                  <div className="border-t border-gray-150 dark:border-gray-850 pt-4 space-y-2 text-xs">
                    <h4 className="font-bold flex items-center gap-1">
                      <CreditCard className="text-primary-500 h-4 w-4" />
                      Client Payment Transcripts
                    </h4>
                    <div className="space-y-2">
                      {activeOrderDetails.payments.map((p, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg border border-gray-100 dark:border-gray-850 flex justify-between">
                          <div>
                            <p className="font-bold">{p.payment_method} - {p.status}</p>
                            {p.transaction_id && <p className="text-[10px] text-gray-400">Ref: {p.transaction_id}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">Rs. {parseFloat(p.amount).toFixed(2)}</p>
                            <p className="text-[9px] text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
