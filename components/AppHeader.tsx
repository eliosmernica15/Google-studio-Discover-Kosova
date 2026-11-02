'use client';

import React from 'react';
import { Sparkles, Globe, DownloadCloud, HeartHandshake } from 'lucide-react';
import { CityId, LanguageCode } from '@/lib/types';
import { KOSOVO_CITIES } from '@/lib/kosovo-data';

interface AppHeaderProps {
  selectedCityId: CityId | 'all';
  onSelectCity: (id: CityId | 'all') => void;
  lang: LanguageCode;
  onChangeLang: (l: LanguageCode) => void;
  diasporaMode: boolean;
  onToggleDiasporaMode: () => void;
  onOpenAskAI: () => void;
  onOpenOfflineManager: () => void;
  offlinePacksCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  selectedCityId,
  onSelectCity,
  lang,
  onChangeLang,
  diasporaMode,
  onToggleDiasporaMode,
  onOpenAskAI,
  onOpenOfflineManager,
  offlinePacksCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3 pb-2 bg-slate-950/85 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and City Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-400 p-[1.5px] shadow-md flex items-center justify-center">
              <span className="text-sm font-black text-white">XK</span>
            </div>
            <div className="hidden xs:block">
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
                Discover Kosovo
                {diasporaMode && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Diaspora
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* City Switcher Pill */}
          <div className="relative">
            <select
              value={selectedCityId}
              onChange={(e) => onSelectCity(e.target.value as CityId | 'all')}
              className="appearance-none bg-slate-900/90 text-xs text-slate-200 border border-white/15 rounded-full pl-2.5 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400/50 cursor-pointer font-medium hover:bg-slate-800 transition max-w-[125px] sm:max-w-none truncate"
              aria-label="Filter by Kosovo City Hub"
            >
              <option value="all">🇽🇰 All Hubs</option>
              {KOSOVO_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Ask Kosovo AI Button */}
          <button
            onClick={onOpenAskAI}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-600/30 to-amber-500/30 hover:from-blue-600/50 hover:to-amber-500/50 text-amber-300 border border-amber-400/30 rounded-full px-2 sm:px-2.5 py-1 text-xs font-medium shadow-sm transition active:scale-95"
            aria-label="Open Ask Kosovo AI concierge"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Ask Kosovo</span>
          </button>

          {/* Diaspora Mode Toggle */}
          <button
            onClick={onToggleDiasporaMode}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition active:scale-95 ${
              diasporaMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-semibold'
                : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/20'
            }`}
            title="Toggle Diaspora Mode (Villages, summer calendar & homecoming)"
            aria-label="Toggle Diaspora Mode"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Diaspora</span>
          </button>

          {/* Offline Manager Button */}
          <button
            onClick={onOpenOfflineManager}
            className={`relative p-1.5 rounded-full border transition ${
              offlinePacksCount > 0
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title="Offline City Packs & Cache Manager"
            aria-label="Offline storage manager"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            {offlinePacksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-white/15 rounded-full p-0.5">
            <Globe className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5 hidden xs:block" />
            {(['en', 'sq', 'de', 'tr'] as const).map((l) => (
              <button
                key={l}
                onClick={() => onChangeLang(l)}
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                  lang === l
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={`Switch language to ${l}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
