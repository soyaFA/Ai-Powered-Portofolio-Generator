import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import type { AuthUser } from '../types/portfolio';

export type AppView = 'studio' | 'templates' | 'saved' ;

interface NavbarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  savedCount: number;
  authUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  savedCount,
  authUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: AppView; label: string }[] = [
    { id: 'studio', label: 'Studio' },
    { id: 'templates', label: 'Templates' },
    {
      id: 'saved',
      label: authUser && savedCount > 0 ? `Saved (${savedCount})` : 'Saved',
    },
    
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('studio')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Repo2Folio
        </button>

        {/* Zone 2: 4 single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary account control */}
        <div className="relative flex items-center shrink-0" ref={menuRef}>
          {authUser ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span className="max-w-[130px] truncate">{authUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-40">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {authUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{authUser.email}</div>
                    {authUser.githubUsername && (
                      <div className="font-mono-tabular text-[11px] text-blue-600 mt-0.5 truncate">
                        github.com/{authUser.githubUsername}
                      </div>
                    )}
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onNavigate('saved');
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      My Saved Portfolios ({savedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-slate-100 px-6 py-2"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`text-xs font-medium whitespace-nowrap shrink-0 py-1 ${
              activeView === item.id ? 'text-blue-600 font-semibold' : 'text-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};
