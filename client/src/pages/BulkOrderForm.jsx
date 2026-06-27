import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../services/api';
import { CheckCircle2, ChevronRight, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export default function BulkOrderForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Initialize React Hook Form
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      customer_name: '',
      company_name: '',
      phone: '',
      email: '',
      event_type: 'Festival',
      event_date: '',
      delivery_address: '',
      city: '',
      state: '',
      pincode: '',
      category_id: '',
      package_id: '',
      quantity: 50,
      budget: 15000,
      message: '',
      preferred_contact: 'Email',
      items: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Watch values for package calculations
  const selectedPackageId = watch('package_id');
  const qty = watch('quantity') || 0;

  // Load Categories, Products, and Gift Packages
  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        setCategories(catsRes.data);
        setProducts(prodsRes.data);

        // Prepopulate packages based on seed structure
        setPackages([
          { id: 1, name: 'Silver Package', price: 350 },
          { id: 2, name: 'Gold Package', price: 750 },
          { id: 3, name: 'Premium Package', price: 1250 },
          { id: 4, name: 'Luxury Package', price: 2200 }
        ]);

        // Pre-select package from URL parameter if any
        const pkgParam = searchParams.get('package');
        if (pkgParam) {
          const map = { 'Silver Package': 1, 'Gold Package': 2, 'Premium Package': 3, 'Luxury Package': 4 };
          if (map[pkgParam]) {
            setValue('package_id', map[pkgParam].toString());
          }
        }
      } catch (err) {
        console.error('Data Loading Error:', err);
        // Local fallbacks
        setCategories([
          { id: 1, name: 'Traditional Sweets' },
          { id: 2, name: 'Savory Snacks' }
        ]);
      }

      // Check if there are any cart items passed from the shop cart
      const cartItems = location.state?.cartItems;
      if (cartItems && cartItems.length > 0) {
        setValue('items', cartItems.map(item => ({
          product_id: item.id.toString(),
          quantity: item.quantity.toString()
        })));
        
        // Also pre-fill customer info if logged in
        const customerSession = JSON.parse(localStorage.getItem('customer'));
        if (customerSession) {
          setValue('customer_name', customerSession.name || '');
          setValue('company_name', customerSession.company_name || '');
          setValue('phone', customerSession.phone || '');
          setValue('email', customerSession.email || '');
        }
      }
    }
    loadData();
  }, [searchParams, setValue, location.state]);

  // Autocalculate budget if a package is selected
  useEffect(() => {
    if (selectedPackageId && packages.length > 0) {
      const pkg = packages.find(p => p.id.toString() === selectedPackageId.toString());
      if (pkg) {
        setValue('budget', pkg.price * qty);
      }
    }
  }, [selectedPackageId, qty, packages, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Map item IDs and convert types
      const payload = {
        ...data,
        category_id: data.category_id ? parseInt(data.category_id, 10) : null,
        package_id: data.package_id ? parseInt(data.package_id, 10) : null,
        quantity: parseInt(data.quantity, 10),
        budget: parseFloat(data.budget),
        items: data.items.map(item => {
          const prodObj = products.find(p => p.id.toString() === item.product_id.toString());
          return {
            product_id: parseInt(item.product_id, 10),
            quantity: parseInt(item.quantity, 10),
            unit_price: prodObj ? parseFloat(prodObj.price) : 0
          };
        })
      };

      const res = await api.post('/orders', payload);
      setSuccessData({
        request_id: res.data.request_id,
        customer_name: data.customer_name
      });
      toast.success('Bulk enquiry submitted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Submission failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-8">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Request Received!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Thank you, <span className="font-semibold text-gray-700 dark:text-gray-300">{successData.customer_name}</span>. Your request has been logged.
          </p>
        </div>

        <div className="bg-gray-55 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 max-w-md mx-auto space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Your Unique Request ID</p>
            <p className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-500 mt-1">{successData.request_id}</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Write down this Request ID to track the real-time review timeline, check quotations, and execute payments. A copy has been simulated to your email.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(`/track?requestId=${successData.request_id}`)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition"
          >
            Track Request Status
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-55 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-xl transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="space-y-4 mb-10 text-center md:text-left">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary-500 font-semibold transition">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Bulk Order Enquiry Portal</h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Enter event parameters, pick standard corporate gift packages or add custom sweet selections to generate a quotation request.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-850 p-6 md:p-10 shadow-sm space-y-8">
        
        {/* Contact details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-gray-100 dark:border-gray-850 pb-2 text-primary-600">1. Client Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Customer Full Name *</label>
              <input 
                {...register('customer_name', { required: 'Full name is required' })} 
                type="text" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
              {errors.customer_name && <p className="text-[10px] text-red-500 mt-1">{errors.customer_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Company / Organization Name (Optional)</label>
              <input 
                {...register('company_name')} 
                type="text" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile Contact Phone *</label>
              <input 
                {...register('phone', { required: 'Mobile phone is required' })} 
                type="tel" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
              {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address *</label>
              <input 
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })} 
                type="email" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Event parameters */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-gray-100 dark:border-gray-850 pb-2 text-primary-600">2. Event & Delivery Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Event Category *</label>
              <select 
                {...register('event_type')}
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              >
                <option value="Wedding">Wedding Celebration</option>
                <option value="Corporate Gift">Corporate Gift Hampers</option>
                <option value="Office Event">Office Event / Meeting</option>
                <option value="Return Gift">Return Gifting Hamper</option>
                <option value="Birthday">Birthday Party</option>
                <option value="Festival">Festival Celebration</option>
                <option value="Other">Other Events</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery / Event Date *</label>
              <input 
                {...register('event_date', { required: 'Event date is required' })} 
                type="date" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
              {errors.event_date && <p className="text-[10px] text-red-500 mt-1">{errors.event_date.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Preferred Notification Channel</label>
              <select 
                {...register('preferred_contact')}
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              >
                <option value="Email">Email</option>
                <option value="Phone">Phone Calls</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Full Delivery Site Address *</label>
              <input 
                {...register('delivery_address', { required: 'Address is required' })} 
                type="text" 
                placeholder="Building No, Street Name"
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
              {errors.delivery_address && <p className="text-[10px] text-red-500 mt-1">{errors.delivery_address.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">City *</label>
              <input 
                {...register('city', { required: 'City is required' })} 
                type="text" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">State *</label>
              <input 
                {...register('state', { required: 'State is required' })} 
                type="text" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pincode *</label>
              <input 
                {...register('pincode', { required: 'Pincode is required' })} 
                type="text" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quantities */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-gray-100 dark:border-gray-850 pb-2 text-primary-600">3. Gift Package & Volumes</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pick Gift Package (Optional)</label>
              <select 
                {...register('package_id')}
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              >
                <option value="">-- Select Package --</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.name} (Rs. {p.price})</option>)}
                <option value="">Custom Selection Below</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Product Category Filter</label>
              <select 
                {...register('category_id')}
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity Requested *</label>
              <input 
                {...register('quantity', { required: true, min: 25 })} 
                type="number" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Target Budget Limit (Rs.) *</label>
              <input 
                {...register('budget', { required: true })} 
                type="number" 
                className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Custom products array */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-2">
            <h3 className="text-lg font-bold text-primary-600">4. Custom Product Items Selector</h3>
            <button
              type="button"
              onClick={() => append({ product_id: '', quantity: 1 })}
              className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 text-xs px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="h-3 w-3" /> Add Item
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No custom items added. Leave empty to request general package configuration.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Select Sweet/Savory Item</label>
                    <select
                      {...register(`items.${index}.product_id`, { required: 'Please select a product' })}
                      className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Rs. {p.price})</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Pack Qty</label>
                    <input
                      {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                      type="number"
                      className="w-full text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 p-2.5 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-500">Special Instructions / Custom Notes</label>
          <textarea 
            {...register('message')} 
            rows={3} 
            placeholder="Tell us about branding box inserts, custom messages, or special packing choices..."
            className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl focus:border-primary-500 focus:outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition duration-200"
        >
          {submitting ? 'Submitting Enquiry...' : 'Submit Quotation Request'}
        </button>
      </form>
    </div>
  );
}
