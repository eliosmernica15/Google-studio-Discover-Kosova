import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGeoDistance,
  verifyPhotoUnlock,
  calculateCityProgress,
  evaluateBadgeUnlock,
  updateBeliRankings,
  filterPlacesList,
} from './rules.ts';
import type { Place, PassportStamp, Badge } from './types.ts';

test('calculateGeoDistance returns accurate distance between Prizren Fortress and Stone Bridge', () => {
  // Prizren Fortress: 42.2285, 20.7438
  // Stone Bridge: 42.2100, 20.7410
  const dist = calculateGeoDistance(42.2285, 20.7438, 42.2100, 20.7410);
  // ~2060 meters
  assert.ok(dist > 1900 && dist < 2200, `Expected around 2060m, got ${dist}m`);
});

test('calculateGeoDistance returns 0 for identical points', () => {
  const dist = calculateGeoDistance(42.6629, 21.1655, 42.6629, 21.1655);
  assert.equal(dist, 0);
});

test('verifyPhotoUnlock approves when in proximity and high photo confidence', () => {
  const newbornCoord = { lat: 42.6586, lng: 21.1578 };
  const userNear = { lat: 42.6587, lng: 21.1579 }; // < 20 meters

  const result = verifyPhotoUnlock({
    userCoord: userNear,
    placeCoord: newbornCoord,
    hasPhoto: true,
    confidenceScore: 0.92,
  });

  assert.equal(result.passed, true);
  assert.equal(result.status, 'verified');
  assert.ok(result.distanceMeters < 30);
});

test('verifyPhotoUnlock rejects when photo is missing', () => {
  const result = verifyPhotoUnlock({
    userCoord: { lat: 42.0, lng: 21.0 },
    placeCoord: { lat: 42.0, lng: 21.0 },
    hasPhoto: false,
    confidenceScore: 0.95,
  });

  assert.equal(result.passed, false);
  assert.equal(result.status, 'rejected');
});

test('verifyPhotoUnlock sends to editor review when doubtful or moderately distant', () => {
  const spotCoord = { lat: 42.6586, lng: 21.1578 };
  const userMid = { lat: 42.6610, lng: 21.1610 }; // ~360 meters

  const result = verifyPhotoUnlock({
    userCoord: userMid,
    placeCoord: spotCoord,
    hasPhoto: true,
    confidenceScore: 0.85,
    maxProximityMeters: 250,
  });

  assert.equal(result.passed, true);
  assert.equal(result.status, 'editor_review');
});

test('calculateCityProgress accurately computes percentage', () => {
  const stamps: PassportStamp[] = [
    {
      id: 's1',
      placeId: 'prizren-fortress',
      placeTitle: 'Prizren Fortress',
      cityId: 'prizren',
      category: 'see',
      unlockedAt: '2026-07-01T12:00:00Z',
      confidenceScore: 0.9,
      userType: 'diaspora',
      reviewStatus: 'verified',
    },
    {
      id: 's2',
      placeId: 'sinan-pasha',
      placeTitle: 'Sinan Pasha Mosque',
      cityId: 'prizren',
      category: 'see',
      unlockedAt: '2026-07-01T14:00:00Z',
      confidenceScore: 0.88,
      userType: 'diaspora',
      reviewStatus: 'verified',
    },
  ];

  const progress = calculateCityProgress(stamps, 'prizren', 4);
  assert.equal(progress.unlockedCount, 2);
  assert.equal(progress.percentage, 50);

  const emptyCity = calculateCityProgress(stamps, 'peja', 5);
  assert.equal(emptyCity.unlockedCount, 0);
  assert.equal(emptyCity.percentage, 0);
});

test('evaluateBadgeUnlock triggers at threshold', () => {
  const badge: Badge = {
    id: 'prizren-master',
    title: 'Prizren Guild',
    cityId: 'prizren',
    description: 'Unlock 2 places in Prizren',
    icon: '🏰',
    threshold: 2,
    unlocked: false,
  };

  const stamps: PassportStamp[] = [
    {
      id: 's1',
      placeId: 'prizren-fortress',
      placeTitle: 'Prizren Fortress',
      cityId: 'prizren',
      category: 'see',
      unlockedAt: '2026-07-01T12:00:00Z',
      confidenceScore: 0.9,
      userType: 'diaspora',
      reviewStatus: 'verified',
    },
    {
      id: 's2',
      placeId: 'sinan-pasha',
      placeTitle: 'Sinan Pasha Mosque',
      cityId: 'prizren',
      category: 'see',
      unlockedAt: '2026-07-01T14:00:00Z',
      confidenceScore: 0.88,
      userType: 'diaspora',
      reviewStatus: 'verified',
    },
  ];

  assert.equal(evaluateBadgeUnlock(badge, stamps), true);
  assert.equal(evaluateBadgeUnlock({ ...badge, threshold: 3 }, stamps), false);
});

test('updateBeliRankings awards points to winner and deducts from loser', () => {
  const initial = { 'place-a': 1500, 'place-b': 1500 };
  const updated = updateBeliRankings(initial, 'place-a', 'place-b');

  assert.ok(updated['place-a'] > 1500);
  assert.ok(updated['place-b'] < 1500);
  assert.equal(updated['place-a'] + updated['place-b'], 3000);
});

test('filterPlacesList filters by search query and category', () => {
  const dummyPlaces: Place[] = [
    {
      id: 'p1',
      cityId: 'prizren',
      title: 'Sinan Pasha Mosque',
      nativeTitle: 'Xhamia e Sinan Pashës',
      alts: ['Sinan Paşa Camii'],
      category: 'see',
      subcategory: 'Ottoman Heritage',
      rating: 4.8,
      reviewsCount: 320,
      priceLevel: 'Free',
      coordinates: { lat: 42.21, lng: 20.74 },
      address: 'Sheshi Shadërvan, Prizren',
      openingHours: '08:00 - 22:00',
      isOpenNow: true,
      description: 'Historical mosque built in 1615.',
      localTip: 'Climb the steps near the river for the best sunset angle.',
      photos: [],
      tags: ['mosque', 'ottoman', 'shervan'],
      unlockPrompt: 'Take a photo of the stone minaret',
    },
    {
      id: 'p2',
      cityId: 'peja',
      title: 'Rugova Canyon',
      nativeTitle: 'Gryka e Rugovës',
      alts: ['Rugovska klisura'],
      category: 'nature',
      subcategory: 'Canyon & Cliffs',
      rating: 4.9,
      reviewsCount: 512,
      priceLevel: 'Free',
      coordinates: { lat: 42.69, lng: 20.17 },
      address: 'M9 Highway, Peja',
      openingHours: '24 Hours',
      isOpenNow: true,
      description: 'Deep canyon with sheer rock walls.',
      localTip: 'Visit Kilometre 4 waterfall early morning.',
      photos: [],
      tags: ['canyon', 'climbing', 'nature'],
      unlockPrompt: 'Photograph the rock arch',
    },
  ];

  const searchResults = filterPlacesList(dummyPlaces, { searchQuery: 'Sinan' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 'p1');

  const altMatch = filterPlacesList(dummyPlaces, { searchQuery: 'klisura' });
  assert.equal(altMatch.length, 1);
  assert.equal(altMatch[0].id, 'p2');

  const catMatch = filterPlacesList(dummyPlaces, { category: 'nature' });
  assert.equal(catMatch.length, 1);
  assert.equal(catMatch[0].id, 'p2');
});
