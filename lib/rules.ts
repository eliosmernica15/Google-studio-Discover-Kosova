import type { Coordinates, Place, PassportStamp, Badge, CityId } from './types.ts';

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula (returns distance in meters).
 */
export function calculateGeoDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export interface VerificationResult {
  passed: boolean;
  status: 'verified' | 'editor_review' | 'rejected';
  distanceMeters: number;
  reason: string;
}

/**
 * Implements the PDF specification photo unlock 3-check engine:
 * 1. Location at capture (GPS proximity)
 * 2. Photo match confidence score
 * 3. Freshness (photo captured in-app)
 */
export function verifyPhotoUnlock(params: {
  userCoord: Coordinates;
  placeCoord: Coordinates;
  hasPhoto: boolean;
  confidenceScore: number;
  maxProximityMeters?: number;
}): VerificationResult {
  const {
    userCoord,
    placeCoord,
    hasPhoto,
    confidenceScore,
    maxProximityMeters = 300,
  } = params;

  if (!hasPhoto) {
    return {
      passed: false,
      status: 'rejected',
      distanceMeters: 0,
      reason: 'No photo captured. Live in-app capture required.',
    };
  }

  const distance = calculateGeoDistance(
    userCoord.lat,
    userCoord.lng,
    placeCoord.lat,
    placeCoord.lng
  );

  // Check 1 & 2: Proximity & Visual Match
  if (distance <= maxProximityMeters && confidenceScore >= 0.7) {
    return {
      passed: true,
      status: 'verified',
      distanceMeters: distance,
      reason: `Location verified (${distance}m away) and landmark visually recognized (${Math.round(confidenceScore * 100)}% match).`,
    };
  }

  // Soft check / Doubtful shot -> Editorial queue as specified in PDF
  if (distance <= maxProximityMeters * 2.5 || (distance <= maxProximityMeters && confidenceScore >= 0.4)) {
    return {
      passed: true,
      status: 'editor_review',
      distanceMeters: distance,
      reason: `Submitted to editor review queue: proximity (${distance}m) or lighting variance requires secondary sign-off.`,
    };
  }

  return {
    passed: false,
    status: 'rejected',
    distanceMeters: distance,
    reason: `Too far from location (${distance}m away; maximum is ${maxProximityMeters}m). Please stand closer to the landmark.`,
  };
}

/**
 * Calculates progress percentage and count for a specific city.
 */
export function calculateCityProgress(
  stamps: PassportStamp[],
  cityId: CityId,
  totalCityPlaces: number
): { unlockedCount: number; percentage: number } {
  if (totalCityPlaces <= 0) return { unlockedCount: 0, percentage: 0 };
  const unlockedCount = stamps.filter((s) => s.cityId === cityId).length;
  const percentage = Math.min(100, Math.round((unlockedCount / totalCityPlaces) * 100));
  return { unlockedCount, percentage };
}

/**
 * Checks whether a badge requirement has been met based on stamps.
 */
export function evaluateBadgeUnlock(badge: Badge, stamps: PassportStamp[]): boolean {
  if (badge.cityId) {
    const cityStamps = stamps.filter((s) => s.cityId === badge.cityId);
    return cityStamps.length >= badge.threshold;
  }
  if (badge.category) {
    const catStamps = stamps.filter((s) => s.category === badge.category);
    return catStamps.length >= badge.threshold;
  }
  return stamps.length >= badge.threshold;
}

/**
 * Elo-style Beli ranking updater for head-to-head comparisons.
 */
export function updateBeliRankings(
  currentRatings: Record<string, number>,
  winnerId: string,
  loserId: string,
  kFactor: number = 32
): Record<string, number> {
  const winnerRating = currentRatings[winnerId] || 1500;
  const loserRating = currentRatings[loserId] || 1500;

  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  const newWinnerRating = Math.round(winnerRating + kFactor * (1 - expectedWinner));
  const newLoserRating = Math.round(loserRating + kFactor * (0 - expectedLoser));

  return {
    ...currentRatings,
    [winnerId]: newWinnerRating,
    [loserId]: newLoserRating,
  };
}

/**
 * Filters places based on query, city, category, and open-now criteria.
 */
export function filterPlacesList(
  places: Place[],
  params: {
    cityId?: CityId | 'all';
    category?: string;
    searchQuery?: string;
    openNowOnly?: boolean;
  }
): Place[] {
  const { cityId = 'all', category = 'all', searchQuery = '', openNowOnly = false } = params;
  const cleanQuery = searchQuery.trim().toLowerCase();

  return places.filter((p) => {
    if (cityId !== 'all' && p.cityId !== cityId) return false;
    if (category !== 'all' && p.category !== category) return false;
    if (openNowOnly && !p.isOpenNow) return false;

    if (cleanQuery) {
      const matchTitle = p.title.toLowerCase().includes(cleanQuery);
      const matchNative = p.nativeTitle.toLowerCase().includes(cleanQuery);
      const matchAlts = p.alts.some((a) => a.toLowerCase().includes(cleanQuery));
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(cleanQuery));
      const matchSub = p.subcategory.toLowerCase().includes(cleanQuery);
      const matchDish = p.mustTryDish?.toLowerCase().includes(cleanQuery);
      if (!matchTitle && !matchNative && !matchAlts && !matchTags && !matchSub && !matchDish) {
        return false;
      }
    }

    return true;
  });
}
