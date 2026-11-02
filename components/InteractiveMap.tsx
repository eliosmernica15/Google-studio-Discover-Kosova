'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Compass,
  Crosshair,
  Layers,
  Sparkles,
  Eye,
  Utensils,
  Bed,
  Trees,
  Wine,
} from 'lucide-react';
import { Place, CityId, PassportStamp } from '@/lib/types';
import { calculateGeoDistance } from '@/lib/rules';

interface InteractiveMapProps {
  places: Place[];
  stamps: PassportStamp[];
  selectedCityId: CityId | 'all';
  onSelectPlace: (place: Place) => void;
  userCoords: { lat: number; lng: number };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places,
  stamps,
  selectedCityId,
  onSelectPlace,
  userCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [scratchMapEnabled, setScratchMapEnabled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPinPlace, setSelectedPinPlace] = useState<Place | null>(null);

  // Filter places based on active category and city
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (selectedCityId !== 'all' && p.cityId !== selectedCityId) return false;
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      return true;
    });
  }, [places, selectedCityId, activeCategory]);

  // Compute nearest place to user's current coordinates
  const nearestPlaceInfo = useMemo(() => {
    if (places.length === 0) return null;
    let closest = places[0];
    let minDistance = Infinity;

    for (const p of places) {
      const dist = calculateGeoDistance(
        userCoords.lat,
        userCoords.lng,
        p.coordinates.lat,
        p.coordinates.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        closest = p;
      }
    }
    return { place: closest, distanceMeters: minDistance };
  }, [places, userCoords]);

  // Map initialization with Leaflet
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (leafletMapRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;
        if (leafletMapRef.current) return;
        if ((mapContainerRef.current as any)?._leaflet_id) return;

        // Leaflet CSS inject if not present
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Center on Kosovo: 42.6026, 20.9030
        const map = L.map(mapContainerRef.current, {
          center: [42.6026, 20.903],
          zoom: 9,
          zoomControl: false,
        });

        // Add OpenStreetMap open-source tiles (no API key required)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        leafletMapRef.current = map;
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update map center & markers when filtered places or city changes
  useEffect(() => {
    async function updateMarkers() {
      if (!leafletMapRef.current || !markersLayerRef.current) return;
      const L = (await import('leaflet')).default;

      markersLayerRef.current.clearLayers();

      const stampIds = new Set(stamps.map((s) => s.placeId));

      filteredPlaces.forEach((place) => {
        const isUnlocked = stampIds.has(place.id);
        const iconHtml = `
          <div style="
            background: ${isUnlocked ? '#10B981' : '#0F172A'};
            border: 2px solid ${isUnlocked ? '#34D399' : '#F59E0B'};
            color: white;
            border-radius: 9999px;
            padding: 4px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            cursor: pointer;
            transform: scale(${isUnlocked ? 1.1 : 1});
            transition: all 0.2s ease;
          ">
            ${isUnlocked ? '✓' : place.category === 'eat' ? '🍽️' : place.category === 'nature' ? '🌲' : '📍'}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-kosovo-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
          icon: customIcon,
        });

        marker.on('click', () => {
          setSelectedPinPlace(place);
        });

        marker.addTo(markersLayerRef.current);
      });

      // Add user position marker
      const userIcon = L.divIcon({
        html: `
          <div style="
            background: #3B82F6;
            border: 2px solid white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            box-shadow: 0 0 12px #3B82F6;
            animation: pulse 2s infinite;
          "></div>
        `,
        className: 'user-pos-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(
        markersLayerRef.current
      );

      // If viewing a specific city, pan to its first place
      if (selectedCityId !== 'all' && filteredPlaces.length > 0) {
        leafletMapRef.current.flyTo(
          [filteredPlaces[0].coordinates.lat, filteredPlaces[0].coordinates.lng],
          12,
          { duration: 1.2 }
        );
      }
    }

    updateMarkers();
  }, [filteredPlaces, stamps, selectedCityId, userCoords]);

  const categories = [
    { id: 'all', label: 'All Pins', icon: Layers },
    { id: 'see', label: 'Culture & Sights', icon: Eye },
    { id: 'eat', label: 'Food & Cafés', icon: Utensils },
    { id: 'nature', label: 'Nature & Parks', icon: Trees },
    { id: 'stay', label: 'Stays', icon: Bed },
    { id: 'nightlife', label: 'Nightlife', icon: Wine },
  ];

  const recentUnlockedPlacesCount = stamps.length;

  return (
    <div className="relative w-full h-[calc(100vh-125px)] min-h-[500px] overflow-hidden bg-slate-950">
      {/* Map Surface */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0"
        style={{ filter: scratchMapEnabled ? 'contrast(1.1) brightness(0.9)' : undefined }}
      />

      {/* Zenly/Bump Scratch Map Fog of War Overlay */}
      {scratchMapEnabled && (
        <div className="absolute inset-0 pointer-events-none z-10 bg-slate-950/40 backdrop-blur-[2px] transition-all">
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-amber-400/40 rounded-full px-4 py-1.5 text-xs text-amber-300 font-semibold shadow-xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Scratch Map Active: {recentUnlockedPlacesCount} Landmarks Cleared</span>
          </div>
        </div>
      )}

      {/* Top Floating Controls & Filters */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Horizontal Category Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto no-scrollbar">
          {categories.map((c) => {
            const Icon = c.icon;
            const isCatActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition shadow-md backdrop-blur-md ${
                  isCatActive
                    ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-300 border border-white/15 hover:bg-slate-800'
                }`}
                aria-label={`Filter map by ${c.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Proximity / Nearest Place Radar Banner */}
        {nearestPlaceInfo && (
          <div className="self-start pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-slate-200">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>
              Nearest spot: <strong className="text-white">{nearestPlaceInfo.place.title}</strong>{' '}
              <span className="text-emerald-400 font-bold">
                ({nearestPlaceInfo.distanceMeters < 1000
                  ? `${nearestPlaceInfo.distanceMeters}m`
                  : `${(nearestPlaceInfo.distanceMeters / 1000).toFixed(1)}km`})
              </span>
            </span>
            <button
              onClick={() => onSelectPlace(nearestPlaceInfo.place)}
              className="text-[11px] text-amber-400 underline font-bold ml-1 hover:text-amber-300"
            >
              View
            </button>
          </div>
        )}
      </div>

      {/* Right Map Action Buttons */}
      <div className="absolute right-3 top-20 z-20 flex flex-col gap-2">
        {/* Scratch Map Toggle (Bump / Zenly feature) */}
        <button
          onClick={() => setScratchMapEnabled(!scratchMapEnabled)}
          className={`p-2.5 rounded-2xl backdrop-blur-md border shadow-lg transition active:scale-95 ${
            scratchMapEnabled
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-slate-900/85 text-slate-300 border-white/15 hover:text-white'
          }`}
          title="Toggle Scratch Map (Fog of war that clears as you explore)"
          aria-label="Toggle scratch map overlay"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Recenter Kosovo Button */}
        <button
          onClick={() => {
            if (leafletMapRef.current) {
              leafletMapRef.current.flyTo([42.6026, 20.903], 9, { duration: 1 });
            }
          }}
          className="p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md text-slate-300 border border-white/15 hover:text-white shadow-lg transition active:scale-95"
          title="Recenter Kosovo"
          aria-label="Recenter map to all Kosovo"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Place Preview Card (Bump / Life360 sheet peek) */}
      {selectedPinPlace && (
        <div className="absolute bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-20 z-30 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPinPlace.photos[0] || 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=200&q=80'}
              alt={selectedPinPlace.title}
              className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  {selectedPinPlace.subcategory}
                </span>
                <span className="text-xs text-white font-bold">★ {selectedPinPlace.rating}</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">{selectedPinPlace.title}</h4>
              <p className="text-xs text-slate-400 truncate">{selectedPinPlace.address}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => onSelectPlace(selectedPinPlace)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
                >
                  Open Guide
                </button>
                <button
                  onClick={() => setSelectedPinPlace(null)}
                  className="px-2 py-1 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
