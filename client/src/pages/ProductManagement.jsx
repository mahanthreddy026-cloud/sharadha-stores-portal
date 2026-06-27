import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Form modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Input states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState(0);
  const [stock, setStock] = useState(100);
  const [imgUrl, setImgUrl] = useState('');
  const [catId, setCatId] = useState('');
  const [avail, setAvail] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load catalogue data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiscount(0);
    setStock(100);
    setImgUrl('');
    setCatId(categories[0]?.id || '');
    setAvail(true);
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingId(prod.id);
    setName(prod.name);
    setDescription(prod.description || '');
    setPrice(prod.price);
    setDiscount(prod.discount);
    setStock(prod.stock);
    setImgUrl(prod.image_url || '');
    setCatId(prod.category_id || '');
    setAvail(prod.availability === 1 || prod.availability === true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? It will wipe references in active orders.')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      toast.warning('Name and Price are mandatory fields.');
      return;
    }

    const payload = {
      name,
      description,
      price: parseFloat(price),
      discount: parseFloat(discount),
      stock: parseInt(stock, 10),
      image_url: imgUrl,
      category_id: catId ? parseInt(catId, 10) : null,
      availability: avail ? 1 : 0
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated.');
      } else {
        await api.post('/products', payload);
        toast.success('Product registered successfully.');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Save failed. Review credentials.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-grow max-w-md w-full">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sweets or snacks by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs border border-gray-250 dark:border-gray-850 bg-gray-55 dark:bg-gray-950 p-2.5 pl-10 rounded-xl focus:outline-none"
          />
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm inline-flex items-center gap-1 transition w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </section>

      {/* Catalogue table */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-xs text-gray-400 py-10 text-center italic">No products matched search query.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-105 dark:border-gray-800">
                  <th className="py-3 font-semibold">Product Name</th>
                  <th className="py-3 font-semibold">Category</th>
                  <th className="py-3 font-semibold">Base Price</th>
                  <th className="py-3 font-semibold">Discount</th>
                  <th className="py-3 font-semibold">Stock Qty</th>
                  <th className="py-3 font-semibold">Availability</th>
                  <th className="py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/40">
                    <td className="py-4 font-semibold text-gray-800 dark:text-gray-200">{p.name}</td>
                    <td className="py-4">{p.category_name || 'Unassigned'}</td>
                    <td className="py-4">Rs. {parseFloat(p.price).toFixed(2)}</td>
                    <td className="py-4 text-red-500">{p.discount > 0 ? `${p.discount}%` : '0%'}</td>
                    <td className="py-4">{p.stock} units</td>
                    <td className="py-4">
                      <span className={`inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        p.availability ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.availability ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-primary-650 hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-2">
              <h3 className="font-bold text-base">{editingId ? 'Edit Product Item' : 'Register New Sweet / Snack'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Product Item Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Item Category *</label>
                <select
                  value={catId}
                  onChange={(e) => setCatId(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Base Price (Rs.) *</label>
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Discount Rate (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Image Asset Link</label>
                <input
                  type="text"
                  placeholder="e.g. /images/mysurpa.jpg"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="avail"
                  checked={avail}
                  onChange={(e) => setAvail(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-200 rounded focus:ring-primary-500"
                />
                <label htmlFor="avail" className="text-xs font-bold text-gray-650">Item available for checkout</label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-xs shadow transition mt-2"
            >
              {editingId ? 'Save Changes' : 'Create Product'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
