import { Link } from 'react-router-dom';
import { Trophy, Calendar, Heart, Users } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-maroon overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/team-photo-field.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-maroon via-maroon-900 to-black opacity-80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="text-center">
            <img
              src="/mthc-logo.png"
              alt="MTHC Logo"
              className="h-32 w-32 mx-auto mb-8 rounded-full border-4 border-white shadow-2xl"
            />
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">
              Maroon Tiger
              <span className="block text-gold">Homerun Club</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
              Supporting Morehouse College Baseball Excellence Since 1867
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate" className="btn-gold text-lg px-8 py-4 inline-block text-center">
                Make a Donation
              </Link>
              <Link to="/about" className="btn-secondary border-white text-white hover:bg-white hover:text-maroon text-lg px-8 py-4 inline-block text-center">
                Learn More
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative baseball stitching */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gold to-white opacity-50" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-maroon">25-20</div>
              <div className="text-gray-600 mt-1">2026 Record</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-maroon">1867</div>
              <div className="text-gray-600 mt-1">Established</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-maroon">SIAC</div>
              <div className="text-gray-600 mt-1">Conference</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-maroon">D-II</div>
              <div className="text-gray-600 mt-1">NCAA Division</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center mb-12">How You Can Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/donate" className="card p-6 text-center group">
              <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-maroon/20 transition-colors">
                <Heart className="w-8 h-8 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-lg text-maroon mb-2">Donate</h3>
              <p className="text-gray-600 text-sm">
                Support our players with equipment, travel, and training resources.
              </p>
            </Link>

            <Link to="/schedule" className="card p-6 text-center group">
              <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-maroon/20 transition-colors">
                <Calendar className="w-8 h-8 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-lg text-maroon mb-2">Attend Games</h3>
              <p className="text-gray-600 text-sm">
                Check our schedule and come cheer on the Maroon Tigers.
              </p>
            </Link>

            <Link to="/history" className="card p-6 text-center group">
              <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-maroon/20 transition-colors">
                <Trophy className="w-8 h-8 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-lg text-maroon mb-2">Our Legacy</h3>
              <p className="text-gray-600 text-sm">
                Explore our rich history of SIAC championships and achievements.
              </p>
            </Link>

            <Link to="/board" className="card p-6 text-center group">
              <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-maroon/20 transition-colors">
                <Users className="w-8 h-8 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-lg text-maroon mb-2">Get Involved</h3>
              <p className="text-gray-600 text-sm">
                Meet our board and learn how to join the MTHC community.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Community & Impact */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center mb-12">Community &amp; Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: 'nola-minority-baseball-tournament.png', title: 'NOLA Minority Baseball Tournament', desc: 'Maroon Tigers compete at the MBP HBCU Final 4.' },
              { img: 'hbcu-allstar-team-photo.jpg', title: 'Giving Back to ATL Youth', desc: 'Players mentoring at the MBP All-Star youth clinic.' },
              { img: 'den-of-honor-induction.jpg', title: 'Den of Honor Induction', desc: 'Celebrating excellence with Dr. Reuben Brigety.' },
              { img: 'mbp-allstar-2026.png', title: 'Represent Yourself 5K', desc: 'Community events that fuel the program.' },
            ].map((c) => (
              <div key={c.title} className="card overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                  <img src={`/images/${c.img}`} alt={c.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-bold text-maroon mb-1">{c.title}</h3>
                  <p className="text-gray-600 text-sm">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-maroon">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Every Donation Hits a Home Run
          </h2>
          <p className="text-xl text-white/80 mb-8">
            From Singles to Home Runs, every tier of giving makes a direct impact
            on Morehouse Baseball. Choose your level and step up to the plate.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-gold font-bold text-lg">Single</div>
              <div className="text-white text-2xl font-bold">$100</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-gold font-bold text-lg">Double</div>
              <div className="text-white text-2xl font-bold">$200</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-gold font-bold text-lg">Triple</div>
              <div className="text-white text-2xl font-bold">$300</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-gold font-bold text-lg">Home Run</div>
              <div className="text-white text-2xl font-bold">$400</div>
            </div>
          </div>
          <Link to="/donate" className="btn-gold text-lg px-8 py-4 inline-block">
            Donate Now
          </Link>
        </div>
      </section>
    </div>
  );
}
