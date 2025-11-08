// src/pages/Contact.jsx
import React, { useState } from 'react';
import { Phone, Mail, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';

const Contact = () => {
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
      title: "Call Us",
      description: "Speak directly with our team",
      details: "+92 325 8211422",
      action: "tel:+923258211422",
      color: "teal"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat with us instantly",
      details: "24/7 Available",
      action: "https://wa.me/923258211422",
      color: "green"
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us a detailed message",
      details: "team.yourease@gmail.com",
      action: "mailto:team.yourease@gmail.com",
      color: "blue"
    },
  ];

  const faqItems = [
    {
      question: "What are your business hours?",
      answer: "We're available Monday to Sunday, 9:00 AM to 11:00 PM Pakistan Standard Time."
    },
    {
      question: "How long does shipping take?",
      answer: "We offer FREE delivery all over Pakistan within 3-7 business days for standard delivery and 1-2 days for express delivery."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within Pakistan. We're working on expanding our services internationally."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash on delivery, bank transfers, credit/debit cards, and mobile payments."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Reach out to us through any channel that works for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Methods</h2>
              
              <div className="grid gap-6">
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
                      <h3 className="font-semibold text-gray-900 text-lg">{method.title}</h3>
                      <p className="text-gray-600">{method.description}</p>
                      <p className={`text-${method.color}-600 font-medium text-sm mt-1`}>{method.details}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
              </div>
              
              <div className="space-y-3">
                {[
                  { day: 'Monday - Friday', hours: '9:00 AM - 11:00 PM' },
                  { day: 'Saturday', hours: '10:00 AM - 11:00 PM' },
                  { day: 'Sunday', hours: '10:00 AM - 10:00 PM' }
                ].map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-900">{schedule.day}</span>
                    <span className="text-gray-600">{schedule.hours}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-teal-50 rounded-xl">
                <p className="text-teal-800 text-sm text-center">
                  <strong>Emergency Support:</strong> Available 24/7 via WhatsApp for urgent order issues
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Answers</h2>
              
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-600 text-sm">{item.answer}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <a 
                  href="/faq"
                  className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                >
                  View all FAQs →
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-gray-600 mb-6">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-red-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="return">Returns & Refunds</option>
                      <option value="product">Product Information</option>
                      <option value="wholesale">Wholesale/Bulk Orders</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white py-4 px-6 rounded-xl hover:bg-teal-700 transition-colors font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
                
                <p className="text-center text-gray-500 text-sm">
                  We typically respond within 2-4 hours during business hours.
                </p>
              </form>
            )}
          </div>
        </div>
       
      </div>
    </div>
  );
};

export default Contact;