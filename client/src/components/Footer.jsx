import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-white text-lg">Sharadha Stores</h3>
            <p className="text-sm text-gray-400">
              Preserving tradition with handmade, pure ghee sweets and extra crunchy savories prepared using grandma's original recipes.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-primary-400 transition">Corporate Combos</Link>
              </li>
              <li>
                <Link to="/request" className="hover:text-primary-400 transition">Bulk Enquiry Form</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-primary-400 transition">Track Quote Status</Link>
              </li>
            </ul>
          </div>

          {/* Corporate Gifting Info */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Wedding Gift boxes</li>
              <li>Corporate Employee Gifts</li>
              <li>Traditional Festival Hampers</li>
              <li>Birthday Return Hampers</li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4">Contact Info</h4>
            <div className="flex items-start text-sm gap-2">
              <MapPin className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
              <span>No. 45, Sannidhi Street, Jubilee Hills, Hyderabad, Telangana - 500033</span>
            </div>
            <div className="flex items-center text-sm gap-2">
              <Phone className="h-4 w-4 text-primary-500 shrink-0" />
              <span>1111111111</span>
            </div>
            <div className="flex items-center text-sm gap-2">
              <Mail className="h-4 w-4 text-primary-500 shrink-0" />
              <span>orders@sharadhastores.com</span>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs flex flex-col sm:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} Sharadha Stores. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <Link to="/admin/login" className="hover:text-primary-400 transition inline-flex items-center gap-1">
              Admin Login <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
