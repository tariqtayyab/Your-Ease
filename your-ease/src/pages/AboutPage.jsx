import React from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiShield, FiAward, FiHeart, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';

const AboutPage = () => {
  const milestones = [
  ]

  const stats = [
   
  ];

  const values = [
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Trust & Reliability",
      description: "Built on years of trusted service and reliable delivery across Pakistan"
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Growth & Innovation",
      description: "Continuously evolving to bring you the latest products and shopping technologies"
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Quality Excellence",
      description: "Rigorous quality control ensures you receive only the best products"
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "Customer First",
      description: "Your satisfaction drives every decision we make"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2c9ba3] to-[#34b4bd] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About YourEase</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 opacity-90">
            Pakistan's Trusted E-commerce Partner - Delivering Excellence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-white text-[#2c9ba3] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Explore Products
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-[#2c9ba3] transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
     <section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Our Commitment to Excellence</h2>
          <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
            <p>
              YourEase was founded on a simple yet powerful vision: to make quality products accessible 
              to every Pakistani with unparalleled convenience and service. We understand the unique 
              needs of the Pakistani market and have built our platform around delivering exceptional 
              value to our customers.
            </p>
            <p>
              Our approach combines deep market understanding with technological innovation to create 
              a shopping experience that is both reliable and enjoyable. We're committed to building 
              lasting relationships with our customers through transparency, quality assurance, and 
              customer-first policies.
            </p>
            <p>
              What sets us apart is our unwavering focus on customer satisfaction and our commitment 
              to continuous improvement. We listen to our customers and constantly evolve to meet 
              their changing needs in the dynamic e-commerce landscape.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">What Drives Us</h3>
          <div className="space-y-4">
            {[
              {
                title: "Customer-Centric Approach",
                description: "Every decision we make starts with our customers' needs and satisfaction"
              },
              {
                title: "Quality Assurance",
                description: "Rigorous quality checks ensure you receive only the best products"
              },
              {
                title: "Innovation & Growth",
                description: "Continuously improving our platform and services for better experiences"
              },
              {
                title: "Nationwide Accessibility",
                description: "Making quality products available to customers across Pakistan"
              },
              {
                title: "Trust & Reliability",
                description: "Building long-term relationships based on transparency and dependability"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-[#2c9ba3] text-white px-3 py-1 rounded-full text-sm font-semibold min-w-10 h-10 flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Stats Section */}
    

      {/* Our Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              The Principles That Guide Us
            </h2>
            <p className="text-lg text-gray-600">
              Our success is built on a foundation of core values that have remained unchanged since our inception
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-[#2c9ba3] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Mission */}
            <div className="bg-gradient-to-br from-[#2c9ba3] to-[#34b4bd] text-white p-8 rounded-2xl">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                <FiShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg opacity-90 leading-relaxed">
                To revolutionize online shopping in Pakistan by providing unparalleled access to quality products, 
                exceptional customer service, and innovative solutions that make shopping effortless and enjoyable 
                for every Pakistani.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gray-800 text-white p-8 rounded-2xl">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                <FiAward className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-lg opacity-90 leading-relaxed">
                To be the most trusted and innovative e-commerce platform in Pakistan, setting new standards 
                for customer experience while empowering businesses and communities through digital commerce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Why Customers Choose YourEase
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Nationwide Free Delivery</h3>
              <p className="text-gray-600">
                Enjoy free shipping to every corner of Pakistan with our extensive delivery network
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Quality Assured</h3>
              <p className="text-gray-600">
                Every product undergoes rigorous quality checks to ensure you receive only the best
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer First Approach</h3>
              <p className="text-gray-600">
                24/7 support and customer-centric policies that put your needs first
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Experience the YourEase Difference
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Experience the convenience and quality that keeps customers coming back
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-white text-[#2c9ba3] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg shadow-lg"
            >
              Start Shopping Today
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#2c9ba3] transition-colors text-lg"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;