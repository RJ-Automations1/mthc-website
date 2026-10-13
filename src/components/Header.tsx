import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import { PHOTOS } from '../lib/photos';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'History', href: '/history' },
  { name: 'Schedule', href: '/schedule' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Board', href: '/board' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const solid = scrolled || mobileMenuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? 'bg-ink/90 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={PHOTOS.logo}
              alt="MTHC Logo"
              className="h-12 w-12 rounded-full ring-2 ring-gold/70 group-hover:ring-gold transition"
            />
            <div className="leading-none">
              <span className="block font-display uppercase text-white text-xl font-bold tracking-wide">
                Maroon Tiger
              </span>
              <span className="block text-gold text-[11px] font-semibold uppercase tracking-[0.3em] mt-1">
                Homerun Club
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:bg-gold after:origin-left after:transition-transform ${
                    isActive
                      ? 'text-white after:scale-x-100'
                      : 'text-white/65 hover:text-white after:scale-x-0 hover:after:scale-x-100'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <Link to="/donate" className="btn-gold ml-4 !py-2.5 !px-5 text-sm uppercase tracking-wider">
              <Heart className="w-4 h-4" /> Donate
            </Link>
          </div>

          <button
            className="lg:hidden text-white p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 animate-fade-up">
            <div className="flex flex-col border-t border-white/10 pt-4">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
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
              <Link to="/donate" className="btn-gold mt-4 uppercase tracking-wider">
                <Heart className="w-4 h-4" /> Donate
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
