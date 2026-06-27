import { useEffect, useState } from 'react';
import { Trophy, Award, Star } from 'lucide-react';

interface Coach {
  id: number;
  name: string;
  title: string;
  bio: string;
  imageUrl: string | null;
  yearsActive: string;
  current: boolean;
}

interface HistoryAward {
  id: number;
  title: string;
  year: string;
  category: string;
  description: string;
}

export default function History() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [awards, setAwards] = useState<HistoryAward[]>([]);
  const [championships, setChampionships] = useState<HistoryAward[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'coaches' | 'awards' | 'championships'>('overview');

  useEffect(() => {
    fetch('/api/history/coaches')
      .then(res => res.json())
      .then(data => setCoaches(data))
      .catch(console.error);

    fetch('/api/history/awards')
      .then(res => res.json())
      .then(data => setAwards(data))
      .catch(console.error);

    fetch('/api/history/championships')
      .then(res => res.json())
      .then(data => setChampionships(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-maroon py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Our History
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            A legacy of excellence, perseverance, and championship baseball at Morehouse College.
          </p>
        </div>
      </section>

      {/* Team banner */}
      <section className="relative bg-black">
        <img src="/images/team-photo-field.jpg" alt="Morehouse Baseball team on the field" className="w-full h-64 md:h-96 object-cover opacity-90" />
      </section>

      {/* Tab Navigation */}
      <section className="border-b border-gray-200 bg-white sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'coaches', label: 'Coaches' },
              { id: 'awards', label: 'Awards' },
              { id: 'championships', label: 'SIAC Championships' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-maroon text-maroon'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-page">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="section-heading">The Morehouse Baseball Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                Morehouse College Baseball has a storied history dating back to the institution's
                founding in 1867. As one of the premier HBCUs in the nation, Morehouse has
                produced outstanding student-athletes who have excelled both on the diamond
                and in their professional careers.
              </p>
              <p>
                Competing in the Southern Intercollegiate Athletic Conference (SIAC), the
                Maroon Tigers have built a tradition of competitive excellence. The program
                has seen periods of remarkable success, including multiple SIAC championships
                and individual awards that highlight the talent developed within the program.
              </p>
              <p>
                After a brief hiatus, the baseball program was revived in 2017, marking a new
                era for Morehouse Baseball. Since the revival, the team has quickly returned
                to prominence, capturing SIAC championships and making historic appearances
                in NCAA postseason play.
              </p>
              <p>
                The Maroon Tiger Homerun Club was established to ensure the continued growth
                and success of the program, providing the resources and support needed to
                compete at the highest level of NCAA Division II baseball.
              </p>
            </div>

            {/* Honors & recognition graphics */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { img: 'siac-portfolio.png', label: 'SIAC Championships' },
                { img: 'bcn-poll-champions.jpg', label: 'Black College Nines Poll' },
                { img: 'den-of-honor-logo.jpg', label: 'Den of Honor' },
                { img: 'morehouse-baseball-athletics.jpg', label: 'Maroon Tigers Baseball' },
              ].map((g) => (
                <div key={g.label} className="card overflow-hidden">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img src={`/images/${g.img}`} alt={g.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 text-center text-xs font-medium text-gray-600">{g.label}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="mt-12">
              <h3 className="text-2xl font-heading font-bold text-maroon mb-8">Key Milestones</h3>
              <div className="space-y-6">
                {[
                  { year: '1867', event: 'Morehouse College founded in Augusta, Georgia' },
                  { year: '2017', event: 'Baseball program revived after hiatus' },
                  { year: '2019', event: 'SIAC Conference Championship' },
                  { year: '2024', event: 'SIAC Conference Championship & NCAA D2 Tournament appearance' },
                  { year: '2026', event: 'Current season: 25-20 record' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-20 text-right">
                      <span className="text-maroon font-bold">{item.year}</span>
                    </div>
                    <div className="w-3 h-3 bg-maroon rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Coaches Tab */}
        {activeTab === 'coaches' && (
          <div>
            <h2 className="section-heading">Coaching Staff</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coaches.length > 0 ? (
                coaches.map(coach => (
                  <div key={coach.id} className="card p-6">
                    <div className="w-24 h-24 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {coach.imageUrl ? (
                        <img src={coach.imageUrl} alt={coach.name} className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <Star className="w-10 h-10 text-maroon" />
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-lg text-center text-maroon">{coach.name}</h3>
                    <p className="text-center text-gray-600 font-medium">{coach.title}</p>
                    <p className="text-center text-gray-500 text-sm mt-1">{coach.yearsActive}</p>
                    {coach.bio && <p className="text-gray-600 text-sm mt-3 text-center">{coach.bio}</p>}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-12">
                  <Star className="w-12 h-12 text-maroon/30 mx-auto mb-4" />
                  <p>Coaching staff information coming soon.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Awards Tab */}
        {activeTab === 'awards' && (
          <div>
            <h2 className="section-heading">Awards & Honors</h2>
            <div className="space-y-4">
              {awards.length > 0 ? (
                awards.map(award => (
                  <div key={award.id} className="card p-6 flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-gold-dark" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-heading font-bold text-lg text-maroon">{award.title}</h3>
                        <span className="text-sm bg-maroon/10 text-maroon px-2 py-0.5 rounded">{award.year}</span>
                      </div>
                      {award.description && <p className="text-gray-600 mt-1">{award.description}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Award className="w-12 h-12 text-maroon/30 mx-auto mb-4" />
                  <p>Awards information coming soon.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Championships Tab */}
        {activeTab === 'championships' && (
          <div>
            <h2 className="section-heading">SIAC Championships</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {championships.length > 0 ? (
                championships.map(champ => (
                  <div key={champ.id} className="card p-6 border-l-4 border-l-gold">
                    <div className="flex items-center space-x-3 mb-2">
                      <Trophy className="w-8 h-8 text-gold" />
                      <div>
                        <h3 className="font-heading font-bold text-xl text-maroon">{champ.year}</h3>
                        <p className="text-gray-600 font-medium">{champ.title}</p>
                      </div>
                    </div>
                    {champ.description && <p className="text-gray-600 mt-2">{champ.description}</p>}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-12">
                  <Trophy className="w-12 h-12 text-gold/30 mx-auto mb-4" />
                  <p>Championship history coming soon.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
