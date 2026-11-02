'use client';

import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Trophy,
  Share2,
  Send,
  CheckCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { PassportStamp, Badge, Place, LanguageCode } from '@/lib/types';
import { KOSOVO_CITIES, INITIAL_BADGES } from '@/lib/kosovo-data';
import { updateBeliRankings } from '@/lib/rules';

interface PassportViewProps {
  stamps: PassportStamp[];
  places: Place[];
  onOpenPlace: (place: Place) => void;
  lang: LanguageCode;
}

export const PassportView: React.FC<PassportViewProps> = ({
  stamps,
  places,
  onOpenPlace,
  lang,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stamps' | 'ranking' | 'badges' | 'recap'>('stamps');
  const [selectedPostcardStamp, setSelectedPostcardStamp] = useState<PassportStamp | null>(
    stamps[0] || null
  );
  const [postcardMessage, setPostcardMessage] = useState<string>(
    'Përshëndetje nga Kosova! Exploring our homeland under the summer sun.'
  );
  const [postcardSentToast, setPostcardSentToast] = useState(false);

  // Beli head-to-head state
  const [ratings, setRatings] = useState<Record<string, number>>({
    'prizren-fortress': 1740,
    'newborn-monument': 1620,
    'sinan-pasha-mosque': 1580,
    'rugova-canyon': 1690,
  });
  const [rankingSuccessMsg, setRankingSuccessMsg] = useState<string | null>(null);

  // Compute stats
  const totalPlaces = places.length;
  const progressPercent = Math.min(100, Math.round((stamps.length / totalPlaces) * 100));

  // Head to head vote handler
  const handleVote = (winnerId: string, loserId: string) => {
    const updated = updateBeliRankings(ratings, winnerId, loserId);
    setRatings(updated);
    setRankingSuccessMsg(`Rank recorded! Winner boosted to rating ${updated[winnerId]}`);
    setTimeout(() => setRankingSuccessMsg(null), 3000);
  };

  // Sorted list of places by Beli rating
  const rankedPlaceIds = Object.keys(ratings).sort((a, b) => (ratings[b] || 0) - (ratings[a] || 0));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-36 sm:pb-40 text-slate-100">
      {/* Passport Book Official Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/30 p-6 shadow-2xl mb-6">
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 p-0.5 shadow-xl flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-center p-1">
                <span className="text-xl">🇽🇰</span>
                <span className="text-[9px] font-black text-amber-400 tracking-tighter">
                  PASSPORT
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Republic of Kosovo
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                  Digital Edition
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Official Cultural Heritage & Landmark Discovery Pass
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-4">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Stamps</div>
              <div className="text-lg font-black text-amber-400">{stamps.length}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Explored</div>
              <div className="text-lg font-black text-emerald-400">{progressPercent}%</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Overall Country Progress</span>
            <span className="font-mono text-amber-400 font-bold">
              {stamps.length} of {totalPlaces} Landmarks Unlocked
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 mt-6 border-t border-white/10 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'stamps', label: 'Collected Stamps', icon: Award },
            { id: 'ranking', label: 'Beli Rank It', icon: TrendingUp },
            { id: 'badges', label: 'Badges & Quests', icon: Trophy },
            { id: 'recap', label: 'Kosovo Wrapped', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: COLLECTED STAMPS GRID */}
      {activeSubTab === 'stamps' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Passport Stamp Vault</span>
              <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                {stamps.length} Verified
              </span>
            </h3>
            <span className="text-xs text-slate-400">
              Each stamped with live GPS & in-app photo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stamps.map((stamp) => {
              const matchedPlace = places.find((p) => p.id === stamp.placeId);
              return (
                <div
                  key={stamp.id}
                  onClick={() => matchedPlace && onOpenPlace(matchedPlace)}
                  className="group relative bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 rounded-3xl p-4 shadow-xl cursor-pointer transition duration-200 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                >
                  {/* Circular Gold Passport Stamp Watermark */}
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full border-4 border-dashed border-amber-500/15 pointer-events-none flex items-center justify-center rotate-12">
                    <span className="text-[10px] font-black text-amber-500/20 uppercase tracking-widest text-center">
                      OFFICIAL<br />KOSOVO<br />STAMP
                    </span>
                  </div>

                  <div className="space-y-3 z-10">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {stamp.cityId.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(stamp.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {stamp.photoUrl && (
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={stamp.photoUrl}
                          alt={stamp.placeTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-500/90 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>{Math.round(stamp.confidenceScore * 100)}% Match</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                        {stamp.placeTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>Verified in-app capture ({stamp.userType})</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-semibold z-10">
                    <span>View Guide</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regional Progress Breakdown */}
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">City Progress Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {KOSOVO_CITIES.map((c) => {
                const cityStamps = stamps.filter((s) => s.cityId === c.id);
                const cityPlaces = places.filter((p) => p.cityId === c.id);
                const total = Math.max(1, cityPlaces.length);
                const pct = Math.round((cityStamps.length / total) * 100);

                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-1.5"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white truncate">{c.name}</span>
                      <span className="text-amber-400 font-mono text-[11px]">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {cityStamps.length} / {total} unlocked
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BELI HEAD-TO-HEAD RANKING */}
      {activeSubTab === 'ranking' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Beli Head-to-Head Engine</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Which landmark made a stronger impression on you?
              </h3>
              <p className="text-xs text-slate-300">
                Compare two places head-to-head to dynamically calculate your personalized &ldquo;My Kosovo Top 10&rdquo; leaderboard.
              </p>
            </div>

            {rankingSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in">
                {rankingSuccessMsg}
              </div>
            )}

            {/* Voting Arena */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => handleVote('prizren-fortress', 'newborn-monument')}
                className="group p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-400 cursor-pointer transition duration-200 flex flex-col justify-between text-center"
              >
                <div>
                  <span className="text-2xl mb-1 block">🏰</span>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300">
                    Prizren Fortress (Kalaja)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Panoramic sunset across the minarets and Ottoman Old Town
                  </p>
                </div>
                <button className="mt-4 w-full py-2 bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-slate-950 font-bold text-xs rounded-xl transition">
                  Vote Prizren Fortress
                </button>
              </div>

              <div
                onClick={() => handleVote('newborn-monument', 'prizren-fortress')}
                className="group p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-blue-400 cursor-pointer transition duration-200 flex flex-col justify-between text-center"
              >
                <div>
                  <span className="text-2xl mb-1 block">⭐</span>
                  <h4 className="text-base font-bold text-white group-hover:text-blue-300">
                    Newborn Monument
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    The living typography symbol of independence and youth spirit
                  </p>
                </div>
                <button className="mt-4 w-full py-2 bg-blue-500/20 group-hover:bg-blue-500 text-blue-300 group-hover:text-white font-bold text-xs rounded-xl transition">
                  Vote Newborn
                </button>
              </div>
            </div>

            {/* My Kosovo Top List */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">My Kosovo Top Rated</h4>
                <div className="flex gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                    Locals: 4.8
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                    Diaspora: 4.9
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                    Visitors: 4.7
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {rankedPlaceIds.map((placeId, index) => {
                  const place = places.find((p) => p.id === placeId);
                  const rating = ratings[placeId];
                  if (!place) return null;

                  return (
                    <div
                      key={placeId}
                      className="p-3 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-white">{place.title}</h5>
                          <span className="text-[10px] text-slate-400">
                            {place.cityId.toUpperCase()} · {place.subcategory}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {rating} pts
                        </span>
                        <div className="text-[9px] text-slate-500">Beli Elo</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BADGES & VILLAGE QUESTS */}
      {activeSubTab === 'badges' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Explorer Badges & Accolades</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {INITIAL_BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-3xl border transition duration-200 ${
                    badge.unlocked
                      ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/50 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{badge.icon}</span>
                    {badge.unlocked ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 font-bold">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">{badge.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: KOSOVO WRAPPED & SHAREABLE POSTCARD */}
      {activeSubTab === 'recap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Kosovo Wrapped Graphic Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 border border-white/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇽🇰</span>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    My Kosovo 2026 Wrapped
                  </h3>
                  <p className="text-[11px] text-amber-300">Personal Travel Footprint</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold">SUMMER 2026</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 bg-black/40 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Stamps Logged</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">{stamps.length}</div>
              </div>
              <div className="p-3 bg-black/40 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Distance Walked</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">28.4 km</div>
              </div>
              <div className="p-3 bg-black/40 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Favorite Hub</div>
                <div className="text-base font-black text-blue-400 mt-1 truncate">Prizren</div>
              </div>
              <div className="p-3 bg-black/40 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Top Gastronomy</div>
                <div className="text-base font-black text-amber-400 mt-1 truncate">Flija me Saç</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 italic">
              &ldquo;From sunset at Kalaja to the cold mountain springs of Rugova, you’ve explored the beating heart of Kosovo.&rdquo;
            </p>
          </div>

          {/* Shareable Postcard Generator (PDF diaspora feature) */}
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <span>Send a Vintage Postcard to Relatives Abroad</span>
              </h4>
              <p className="text-xs text-slate-400">
                Turn your verified stamp photo into a shareable postcard for diaspora family in Germany, Switzerland, or the US.
              </p>
            </div>

            {/* Postcard Preview Frame */}
            <div className="relative bg-amber-50 text-slate-900 p-5 rounded-2xl shadow-xl border-4 border-dashed border-amber-300/80 font-serif">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        selectedPostcardStamp?.photoUrl ||
                        'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=400&q=80'
                      }
                      alt="Postcard Stamp"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs font-bold text-amber-950">
                    📍 {selectedPostcardStamp?.placeTitle || 'Prizren Fortress'}
                  </div>
                </div>

                <div className="flex flex-col justify-between border-l border-amber-300/80 pl-4 space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-sans tracking-widest uppercase font-bold text-amber-900">
                        POSTA E KOSOVËS
                      </span>
                      <div className="w-10 h-12 border-2 border-amber-800/40 rounded flex items-center justify-center text-xs font-bold font-mono">
                        € 0.85
                      </div>
                    </div>
                    <textarea
                      value={postcardMessage}
                      onChange={(e) => setPostcardMessage(e.target.value)}
                      rows={4}
                      className="w-full mt-2 p-2 text-xs bg-amber-100/50 rounded border border-amber-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      aria-label="Postcard message"
                    />
                  </div>
                  <div className="text-[10px] text-amber-800 font-mono">
                    Stamp ID: XK-{selectedPostcardStamp?.id.slice(-6) || '2026-A'}
                  </div>
                </div>
              </div>
            </div>

            {postcardSentToast && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Postcard ready! Shared link copied to clipboard.</span>
              </div>
            )}

            <button
              onClick={() => {
                setPostcardSentToast(true);
                setTimeout(() => setPostcardSentToast(false), 3000);
              }}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Postcard with Family Abroad</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
