import { Flight, Accommodation, CarRental } from "./types";

export const FLIGHTS: Flight[] = [
  {
    id: "f1",
    airline: "British Airways",
    logo: "🇬🇧",
    from: "New York (JFK)",
    to: "London (LHR)",
    departureTime: "08:15 AM",
    arrivalTime: "08:30 PM",
    duration: "7h 15m",
    price: 450,
    stops: 0
  },
  {
    id: "f2",
    airline: "Virgin Atlantic",
    logo: "🔴",
    from: "New York (JFK)",
    to: "London (LHR)",
    departureTime: "06:30 PM",
    arrivalTime: "06:45 AM",
    duration: "7h 15m",
    price: 520,
    stops: 0
  },
  {
    id: "f3",
    airline: "Air France",
    logo: "🇫🇷",
    from: "New York (JFK)",
    to: "Paris (CDG)",
    departureTime: "04:30 PM",
    arrivalTime: "05:45 AM",
    duration: "7h 15m",
    price: 480,
    stops: 0
  },
  {
    id: "f4",
    airline: "Japan Airlines",
    logo: "🇯🇵",
    from: "New York (JFK)",
    to: "Tokyo (NRT)",
    departureTime: "11:30 AM",
    arrivalTime: "03:15 PM",
    duration: "14h 45m",
    price: 920,
    stops: 0
  },
  {
    id: "f5",
    airline: "Lufthansa",
    logo: "🇩🇪",
    from: "London (LHR)",
    to: "Paris (CDG)",
    departureTime: "10:15 AM",
    arrivalTime: "11:35 AM",
    duration: "1h 20m",
    price: 110,
    stops: 0
  },
  {
    id: "f6",
    airline: "Ana Airways",
    logo: "🔵",
    from: "London (LHR)",
    to: "Tokyo (NRT)",
    departureTime: "01:45 PM",
    arrivalTime: "09:15 AM",
    duration: "11h 30m",
    price: 850,
    stops: 1,
    layovers: [
      { airport: "Seoul (ICN)", duration: "2h 10m" }
    ]
  },
  {
    id: "f7",
    airline: "Air Canada",
    logo: "🇨🇦",
    from: "New York (JFK)",
    to: "London (LHR)",
    departureTime: "06:00 AM",
    arrivalTime: "08:30 PM",
    duration: "9h 30m",
    price: 390,
    stops: 1,
    layovers: [
      { airport: "Toronto (YYZ)", duration: "1h 45m" }
    ]
  },
  {
    id: "f8",
    airline: "Aer Lingus",
    logo: "🇮🇪",
    from: "London (LHR)",
    to: "New York (JFK)",
    departureTime: "11:00 AM",
    arrivalTime: "04:30 PM",
    duration: "10h 30m",
    price: 410,
    stops: 1,
    layovers: [
      { airport: "Dublin (DUB)", duration: "2h 15m" }
    ]
  }
];

export const ACCOMMODATIONS: Accommodation[] = [
  {
    id: "h1",
    name: "The Ritz London",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    pricePerNight: 350,
    location: "London, City Center",
    amenities: ["Free Wi-Fi", "Spa & Wellness", "Michelin Restaurant", "Bar", "Gym"],
    latitude: 51.5073,
    longitude: -0.1416
  },
  {
    id: "h2",
    name: "Standard East Village Hotel",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    pricePerNight: 240,
    location: "New York, East Village",
    amenities: ["Free Wi-Fi", "Pet Friendly", "Rooftop Lounge", "Bicycle Rental"],
    latitude: 40.7274,
    longitude: -73.9912
  },
  {
    id: "h3",
    name: "Hotel de Crillon",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    pricePerNight: 390,
    location: "Paris, Place de la Concorde",
    amenities: ["Indoor Pool", "Free Wi-Fi", "Butler Service", "Valet Parking"],
    latitude: 48.8672,
    longitude: 2.3214
  },
  {
    id: "h4",
    name: "Park Hyatt Tokyo",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    pricePerNight: 320,
    location: "Tokyo, Shinjuku",
    amenities: ["Skyscraper Views", "Free Wi-Fi", "High-End Spa", "Live Music Jazz Club"],
    latitude: 35.6862,
    longitude: 139.6917
  },
  {
    id: "h5",
    name: "Shoreditch Boutique Inn",
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80",
    rating: 4.4,
    pricePerNight: 160,
    location: "London, Shoreditch",
    amenities: ["Free Wi-Fi", "Craft Beer Tap", "Breakfast Included"],
    latitude: 51.5244,
    longitude: -0.0784
  },
  {
    id: "h6",
    name: "Pod Hotel Times Square",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80",
    rating: 4.2,
    pricePerNight: 130,
    location: "New York, Times Square",
    amenities: ["Free Wi-Fi", "Budget Friendly", "Social Courtyard", "Rooftop Bar"],
    latitude: 40.7580,
    longitude: -73.9855
  }
];

export const CAR_RENTALS: CarRental[] = [
  {
    id: "c1",
    model: "Tesla Model Y",
    type: "SUV (Electric)",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&auto=format&fit=crop&q=80",
    company: "Hertz Premium",
    pricePerDay: 85,
    transmission: "Automatic",
    fuelType: "Electric"
  },
  {
    id: "c2",
    model: "Audi A4",
    type: "Sedan (Premium)",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&auto=format&fit=crop&q=80",
    company: "Enterprise Luxury",
    pricePerDay: 70,
    transmission: "Automatic",
    fuelType: "Gasoline"
  },
  {
    id: "c3",
    model: "Ford Mustang Convertible",
    type: "Sports / Cabrio",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80",
    company: "Sixt Rent-A-Car",
    pricePerDay: 95,
    transmission: "Automatic",
    fuelType: "Gasoline"
  },
  {
    id: "c4",
    model: "Toyota RAV4 Hybrid",
    type: "SUV (Standard)",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    company: "Avis Hybrid",
    pricePerDay: 55,
    transmission: "Automatic",
    fuelType: "Hybrid"
  },
  {
    id: "c5",
    model: "Fiat 500",
    type: "Mini / Compact",
    image: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=600&auto=format&fit=crop&q=80",
    company: "Budget Compacts",
    pricePerDay: 35,
    transmission: "Manual",
    fuelType: "Gasoline"
  }
];
