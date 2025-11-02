// src/pages/Support.jsx
import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, MapPin, Send, CheckCircle } from 'lucide-react';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      details: "+92 325 8211422",
      action: "tel:+923258211422",
      color: "teal"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat with us on WhatsApp",
      details: "24/7 Available",
      action: "https://wa.me/923258211422",
      color: "green"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email",
      details: "team.yourease@gmail.com",
      action: "mailto:team.yourease@gmail.com",
      color: "blue"
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "Our support availability",
      details: "Mon-Sun: 9AM - 11PM",
      action: null,
      color: "purple"
    }
  ];

  const commonIssues = [
    {
      title: "Order Tracking",
      description: "Track your order status and delivery",
      link: "/track-order"
    },
    {
      title: "Returns & Refunds",
      description: "Initiate returns and check refund status",
      link: "/returns"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Customer Support
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help you. Get in touch with our support team through multiple channels.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="grid gap-4">
                {contactMethods.map((method, index) => (
                  <a
                    key={index}
                    href={method.action}
                    target={method.action?.startsWith('http') ? '_blank' : undefined}
                    rel={method.action?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-${method.color}-200 hover:bg-${method.color}-50 transition-all duration-200 ${
                      !method.action ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className={`w-12 h-12 bg-${method.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <method.icon className={`w-6 h-6 text-${method.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{method.title}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <p className={`text-${method.color}-600 font-medium text-sm mt-1`}>{method.details}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Help</h2>
              
              <div className="grid gap-3">
                {commonIssues.map((issue, index) => (
                  <a
                    key={index}
                    href={issue.link}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-gray-600">{issue.description}</p>
                    </div>
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    >
                      <option value="">Select an issue</option>
                      <option value="order-issue">Order Issue</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="return">Returns & Refunds</option>
                      <option value="product">Product Information</option>
                      <option value="payment">Payment Issue</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white py-4 px-6 rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Prompt */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-center text-white mt-8">
          <h3 className="text-xl font-bold mb-2">Check our FAQ first</h3>
          <p className="mb-6 opacity-90">
            Many common questions are already answered in our frequently asked questions section.
          </p>
          <a 
            href="/faq"
            className="bg-white text-teal-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold inline-block"
          >
            Visit FAQ Section
          </a>
        </div>
      </div>
    </div>
  );
};

export default Support;