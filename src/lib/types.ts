export type Region = 'Saudi Arabia' | 'GCC' | 'Arab World';
export type SpendStyle = 'smart' | 'balanced' | 'comfort';
export type TripType = 'round' | 'oneway';
export type DateMode = 'anytime' | 'specific';

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
  tripType: TripType;
  spendStyle: SpendStyle;
};

export type CostBreakdown = {
  flight: number;
  hotel: number;
  food: number;
  local: number;
  activities: number;
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
  remaining: number;
  within: boolean;
  budgetUsage: number;
  score: number;
  rooms: number;
  travelers: number;
  nativeCurrency: string;
  fxRateToSar: number;
};
