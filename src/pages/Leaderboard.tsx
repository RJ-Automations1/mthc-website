import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Star, Heart } from 'lucide-react';

interface Donor {
  id: number;
  displayName: string;
  tier: string;
  amount: string;
  message: string | null;
  createdAt: string;
}

interface LeaderboardData {
  homerun: Donor[];
  triple: Donor[];
  double: Donor[];
  single: Donor[];
  totalDonors: number;
  totalRaised: number;
}

const TIER_CONFIG = {
  homerun: { name: 'Home Run', icon: Trophy, color: 'text-gold', bg: 'bg-gold/10', amount: '$400' },
  triple: { name: 'Triple', icon: Medal, color: 'text-maroon', bg: 'bg-maroon/10', amount: '$300' },
  double: { name: 'Double', icon: Star, color: 'text-maroon-700', bg: 'bg-maroon/5', amount: '$200' },
  single: { name: 'Single', icon: Heart, color: 'text-maroon-500', bg: 'bg-maroon/5', amount: '$100' },
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-maroon py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Donor Leaderboard
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Recognizing the generous supporters who make Morehouse Baseball possible.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-maroon">
                {leaderboard?.totalDonors || 0}
              </div>
              <div className="text-sm text-gray-600">Total Donors</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-maroon">
                ${leaderboard?.totalRaised?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Total Raised</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Content */}
      <section className="container-page">
        <div className="max-w-4xl mx-auto">
          {/* Note about approval */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <strong>Note:</strong> Donor names appear on this leaderboard after manual approval
            by MTHC administrators. If you recently donated, your name will appear shortly.
          </div>

          {/* Tier Sections */}
          {(['homerun', 'triple', 'double', 'single'] as const).map(tierKey => {
            const config = TIER_CONFIG[tierKey];
            const Icon = config.icon;
            const donors = leaderboard?.[tierKey] || [];

            return (
              <div key={tierKey} className="mb-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-maroon">{config.name} Club</h2>
                    <p className="text-sm text-gray-500">{config.amount} donors</p>
                  </div>
                </div>

                {donors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {donors.map(donor => (
                      <div key={donor.id} className={`${config.bg} rounded-lg p-4 border border-gray-100`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{donor.displayName}</span>
                          <span className={`text-sm font-medium ${config.color}`}>{config.amount}</span>
                        </div>
                        {donor.message && (
                          <p className="text-sm text-gray-600 mt-1 italic">"{donor.message}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`${config.bg} rounded-lg p-6 text-center`}>
                    <p className="text-gray-500 text-sm">
                      Be the first to join the {config.name} Club!
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* CTA */}
          <div className="text-center mt-12 p-8 bg-maroon/5 rounded-xl">
            <h3 className="font-heading font-bold text-xl text-maroon mb-2">
              Want to see your name here?
            </h3>
            <p className="text-gray-600 mb-4">
              Make a donation and join the MTHC family of supporters.
            </p>
            <Link to="/donate" className="btn-primary inline-block">
              Donate Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
