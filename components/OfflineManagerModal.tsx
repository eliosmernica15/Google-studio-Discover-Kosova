'use client';

import React, { useState } from 'react';
import {
  X,
  DownloadCloud,
  CheckCircle,
  Trash2,
  HardDrive,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { CityId, OfflinePack } from '@/lib/types';
import { KOSOVO_CITIES, KOSOVO_PLACES } from '@/lib/kosovo-data';

interface OfflineManagerModalProps {
  onClose: () => void;
  downloadedCityIds: Set<CityId>;
  onToggleDownloadPack: (cityId: CityId) => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  onClose,
  downloadedCityIds,
  onToggleDownloadPack,
}) => {
  const [downloadingId, setDownloadingId] = useState<CityId | null>(null);

  const packs: OfflinePack[] = KOSOVO_CITIES.map((c) => {
    const placesInCity = KOSOVO_PLACES.filter((p) => p.cityId === c.id);
    const isDownloaded = downloadedCityIds.has(c.id);
    return {
      cityId: c.id,
      cityName: `${c.name} (${c.nativeName})`,
      sizeMb: Math.max(12, placesInCity.length * 3.8),
      downloadedAt: isDownloaded ? '2026-07-15' : null,
      isDownloaded,
      itemCount: placesInCity.length,
    };
  });

  const totalDownloadedMb = packs
    .filter((p) => p.isDownloaded)
    .reduce((acc, p) => acc + p.sizeMb, 0);

  const handleAction = (cityId: CityId) => {
    if (downloadedCityIds.has(cityId)) {
      onToggleDownloadPack(cityId);
    } else {
      setDownloadingId(cityId);
      setTimeout(() => {
        onToggleDownloadPack(cityId);
        setDownloadingId(null);
      }, 800);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-manager-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 id="offline-manager-title" className="text-sm font-bold text-white">
                Offline City Packs & Cache
              </h3>
              <p className="text-[10px] text-slate-400">
                Explore Kosovo mountains and bazaars without mobile data or signal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close offline manager"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Storage Summary */}
        <div className="p-4 bg-slate-950/60 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>
              Device Offline Storage Used:{' '}
              <strong className="text-white">{totalDownloadedMb.toFixed(1)} MB</strong>
            </span>
          </div>
          <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
            {downloadedCityIds.size} Packs Offline
          </span>
        </div>

        {/* City Packs List */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-2.5">
          {packs.map((pack) => {
            const isDownloading = downloadingId === pack.cityId;
            return (
              <div
                key={pack.cityId}
                className="p-3 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{pack.cityName}</h4>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{pack.itemCount} places & guides</span>
                    <span>•</span>
                    <span>~{pack.sizeMb.toFixed(1)} MB (incl. map tiles)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pack.isDownloaded ? (
                    <button
                      onClick={() => handleAction(pack.cityId)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition"
                      aria-label={`Remove offline pack for ${pack.cityName}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Ready (Remove)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(pack.cityId)}
                      disabled={isDownloading}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                      aria-label={`Download offline pack for ${pack.cityName}`}
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Packs include text, reference photos and vector map tiles</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
