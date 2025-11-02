// src/pages/Returns.jsx
import React from 'react';
import { RotateCcw, Clock, Package, CheckCircle, XCircle, AlertCircle, Truck } from 'lucide-react';

const Returns = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Returns & Refunds Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hassle-free returns with full item value refund. Original shipping charges are non-refundable.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Quick Overview */}
            <section className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <Clock className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">14-Day Returns</h3>
                <p className="text-sm text-gray-600">Easy returns within 7 days</p>
              </div>
              <div className="text-center p-4">
                <Package className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Item Value Refund</h3>
                <p className="text-sm text-gray-600">Full product amount returned</p>
              </div>
              <div className="text-center p-4">
                <Truck className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Shipping Policy</h3>
                <p className="text-sm text-gray-600">Delivery charges are non-refundable</p>
              </div>
            </section>

            {/* Return Policy Details */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Policy Details</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Eligible for Full Refund</h3>
                    <p className="text-green-800 text-sm">
                      Complete product price refund when items are returned in original condition with tags and packaging within 7 days.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Shipping Charges Policy</h3>
                    <p className="text-amber-800 text-sm">
                      Original delivery charges are non-refundable. You receive the full product amount, excluding initial shipping costs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Non-Returnable Items</h3>
                    <p className="text-red-800 text-sm">
                      Personal care items, underwear, software, and personalized products for hygiene and copyright reasons.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Return Process */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return an Item</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Initiate Return</h3>
                      <p className="text-gray-600 text-sm">
                        Go to your account orders section and select "Return Item" or contact our support team.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Return Authorization</h3>
                      <p className="text-gray-600 text-sm">
                        We'll verify your return eligibility and provide return instructions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Package & Ship</h3>
                      <p className="text-gray-600 text-sm">
                        Pack the item securely in original packaging and ship to our return center.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Receive Refund</h3>
                      <p className="text-gray-600 text-sm">
                        Get your refund (product value only) within 3-5 business days after we process your return.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Information</h2>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Refund Breakdown</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Full product price refunded</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-amber-600" />
                        <span>Original shipping charges not refunded</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>No restocking fees</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Processing: 3-5 business days</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Refund Methods</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Credit/Debit Card: Refund to original payment method</li>
                      <li>• Cash on Delivery: Bank transfer refund</li>
                      <li>• Digital Wallets: Refund to original wallet</li>
                      <li>• Refund timeline: 3-5 business days after return processing</li>
                    </ul>
                  </div>
                </div>
                
                {/* Important Note */}
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-800 text-sm">
                      <strong>Note:</strong> While we refund the full product amount, the original delivery charges cover the completed shipping service and are therefore non-refundable.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Warranty Claims */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Warranty Claims</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Manufacturer Warranty</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Most electronics come with 1-2 years manufacturer warranty. Warranty claims are processed through authorized service centers.
                </p>
                
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Warranty Coverage:</strong> Manufacturing defects</p>
                  <p><strong>Not Covered:</strong> Physical damage, water damage, unauthorized repairs</p>
                  <p><strong>Process:</strong> Contact support with purchase proof and issue description</p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="text-center border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help with Returns?</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Our support team is available to assist you with returns and refunds.
              </p>
              <div className="flex gap-3 justify-center">
                <a 
                  href="tel:+923258211422"
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Call Support
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

export default Returns;