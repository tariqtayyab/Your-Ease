// src/pages/FAQ.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShoppingBag, Truck, CreditCard, RotateCcw } from 'lucide-react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqCategories = [
    {
      icon: ShoppingBag,
      title: "Ordering & Products",
      questions: [
        {
          question: "How do I place an order?",
          answer: "You can place an order through our website. Simply browse products, add them to your cart, and proceed to checkout."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and cannot be changed. Contact our support team immediately if you need to make changes."
        },
        {
          question: "Are your products genuine and authentic?",
          answer: "Yes, we guarantee 100% authenticity for all our products. We source directly from authorized distributors and manufacturers. All products come with official warranties where applicable."
        },
        {
          question: "Do you offer bulk discounts?",
          answer: "Yes, we offer special pricing for bulk orders. Please contact our sales team at sales@yourstore.com or call us at +92 325 8211422 for bulk pricing."
        }
      ]
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      questions: [
        {
          question: "What are your shipping charges?",
          answer: "We offer free standard shipping on all orders "
        },
        {
          question: "How long does delivery take?",
          answer: "Standard delivery takes 3-7 business days. Express delivery takes 1-2 business days in major cities. Delivery times may vary for remote areas."
        },
        {
          question: "Do you ship internationally?",
          answer: "Currently, we only ship within Pakistan. We're working on expanding our services to international customers in the future."
        },
        {
          question: "Can I track my order?",
          answer: "Yes, you'll receive a tracking number via email and SMS once your order is dispatched. You can track your order in real-time through our website or the courier's tracking system."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Payment & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept cash on delivery, bank transfers, credit/debit cards, and mobile payments. All online payments are processed through secure payment gateways."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard SSL encryption to protect your payment information. We don't store your credit card details on our servers."
        },
        {
          question: "Why was my payment declined?",
          answer: "Payment declines can occur due to insufficient funds, incorrect card details, or security checks by your bank. Please ensure your information is correct and contact your bank if issues persist."
        },
        
      ]
    },
    {
      icon: RotateCcw,
      title: "Returns & Warranty",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 14-day return policy for most items. Products must be in original condition with all tags and packaging. Some items like personal care products may not be returnable for hygiene reasons."
        },
        {
          question: "How do I initiate a return?",
          answer: "You can initiate a return through your account dashboard or by contacting our support team. We'll provide a return label and instructions for the process."
        },
        {
          question: "What is covered under warranty?",
          answer: "Most electronics come with 1-2 years manufacturer warranty. Warranty covers manufacturing defects but not damage from accidents or improper use. Check individual product pages for specific warranty details."
        },
        {
          question: "How long do refunds take?",
          answer: "Refunds are processed within 3-5 business days after we receive the returned item. The time it takes for the refund to reflect in your account depends on your bank's processing time."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find quick answers to common questions about shopping with us.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for questions..."
              className="bg-transparent border-none outline-none flex-1 text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Category Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-gray-100">
                {category.questions.map((item, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems.has(index);

                  return (
                    <div key={questionIndex} className="p-6">
                      <button
                        onClick={() => toggleItem(index)}
                        className="flex items-center justify-between w-full text-left gap-4"
                      >
                        <span className="font-semibold text-gray-900 flex-1">
                          {item.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="mt-4 text-gray-600 leading-relaxed animate-in fade-in duration-200">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-center text-white mt-8">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="mb-6 opacity-90">
            Our customer support team is here to help you 7 days a week.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="tel:+923258211422"
              className="bg-white text-teal-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Call Support
            </a>
            <a 
              href="https://wa.me/923258211422"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              WhatsApp Chat
            </a>
            <a 
              href="mailto:team.yourease@gmail.com"
              className="bg-transparent border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-teal-600 transition-colors font-semibold"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;