'use client';

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Navigation,
  Camera,
  Bookmark,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Place, LanguageCode } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
  onOpenUnlock: (place: Place) => void;
  isUnlocked: boolean;
  isSaved: boolean;
  onToggleSave: (placeId: string) => void;
  lang: LanguageCode;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  onOpenUnlock,
  isUnlocked,
  isSaved,
  onToggleSave,
  lang,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!place) return null;

  const photos = place.photos.length > 0
    ? place.photos
    : ['https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=800&q=80'];

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.title}, ${place.address}`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Background click backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Bottom Sheet / Modal Card */}
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-slate-900 border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col z-10 text-slate-100">
        {/* Sticky Header Bar with Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {place.subcategory}
            </span>
            {isUnlocked && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                ✓ Passport Unlocked
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(place.id)}
              className={`p-2 rounded-full border transition ${
                isSaved
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-white/10 hover:text-white'
              }`}
              aria-label={isSaved ? 'Remove from saved places' : 'Save place to list'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 border border-white/10 hover:text-white transition"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Photo Carousel */}
        <div className="relative w-full h-64 sm:h-72 bg-slate-950 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[photoIndex]}
            alt={place.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/60 backdrop-blur-md text-white border border-white/20 hover:bg-slate-900"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/60 backdrop-blur-md text-white border border-white/20 hover:bg-slate-900"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      photoIndex === i ? 'bg-amber-400 w-4' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick category and rating pill */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs px-2.5 py-1 rounded-full text-white font-medium flex items-center gap-1">
              ★ {place.rating} ({place.reviewsCount})
            </span>
            <span className="bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs px-2.5 py-1 rounded-full text-slate-200 font-medium">
              {place.priceLevel}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          <div>
            <h2 id="place-modal-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {place.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-1">
              <span className="text-amber-400 font-medium">{place.nativeTitle}</span>
              {place.alts.length > 0 && (
                <span className="text-slate-500">({place.alts.join(' · ')})</span>
              )}
            </div>
          </div>

          {/* Key Quick Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/50 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{place.address}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">{place.openingHours}</span>
              {place.isOpenNow ? (
                <span className="text-[10px] text-emerald-400 font-bold ml-auto">OPEN</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-bold ml-auto">CLOSED</span>
              )}
            </div>
          </div>

          {/* Audio Story Guide (PDF page 6 & 11) */}
          {place.audioGuide && (
            <div className="bg-gradient-to-r from-blue-900/30 to-amber-900/30 border border-blue-500/20 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Voices of Kosovo Audio Clip</h4>
                    <p className="text-[10px] text-slate-400">
                      Narrated by {place.audioGuide.narratorEn} ({place.audioGuide.durationSec}s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`px-3 py-1 text-xs rounded-full font-bold flex items-center gap-1 transition ${
                    isPlayingAudio
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  aria-label={isPlayingAudio ? 'Pause audio story' : 'Play audio story'}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" /> Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" /> Listen
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 italic border-l-2 border-amber-400/50 pl-2.5 py-0.5">
                &ldquo;{lang === 'sq' ? place.audioGuide.summarySq : place.audioGuide.summaryEn}&rdquo;
              </p>
            </div>
          )}

          {/* Description */}
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>{place.description}</p>
          </div>

          {/* Local Tip Box (PDF feature) */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-0.5">
                {t.local_tip}
              </h4>
              <p className="text-xs text-slate-200">{place.localTip}</p>
            </div>
          </div>

          {/* Must-Try Gastronomy / Dish if applicable */}
          {place.mustTryDish && (
            <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
              <span className="text-lg">🥘</span>
              <div className="text-xs">
                <span className="text-slate-400 font-medium">Culinary Highlight: </span>
                <span className="text-amber-300 font-semibold">{place.mustTryDish}</span>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons: Unlock Stamp & Directions */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onOpenUnlock(place)}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition"
              aria-label={`Unlock photo stamp for ${place.title}`}
            >
              <Camera className="w-4 h-4" />
              <span>{isUnlocked ? 'Re-Verify / Take New Photo' : t.unlock_stamp}</span>
            </button>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 border border-white/10 transition"
              aria-label={`Open directions to ${place.title} in external map`}
            >
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>{t.directions}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
