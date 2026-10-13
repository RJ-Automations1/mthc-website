import { Link, useLocation } from 'react-router-dom';
import { Mail, MapPin, ArrowRight } from 'lucide-react';
import { PHOTOS } from '../lib/photos';

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/mthc1867',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/mthc1867',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@mthc1867',
    path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.7 6.34 6.34 0 0 0 9.49 22a6.34 6.34 0 0 0 6.34-6.34V9.41a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.84z',
  },
];

const LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'History', href: '/history' },
  { name: 'Schedule', href: '/schedule' },
  { name: 'Donate', href: '/donate' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Board Members', href: '/board' },
];

export default function Footer() {
  const { pathname } = useLocation();
  return (
    <footer className="relative bg-ink text-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-maroon via-gold to-maroon" />

      {/* Donate band (hidden on the donate page itself) */}
      <div className={`border-b border-white/10 ${pathname === '/donate' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="font-display uppercase text-3xl md:text-4xl font-bold leading-none">
              Step up to the plate.
            </h3>
            <p className="text-white/60 mt-2">Every gift goes straight to Morehouse Baseball.</p>
          </div>
          <Link to="/donate" className="btn-gold uppercase tracking-wider self-start md:self-auto">
            Give Today <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <img src={PHOTOS.logo} alt="MTHC Logo" className="h-14 w-14 rounded-full ring-2 ring-gold/60" />
              <div className="leading-none">
                <span className="block font-display uppercase text-2xl font-bold">Maroon Tiger</span>
                <span className="block text-gold text-xs font-semibold uppercase tracking-[0.3em] mt-1">
                  Homerun Club · Est. 1867
                </span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              The Maroon Tiger Homerun Club supports Morehouse College Baseball
              through fundraising, community engagement, and program development.
            </p>
            <div className="flex gap-3 mt-6">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-full ring-1 ring-white/15 flex items-center justify-center text-white/70 hover:text-ink hover:bg-gold hover:ring-gold transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-5">Explore</h4>
            <ul className="space-y-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-white/70 hover:text-white transition-colors text-sm">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-5">Contact</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <a href="mailto:Info@mthc1867.org" className="hover:text-white transition-colors">
                  Info@mthc1867.org
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>
                  Morehouse College
                  <br />
                  830 Westview Dr SW
                  <br />
                  Atlanta, GA 30314
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-2 text-white/45 text-xs">
          <p>&copy; {new Date().getFullYear()} Maroon Tiger Homerun Club. All rights reserved.</p>
          <p>Supporting Morehouse College Baseball Since 1867</p>
        </div>
      </div>
    </footer>
  );
}
