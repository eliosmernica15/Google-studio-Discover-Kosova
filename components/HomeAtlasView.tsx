'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  Layers,
  Eye,
  Utensils,
  Bed,
  Trees,
  Wine,
  Calendar,
  CheckCircle,
  Bookmark,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import { Place, City, CityId, PlaceCategory, LanguageCode } from '@/lib/types';
import { KOSOVO_CITIES } from '@/lib/kosovo-data';
import { filterPlacesList } from '@/lib/rules';
import { TRANSLATIONS } from '@/lib/translations';

interface HomeAtlasViewProps {
  places: Place[];
  selectedCityId: CityId | 'all';
  onSelectCity: (cityId: CityId | 'all') => void;
  onOpenPlace: (place: Place) => void;
  unlockedPlaceIds: Set<string>;
  savedPlaceIds: Set<string>;
  onToggleSave: (placeId: string) => void;
  diasporaMode: boolean;
  lang: LanguageCode;
  onOpenAskAI: () => void;
}

export const HomeAtlasView: React.FC<HomeAtlasViewProps> = ({
  places,
  selectedCityId,
  onSelectCity,
  onOpenPlace,
  unlockedPlaceIds,
  savedPlaceIds,
  onToggleSave,
  diasporaMode,
  lang,
  onOpenAskAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Active City metadata
  const currentCity = useMemo(() => {
    if (selectedCityId === 'all') return null;
    return KOSOVO_CITIES.find((c) => c.id === selectedCityId) || null;
  }, [selectedCityId]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    let result = filterPlacesList(places, {
      cityId: selectedCityId,
      category: selectedCategory,
      searchQuery,
      openNowOnly,
    });

    if (savedOnly) {
      result = result.filter((p) => savedPlaceIds.has(p.id));
    }

    return result;
  }, [places, selectedCityId, selectedCategory, searchQuery, openNowOnly, savedOnly, savedPlaceIds]);

  const categories = [
    { id: 'all', label: t.filter_all, icon: Layers },
    { id: 'see', label: t.filter_see, icon: Eye },
    { id: 'eat', label: t.filter_eat, icon: Utensils },
    { id: 'nature', label: t.filter_nature, icon: Trees },
    { id: 'stay', label: t.filter_stay, icon: Bed },
    { id: 'nightlife', label: t.filter_nightlife, icon: Wine },
    { id: 'events', label: t.filter_events, icon: Calendar },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 pb-36 sm:pb-40 text-slate-100 space-y-6">
      {/* Diaspora Mode Welcome Banner */}
      {diasporaMode && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-amber-900/40 to-slate-900 border border-amber-400/30 p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Diaspora Companion Active
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {t.diaspora_welcome}
              </h3>
            </div>
          </div>
          <button
            onClick={onOpenAskAI}
            className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow hover:bg-amber-300 transition"
          >
            Ask Advice
          </button>
        </div>
      )}

      {/* Hero Header: Full-bleed photography for the selected city or all Kosovo */}
      <div className="relative overflow-hidden rounded-3xl min-h-[220px] sm:min-h-[260px] bg-slate-950 border border-white/15 shadow-2xl flex flex-col justify-end p-6">
        {/* Hero Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            currentCity?.heroImage ||
            'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1400&q=80'
          }
          alt={currentCity?.name || 'Kosovo'}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow">
              {currentCity ? `${currentCity.name} Hub` : 'Discover Kosovo'}
            </span>
            {currentCity && (
              <span className="text-xs text-amber-300 font-medium">
                {currentCity.nativeName} {currentCity.alts[0] && `· ${currentCity.alts[0]}`}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentCity ? currentCity.tagline : 'Seven Historic Cities, One Living Country'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
            {currentCity
              ? currentCity.description
              : 'Explore the beating heart of the Balkans. From Ottoman old towns and brutalist architecture to high alpine trails and vibrant cafe streets.'}
          </p>

          {/* Quick city stats */}
          {currentCity && (
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                📍 {currentCity.stats.placesCount} Curated Places
              </span>
              <span className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                ⛰️ {currentCity.stats.trailsCount} Alpine Trails
              </span>
              <span className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                🥘 {currentCity.stats.topDish}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Seven Cities Fast-Switch Carousel (PDF core requirement) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
            Seven City Hubs
          </span>
          <button
            onClick={() => onSelectCity('all')}
            className={`font-semibold transition ${
              selectedCityId === 'all' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Show All
          </button>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pr-8 no-scrollbar scroll-smooth">
            {KOSOVO_CITIES.map((city) => {
              const isSelected = selectedCityId === city.id;
              return (
                <button
                  key={city.id}
                  onClick={() => onSelectCity(isSelected ? 'all' : city.id)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                      : 'bg-slate-900/90 text-slate-300 border-white/10 hover:bg-slate-800'
                  }`}
                >
                  <span>{city.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {city.stats.placesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search & Filters Strip */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search_placeholder}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 backdrop-blur-md shadow-sm"
              aria-label="Search places and tags"
            />
          </div>

          {/* Open Now Toggle */}
          <button
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`px-3 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-1.5 shrink-0 ${
              openNowOnly
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            aria-label="Toggle open now only filter"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.open_now}</span>
          </button>

          {/* Saved Places Filter Toggle */}
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`p-2.5 rounded-2xl border transition shrink-0 ${
              savedOnly
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title="Show saved places only"
            aria-label="Filter saved bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => {
            const Icon = c.icon;
            const isCatActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isCatActive
                    ? 'bg-white text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/10'
                }`}
                aria-label={`Filter by ${c.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Stories Carousel (PDF page 6) */}
      {selectedCityId === 'all' && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Curated Stories & Essentials</span>
            </h3>
            <span className="text-[11px] text-slate-400">Discover Kosovo Guides</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => onSelectCity('prizren')}
              className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-white/10 hover:border-amber-400/50 cursor-pointer transition duration-200 space-y-2 group"
            >
              <span className="text-xl">🏰</span>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-300">
                Prizren: The Ottoman Cultural Heart
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Why locals climb Kalaja at golden hour and watch DokuFest films floating on the river.
              </p>
            </div>

            <div
              onClick={() => onSelectCity('peja')}
              className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-white/10 hover:border-emerald-400/50 cursor-pointer transition duration-200 space-y-2 group"
            >
              <span className="text-xl">⛰️</span>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                Rugova: Gateway to the Accursed Peaks
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Via Ferrata iron ladders, suspension bridges, and traditional shepherd chalets.
              </p>
            </div>

            <div
              onClick={() => onSelectCity('beyond')}
              className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-white/10 hover:border-purple-400/50 cursor-pointer transition duration-200 space-y-2 group"
            >
              <span className="text-xl">🥘</span>
              <h4 className="text-xs font-bold text-white group-hover:text-purple-300">
                The Sacred Art of Flija under Saç
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Hours of layering batter and mountain kajmak under glowing coals with family.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Places Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            {filteredPlaces.length} Verified Destinations
          </h3>
          <span className="text-xs text-slate-400">
            {unlockedPlaceIds.size} stamped in passport
          </span>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-white/10 rounded-3xl space-y-3">
            <Compass className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No destinations found</h4>
            <p className="text-xs text-slate-400">
              Try adjusting your search terms or clearing the category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOpenNowOnly(false);
                setSavedOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaces.map((place) => {
              const isUnlocked = unlockedPlaceIds.has(place.id);
              const isSaved = savedPlaceIds.has(place.id);

              return (
                <div
                  key={place.id}
                  onClick={() => onOpenPlace(place)}
                  className="group relative bg-slate-900 border border-white/10 hover:border-amber-400/40 rounded-3xl overflow-hidden shadow-xl cursor-pointer transition duration-200 hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        place.photos[0] ||
                        'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={place.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

                    {/* Category & Status Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-white/15">
                        {place.subcategory}
                      </span>
                      {isUnlocked && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 flex items-center gap-1 shadow">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Stamped</span>
                        </span>
                      )}
                    </div>

                    {/* Bookmark Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(place.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition ${
                        isSaved
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950/70 text-white/80 border-white/20 hover:text-white'
                      }`}
                      aria-label={isSaved ? 'Remove from saved' : 'Save place'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    {/* Rating Pill */}
                    <div className="absolute bottom-2.5 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-xs font-bold text-white flex items-center gap-1">
                      ★ {place.rating}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                        {place.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {place.description}
                      </p>
                    </div>

                    {/* Local tip snippet */}
                    <div className="pt-2 border-t border-white/5 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{place.localTip}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
