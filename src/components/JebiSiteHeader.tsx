import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { JEBI, JEBI_NAV } from '../pages/jebi/data';
import { MTHC_SITE_URL, PHOTOS_MTHC_LOGO } from './jebiSiteShared';

/**
 * Header for the standalone JEBI site (VITE_SITE_MODE=jebi). Event-only nav,
 * plus one gold link back to the Maroon Tiger Homerun Club site — the same
 * pattern as the JVO Weddings site's link back to JVO Events.
 */
export default function JebiSiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || open;

  const MthcLink = ({ className }: { className: string }) => (
    <a href={MTHC_SITE_URL} className={className}>
      <img src={PHOTOS_MTHC_LOGO} alt="" className="h-6 w-6 rounded-full ring-1 ring-gold/70" />
      MTHC <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
    </a>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? 'bg-ink/90 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main">
        <div className="flex items-center justify-between h-20 gap-6">
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label={`${JEBI.name} home`}>
            <img src={JEBI.logo} alt="" className="h-12 w-auto" />
            <span className="hidden sm:block leading-none">
              <span className="block font-display uppercase text-white text-lg font-bold tracking-wide">Jay Edwards</span>
              <span className="block text-gold text-[10px] font-semibold uppercase tracking-[0.25em] mt-1">
                Baseball Invitational
              </span>
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-0.5">
            {JEBI_NAV.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `relative px-2.5 py-2 text-[13px] font-semibold uppercase tracking-wider transition-colors after:absolute after:left-2.5 after:right-2.5 after:-bottom-0.5 after:h-0.5 after:bg-gold after:origin-left after:transition-transform ${
                    isActive ? 'text-white after:scale-x-100' : 'text-white/65 hover:text-white after:scale-x-0 hover:after:scale-x-100'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <MthcLink className="ml-4 inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-ink transition" />
          </div>

          <button
            className="xl:hidden text-white p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {open && (
          <div className="xl:hidden pb-6 animate-fade-up max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex flex-col border-t border-white/10 pt-4">
              {JEBI_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    `px-2 py-3 font-display uppercase text-2xl font-semibold tracking-wide ${
                      isActive ? 'text-gold' : 'text-white/80 hover:text-white'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              <MthcLink className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 px-6 py-3 font-bold uppercase tracking-wider text-gold" />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
