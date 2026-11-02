'use client';

import React from 'react';
import { Compass, Map, Award, Mountain, UtensilsCrossed } from 'lucide-react';
import { LanguageCode } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';

interface NavbarProps {
  activeTab: 'atlas' | 'map' | 'passport' | 'trails' | 'taste';
  setActiveTab: (tab: 'atlas' | 'map' | 'passport' | 'trails' | 'taste') => void;
  lang: LanguageCode;
  stampsCount: number;
}

interface NavItem {
  id: 'atlas' | 'map' | 'passport' | 'trails' | 'taste';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  stampsCount,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const navItems: NavItem[] = [
    { id: 'atlas', label: t.nav_atlas, icon: Compass },
    { id: 'map', label: t.nav_map, icon: Map },
    {
      id: 'passport',
      label: t.nav_passport,
      icon: Award,
      badge: stampsCount > 0 ? stampsCount : undefined,
    },
    { id: 'trails', label: t.nav_trails, icon: Mountain },
    { id: 'taste', label: t.nav_taste, icon: UtensilsCrossed },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-4 pt-2 pointer-events-none flex justify-center"
    >
      <div className="w-full max-w-md pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-3xl p-1.5 shadow-2xl shadow-black/60 flex items-center justify-around transition-all">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-amber-400' : 'text-slate-400'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] xs:text-[11px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
