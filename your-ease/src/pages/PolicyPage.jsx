import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiShield, FiTruck, FiRotateCcw,} from 'react-icons/fi';

const PolicyPage = () => {
  const [activePolicy, setActivePolicy] = useState('privacy');

  const policies = {
    privacy: {
      icon: <FiShield className="w-6 h-6" />,
      title: "Privacy Policy",
      content: `
        <h3 className="text-xl font-semibold mb-4">Your Privacy Matters</h3>
        <p className="mb-4">At YourEase, we are committed to protecting your privacy and ensuring the security of your personal information.</p>
        
        <h4 className="font-semibold mb-2">Information We Collect</h4>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Personal information (name, email, phone number) provided during registration</li>
          <li>Shipping and billing addresses</li>
          <li>Order history and preferences</li>
          <li>Device and browsing information for analytics</li>
        </ul>

        <h4 className="font-semibold mb-2">How We Use Your Information</h4>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Process and deliver your orders</li>
          <li>Provide customer support</li>
          <li>Send order updates and promotional communications (with your consent)</li>
          <li>Improve our services and user experience</li>
        </ul>

        <h4 className="font-semibold mb-2">Data Protection</h4>
        <p className="mb-4">We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure.</p>

        <h4 className="font-semibold mb-2">Third-Party Services</h4>
        <p>We may share necessary information with trusted third parties (payment processors, delivery partners) solely for order fulfillment purposes.</p>
      `
    },
    terms: {
  icon: <FiFileText className="w-6 h-6" />,
  title: "Terms of Service",
  content: `
    <h3 className="text-xl font-semibold mb-4">Terms & Conditions</h3>
    <p className="mb-4">By using YourEase, you agree to comply with and be bound by the following terms and conditions.</p>
    
    <h4 className="font-semibold mb-2">Account Registration</h4>
    <ul className="list-disc list-inside mb-4 space-y-1">
      <li>You must be at least 18 years old to create an account</li>
      <li>Provide accurate and complete information during registration</li>
      <li>Maintain the confidentiality of your account credentials</li>
      <li>Notify us immediately of any unauthorized account activity</li>
    </ul>

    <h4 className="font-semibold mb-2">Order Acceptance & Completion</h4>
    <ul className="list-disc list-inside mb-4 space-y-1">
      <li>All orders are subject to product availability</li>
      <li>Prices are subject to change without notice</li>
      <li>Order confirmation does not constitute final acceptance</li>
      <li>The transaction is considered complete upon successful delivery and receipt of the product by the customer</li>
      <li>Ownership and risk of loss pass to you upon delivery confirmation</li>
    </ul>

    <h4 className="font-semibold mb-2">User Responsibilities</h4>
    <ul className="list-disc list-inside mb-4 space-y-1">
      <li>Use the platform for lawful purposes only</li>
      <li>Do not attempt to interfere with platform security</li>
      <li>Provide accurate shipping and payment information</li>
      <li>Respect intellectual property rights</li>
    </ul>

    <h4 className="font-semibold mb-2">Product Reviews & Content</h4>
    <ul className="list-disc list-inside mb-4 space-y-1">
      <li>We may display product reviews and ratings from various sources</li>
      <li>Some reviews are imported from third-party platforms to provide comprehensive product information</li>
      <li>We strive to ensure the accuracy of imported content but cannot guarantee its authenticity</li>
      <li>Users may submit their own reviews which are subject to moderation and approval</li>
    </ul>

    <h4 className="font-semibold mb-2">Transaction Completion</h4>
    <ul className="list-disc list-inside mb-4 space-y-1">
      <li>The sales contract between you and YourEase is finalized upon product delivery</li>
      <li>Delivery confirmation via tracking or customer acknowledgment completes the transaction</li>
      <li>Post-delivery disputes are handled through our returns and refunds policy</li>
      <li>Payment obligations are confirmed upon successful delivery</li>
    </ul>

    <h4 className="font-semibold mb-2">Modifications</h4>
    <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of modified terms.</p>
  `
},
    shipping: {
      icon: <FiTruck className="w-6 h-6" />,
      title: "Shipping Policy",
      content: `
        <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
        <p className="mb-4">We offer free delivery across Pakistan with reliable and trackable shipping services.</p>
        
        <h4 className="font-semibold mb-2">Delivery Areas</h4>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>We deliver to all major cities and towns across Pakistan</li>
          <li>Free shipping nationwide with no minimum order value</li>
          <li>Remote areas may require additional delivery time</li>
        </ul>

        <h4 className="font-semibold mb-2">Delivery Timeframes</h4>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Standard Delivery:</strong> 3-7 business days</li>
          <li><strong>Express Delivery:</strong> 1-2 business days (major cities)</li>
          <li>Delivery times may vary during holidays or adverse weather conditions</li>
        </ul>

        <h4 className="font-semibold mb-2">Order Processing</h4>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Orders are processed within 24 hours on business days</li>
          <li>You will receive tracking information once your order is shipped</li>
          <li>Someone must be available at the delivery address to receive packages</li>
        </ul>

        <h4 className="font-semibold mb-2">Shipping Charges</h4>
        <p>All shipping charges are FREE across Pakistan. No hidden fees or additional costs.</p>
      `
    },
    returns: {
      icon: <FiRotateCcw className="w-6 h-6" />,
      title: "Return & Refund Policy",
      content: `
        <h3 className="text-xl font-semibold mb-4">Returns & Refunds</h3>
        <p className="mb-4">We strive to ensure your complete satisfaction with every purchase.</p>
        
        <h4 className="font-semibold mb-2">Return Policy</h4>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>14-day return policy from delivery date</li>
          <li>Items must be in original condition with tags and packaging</li>
          <li>Return shipping is free for defective or incorrect items</li>
          <li>Some items are non-returnable for hygiene reasons</li>
        </ul>

        <h4 className="font-semibold mb-2">Refund Process</h4>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Full product price refund for eligible returns</li>
          <li>Original shipping charges are non-refundable</li>
          <li>Refunds processed within 3-5 business days after return receipt</li>
          <li>Refund method matches original payment method</li>
        </ul>

        <h4 className="font-semibold mb-2">Non-Returnable Items</h4>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Personal care and hygiene products</li>
          <li>Underwear and intimate apparel</li>
          <li>Software and digital products</li>
          <li>Personalized or custom-made items</li>
        </ul>

        <h4 className="font-semibold mb-2">Warranty Claims</h4>
        <p>Manufacturer warranty claims are processed through authorized service centers. Contact support for assistance.</p>
      `
    },
    // payment: {
    //   icon: <FiCreditCard className="w-6 h-6" />,
    //   title: "Payment Policy",
    //   content: `
    //     <h3 className="text-xl font-semibold mb-4">Payment Methods & Security</h3>
    //     <p className="mb-4">We offer multiple secure payment options for your convenience.</p>
        
    //     <h4 className="font-semibold mb-2">Accepted Payment Methods</h4>
    //     <ul className="list-disc list-inside mb-4 space-y-1">
    //       <li>Cash on Delivery (COD)</li>
    //       <li>Credit/Debit Cards (Visa, MasterCard)</li>
    //       <li>Bank Transfers</li>
    //       <li>Mobile Payments</li>
    //       <li>Digital Wallets</li>
    //     </ul>

    //     <h4 className="font-semibold mb-2">Payment Security</h4>
    //     <ul className="list-disc list-inside mb-4 space-y-1">
    //       <li>All payments are processed through secure, encrypted channels</li>
    //       <li>We do not store your complete payment card information</li>
    //       <li>PCI DSS compliant payment processing</li>
    //       <li>Secure SSL encryption for all transactions</li>
    //     </ul>

    //     <h4 className="font-semibold mb-2">Order Verification</h4>
    //     <ul className="list-disc list-inside mb-4 space-y-1">
    //       <li>Orders may require additional verification for security</li>
    //       <li>We may contact you to confirm order details</li>
    //       <li>Suspicious transactions may be held for review</li>
    //     </ul>

    //     <h4 className="font-semibold mb-2">Currency & Pricing</h4>
    //     <p>All prices are in Pakistani Rupees (PKR). We reserve the right to correct pricing errors that may occur.</p>
    //   `
    // }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Policies & Terms
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Understanding our policies helps ensure a smooth and secure shopping experience.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-4">
            {/* Policy Navigation */}
            <div className="lg:col-span-1 bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Policy</h2>
              <div className="space-y-2">
                {Object.entries(policies).map(([key, policy]) => (
                  <button
                    key={key}
                    onClick={() => setActivePolicy(key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activePolicy === key
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {policy.icon}
                    <span className="font-medium">{policy.title}</span>
                  </button>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link to="/contact" className="block text-sm text-teal-600 hover:text-teal-700">
                    Contact Support
                  </Link>
                  <Link to="/faq" className="block text-sm text-teal-600 hover:text-teal-700">
                    FAQ Section
                  </Link>
                  <Link to="/support" className="block text-sm text-teal-600 hover:text-teal-700">
                    Customer Support
                  </Link>
                </div>
              </div>
            </div>

            {/* Policy Content */}
            <div className="lg:col-span-3 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  {policies[activePolicy].icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {policies[activePolicy].title}
                </h2>
              </div>

              <div className="prose prose-gray max-w-none">
                <div 
                  className="text-gray-600 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: policies[activePolicy].content }}
                />
              </div>

              {/* Last Updated */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  For questions about our policies, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-white text-center mt-8">
          <h3 className="text-xl font-bold mb-2">Need Help Understanding Our Policies?</h3>
          <p className="mb-6 opacity-90">
            Our support team is here to help clarify any questions you may have.
          </p>
          <div className="flex gap-3 justify-center">
            <Link 
              to="/contact"
              className="bg-white text-teal-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Contact Support
            </Link>
            <a 
              href="https://wa.me/923258211422"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              WhatsApp Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;