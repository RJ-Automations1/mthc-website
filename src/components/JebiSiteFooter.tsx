import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { CONTACTS, JEBI, JEBI_NAV } from '../pages/jebi/data';
import { MTHC_SITE_URL, PHOTOS_MTHC_LOGO } from './jebiSiteShared';

/** Footer for the standalone JEBI site, with the link back to MTHC. */
export default function JebiSiteFooter() {
  return (
    <footer className="relative bg-ink text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-jebi via-gold to-jebi" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <img src={JEBI.logo} alt={`${JEBI.name} logo`} className="h-20 w-auto" />
          <p className="mt-4 text-sm text-white/60 max-w-sm">
            {JEBI.edition} {JEBI.name} · {JEBI.dates} · {JEBI.venue}, {JEBI.city}
          </p>
          <a
            href={MTHC_SITE_URL}
            className="mt-6 inline-flex items-center gap-3 rounded-full ring-1 ring-gold/50 pl-1.5 pr-5 py-1.5 text-sm font-semibold text-gold hover:bg-gold hover:text-ink transition"
          >
            <img src={PHOTOS_MTHC_LOGO} alt="" className="h-8 w-8 rounded-full" />
            Presented by the Maroon Tiger Homerun Club
          </a>
        </div>
        <div className="md:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-5">The Invitational</h4>
          <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            {JEBI_NAV.map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="text-white/70 hover:text-white">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-5">Contact</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <span className="block text-white/45 text-xs uppercase tracking-wider">Sponsorships</span>
              <a href={`mailto:${CONTACTS.sponsorship.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="w-4 h-4 text-gold" aria-hidden="true" /> {CONTACTS.sponsorship.email}
              </a>
            </li>
            <li>
              <span className="block text-white/45 text-xs uppercase tracking-wider">Media</span>
              <a href={`mailto:${CONTACTS.media.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="w-4 h-4 text-gold" aria-hidden="true" /> {CONTACTS.media.email}
              </a>
            </li>
            <li>
              <span className="block text-white/45 text-xs uppercase tracking-wider">General</span>
              <a href={`mailto:${CONTACTS.general.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="w-4 h-4 text-gold" aria-hidden="true" /> {CONTACTS.general.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-2 text-white/45 text-xs">
        <p>&copy; {new Date().getFullYear()} Maroon Tiger Homerun Club, Inc. All rights reserved.</p>
        <p>Media operations by Perez Sports Group, LLC</p>
      </div>
    </footer>
  );
}
