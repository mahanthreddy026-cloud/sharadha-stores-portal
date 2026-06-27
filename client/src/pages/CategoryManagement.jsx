import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Associated product linkages will be set to Null.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category removed.');
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete category.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.warning('Category name is mandatory.');
      return;
    }

    const payload = { name, description };
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success('Category updated.');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created.');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save category.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-sm font-bold">Manage Product Categories</h2>
          <p className="text-[10px] text-gray-400">Classify Sweets, Snacks, Pickles and Podis.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm inline-flex items-center gap-1 transition"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </section>

      {/* Grid */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-xs text-gray-400 py-10 text-center italic">No categories created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-850">
                  <th className="py-3 font-semibold w-1/4">Category Name</th>
                  <th className="py-3 font-semibold w-1/2">Description</th>
                  <th className="py-3 font-semibold text-right w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/40">
                    <td className="py-4 font-bold text-gray-800 dark:text-gray-200">{c.name}</td>
                    <td className="py-4 text-gray-500">{c.description || 'No description provided.'}</td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="text-primary-650 hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-2">
              <h3 className="font-bold text-base">{editingId ? 'Edit Category' : 'Create New Category'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Category Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-xs shadow transition mt-2"
            >
              {editingId ? 'Save Changes' : 'Create Category'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
