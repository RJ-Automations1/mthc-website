import { Link } from 'react-router-dom';
import { Trophy, Calendar, Heart, Users, ArrowRight, ChevronDown } from 'lucide-react';
import { PHOTOS } from '../lib/photos';

const STATS = [
  { value: '25-20', label: '2026 Record' },
  { value: '1867', label: 'Established' },
  { value: 'SIAC', label: 'Conference' },
  { value: 'D-II', label: 'NCAA Division' },
];

const WAYS = [
  { to: '/donate', icon: Heart, title: 'Donate', desc: 'Support our players with equipment, travel, and training resources.' },
  { to: '/schedule', icon: Calendar, title: 'Attend Games', desc: 'Check our schedule and come cheer on the Maroon Tigers.' },
  { to: '/history', icon: Trophy, title: 'Our Legacy', desc: 'Explore our rich history of SIAC championships and achievements.' },
  { to: '/board', icon: Users, title: 'Get Involved', desc: 'Meet our board and learn how to join the MTHC community.' },
];

const TIERS = [
  { name: 'Single', amount: 100 },
  { name: 'Double', amount: 200 },
  { name: 'Triple', amount: 300 },
  { name: 'Home Run', amount: 400 },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate min-h-[100svh] md:min-h-[640px] md:h-[92svh] md:max-h-[1000px] flex items-end overflow-hidden bg-ink">
        <img
          src={PHOTOS.homeHero.src}
          style={{ objectPosition: PHOTOS.homeHero.position }}
          alt="Morehouse Baseball team on the field"
          className="absolute inset-0 -z-10 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-maroon-900/70 via-transparent to-transparent" />
        <div className="absolute inset-0 -z-10 grain" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-32 pt-32">
          <div className="max-w-3xl animate-fade-up">
            <span className="eyebrow text-gold">Morehouse College Baseball Boosters</span>
            <h1 className="mt-5 font-display uppercase font-bold text-white leading-[0.85] text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
              Maroon Tiger
              <span className="block text-gold">Homerun Club</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-xl">
              Fueling Morehouse College Baseball excellence on the diamond and in life. Since 1867.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link to="/donate" className="btn-gold text-base px-8 py-4 uppercase tracking-wider">
                Make a Donation <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-ghost-light text-base px-8 py-4 uppercase tracking-wider">
                Our Mission
              </Link>
            </div>
          </div>
        </div>

        <a
          href="#stats"
          aria-label="Scroll down"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white animate-bounce"
        >
          <ChevronDown className="w-7 h-7" />
        </a>
      </section>

      {/* Stats */}
      <section id="stats" className="relative bg-maroon text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/15">
            {STATS.map((s) => (
              <div key={s.label} className="py-10 px-4 text-center">
                <div className="font-display text-5xl md:text-6xl font-bold leading-none">{s.value}</div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission split */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-3 md:-inset-4 rounded-3xl bg-gradient-to-br from-gold/40 to-maroon/30 rotate-2" />
            <img
              src={PHOTOS.homeMission.src}
              style={{ objectPosition: PHOTOS.homeMission.position }}
              alt="Morehouse catcher set behind home plate"
              className="relative rounded-3xl w-full aspect-[4/5] max-h-[640px] object-cover shadow-2xl"
            />
          </div>
          <div>
            <span className="eyebrow">Who We Are</span>
            <h2 className="section-heading mt-4">
              Building champions <span className="text-maroon">on the diamond</span> and leaders in life.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The Maroon Tiger Homerun Club is the official booster organization for Morehouse College
              Baseball. Through fundraising, community engagement, and strategic partnerships, we give
              our student-athletes the resources to excel on the field and in the classroom.
            </p>
            <Link to="/about" className="btn-primary mt-8 uppercase tracking-wider text-sm">
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ways to help */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="eyebrow">Join the Team</span>
              <h2 className="section-heading mt-4 mb-0">How You Can Help</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WAYS.map(({ to, icon: Icon, title, desc }) => (
              <Link key={title} to={to} className="card group p-7 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-maroon text-white flex items-center justify-center group-hover:bg-gold group-hover:text-ink transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-6 font-display uppercase text-2xl font-bold text-ink">{title}</h3>
                <p className="mt-2 text-gray-600 text-sm flex-1">{desc}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-maroon">
                  Go <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Impact */}
      <section className="py-20 md:py-28 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="eyebrow text-gold">Beyond the Field</span>
          <h2 className="section-heading text-white mt-4 mb-12">Community &amp; Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[640px]">
            {PHOTOS.community.map((c, i) => (
              <figure
                key={c.title}
                className={`group relative overflow-hidden rounded-2xl bg-ink-800 min-h-[260px] ${
                  i === 0 ? 'md:col-span-2 md:row-span-2' : i === 1 ? 'md:col-span-2' : ''
                }`}
              >
                <img
                  src={c.src}
                  style={{ objectPosition: c.position }}
                  alt={c.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <figcaption className="absolute bottom-0 p-5 md:p-6">
                  <h3 className="font-display uppercase text-2xl font-bold leading-tight">{c.title}</h3>
                  <p className="text-white/70 text-sm mt-1">{c.desc}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Donation tiers CTA */}
      <section className="relative isolate overflow-hidden py-20 md:py-28 bg-maroon">
        <div className="absolute inset-0 -z-10 grain" />
        <div className="absolute -right-32 -top-32 -z-10 w-96 h-96 rounded-full border-[40px] border-white/5" />
        <div className="absolute -left-24 -bottom-40 -z-10 w-96 h-96 rounded-full border-[40px] border-gold/10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="eyebrow text-gold-light justify-center">Give Back</span>
          <h2 className="mt-4 font-display uppercase font-bold text-white text-5xl md:text-7xl leading-[0.9]">
            Every Donation Hits a Home Run
          </h2>
          <p className="mt-5 text-lg text-white/75 max-w-2xl mx-auto">
            From Singles to Home Runs, every tier of giving makes a direct impact on Morehouse Baseball.
            Choose your level and step up to the plate.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIERS.map((t, i) => (
              <Link
                key={t.name}
                to="/donate"
                className={`group rounded-2xl p-6 text-left ring-1 transition-all hover:-translate-y-1 ${
                  i === 3
                    ? 'bg-gold text-ink ring-gold'
                    : 'bg-white/5 text-white ring-white/15 hover:bg-white/10'
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-[0.2em] ${i === 3 ? 'text-maroon-800' : 'text-gold-light'}`}>
                  {t.name}
                </div>
                <div className="mt-2 font-display text-5xl font-bold">${t.amount}</div>
              </Link>
            ))}
          </div>
          <Link to="/donate" className="btn-gold mt-12 text-base px-10 py-4 uppercase tracking-wider">
            Donate Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
