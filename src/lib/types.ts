export type Region = 'Saudi Arabia' | 'GCC' | 'Arab World';
export type SpendStyle = 'smart' | 'balanced' | 'comfort';
export type TripType = 'round' | 'oneway';
export type DateMode = 'anytime' | 'specific';
export type PriceConfidence = 'live' | 'reference' | 'allowance';

export type Destination = {
  city: string;
  country: string;
  iata: string;
  currency: string;
  region: Region;
  hotelNight: number;
  dailyFood: number;
  dailyLocal: number;
  dailyActivities: number;
};

export type SearchInput = {
  origin: string;
  destination?: string;
  region?: 'ALL' | Region;
  currency?: string;
  budget: number;
  adults: number;
  children: number;
  days: number;
  dateMode?: DateMode;
  searchMonths?: 1 | 3 | 6 | 12;
  startDate?: string;
  flexDays: number;
  includeHotel: boolean;
  includeFood: boolean;
  includeLocal: boolean;
  includeActivities: boolean;
  includeEssentials?: boolean;
  emergencyPct?: number;
  tripType: TripType;
  spendStyle: SpendStyle;
};

export type CostLine = {
  key: 'flight'|'hotel'|'food'|'local'|'activities'|'essentials'|'emergency';
  amount: number;
  confidence: PriceConfidence;
  unitAmount?: number;
  units?: number;
  unitLabel: string;
  formula: string;
  basis: string;
};

export type CostBreakdown = {
  flight: number;
  hotel: number;
  food: number;
  local: number;
  activities: number;
  essentials: number;
  coreTotal: number;
  emergency: number;
  safeTotal: number;
  total: number;
  perPerson: number;
};

export type TripResult = Destination & {
  departure: string;
  returnDate: string | null;
  carrier: string;
  stops: number;
  liveFare: boolean;
  costs: CostBreakdown;
  costLines: CostLine[];
  remaining: number;
  safeRemaining: number;
  within: boolean;
  safeWithin: boolean;
  budgetUsage: number;
  score: number;
  rooms: number;
  days: number;
  nights: number;
  travelers: number;
  adultsCount: number;
  childrenCount: number;
  spendStyleUsed: SpendStyle;
  emergencyPct: number;
  nativeCurrency: string;
  fxRateToSar: number;
  methodologyVersion: string;
};
