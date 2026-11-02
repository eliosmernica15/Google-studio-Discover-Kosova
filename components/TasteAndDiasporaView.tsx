'use client';

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  HeartHandshake,
  Search,
  Sparkles,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Dish, EventItem, VillageQuest, Place, LanguageCode } from '@/lib/types';
import { KOSOVO_DISHES, KOSOVO_EVENTS, VILLAGE_QUESTS } from '@/lib/kosovo-data';

interface TasteAndDiasporaViewProps {
  places: Place[];
  onOpenPlace: (place: Place) => void;
  lang: LanguageCode;
  initialSubTab?: 'taste' | 'diaspora';
}

export const TasteAndDiasporaView: React.FC<TasteAndDiasporaViewProps> = ({
  places,
  onOpenPlace,
  lang,
  initialSubTab = 'taste',
}) => {
  const [subTab, setSubTab] = useState<'taste' | 'diaspora'>(initialSubTab);
  const [selectedDish, setSelectedDish] = useState<Dish>(KOSOVO_DISHES[0]);
  const [villageSearch, setVillageSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Filter village quests
  const filteredQuests = VILLAGE_QUESTS.filter(
    (q) =>
      q.villageName.toLowerCase().includes(villageSearch.toLowerCase()) ||
      q.municipality.toLowerCase().includes(villageSearch.toLowerCase()) ||
      q.title.toLowerCase().includes(villageSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-36 sm:pb-40 text-slate-100 space-y-6">
      {/* Top Toggle Switch */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/10 max-w-md mx-auto">
        <button
          onClick={() => setSubTab('taste')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            subTab === 'taste'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Taste of Kosovo</span>
        </button>
        <button
          onClick={() => setSubTab('diaspora')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            subTab === 'diaspora'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Diaspora Home</span>
        </button>
      </div>

      {/* ===================== TASTE OF KOSOVO ===================== */}
      {subTab === 'taste' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              <span>Dish-First Gastronomy Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Where to eat Flija, Tavë Krapi & Qebapa
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Authentic Kosovar culinary traditions: wood-fired saç baking, earthenware casseroles, and highland sheep cheeses.
            </p>
          </div>

          {/* Dish Pills Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {KOSOVO_DISHES.map((dish) => {
              const isSelected = selectedDish.id === dish.id;
              return (
                <button
                  key={dish.id}
                  onClick={() => setSelectedDish(dish)}
                  className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800'
                  }`}
                >
                  <span>{dish.name}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Dish Spotlight Card */}
          <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-60 md:h-auto min-h-[240px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 md:bg-gradient-to-r md:from-transparent md:to-slate-900" />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-400 border border-white/10">
                  {selectedDish.region}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedDish.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{selectedDish.albanianName}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{selectedDish.description}</p>

                {/* Cultural Ritual / Saç lore */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200">
                  <span className="font-bold text-amber-300 block mb-0.5">Heritage Ritual:</span>
                  {selectedDish.traditionNote}
                </div>

                {/* Ingredients */}
                <div>
                  <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Traditional Ingredients
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDish.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-white/5"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Where to Eat Right Now (Place Links) */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <h5 className="text-[11px] uppercase font-bold text-slate-400">
                    Where to taste in Discover Kosovo:
                  </h5>
                  <div className="space-y-1.5">
                    {selectedDish.whereToEat.map((placeId) => {
                      const place = places.find((p) => p.id === placeId);
                      if (!place) return null;
                      return (
                        <div
                          key={place.id}
                          onClick={() => onOpenPlace(place)}
                          className="p-2.5 rounded-xl bg-slate-950 border border-white/10 hover:border-amber-400/50 cursor-pointer transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 text-xs font-bold">📍</span>
                            <span className="text-xs font-bold text-white">{place.title}</span>
                            <span className="text-[10px] text-slate-400">({place.cityId})</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DIASPORA HOME ===================== */}
      {subTab === 'diaspora' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-amber-950 border border-blue-500/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>Diaspora Homecoming Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Mirë se Vini në Atdhe!
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Dedicated toolkit for the 600,000+ diaspora returning every summer: ancestral village quests, festival dates, and family road trips.
            </p>
          </div>

          {/* Summer Festivals Calendar 2026/2027 */}
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Summer Festival & Homecoming Calendar</span>
              </h3>
              <span className="text-xs text-amber-400 font-semibold">Summer 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KOSOVO_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-white/5 hover:border-amber-400/30 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {event.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{event.dates}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{event.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{event.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{event.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "My Village" Ancestral Quest Finder (PDF feature) */}
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>&ldquo;My Village&rdquo; Family Quest Generator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Search your family’s ancestral village or municipality to unlock family heritage quests.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={villageSearch}
                onChange={(e) => setVillageSearch(e.target.value)}
                placeholder="Search village (e.g., Prekaz, Brod, Junik, Mushtisht)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                aria-label="Search village quests"
              />
            </div>

            {/* Quest Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {filteredQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-white/5 hover:border-amber-400/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-amber-400 uppercase">
                        {quest.municipality}
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                        {quest.villageName}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{quest.title}</h5>
                    <p className="text-[11px] text-slate-300">{quest.description}</p>
                    <p className="text-[10px] text-slate-500 italic">&ldquo;{quest.familyStory}&rdquo;</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 font-semibold">
                    <span>Nearby: {quest.placesNearby[0]}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diaspora Practical Advice (Border, Green Card, Customs) */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Returning Diaspora Practical Essentials</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-white/5">
                <strong className="text-white block mb-0.5">Border Crossings:</strong>
                Check live queue times at Merdare, Dheu i Bardhë, and Vërmica via the Ministry of Internal Affairs webcam portal.
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-white/5">
                <strong className="text-white block mb-0.5">Vehicle Border Insurance:</strong>
                Kosovo vehicle border insurance is subsidized by the government for passenger cars registered in the diaspora.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
