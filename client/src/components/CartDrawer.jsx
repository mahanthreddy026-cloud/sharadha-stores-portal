import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const totalCost = cart.reduce((sum, item) => {
    const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
    return sum + (price * item.quantity);
  }, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    // Redirect to Bulk Enquiry form with cart items pre-loaded
    navigate('/request', { state: { cartItems: cart } });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-xs">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-xl flex flex-col h-full border-l border-gray-150 dark:border-gray-800">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary-500" />
              <h3 className="font-serif font-bold text-sm text-gray-950 dark:text-white">Shopping Enquiry Cart</h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-gray-400 space-y-2">
                <ShoppingBag className="h-10 w-10 mx-auto opacity-50" />
                <p className="italic font-bold">Your cart is empty.</p>
                <p className="text-[10px] text-gray-450">Add traditional sweets and snacks to start your bulk enquiry.</p>
              </div>
            ) : (
              cart.map((item) => {
                const discountedPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl relative group"
                  >
                    {/* Product Image */}
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={item.image_url || '/images/mysurpa.jpg'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = '/images/mysurpa.jpg'; }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div className="pr-6">
                        <p className="font-serif font-bold text-gray-950 dark:text-white line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Rs. {discountedPrice.toFixed(2)} / kg</p>
                      </div>

                      {/* Quantity controller */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-lg p-1 text-gray-800 dark:text-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 5)}
                            className="p-1 hover:text-primary-500 transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-extrabold px-1 min-w-[20px] text-center">{item.quantity} kg</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 5)}
                            className="p-1 hover:text-primary-500 transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="font-bold text-gray-800 dark:text-gray-250">
                          Rs. {(discountedPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-gray-950 dark:text-white">
                <span>Estimated Items Cost</span>
                <span className="text-base text-primary-600">Rs. {totalCost.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-gray-405 leading-relaxed">
                * GST tax rates, packaging parameters, and shipping logistics charges will be added by the admin to your quotation invoice.
              </p>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                Proceed to Bulk Enquiry <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
