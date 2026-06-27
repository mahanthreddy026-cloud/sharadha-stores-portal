import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Sparkles, Award, ShieldCheck, ArrowRight, Star, HelpCircle } from 'lucide-react';

export default function LandingPage() {
  const categories = [
    { name: 'Traditional Sweets', desc: 'Ghee Mysurpa, Motichoor Laddus, Tirunelveli Halwas', icon: '🍬', color: 'from-orange-500 to-amber-500' },
    { name: 'Savory Snacks', desc: 'Kai Murukku, Ribbon Pakoda, Butter Mixture, Banana Chips', icon: '🥨', color: 'from-amber-500 to-yellow-500' },
    { name: 'Organic Pickles', desc: 'Avakkai Mango Pickle, Grandma Garlic Pickle', icon: '🏺', color: 'from-red-500 to-orange-500' },
    { name: 'Aromatic Masalas', desc: 'Milagai Podi (Gunpowder), Sambar Powders', icon: '🌶️', color: 'from-yellow-600 to-amber-600' }
  ];

  const packages = [
    { name: 'Silver Package', price: 350, desc: 'Ideal for wedding return gifts and standard festival greetings.', items: 'Mysurpa, Murukku, Mixture', tag: 'Popular' },
    { name: 'Gold Package', price: 750, desc: 'Elegant combos crafted for corporate events and employee appreciation.', items: 'Mysurpa, Laddu, Ribbon Pakoda, Murukku', tag: 'Best Value' },
    { name: 'Premium Package', price: 1250, desc: 'Luxury eco-friendly baskets containing top-shelf sweets and pickled assortments.', items: 'Dry Fruit Pedha, Mysurpa, Banana Chips, Murukku, Pickles', tag: 'Premium' }
  ];

  const testimonials = [
    { name: 'Raghavan Pillai', role: 'Wedding Coordinator', comment: 'Ordered 500 gift boxes of Ghee Mysurpa and Murukku for a wedding return gift. The sweets were extremely fresh, melt-in-mouth, and guest reviews were spectacular!', stars: 5 },
    { name: 'Shruti Sen', role: 'HR Manager, Tech Corp', comment: 'We gifted Sharadha Stores Gold packages to 200 employees for Diwali. The packaging was neat, and it brought back traditional home-style flavors. Highly recommended.', stars: 5 }
  ];

  const faqs = [
    { q: 'What is the minimum quantity for a bulk order?', a: 'Our minimum order quantity for custom bulk orders is 50 boxes. For pre-configured gift packages, we accept orders starting from 25 units.' },
    { q: 'Do you ship bulk orders outside Chennai?', a: 'Yes! We ship across India via reliable express logistics partners. Sweet items are packed carefully in air-tight bags to ensure absolute freshness.' },
    { q: 'Can we customize the sweets in the gift packages?', a: 'Absolutely. You can select your preferred sweet and savory items through our Bulk Enquiry form or consult with our customer manager to design a custom box.' }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-amber-50/50 to-white dark:from-gray-950 dark:via-gray-900/60 dark:to-gray-950 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              Celebrate with Traditional Purity
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Traditional Snacks & Sweets for <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">Bulk Celebrations</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
              Sharadha Stores crafts premium homemade snacks, traditional ghee sweets, and customized gift packages for weddings, corporate gifting, festivals, and family events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/request"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition duration-200"
              >
                Request Bulk Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/packages"
                className="inline-flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 font-semibold px-6 py-3.5 rounded-xl transition duration-200"
              >
                View Gift Packages
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center">
            {/* Visual branding representation */}
            <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-3xl bg-gradient-to-tr from-primary-500 to-secondary-400 p-8 shadow-2xl relative rotate-3 overflow-hidden flex flex-col justify-between text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <span className="text-3xl">🪔</span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">100% Traditional</span>
              </div>
              <div className="relative z-10 space-y-2">
                <p className="font-serif text-2xl font-bold">Sharadha Stores</p>
                <p className="text-xs text-amber-100">Handmade with pure cow ghee, clean cold-pressed oils, and love.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-850 space-y-3">
            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-950/40 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Heritage Taste</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Original recipes prepared without artificial additives or chemical preservatives.</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-850 space-y-3">
            <div className="h-10 w-10 bg-secondary-100 dark:bg-secondary-950/40 rounded-xl flex items-center justify-center text-secondary-600 dark:text-secondary-400">
              <Gift className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Premium Packing</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Decorative packaging, customized cards, and protective air-tight containers.</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-850 space-y-3">
            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Strict Shelf-Life Control</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Batched preparations made fresh to order and fast dispatch within 24 hours of baking.</p>
          </div>
        </div>
      </section>

      {/* 3. Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold tracking-tight">Browse Product Categories</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Explore traditional specialties available for customizing your bulk hampers.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl p-6 hover:shadow-md transition">
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition">{cat.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Packages Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold">Popular Gift Packages</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Curated sets perfect for bulk gifting, weddings, or corporate distribution.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.name} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl p-8 relative flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <span className="bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                  {pkg.tag}
                </span>
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.desc}</p>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  Rs. {pkg.price} <span className="text-xs text-gray-400 font-normal">/ package</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Included Delicacies:</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{pkg.items}</p>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to={`/request?package=${pkg.name}`}
                  className="block text-center bg-gray-50 hover:bg-primary-600 dark:bg-gray-800 dark:hover:bg-primary-600 text-gray-800 hover:text-white dark:text-gray-200 font-semibold py-2.5 rounded-xl text-xs transition duration-200"
                >
                  Order This Pack
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="bg-gray-50 dark:bg-gray-900/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="font-serif text-3xl font-bold text-center">Customer Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-8 rounded-2xl shadow-sm space-y-4">
                <div className="flex text-amber-400">
                  {[...Array(t.stars)].map((_, idx) => <Star key={idx} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{t.comment}"</p>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQs */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="font-serif text-3xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-xl space-y-2">
              <div className="flex gap-2 items-center text-primary-600">
                <HelpCircle className="h-4 w-4 shrink-0" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{faq.q}</h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
