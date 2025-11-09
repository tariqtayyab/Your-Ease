import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from "react-icons/fi"
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[var(--teal-dark)] text-white">
      {/* Main Footer Links - Ultra Compact */}
      <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-gray-200">Quick Links</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-gray-300 transition-colors">Home</Link></li>
            <li><Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link></li>
            <li><Link to="/track-order" className="hover:text-gray-300 transition-colors">Track Order</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-gray-200">Support</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/faq" className="hover:text-gray-300 transition-colors">FAQ</Link></li>
            <li><Link to="/shipping" className="hover:text-gray-300 transition-colors">Shipping</Link></li>
            <li><Link to="/returns" className="hover:text-gray-300 transition-colors">Returns</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-gray-200">Company</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-gray-300 transition-colors">About</Link></li>
            <li><Link to="/policy" className="hover:text-gray-300 transition-colors">Policy</Link></li>
            <li><Link to="/support" className="hover:text-gray-300 transition-colors">Help</Link></li>
          </ul>
        </div>

        {/* Social Icons - Moved to main grid */}
        <div>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-gray-200">Connect</h3>
          <div className="flex space-x-3">
            <a 
              href="https://www.facebook.com/YourEasePk" 
              aria-label="Facebook"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FiFacebook size={16} />
            </a>
            <a 
              href="https://www.instagram.com/its_tariq_61/" 
              aria-label="Instagram"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FiInstagram size={16} />
            </a>
            <a 
              href="https://x.com/" 
              aria-label="X (Twitter)"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FiTwitter size={16} />
            </a>
            <a 
              href="https://www.youtube.com/" 
              aria-label="YouTube"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FiYoutube size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section - Ultra Compact */}
      <div className="border-t border-gray-600">
        <div className="max-w-4xl mx-auto px-4 py-3 text-center">
          <p className="text-xs text-gray-300">
            © 2025 YourEase. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Mobile bottom spacing - Reduced */}
      <div className="h-16 w-full bg-white md:hidden"></div>
    </footer>
  )
}