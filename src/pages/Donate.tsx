import { useState } from 'react';
import { Check, CreditCard, Heart, Shield } from 'lucide-react';

type Tier = 'single' | 'double' | 'triple' | 'homerun';

interface DonationTier {
  id: Tier;
  name: string;
  amount: number;
  description: string;
  icon: string;
}

const TIERS: DonationTier[] = [
  {
    id: 'single',
    name: 'Single',
    amount: 100,
    description: 'Support a player with essential gear and equipment.',
    icon: '⚾',
  },
  {
    id: 'double',
    name: 'Double',
    amount: 200,
    description: 'Cover travel expenses for an away game.',
    icon: '⚾⚾',
  },
  {
    id: 'triple',
    name: 'Triple',
    amount: 300,
    description: 'Fund training equipment and facility improvements.',
    icon: '⚾⚾⚾',
  },
  {
    id: 'homerun',
    name: 'Home Run',
    amount: 400,
    description: 'Make a major impact on the entire program.',
    icon: '🏠⚾',
  },
];

type Step = 'tier' | 'info' | 'consent' | 'payment' | 'success';

export default function Donate() {
  const [step, setStep] = useState<Step>('tier');
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    displayName: '',
    anonymous: false,
    message: '',
    consentGiven: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedTierData = TIERS.find(t => t.id === selectedTier);

  const handleTierSelect = (tier: Tier) => {
    setSelectedTier(tier);
    setStep('info');
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setStep('consent');
  };

  const handleConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentGiven) {
      setError('You must agree to the terms to proceed.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // In production, this integrates with Square Web Payments SDK
      // The Square payment form generates a sourceId (payment token)
      // which is sent to our backend for processing

      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tier: selectedTier,
          sourceId: 'SQUARE_PAYMENT_TOKEN', // Replaced by Square SDK in production
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-maroon py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Step Up to the Plate
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Your donation directly supports Morehouse College Baseball. Choose your tier and make an impact.
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-6 bg-gray-50 border-b">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {[
              { id: 'tier', label: 'Select Tier' },
              { id: 'info', label: 'Your Info' },
              { id: 'consent', label: 'Consent' },
              { id: 'payment', label: 'Payment' },
            ].map((s, idx) => {
              const steps: Step[] = ['tier', 'info', 'consent', 'payment', 'success'];
              const currentIdx = steps.indexOf(step);
              const stepIdx = steps.indexOf(s.id as Step);
              const isComplete = stepIdx < currentIdx;
              const isCurrent = s.id === step;

              return (
                <div key={s.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    isComplete ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-maroon text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:inline ${
                    isCurrent ? 'text-maroon font-medium' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                  {idx < 3 && <div className="w-8 md:w-16 h-0.5 bg-gray-200 mx-2" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-page">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Tier Selection */}
          {step === 'tier' && (
            <div>
              <h2 className="section-heading text-center">Choose Your Donation Tier</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => handleTierSelect(tier.id)}
                    className={`card p-6 text-left transition-all hover:scale-105 ${
                      selectedTier === tier.id ? 'ring-2 ring-maroon' : ''
                    }`}
                  >
                    <div className="text-3xl mb-3">{tier.icon}</div>
                    <h3 className="font-heading font-bold text-xl text-maroon">{tier.name}</h3>
                    <div className="text-3xl font-bold text-gray-900 my-2">${tier.amount}</div>
                    <p className="text-gray-600">{tier.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Donor Information */}
          {step === 'info' && (
            <div>
              <h2 className="section-heading text-center">Your Information</h2>
              <div className="card p-8 max-w-2xl mx-auto">
                <div className="mb-6 p-4 bg-maroon/5 rounded-lg flex items-center space-x-3">
                  <span className="text-2xl">{selectedTierData?.icon}</span>
                  <div>
                    <span className="font-bold text-maroon">{selectedTierData?.name}</span>
                    <span className="text-gray-600 ml-2">${selectedTierData?.amount}</span>
                  </div>
                  <button
                    onClick={() => setStep('tier')}
                    className="ml-auto text-sm text-maroon hover:underline"
                  >
                    Change
                  </button>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name (for leaderboard)
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder={`${formData.firstName} ${formData.lastName}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.anonymous}
                      onChange={e => setFormData({ ...formData, anonymous: e.target.checked })}
                      className="w-4 h-4 text-maroon rounded"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-700">
                      Make my donation anonymous
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      placeholder="Leave a message of support for the team..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep('tier')}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Back
                    </button>
                    <button type="submit" className="btn-primary">
                      Continue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 3: Consent */}
          {step === 'consent' && (
            <div>
              <h2 className="section-heading text-center">Consent & Agreement</h2>
              <div className="card p-8 max-w-2xl mx-auto">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-8 h-8 text-maroon" />
                  <h3 className="font-heading font-bold text-lg text-maroon">
                    Before We Proceed
                  </h3>
                </div>

                <div className="space-y-4 text-gray-700 mb-8">
                  <p>
                    By proceeding with your donation, you acknowledge and agree to the following:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      Your donation of <strong>${selectedTierData?.amount}</strong> ({selectedTierData?.name} tier)
                      is a voluntary contribution to the Maroon Tiger Homerun Club.
                    </li>
                    <li>
                      Donations are non-refundable unless required by law.
                    </li>
                    <li>
                      Your name may appear on our donor leaderboard (unless you selected anonymous).
                      Display requires manual approval by MTHC administrators.
                    </li>
                    <li>
                      Your personal information will be stored securely and used only for
                      donation processing and MTHC communications.
                    </li>
                    <li>
                      Payment is processed securely through Square. MTHC does not store
                      your credit card information.
                    </li>
                  </ul>
                </div>

                <form onSubmit={handleConsentSubmit}>
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg mb-6">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={formData.consentGiven}
                      onChange={e => setFormData({ ...formData, consentGiven: e.target.checked })}
                      className="w-5 h-5 text-maroon rounded mt-0.5"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-700">
                      I have read and agree to the above terms. I consent to my donation being
                      processed and my information being stored as described.
                    </label>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('info')}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Back
                    </button>
                    <button type="submit" className="btn-primary">
                      Proceed to Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 'payment' && (
            <div>
              <h2 className="section-heading text-center">Complete Payment</h2>
              <div className="card p-8 max-w-2xl mx-auto">
                <div className="mb-6 p-4 bg-maroon/5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-maroon">{selectedTierData?.name} Donation</span>
                      <p className="text-sm text-gray-600">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div className="text-2xl font-bold text-maroon">${selectedTierData?.amount}</div>
                  </div>
                </div>

                {/* Square Payment Form Placeholder */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Square Payment Form</p>
                  <p className="text-sm text-gray-500">
                    In production, the Square Web Payments SDK card form renders here.
                    <br />
                    Supports credit/debit cards, Apple Pay, and Google Pay.
                  </p>
                  {/* 
                    Integration note: Load Square Web Payments SDK script,
                    initialize with your application ID and location ID,
                    then attach the card payment form to this container.
                    See: https://developer.squareup.com/docs/web-payments/overview
                  */}
                  <div id="square-card-container" className="mt-4" />
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                  <Shield className="w-4 h-4" />
                  <span>Payments processed securely by Square</span>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('consent')}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : `Donate $${selectedTierData?.amount}`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-maroon mb-4">
                Thank You!
              </h2>
              <p className="text-xl text-gray-700 mb-2">
                Your {selectedTierData?.name} donation of ${selectedTierData?.amount} has been received.
              </p>
              <p className="text-gray-600 mb-8">
                A confirmation email has been sent to {formData.email}.
                <br />
                Your donation will appear on the leaderboard after approval.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/leaderboard" className="btn-primary inline-block">
                  View Leaderboard
                </a>
                <a href="/" className="btn-secondary inline-block">
                  Return Home
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
