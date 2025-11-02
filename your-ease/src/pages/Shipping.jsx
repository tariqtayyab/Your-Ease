// src/pages/Shipping.jsx
import React from 'react';
import { Truck, Clock, Shield, Package, MapPin, Phone, Zap, Gift } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Shipping Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enjoy <span className="font-bold text-teal-600">FREE delivery</span> across Pakistan with real-time tracking and secure delivery.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Main Content */}
          <div className="p-6 sm:p-8">
            {/* Free Delivery Banner */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Gift className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Free Delivery All Over Pakistan!</h2>
              </div>
              <p className="text-teal-100">
                No minimum order value • No hidden charges • Free shipping to every corner of Pakistan
              </p>
            </div>

            {/* Shipping Options */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Package className="w-6 h-6 text-teal-600" />
                Delivery Options & Timeframes
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-teal-900">Standard Delivery</h3>
                  </div>
                  <p className="text-teal-800 mb-2">Delivery within 3-7 business days</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-teal-600">FREE</span>
                    <span className="text-teal-700 line-through text-sm">Rs 200</span>
                  </div>
                  <p className="text-sm text-teal-700 mt-2">Available nationwide</p>
                </div>

               
              </div>
            </section>

            {/* Coverage Areas */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-teal-600" />
                Nationwide Coverage
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {[
                  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
                  'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Gujranwala',
                  'Sialkot', 'Sargodha', 'Bahawalpur', 'Sukkur', 'Larkana'
                ].map((city) => (
                  <div key={city} className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-gray-700 font-medium">{city}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-sm text-center">
                We deliver to every city, town, and village across Pakistan - absolutely free!
              </p>
            </section>

            {/* Process */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Process</h2>
              
              <div className="space-y-4">
                {[
                  {
                    step: "Order Confirmation",
                    description: "You'll receive an email confirmation immediately after placing your order."
                  },
                  {
                    step: "Order Processing",
                    description: "We process and pack your order within 24 hours during business days."
                  },
                  {
                    step: "Free Shipping",
                    description: "Your order is shipped at no extra cost - we cover all delivery charges."
                  },
                  {
                    step: "Shipment Dispatch",
                    description: "You'll receive tracking information once your order is dispatched."
                  },
                  {
                    step: "Out for Delivery",
                    description: "Our delivery partner will contact you before final delivery."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.step}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Important Notes */}
            <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Important Delivery Information
              </h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• <strong>Free shipping</strong> on all orders across Pakistan</li>
                <li>• Delivery times are estimates and may vary due to weather conditions or unforeseen circumstances</li>
                <li>• Someone must be available at the delivery address to receive the package</li>
                <li>• Please ensure your shipping address is complete and accurate</li>
                <li>• Contact us within 24 hours if you need to modify your shipping address</li>
                <li>• No extra charges for remote areas or difficult-to-reach locations</li>
              </ul>
            </section>

            {/* Contact Support */}
            <section className="text-center border-t pt-6">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                <Phone className="w-4 h-4" />
                <span>Questions about our free delivery?</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Contact our customer support team for any delivery-related queries.
              </p>
              <div className="flex gap-3 justify-center">
                <a 
                  href="tel:+923258211422"
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Call Now
                </a>
                <a 
                  href="https://wa.me/923258211422"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;