export type CityId = 'pristina' | 'prizren' | 'peja' | 'gjakova' | 'mitrovica' | 'gjilan' | 'ferizaj' | 'beyond';

export type PlaceCategory = 'see' | 'eat' | 'stay' | 'nightlife' | 'nature' | 'events';

export type TrailDifficulty = 'Easy' | 'Moderate' | 'Demanding' | 'Extreme';

export type LanguageCode = 'en' | 'sq' | 'de' | 'tr';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface City {
  id: CityId;
  name: string;
  nativeName: string;
  alts: string[];
  tagline: string;
  description: string;
  heroImage: string;
  accentColor: string;
  coordinates: Coordinates;
  stats: {
    placesCount: number;
    trailsCount: number;
    topDish: string;
    festivalsCount: number;
  };
}

export interface Place {
  id: string;
  cityId: CityId;
  title: string;
  nativeTitle: string;
  alts: string[];
  category: PlaceCategory;
  subcategory: string;
  rating: number;
  reviewsCount: number;
  priceLevel: '€' | '€€' | '€€€' | 'Free';
  coordinates: Coordinates;
  address: string;
  openingHours: string;
  isOpenNow: boolean;
  description: string;
  localTip: string;
  mustTryDish?: string;
  photos: string[];
  tags: string[];
  audioGuide?: {
    durationSec: number;
    narratorEn: string;
    narratorSq: string;
    summaryEn: string;
    summarySq: string;
  };
  unlockPrompt: string;
  isUnlocked?: boolean;
}

export interface TrailPoint {
  lat: number;
  lng: number;
  elevation: number;
}

export interface Trail {
  id: string;
  title: string;
  nativeTitle: string;
  region: string;
  cityId: CityId;
  distanceKm: number;
  elevationGainM: number;
  durationHours: number;
  difficulty: TrailDifficulty;
  points: TrailPoint[];
  description: string;
  highlights: string[];
  season: string;
  safetyNotice: string;
  heroImage: string;
}

export interface Dish {
  id: string;
  name: string;
  albanianName: string;
  region: string;
  description: string;
  ingredients: string[];
  whereToEat: string[]; // Place IDs or venue names
  traditionNote: string;
  image: string;
}

export interface EventItem {
  id: string;
  title: string;
  cityId: CityId;
  venue: string;
  dates: string;
  description: string;
  category: 'festival' | 'film' | 'music' | 'diaspora' | 'tradition';
  isCurrentSummer: boolean;
  image: string;
}

export interface PassportStamp {
  id: string;
  placeId: string;
  placeTitle: string;
  cityId: CityId;
  category: PlaceCategory;
  unlockedAt: string; // ISO date
  photoUrl?: string;
  confidenceScore: number;
  userType: 'local' | 'visitor' | 'diaspora';
  reviewStatus: 'verified' | 'editor_review' | 'rejected' | 'flagged';
  rankScore?: number;
}

export interface Badge {
  id: string;
  title: string;
  cityId?: CityId;
  category?: PlaceCategory;
  description: string;
  icon: string;
  threshold: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface VillageQuest {
  id: string;
  municipality: string;
  villageName: string;
  title: string;
  description: string;
  familyStory: string;
  coordinates: Coordinates;
  placesNearby: string[];
  isCompleted?: boolean;
}

export interface OfflinePack {
  cityId: CityId;
  cityName: string;
  sizeMb: number;
  downloadedAt: string | null;
  isDownloaded: boolean;
  itemCount: number;
}
