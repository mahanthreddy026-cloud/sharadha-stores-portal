import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { ShoppingCart, Search, Info } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Shop() {
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data.filter(p => p.availability === 1));
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load products catalogue.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter(prod => {
    const matchesCat = selectedCategory === 'all' || prod.category_id === parseInt(selectedCategory, 10);
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`Added 5 units of ${product.name} to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-4xl">🍬</span>
        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
          Traditional Foods & Snacks Shop
        </h2>
        <p className="text-xs text-gray-450 leading-relaxed">
          Order our premium handmade sweets and crispy savories in bulk. Add items to your cart and checkout to submit a direct bulk enquiry.
        </p>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs">
        {/* Categories filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sweets or snacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2.5 pl-10 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-400 italic">No products match your search/filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const inCart = cart.find(item => item.id === prod.id);
            const discountedPrice = prod.discount > 0 ? prod.price * (1 - prod.discount / 100) : prod.price;
            
            return (
              <div
                key={prod.id}
                className="bg-white dark:bg-gray-900 border border-gray-150/85 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group text-xs"
              >
                {/* Product image with discount badge */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={prod.image_url || '/images/mysurpa.jpg'}
                    alt={prod.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => { e.target.src = '/images/mysurpa.jpg'; }}
                  />
                  {prod.discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                      {prod.discount}% OFF
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    Stock: {prod.stock} kg
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed h-8">
                      {prod.description || 'Delicious freshly made traditional recipe delicacy prepared under hygienic environments.'}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                    <div>
                      {prod.discount > 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-sm text-primary-600">
                            Rs. {discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through">
                            Rs. {prod.price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-sm text-gray-800 dark:text-gray-200">
                          Rs. {prod.price.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[9px] text-gray-400 block font-medium">per unit / kg</span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-[10px] px-3.5 py-2.5 rounded-xl shadow-sm hover:shadow transition inline-flex items-center gap-1.5"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {inCart ? `In Cart (${inCart.quantity})` : 'Add (Min 5)'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
