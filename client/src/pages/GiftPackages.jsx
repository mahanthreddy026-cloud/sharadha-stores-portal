import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Check, ArrowRight } from 'lucide-react';

export default function GiftPackages() {
  const navigate = useNavigate();

  const packagesData = [
    {
      id: 'silver',
      name: 'Silver Package',
      price: 350,
      image: '📦',
      desc: 'An excellent choice for general festival greetings, family events, and wedding return gifts.',
      features: [
        'Ghee Mysurpa (250g)',
        'Traditional Kai Murukku (200g)',
        'Hot Butter Mixture (200g)',
        'Premium Cardboard Gift Box',
        'Standard Greeting Card'
      ],
      badge: 'Economic'
    },
    {
      id: 'gold',
      name: 'Gold Package',
      price: 750,
      image: '🎁',
      desc: 'Elegant assortment crafted for corporate employee appreciation and premium wedding return gifts.',
      features: [
        'Ghee Mysurpa (250g)',
        'Special Motichoor Laddu (250g)',
        'Traditional Kai Murukku (250g)',
        'Special Ribbon Pakoda (200g)',
        'Custom Logo/Sticker Support',
        'Handmade Eco-paper Box'
      ],
      badge: 'Best Choice'
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: 1250,
      image: '🧺',
      desc: 'Top-tier sweets and savories with organic pickle jars, designed for VIP clients and close relatives.',
      features: [
        'Ghee Mysurpa (500g)',
        'Stuffed Dry Fruit Pedha (250g)',
        'Kerala Banana Chips (250g)',
        'Grandma Garlic Pickle (200g)',
        'Spicy Avakkai Mango Pickle (200g)',
        'Embossed Golden Foil Box',
        'Personalized Message Cards'
      ],
      badge: 'VIP Favorite'
    },
    {
      id: 'luxury',
      name: 'Luxury Package',
      price: 2200,
      image: '💼',
      desc: 'Our ultimate luxury hamper featuring all major traditional flavors packed inside a handcrafted wooden chest.',
      features: [
        'Ghee Mysurpa (500g)',
        'Stuffed Dry Fruit Pedha (500g)',
        'Traditional Tirunelveli Halwa (250g)',
        'Kai Murukku (250g)',
        'Hot Butter Mixture (250g)',
        'Kerala Banana Chips (250g)',
        'Grandma Garlic Pickle (200g)',
        'Handmade Teakwood Keepsake Chest',
        'Vellum Paper Custom Scroll'
      ],
      badge: 'Imperial'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Title */}
      <div className="text-center space-y-4">
        <span className="bg-primary-100 dark:bg-primary-950/40 text-primary-750 dark:text-primary-400 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
          Assortments
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
          Compare Gift Packages
        </h1>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          Explore our pre-configured traditional combo packs. Choose the right scale of greetings for your clients, employees, or relatives.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {packagesData.map((pkg) => (
          <div 
            key={pkg.id} 
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 relative flex flex-col justify-between hover:shadow-lg transition duration-200"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-4xl">{pkg.image}</span>
                <span className="bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  {pkg.badge}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{pkg.desc}</p>
              </div>

              <div className="text-3xl font-black text-gray-900 dark:text-white">
                Rs. {pkg.price}
                <span className="text-xs text-gray-400 font-normal"> / pack</span>
              </div>

              {/* Feature Inclusions list */}
              <div className="space-y-2.5 border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Package Inclusions:</p>
                <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate(`/request?package=${pkg.name}`)}
                className="w-full inline-flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
              >
                Configure Order
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-6 md:p-8 space-y-6">
        <h3 className="font-serif text-2xl font-bold">Package Inclusions Comparison Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-4 font-bold text-gray-400 uppercase tracking-wider">Features</th>
                <th className="py-4 font-bold text-gray-900 dark:text-white">Silver</th>
                <th className="py-4 font-bold text-gray-900 dark:text-white">Gold</th>
                <th className="py-4 font-bold text-gray-900 dark:text-white">Premium</th>
                <th className="py-4 font-bold text-gray-900 dark:text-white">Luxury</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-850 text-gray-600 dark:text-gray-400">
              <tr>
                <td className="py-3.5 font-semibold text-gray-800 dark:text-gray-200">Ghee Sweets Weight</td>
                <td className="py-3.5">250g</td>
                <td className="py-3.5">500g (Combined)</td>
                <td className="py-3.5">750g (Combined)</td>
                <td className="py-3.5">1.25kg (Combined)</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-gray-800 dark:text-gray-200">Savory Items Count</td>
                <td className="py-3.5">2 Packs</td>
                <td className="py-3.5">2 Packs</td>
                <td className="py-3.5">2 Packs</td>
                <td className="py-3.5">3 Packs</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-gray-800 dark:text-gray-200">Traditional Pickles</td>
                <td className="py-3.5">❌ No</td>
                <td className="py-3.5">❌ No</td>
                <td className="py-3.5">✔️ 2 Jars (200g)</td>
                <td className="py-3.5">✔️ 2 Jars + Gunpowder</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-gray-800 dark:text-gray-200">Box Style</td>
                <td className="py-3.5">Duplex Box</td>
                <td className="py-3.5">Eco Paper Box</td>
                <td className="py-3.5">Gold Foil Box</td>
                <td className="py-3.5">Handcrafted Wooden Chest</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-gray-800 dark:text-gray-200">Logo Customization</td>
                <td className="py-3.5">❌ No</td>
                <td className="py-3.5">✔️ Sticker Logo</td>
                <td className="py-3.5">✔️ Embossed Logo</td>
                <td className="py-3.5">✔️ Laser Engraved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
