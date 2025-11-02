import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from "react-icons/fi"
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#2c9ba3] text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div>
          <div className="bg-white p-3 rounded-lg inline-block mb-4">
            <Link to="/">
              <img src={logo} alt="YourEase logo" className="w-96 md:w-32" />
            </Link>
          </div>
          <p className="text-sm leading-relaxed">
            Shopping made simple. Discover the best deals and quality products with ease.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
            <li><a href="/track-order" className="hover:underline">Track order</a></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/faq" className="hover:underline">FAQ</a></li>
            <li><a href="/shipping" className="hover:underline">Shipping</a></li>
            <li><a href="/returns" className="hover:underline">Returns</a></li>
            <li><a href="/support" className="hover:underline">Support</a></li>
            <li><a href="/policy" className="hover:underline">Policy</a></li>
            
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#"><FiFacebook size={22} className="hover:text-black" /></a>
            <a href="#"><FiInstagram size={22} className="hover:text-black" /></a>
            <a href="#"><FiTwitter size={22} className="hover:text-black" /></a>
            <a href="#"><FiYoutube size={22} className="hover:text-black" /></a>
          </div>
        </div>
      </div>

      <div className="bg-[#248489] text-center py-4 text-sm">
        © {new Date().getFullYear()} YourEase. All rights reserved.
      </div>
      <div className="h-16 w-full bg-white md:hidden"></div>
    </footer>
  )
}