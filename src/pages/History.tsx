import { useEffect, useState } from 'react';
import { Trophy, Award, Star } from 'lucide-react';
import PageHero from '../components/PageHero';
import { PHOTOS } from '../lib/photos';

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
      <PageHero
        eyebrow="Our History"
        title={<>A Legacy of <span className="text-gold">Excellence</span></>}
        subtitle={`${new Date().getFullYear() - 1890} years of Maroon Tiger baseball excellence.`}
        image={PHOTOS.historyHero}
      />

      {/* Tab Navigation */}
      <section className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-20 z-40">
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
                className={`py-4 px-2 border-b-2 font-semibold uppercase tracking-wider text-sm whitespace-nowrap transition-colors ${
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
            {/* The Beginning */}
            <div className="grid md:grid-cols-5 gap-10 items-center mb-20">
              <div className="md:col-span-3">
                <span className="eyebrow">Est. 1890</span>
                <h2 className="section-heading mt-4">The Beginning</h2>
                <div className="text-gray-700 text-lg leading-relaxed space-y-5">
                  <p>
                    The Morehouse College baseball program was established in 1890, just 23 years
                    after the college itself was founded. This makes Morehouse baseball one of the
                    oldest collegiate baseball programs at a historically Black institution in the
                    entire nation.
                  </p>
                  <p>
                    In those early decades, the Maroon Tigers quickly established themselves as a force
                    on the diamond. The program's connection to the broader HBCU athletic movement
                    deepened on December 30, 1913, when representatives from several institutions
                    gathered at Morehouse College to form the Southern Intercollegiate Athletic
                    Conference (SIAC) — a conference that remains one of the most respected in Black
                    collegiate athletics more than a century later.
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 relative">
                <div className="absolute -inset-3 rounded-3xl border-2 border-maroon/20 -rotate-2" />
                <img
                  src={PHOTOS.historyBeginning.src}
                  style={{ objectPosition: PHOTOS.historyBeginning.position }}
                  alt="Morehouse catcher behind the plate"
                  className="relative w-full aspect-[4/5] object-cover rounded-3xl shadow-2xl grayscale contrast-125"
                />
              </div>
            </div>

            <h2 className="section-heading">The Morehouse Baseball Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                Morehouse College Baseball has a storied history spanning more than 130 years.
                As one of the premier HBCUs in the nation, Morehouse has
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
              {PHOTOS.honors.map((g) => (
                <div key={g.label} className="card group">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img src={g.src} alt={g.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">{g.label}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="mt-12">
              <h3 className="font-display uppercase text-3xl font-bold text-ink mb-8">Key Milestones</h3>
              <ol className="relative border-l-2 border-maroon/20 ml-3 space-y-8">
                {[
                  { year: '1867', event: 'Morehouse College founded in Augusta, Georgia' },
                  { year: '1890', event: 'Morehouse baseball program established' },
                  { year: '1913', event: 'SIAC founded at Morehouse College on December 30' },
                  { year: '1991', event: 'Baseball reestablished after a 10-year absence, led by students including MTHC founders' },
                  { year: '2017', event: 'Baseball program revived after hiatus' },
                  { year: '2019', event: 'SIAC Conference Championship' },
                  { year: '2024', event: 'SIAC Conference Championship & NCAA D2 Tournament appearance' },
                  { year: '2026', event: '25-21 season and a historic SIAC Tournament run' },
                ].map((item) => (
                  <li key={item.year} className="pl-8 relative">
                    <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-maroon ring-4 ring-cream" />
                    <span className="font-display text-3xl font-bold text-maroon leading-none">{item.year}</span>
                    <p className="text-gray-700 mt-1">{item.event}</p>
                  </li>
                ))}
              </ol>
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
