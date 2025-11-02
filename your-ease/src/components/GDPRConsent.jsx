import React, { useState, useEffect } from 'react';
import { analytics } from '../utils/analytics';

const GDPRConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true,
    analytics: false,
    ga4: false
  });

  useEffect(() => {
    const hasConsent = localStorage.getItem('analyticsConsent');
    if (hasConsent === null) {
      setShowBanner(true);
    }
  }, []);

  // In your GDPRConsent.jsx - update these lines:

const handleAcceptAll = () => {
  const newConsent = {
    necessary: true,
    analytics: true,
    ga4: true
  };
  setConsent(newConsent);
  analytics.setConsent(true, true);
  setShowBanner(false);
  analytics.trackConsentAccepted('all'); // Use new method
};

const handleAcceptNecessary = () => {
  const newConsent = {
    necessary: true,
    analytics: false,
    ga4: false
  };
  setConsent(newConsent);
  analytics.setConsent(false, false);
  setShowBanner(false);
  analytics.trackConsentAccepted('necessary'); // Use new method
};

const handleSaveSettings = () => {
  analytics.setConsent(consent.analytics, consent.ga4);
  setShowBanner(false);
  setShowSettings(false);
  analytics.trackConsentUpdated(consent); // Use new method
};

  if (!showBanner && !showSettings) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
        {!showSettings ? (
          // Consent Banner
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Privacy Preferences
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We use cookies and similar technologies to enhance your browsing experience, 
              analyze site traffic, and personalize content. You can control your preferences below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptNecessary}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 border border-teal-600 text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          // Settings Panel
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cookie Settings
            </h3>
            
            <div className="space-y-4 mb-6">
              {/* Necessary Cookies - Always enabled */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Necessary Cookies</div>
                  <div className="text-sm text-gray-600">
                    Essential for the website to function properly
                  </div>
                </div>
                <div className="w-10 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">Always</span>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Analytics Cookies</div>
                  <div className="text-sm text-gray-600">
                    Help us understand how visitors interact with our website
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Google Analytics */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Google Analytics</div>
                  <div className="text-sm text-gray-600">
                    Advanced analytics and insights from Google
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent.ga4}
                    onChange={(e) => setConsent(prev => ({ ...prev, ga4: e.target.checked }))}
                    className="sr-only peer"
                    disabled={!consent.analytics}
                  />
                  <div className={`w-11 h-6 rounded-full peer ${
                    !consent.analytics ? 'bg-gray-100' : 'bg-gray-200 peer-checked:bg-teal-600'
                  }`}></div>
                  <div className={`absolute left-[2px] top-[2px] bg-white border rounded-full h-5 w-5 transition-all ${
                    consent.ga4 ? 'translate-x-full border-white' : 'border-gray-300'
                  } ${!consent.analytics ? 'opacity-50' : ''}`}></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GDPRConsent;