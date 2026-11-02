'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppHeader } from '@/components/AppHeader';
import { Navbar } from '@/components/Navbar';
import { HomeAtlasView } from '@/components/HomeAtlasView';
import { PassportView } from '@/components/PassportView';
import { TrailsView } from '@/components/TrailsView';
import { TasteAndDiasporaView } from '@/components/TasteAndDiasporaView';
import { PlaceDetailModal } from '@/components/PlaceDetailModal';
import { PhotoUnlockModal } from '@/components/PhotoUnlockModal';
import { AskKosovoModal } from '@/components/AskKosovoModal';
import { OfflineManagerModal } from '@/components/OfflineManagerModal';

const InteractiveMap = dynamic(
  () => import('@/components/InteractiveMap').then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-125px)] min-h-[500px] bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-medium">
        Loading Interactive Kosovo Map...
      </div>
    ),
  }
);

import { Place, CityId, LanguageCode, PassportStamp, Coordinates } from '@/lib/types';
import { KOSOVO_PLACES, INITIAL_STAMPS } from '@/lib/kosovo-data';

export default function DiscoverKosovoApp() {
  const [activeTab, setActiveTab] = useState<'atlas' | 'map' | 'passport' | 'trails' | 'taste'>('atlas');
  const [selectedCityId, setSelectedCityId] = useState<CityId | 'all'>('all');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [diasporaMode, setDiasporaMode] = useState<boolean>(false);

  const [places] = useState<Place[]>(KOSOVO_PLACES);

  const [stamps, setStamps] = useState<PassportStamp[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('discover_kosovo_stamps');
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_STAMPS;
  });

  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('discover_kosovo_saved_places');
        if (saved) return new Set(JSON.parse(saved));
      } catch {
        // fallback
      }
    }
    return new Set(['prizren-fortress', 'rugova-canyon']);
  });

  const [downloadedCityIds, setDownloadedCityIds] = useState<Set<CityId>>(
    new Set(['prizren', 'pristina'])
  );

  // User simulated/real location coordinates (Default: Prizren center)
  const [userCoords, setUserCoords] = useState<Coordinates>({
    lat: 42.2139,
    lng: 20.7397,
  });

  // Modal states
  const [activeDetailPlace, setActiveDetailPlace] = useState<Place | null>(null);
  const [activeUnlockPlace, setActiveUnlockPlace] = useState<Place | null>(null);
  const [isAskAIOpen, setIsAskAIOpen] = useState<boolean>(false);
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState<boolean>(false);

  // Check geolocation on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (
            pos.coords.latitude >= 41.8 &&
            pos.coords.latitude <= 43.3 &&
            pos.coords.longitude >= 20.0 &&
            pos.coords.longitude <= 21.8
          ) {
            setUserCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        },
        () => {
          // Keep default Prizren / Pristina hub
        },
        { timeout: 4000 }
      );
    }
  }, []);

  // Save updates to localStorage
  const handleStampUnlocked = (newStamp: PassportStamp) => {
    const updated = [newStamp, ...stamps.filter((s) => s.placeId !== newStamp.placeId)];
    setStamps(updated);
    try {
      localStorage.setItem('discover_kosovo_stamps', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggleSave = (placeId: string) => {
    const next = new Set(savedPlaceIds);
    if (next.has(placeId)) {
      next.delete(placeId);
    } else {
      next.add(placeId);
    }
    setSavedPlaceIds(next);
    try {
      localStorage.setItem('discover_kosovo_saved_places', JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  };

  const handleToggleDownloadPack = (cityId: CityId) => {
    const next = new Set(downloadedCityIds);
    if (next.has(cityId)) {
      next.delete(cityId);
    } else {
      next.add(cityId);
    }
    setDownloadedCityIds(next);
  };

  const handleToggleDiasporaMode = () => {
    const nextVal = !diasporaMode;
    setDiasporaMode(nextVal);
    try {
      localStorage.setItem('discover_kosovo_diaspora', String(nextVal));
    } catch {
      // ignore
    }
  };

  const handleChangeLang = (newLang: LanguageCode) => {
    setLang(newLang);
    try {
      localStorage.setItem('discover_kosovo_lang', newLang);
    } catch {
      // ignore
    }
  };

  const unlockedPlaceIds = new Set(stamps.map((s) => s.placeId));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top App Header with City Switcher, Diaspora Toggle, Search AI */}
      <AppHeader
        selectedCityId={selectedCityId}
        onSelectCity={setSelectedCityId}
        lang={lang}
        onChangeLang={handleChangeLang}
        diasporaMode={diasporaMode}
        onToggleDiasporaMode={handleToggleDiasporaMode}
        onOpenAskAI={() => setIsAskAIOpen(true)}
        onOpenOfflineManager={() => setIsOfflineManagerOpen(true)}
        offlinePacksCount={downloadedCityIds.size}
      />

      {/* Main Tab View Container */}
      <main className="flex-1 w-full flex flex-col">
        {activeTab === 'atlas' && (
          <HomeAtlasView
            places={places}
            selectedCityId={selectedCityId}
            onSelectCity={setSelectedCityId}
            onOpenPlace={(p) => setActiveDetailPlace(p)}
            unlockedPlaceIds={unlockedPlaceIds}
            savedPlaceIds={savedPlaceIds}
            onToggleSave={handleToggleSave}
            diasporaMode={diasporaMode}
            lang={lang}
            onOpenAskAI={() => setIsAskAIOpen(true)}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMap
            places={places}
            stamps={stamps}
            selectedCityId={selectedCityId}
            onSelectPlace={(p) => setActiveDetailPlace(p)}
            userCoords={userCoords}
          />
        )}

        {activeTab === 'passport' && (
          <PassportView
            stamps={stamps}
            places={places}
            onOpenPlace={(p) => setActiveDetailPlace(p)}
            lang={lang}
          />
        )}

        {activeTab === 'trails' && <TrailsView lang={lang} />}

        {activeTab === 'taste' && (
          <TasteAndDiasporaView
            places={places}
            onOpenPlace={(p) => setActiveDetailPlace(p)}
            lang={lang}
            initialSubTab={diasporaMode ? 'diaspora' : 'taste'}
          />
        )}
      </main>

      {/* Place Detail Sheet Modal */}
      {activeDetailPlace && (
        <PlaceDetailModal
          place={activeDetailPlace}
          onClose={() => setActiveDetailPlace(null)}
          onOpenUnlock={(place) => {
            setActiveUnlockPlace(place);
            setActiveDetailPlace(null);
          }}
          isUnlocked={unlockedPlaceIds.has(activeDetailPlace.id)}
          isSaved={savedPlaceIds.has(activeDetailPlace.id)}
          onToggleSave={handleToggleSave}
          lang={lang}
        />
      )}

      {/* Photo Unlock Verification Modal (3-check engine) */}
      {activeUnlockPlace && (
        <PhotoUnlockModal
          place={activeUnlockPlace}
          onClose={() => setActiveUnlockPlace(null)}
          onStampUnlocked={(stamp) => {
            handleStampUnlocked(stamp);
          }}
          userCoords={userCoords}
          onUpdateUserCoords={setUserCoords}
        />
      )}

      {/* Ask Kosovo AI Modal */}
      {isAskAIOpen && (
        <AskKosovoModal
          onClose={() => setIsAskAIOpen(false)}
          onOpenPlaceById={(id) => {
            const found = places.find((p) => p.id === id);
            if (found) setActiveDetailPlace(found);
          }}
          lang={lang}
        />
      )}

      {/* Offline City Pack Manager Modal */}
      {isOfflineManagerOpen && (
        <OfflineManagerModal
          onClose={() => setIsOfflineManagerOpen(false)}
          downloadedCityIds={downloadedCityIds}
          onToggleDownloadPack={handleToggleDownloadPack}
        />
      )}

      {/* Floating Liquid Glass Bottom Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        stampsCount={stamps.length}
      />
    </div>
  );
}
