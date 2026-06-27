import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Search, Calendar, FileText, Landmark, Truck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TrackRequest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryId, setQueryId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Payment form states
  const [payMethod, setPayMethod] = useState('UPI');
  const [transId, setTransId] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const requestIdFromUrl = searchParams.get('requestId');

  useEffect(() => {
    if (requestIdFromUrl) {
      setQueryId(requestIdFromUrl);
      fetchTracking(requestIdFromUrl);
    }
  }, [requestIdFromUrl]);

  async function fetchTracking(id) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrderData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not find a request matching that ID.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (!queryId.trim()) return;
    setSearchParams({ requestId: queryId.trim() });
  };

  const handleApproveAndPay = async (e) => {
    e.preventDefault();
    if (!orderData) return;
    if (!transId.trim()) {
      toast.warning('Please enter a Transaction / Reference ID.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const orderId = orderData.order.id;
      const quoteTotal = orderData.quote ? orderData.quote.grand_total : orderData.order.quote_grand_total;

      await api.post(`/orders/${orderId}/payment`, {
        amount: parseFloat(quoteTotal),
        payment_method: payMethod,
        transaction_id: transId,
        status: 'Completed'
      });

      toast.success('Payment submitted successfully. Order is now processing.');
      // Reload details
      await fetchTracking(orderData.order.request_id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to log payment. Please try again.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Timeline list setup
  const timelineSteps = [
    { label: 'Pending', desc: 'Enquiry received' },
    { label: 'Quotation Sent', desc: 'Price proposal dispatched' },
    { label: 'Payment Pending', desc: 'Awaiting client deposit' },
    { label: 'Processing', desc: 'Cooking & preparation' },
    { label: 'Packing', desc: 'Hamper box labeling' },
    { label: 'Dispatched', desc: 'In-transit with courier' },
    { label: 'Delivered', desc: 'Handed over' }
  ];

  const getStepIndex = (status) => {
    if (status === 'Approved') return 2; // Maps to Payment Pending
    const map = {
      'Pending': 0,
      'Quotation Sent': 1,
      'Payment Pending': 2,
      'Processing': 3,
      'Packing': 4,
      'Dispatched': 5,
      'Delivered': 6
    };
    return map[status] !== undefined ? map[status] : -1;
  };

  const activeIndex = orderData ? getStepIndex(orderData.order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-10">
      
      {/* Search panel */}
      <section className="text-center space-y-4 max-w-xl mx-auto">
        <h1 className="font-serif text-3xl font-bold">Track Your Bulk Order Request</h1>
        <p className="text-xs text-gray-500">
          Enter the unique Request ID (e.g., SRD-2026...) provided upon submission to track quotation review, approve rates, and verify dispatches.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Request ID (e.g. SRD-20260627-1234)"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            className="flex-1 text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 rounded-xl focus:border-primary-500 focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 rounded-xl shadow-sm inline-flex items-center gap-1 transition"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </form>
      </section>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      )}

      {/* Details viewport */}
      {orderData && (
        <div className="space-y-8">
          
          {/* Order Header Summary */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2">
              <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                orderData.order.status === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-950/20' : 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400'
              }`}>
                Status: {orderData.order.status}
              </span>
              <h2 className="text-xl font-bold font-mono">{orderData.order.request_id}</h2>
              <p className="text-xs text-gray-400">
                Customer: <span className="font-semibold text-gray-700 dark:text-gray-300">{orderData.order.customer_name}</span> | Type: {orderData.order.event_type}
              </p>
            </div>
            <div className="text-left md:text-right space-y-1">
              <p className="text-xs text-gray-400">Event Date</p>
              <p className="text-sm font-bold flex items-center md:justify-end gap-1 text-gray-850 dark:text-white">
                <Calendar className="h-4 w-4 text-primary-500" />
                {new Date(orderData.order.event_date).toLocaleDateString('en-IN')}
              </p>
              <p className="text-xs text-gray-400 mt-2">Target Volume</p>
              <p className="text-sm font-bold">{orderData.order.quantity} packs</p>
            </div>
          </div>

          {/* Workflow Timeline */}
          {orderData.order.status !== 'Rejected' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold">Workflow Status Timeline</h3>
              
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-2 pt-2">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = idx <= activeIndex;
                  const isActive = idx === activeIndex;
                  
                  return (
                    <div key={idx} className="flex md:flex-col items-center md:text-center flex-1 w-full relative z-10">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCompleted 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                      } ${isActive ? 'ring-4 ring-primary-100 dark:ring-primary-950/40' : ''}`}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="ml-4 md:ml-0 md:mt-2 text-left md:text-center">
                        <p className={`text-xs font-bold ${isCompleted ? 'text-gray-950 dark:text-white' : 'text-gray-450 dark:text-gray-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-gray-400">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quotation Panel */}
          {orderData.quote && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileText className="text-primary-500 h-5 w-5" />
                  Received Quotation
                </h3>
                <a
                  href={`http://localhost:5000${orderData.quote.generated_pdf_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Download PDF Quote
                </a>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50 dark:border-gray-850">
                        <td className="py-3 font-semibold">{item.name}</td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">Rs. {parseFloat(item.unit_price).toFixed(2)}</td>
                        <td className="py-3 text-right">Rs. {(item.quantity * item.unit_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price summary block */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-end">
                <div className="w-64 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="text-red-500">-Rs. {parseFloat(orderData.quote.discount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({orderData.quote.tax_rate}%):</span>
                    <span>Rs. {((orderData.quote.grand_total - orderData.quote.delivery_charge + orderData.quote.discount) * (orderData.quote.tax_rate / 118)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logistics Fee:</span>
                    <span>Rs. {parseFloat(orderData.quote.delivery_charge).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white pt-2 border-t border-gray-50 dark:border-gray-850">
                    <span>Grand Total:</span>
                    <span>Rs. {parseFloat(orderData.quote.grand_total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Acceptance & Payment Gate */}
              {orderData.order.status === 'Quotation Sent' && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Approve Quote & Log Payment</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-1">
                      To lock in this quotation, make a 50% deposit or full settlement of <span className="font-bold">Rs. {parseFloat(orderData.quote.grand_total).toFixed(2)}</span> via Bank Transfer or UPI, then submit your transaction reference.
                    </p>
                  </div>

                  <form onSubmit={handleApproveAndPay} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-1">Select Payment Method</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        className="w-full text-xs border border-amber-200 dark:border-amber-900 bg-white dark:bg-gray-900 p-2.5 rounded-lg focus:outline-none"
                      >
                        <option value="UPI">UPI Transfer (GPay/PhonePe)</option>
                        <option value="Bank Transfer">NEFT/IMPS Bank Transfer</option>
                        <option value="Card">Credit/Debit Card payment</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-1">Transaction Ref / UTR ID</label>
                      <input
                        type="text"
                        placeholder="UTR / Txn Ref Number"
                        value={transId}
                        onChange={(e) => setTransId(e.target.value)}
                        className="w-full text-xs border border-amber-200 dark:border-amber-900 bg-white dark:bg-gray-900 p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm hover:shadow-md transition w-full disabled:bg-gray-400"
                    >
                      {submittingPayment ? 'Submitting...' : 'Approve & Pay'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Dispatch Logs */}
          {orderData.dispatch && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Truck className="text-primary-500 h-5 w-5" />
                Dispatch & Shipping Tracking
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-gray-400">Logistics Partner</p>
                  <p className="font-semibold">{orderData.dispatch.delivery_partner || 'Assigning courier partner...'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400">AWB Tracking Number</p>
                  <p className="font-semibold">{orderData.dispatch.tracking_number || 'Awaiting dispatch manifest...'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400">Estimated Delivery</p>
                  <p className="font-semibold">
                    {orderData.dispatch.estimated_delivery 
                      ? new Date(orderData.dispatch.estimated_delivery).toLocaleDateString('en-IN') 
                      : 'Calculating arrival window...'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400">Delivery Status</p>
                  <p className="font-semibold text-primary-600">{orderData.dispatch.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status logs history */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Clock className="text-primary-500 h-5 w-5" />
              Request Status Updates History
            </h3>
            <div className="space-y-4">
              {orderData.history.map((hist, idx) => (
                <div key={idx} className="flex gap-4 items-start text-xs border-l-2 border-gray-100 dark:border-gray-800 pl-4 relative">
                  <span className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-primary-500"></span>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-950 dark:text-white">{hist.status}</p>
                    <p className="text-gray-500">{hist.notes}</p>
                    <p className="text-[10px] text-gray-400">{new Date(hist.created_at).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
