import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'History', href: '/history' },
  { name: 'Schedule', href: '/schedule' },
  { name: 'Donate', href: '/donate' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Board Members', href: '/board' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-maroon shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/mthc-logo.png"
              alt="MTHC Logo"
              className="h-14 w-14 rounded-full border-2 border-white"
            />
            <div className="hidden sm:block">
              <h1 className="text-white font-heading text-lg font-bold leading-tight">
                Maroon Tiger
              </h1>
              <p className="text-white/80 text-sm font-medium">
                Homerun Club
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/donate"
              className="ml-4 bg-white text-maroon px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              Support Us
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.href
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/donate"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 bg-white text-maroon px-4 py-2 rounded-lg font-bold text-center"
              >
                Support Us
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
