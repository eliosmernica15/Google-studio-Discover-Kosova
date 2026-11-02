'use client';

import React, { useState } from 'react';
import {
  Mountain,
  Download,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  Sun,
  Shield,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Trail, LanguageCode } from '@/lib/types';
import { KOSOVO_TRAILS } from '@/lib/kosovo-data';

interface TrailsViewProps {
  lang: LanguageCode;
}

export const TrailsView: React.FC<TrailsViewProps> = ({ lang }) => {
  const [selectedTrail, setSelectedTrail] = useState<Trail>(KOSOVO_TRAILS[0]);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [expandedSafety, setExpandedSafety] = useState(false);

  const handleDownloadGpx = (trail: Trail) => {
    // Generate clean GPX XML file content
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Discover Kosovo" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${trail.title}</name>
    <desc>${trail.description}</desc>
  </metadata>
  <trk>
    <name>${trail.title}</name>
    <trkseg>
      ${trail.points.map((p) => `<trkpt lat="${p.lat}" lon="${p.lng}"><ele>${p.elevation}</ele></trkpt>`).join('\n      ')}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trail.id}-discover-kosovo.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessToast(`Downloaded offline GPX for ${trail.title}!`);
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-36 sm:pb-40 text-slate-100 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Mountain className="w-4 h-4" />
              <span>Trail & Nature Explorer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Bjeshkët e Nemuna & Peaks of the Balkans
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Alpine GPS circuits, highest summits, Via Ferrata climbing routes, and glacial lakes with offline elevation profiles.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <span className="text-2xl">🥾</span>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Circuits</div>
              <div className="text-lg font-black text-emerald-400">{KOSOVO_TRAILS.length} Alpine Tracks</div>
            </div>
          </div>
        </div>
      </div>

      {downloadSuccessToast && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <Download className="w-4 h-4" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Selected Trail Featured Detail & Elevation Chart */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="relative h-56 sm:h-64 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedTrail.heroImage}
            alt={selectedTrail.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                selectedTrail.difficulty === 'Demanding'
                  ? 'bg-red-500/30 text-red-300 border-red-500/40'
                  : selectedTrail.difficulty === 'Moderate'
                  ? 'bg-amber-500/30 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {selectedTrail.difficulty}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-950/80 text-white border border-white/20">
              {selectedTrail.season}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {selectedTrail.title}
            </h3>
            <p className="text-xs text-amber-300 font-medium">{selectedTrail.region}</p>
          </div>
        </div>

        {/* Trail Metrics Strip */}
        <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 bg-slate-950/60 p-4 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Distance</div>
            <div className="text-base font-black text-white mt-0.5">
              {selectedTrail.distanceKm} km
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Elevation Gain</div>
            <div className="text-base font-black text-amber-400 mt-0.5">
              +{selectedTrail.elevationGainM} m
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Estimated Time</div>
            <div className="text-base font-black text-emerald-400 mt-0.5">
              {selectedTrail.durationHours} hrs
            </div>
          </div>
        </div>

        {/* Elevation Profile Visual SVG */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Elevation Profile (Meters above sea level)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Max: {Math.max(...selectedTrail.points.map((p) => p.elevation))}m
            </span>
          </div>

          <div className="w-full h-32 bg-slate-950 rounded-2xl p-3 border border-white/5 relative flex flex-col justify-end">
            <svg className="w-full h-24 overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Build polygon points */}
              {(() => {
                const maxEle = Math.max(...selectedTrail.points.map((p) => p.elevation));
                const minEle = Math.min(...selectedTrail.points.map((p) => p.elevation));
                const range = Math.max(1, maxEle - minEle);

                const coords = selectedTrail.points.map((p, idx) => {
                  const x = (idx / (selectedTrail.points.length - 1)) * 100;
                  const y = 45 - ((p.elevation - minEle) / range) * 40;
                  return `${x},${y}`;
                });

                const polyPoints = `0,50 ${coords.join(' ')} 100,50`;
                const linePoints = coords.join(' ');

                return (
                  <>
                    <polygon points={polyPoints} fill="url(#elevationGrad)" />
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                );
              })()}
            </svg>

            {/* Waypoint labels along profile */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 pt-1 border-t border-white/5">
              <span>Start ({selectedTrail.points[0]?.elevation}m)</span>
              <span>Midpoint</span>
              <span>Peak ({Math.max(...selectedTrail.points.map((p) => p.elevation))}m)</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{selectedTrail.description}</p>

          {/* Highlights */}
          <div className="space-y-1.5">
            <h5 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Trail Highlights:
            </h5>
            <div className="flex flex-wrap gap-2">
              {selectedTrail.highlights.map((h, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-800 text-slate-200 px-3 py-1 rounded-xl border border-white/10"
                >
                  ✓ {h}
                </span>
              ))}
            </div>
          </div>

          {/* Mountain Safety Advisory */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
            <button
              onClick={() => setExpandedSafety(!expandedSafety)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Mountain Safety & Daylight Advisory</span>
              </div>
              {expandedSafety ? (
                <ChevronUp className="w-4 h-4 text-amber-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-300" />
              )}
            </button>
            <p className="text-xs text-slate-200">{selectedTrail.safetyNotice}</p>
            {expandedSafety && (
              <div className="text-[11px] text-slate-300 space-y-1 pt-2 border-t border-amber-500/20 font-sans">
                <p>• Emergency Mountain Rescue Kosovo: Call 112</p>
                <p>• Best hiking hours: 06:30 – 16:30 to avoid sudden late afternoon thunderstorm squalls</p>
                <p>• Water availability: Always fill at shepherd springs or bring purification tablets</p>
              </div>
            )}
          </div>

          {/* Actions: Download GPX */}
          <div className="pt-2">
            <button
              onClick={() => handleDownloadGpx(selectedTrail)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download Offline GPX Track ({selectedTrail.title})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trail Selector Carousel */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white">All Kosovo Alpine Trails</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {KOSOVO_TRAILS.map((trail) => {
            const isSelected = selectedTrail.id === trail.id;
            return (
              <div
                key={trail.id}
                onClick={() => setSelectedTrail(trail)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-400 shadow-md'
                    : 'bg-slate-950/80 border-white/10 hover:bg-slate-900'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trail.heroImage}
                  alt={trail.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-emerald-400">{trail.difficulty}</span>
                    <span className="text-slate-400">{trail.distanceKm} km</span>
                  </div>
                  <h5 className="text-xs font-bold text-white truncate mt-0.5">{trail.title}</h5>
                  <p className="text-[10px] text-slate-400 truncate">{trail.region}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
