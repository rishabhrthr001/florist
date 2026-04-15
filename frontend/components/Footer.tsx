import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            {/* LOGO */}
            <Link to="/" className="inline-block mb-8">
              <img
                src="/newLogo.png"
                alt="Mangalam Florist"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="text-gray-400 max-w-md leading-relaxed mb-8">
              Blooming love and celebrations for over 15 years, with
              thoughtfully curated floral creations for life’s most special
              moments.
            </p>

            <div className="flex gap-5">
              {[Instagram, Facebook, Twitter, Mail].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-sans font-bold text-xl mb-6">Collections</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <Link
                  to="/explore"
                  className="hover:text-[#F8BBD0] transition-colors"
                >
                  Complete Catalog
                </Link>
              </li>
              <li>
                <Link
                  to="/category/bouquets"
                  className="hover:text-[#F8BBD0] transition-colors"
                >
                  Daily Bouquets
                </Link>
              </li>
              <li>
                <Link
                  to="/category/weddings"
                  className="hover:text-[#F8BBD0] transition-colors"
                >
                  Wedding Packages
                </Link>
              </li>
              <li>
                <Link
                  to="/category/cakes"
                  className="hover:text-[#F8BBD0] transition-colors"
                >
                  Patisserie
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold text-xl mb-6">Support</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <Link to="#" className="hover:text-[#F8BBD0] transition-colors">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-[#F8BBD0] transition-colors">
                  Care Instructions
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-[#F8BBD0] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-[#F8BBD0] transition-colors">
                  Contact Atelier
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 uppercase tracking-widest gap-4">
          <p>© 2024 Mangalam Florist. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link
              to="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/refund-policy"
              className="hover:text-white transition-colors"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
