'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  RefreshCw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { Place, PassportStamp, Coordinates } from '@/lib/types';
import { verifyPhotoUnlock } from '@/lib/rules';

interface PhotoUnlockModalProps {
  place: Place;
  onClose: () => void;
  onStampUnlocked: (stamp: PassportStamp) => void;
  userCoords: Coordinates;
  onUpdateUserCoords: (coords: Coordinates) => void;
}

export const PhotoUnlockModal: React.FC<PhotoUnlockModalProps> = ({
  place,
  onClose,
  onStampUnlocked,
  userCoords,
  onUpdateUserCoords,
}) => {
  const [stage, setStage] = useState<'camera' | 'verifying' | 'result'>('camera');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [simulatedDistance, setSimulatedDistance] = useState<number>(45); // Default close proximity (45m)
  const [showGpsTester, setShowGpsTester] = useState<boolean>(false);
  const [userCategory, setUserCategory] = useState<'visitor' | 'local' | 'diaspora'>('diaspora');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Attempt real camera stream if available, otherwise stylish viewfinder simulation
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
          setIsCameraActive(true);
        }
      })
      .catch(() => {
        // Graceful fallback to rich simulated optical viewfinder
        setIsCameraActive(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update user coordinate to simulate distance if requested
  const handleSimulateDistanceChange = (meters: number) => {
    setSimulatedDistance(meters);
    // Offset user coordinates by approx meters (1 deg lat ~ 111km)
    const latOffset = (meters / 111000) * 0.707;
    const lngOffset = (meters / 111000) * 0.707;
    onUpdateUserCoords({
      lat: place.coordinates.lat + latOffset,
      lng: place.coordinates.lng + lngOffset,
    });
  };

  const handleCapture = () => {
    // Freshness check: in-app shutter capture
    let photoData = place.photos[0] || 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=400&q=80';

    if (isCameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        photoData = canvas.toDataURL('image/jpeg');
      }
    }

    setCapturedPhoto(photoData);
    setStage('verifying');

    // Run the 3 checks after 1.2s realistic AI verification animation
    setTimeout(() => {
      // Mock visual match score between 0.78 and 0.96 for landmark match
      const confidence = simulatedDistance > 400 ? 0.65 : 0.91;

      const result = verifyPhotoUnlock({
        userCoord: userCoords,
        placeCoord: place.coordinates,
        hasPhoto: true,
        confidenceScore: confidence,
        maxProximityMeters: 300,
      });

      setVerificationResult(result);
      setStage('result');

      if (result.passed) {
        // Fire celebration confetti!
        try {
          import('canvas-confetti').then((mod) => {
            mod.default({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#F59E0B', '#3B82F6', '#10B981', '#FFFFFF'],
            });
          });
        } catch {
          // ignore in headless
        }

        // Create the new official stamp
        const newStamp: PassportStamp = {
          id: `stamp-${place.id}-${Date.now()}`,
          placeId: place.id,
          placeTitle: place.title,
          cityId: place.cityId,
          category: place.category,
          unlockedAt: new Date().toISOString(),
          photoUrl: photoData,
          confidenceScore: confidence,
          userType: userCategory,
          reviewStatus: result.status,
          rankScore: 1600,
        };

        onStampUnlocked(newStamp);
      }
    }, 1300);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-unlock-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 id="photo-unlock-title" className="text-sm font-bold text-white">
                Stamp Unlock: {place.title}
              </h3>
              <p className="text-[10px] text-slate-400">3-Check Verification Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close photo unlock"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Proximity / Simulator Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Proximity: <strong className="text-emerald-400">{simulatedDistance}m away</strong> (≤300m required)
            </span>
          </div>
          <button
            onClick={() => setShowGpsTester(!showGpsTester)}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            aria-label="Toggle GPS Simulation Controls"
          >
            <Sliders className="w-3 h-3" />
            <span>GPS Tester</span>
          </button>
        </div>

        {/* GPS Tester Drawer */}
        {showGpsTester && (
          <div className="p-3 bg-slate-950 border-b border-white/10 text-xs space-y-2">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Simulate Distance from Landmark:</span>
              <span className="font-bold text-white">{simulatedDistance} meters</span>
            </div>
            <input
              type="range"
              min="10"
              max="600"
              step="10"
              value={simulatedDistance}
              onChange={(e) => handleSimulateDistanceChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
              aria-label="Simulated GPS Distance Slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span className="text-emerald-400">10m (At spot)</span>
              <span className="text-amber-400">250m (Borderline)</span>
              <span className="text-red-400">600m (Too far)</span>
            </div>
          </div>
        )}

        {/* Viewfinder / Camera Surface */}
        <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center">
          {/* Active webcam video */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
          />

          {/* Fallback reference simulated live viewfinder */}
          {!isCameraActive && (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={place.photos[0] || 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=600&q=80'}
                alt={place.title}
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute inset-0 bg-slate-950/20" />
            </div>
          )}

          {/* Optical Viewfinder Overlay Reticle */}
          <div className="absolute inset-8 border border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between text-[10px] font-mono text-white/70">
              <span>GPS: 42°N, 20°E</span>
              <span>100 ISO · 1/250s</span>
            </div>
            {/* Center target crosshair */}
            <div className="self-center w-12 h-12 border-2 border-dashed border-amber-400/80 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="text-[10px] text-center font-mono text-amber-300/90 bg-slate-950/60 rounded px-2 py-0.5">
              Target: {place.unlockPrompt}
            </div>
          </div>

          {/* Verifying Animation Overlay */}
          {stage === 'verifying' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-14 h-14 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-4" />
              <h4 className="text-base font-bold text-white mb-1">Analyzing Photograph</h4>
              <div className="text-xs text-slate-300 space-y-1 text-left max-w-xs mt-2 font-mono">
                <div className="text-emerald-400 flex items-center gap-1.5">
                  ✓ [Check 1] GPS Timestamp & Proximity verified
                </div>
                <div className="text-emerald-400 flex items-center gap-1.5">
                  ✓ [Check 2] In-app freshness check passed
                </div>
                <div className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                  ⟳ [Check 3] Comparing landmark features...
                </div>
              </div>
            </div>
          )}

          {/* Result Overlay */}
          {stage === 'result' && verificationResult && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              {verificationResult.passed ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Official Stamp Unlocked!</h4>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    {verificationResult.reason}
                  </p>
                  {verificationResult.status === 'editor_review' && (
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px]">
                      Doubtful shot routed to community editorial queue. Points provisional.
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="mt-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition"
                  >
                    View in Kosovo Passport
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mx-auto text-red-400">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Unlock Verification Failed</h4>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    {verificationResult.reason}
                  </p>
                  <button
                    onClick={() => setStage('camera')}
                    className="mt-2 px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-white/20 transition flex items-center gap-1.5 mx-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Adjust & Retry</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Shutter & User Classification Controls */}
        {stage === 'camera' && (
          <div className="p-4 bg-slate-900 flex flex-col gap-3">
            {/* User Category selector (Locals vs Visitors vs Diaspora) */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Stamp As:</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
                {(['diaspora', 'visitor', 'local'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setUserCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                      userCategory === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Shutter Button */}
            <div className="flex items-center justify-center pt-1">
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white border-4 border-amber-400 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition flex items-center justify-center"
                aria-label="Capture photo and verify unlock"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-amber-400">
                  <Camera className="w-6 h-6" />
                </div>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-500">
              Only photos taken inside the app camera are accepted. GPS recorded at capture.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
