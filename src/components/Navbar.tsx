import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Menu, X, HelpCircle, Users, Search, User, Home } from 'lucide-react';

interface NavbarProps {
  language: string;
}

const translations = {
  en: {
    home: 'Home',
    explore: 'Explore',
    community: 'Community',
    about: 'About',
    help: 'Help',
    login: 'Login',
    title: 'CropCare AI'
  },
  hi: {
    home: 'होम',
    explore: 'खोजें',
    community: 'समुदाय',
    about: 'हमारे बारे में',
    help: 'सहायता',
    login: 'लॉग इन',
    title: 'क्रॉपकेयर AI'
  }
};

export const Navbar = ({ language }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const t = translations[language as keyof typeof translations] || translations.en;

  const navItems = [
    { path: '/', label: t.home, icon: Home },
    { path: '/explore', label: t.explore, icon: Search },
    { path: '/community', label: t.community, icon: Users },
    { path: '/about', label: t.about, icon: User },
    { path: '/help', label: t.help, icon: HelpCircle },
  ];

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">{t.title}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2 h-10 px-4"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            <Link to="/login">
              <Button variant="outline" className="ml-4">
                {t.login}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start space-x-2 h-10"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full mt-2">
                  {t.login}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};