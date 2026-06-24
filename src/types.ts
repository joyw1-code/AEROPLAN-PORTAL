export interface Flight {
  id: string;
  airline: string;
  logo: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  layovers?: { airport: string; duration: string }[];
}

export interface Accommodation {
  id: string;
  name: string;
  image: string;
  rating: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
  latitude: number;
  longitude: number;
}

export interface CarRental {
  id: string;
  model: string;
  type: string; // SUV, Sedan, Coupe etc
  image: string;
  company: string;
  pricePerDay: number;
  transmission: string;
  fuelType: string;
}

export interface RecommendationPlace {
  name: string;
  category: string;
  description: string;
  rating: number;
  address: string;
  latitude: number;
  longitude: number;
}

export interface ItineraryActivity {
  timeOfDay: string;
  title: string;
  description: string;
  tip?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  theme: string;
  activities: ItineraryActivity[];
}

export interface Itinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
}

export interface BookingItem {
  id: string;
  type: 'flight' | 'accommodation' | 'car';
  title: string;
  subtitle: string;
  price: number;
  quantity?: number;
  details?: Record<string, any>;
  seat?: string;
  passengersCount?: number;
}

export interface PriceHistoryPoint {
  day: number;
  date: string;
  price: number;
  average: number;
}

export interface PricingAlert {
  id: string;
  type: 'flight' | 'accommodation' | 'car';
  from: string;
  to: string;
  targetPrice: number;
  currentPrice: number;
  status: 'active' | 'triggered';
}
