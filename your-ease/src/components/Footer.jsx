import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from "react-icons/fi"
import { Link } from "react-router-dom";

export default function Footer() {
  const logo = "https://res.cloudinary.com/dhxydnzrx/image/upload/v1762103256/Your_Ease_png_s4csrk.png"
  
  return (
    <footer className="bg-[#2c9ba3] text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div>
          <div className="bg-white p-3 rounded-lg inline-block mb-4">
            <Link to="/">
              <img 
  src={logo} 
  alt="YourEase logo" 
  className="w-96 md:w-32" 
  width={384}   // 96 * 4 (Tailwind w-96 = 384px)
  height={118}  // Proportional height for your logo
/>
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
            {/* FIXED: Changed a tags to Link components */}
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li><Link to="/track-order" className="hover:underline">Track order</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            {/* FIXED: Changed a tags to Link components */}
            <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link to="/shipping" className="hover:underline">Shipping</Link></li>
            <li><Link to="/returns" className="hover:underline">Returns</Link></li>
            <li><Link to="/support" className="hover:underline">Support</Link></li>
            <li><Link to="/policy" className="hover:underline">Policy</Link></li>
          </ul>
        </div>

        {/* Socials - Keep as regular a tags since they're external */}
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