import React, { useState, useEffect } from "react";
import { Flight, Accommodation, CarRental, BookingItem, RecommendationPlace } from "./types";
import FlightBooking from "./components/FlightBooking";
import AccommodationBooking from "./components/AccommodationBooking";
import CarRentalBooking from "./components/CarRentalBooking";
import GmailAssistant from "./components/GmailAssistant";
import MapPlanner from "./components/MapPlanner";
import ItineraryPlanner from "./components/ItineraryPlanner";
import PricingAlerts from "./components/PricingAlerts";
import CheckoutModal from "./components/CheckoutModal";
import { 
  Plane, Hotel, Car, Compass, Navigation, ShoppingBag, 
  Trash2, CreditCard, Star, MapPin, Sparkles, Map, AlertCircle, X, Mail
} from "lucide-react";

export default function App() {
  // Destination selection
  const [destination, setDestination] = useState<string>("London");
  const [fromCity, setFromCity] = useState<string>("New York (JFK)");
  const [toCity, setToCity] = useState<string>("London (LHR)");

  // Active booking flow tab
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'cars' | 'gmail'>('flights');

  // Recommendation places
  const [places, setPlaces] = useState<RecommendationPlace[]>([]);
  const [placesSource, setPlacesSource] = useState<"gemini" | "simulation">("simulation");
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<RecommendationPlace | null>(null);

  // Cart elements
  const [cart, setCart] = useState<BookingItem[]>(() => {
    const saved = localStorage.getItem("aeroplan_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Checkout modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem("aeroplan_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync destination dropdown with flight inputs
  const handleDestinationDropdown = (dest: string) => {
    setDestination(dest);
    if (dest === "London") {
      setFromCity("New York (JFK)");
      setToCity("London (LHR)");
    } else if (dest === "New York") {
      setFromCity("London (LHR)");
      setToCity("New York (JFK)");
    } else if (dest === "Paris") {
      setFromCity("New York (JFK)");
      setToCity("Paris (CDG)");
    } else if (dest === "Tokyo") {
      setFromCity("New York (JFK)");
      setToCity("Tokyo (NRT)");
    }
  };

  const handleFlightCityChange = (from: string, to: string) => {
    setFromCity(from);
    setToCity(to);
    
    // Attempt to map back to general destination
    if (to.includes("LHR")) setDestination("London");
    else if (to.includes("JFK")) setDestination("New York");
    else if (to.includes("CDG")) setDestination("Paris");
    else if (to.includes("NRT")) setDestination("Tokyo");
  };

  // Fetch local recommendation spots whenever the destination updates
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoadingPlaces(true);
      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination })
        });
        const data = await res.json();
        setPlaces(data.places || []);
        setPlacesSource(data.source || "simulation");
        setSelectedPlace(null);
      } catch (err) {
        console.error("Error loading attraction recommendations:", err);
        setPlacesSource("simulation");
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchPlaces();
  }, [destination]);

  // Add items to the cart
  const handleAddFlight = (flight: Flight, seats?: string[], passengersCount?: number) => {
    // Remove previous flight if any
    const cleanCart = cart.filter(item => item.type !== 'flight');
    const count = passengersCount || 1;
    const seatStr = seats && seats.length > 0 ? seats.join(", ") : "Not Selected";
    const newItem: BookingItem = {
      id: flight.id,
      type: 'flight',
      title: `${flight.airline} Flight`,
      subtitle: `${flight.from} to ${flight.to} (${flight.duration}) • ${count} Pax • Seat: ${seatStr}`,
      price: flight.price * count,
      seat: seatStr,
      passengersCount: count
    };
    setCart([...cleanCart, newItem]);
  };

  const handleAddHotel = (hotel: Accommodation) => {
    // Remove previous lodging
    const cleanCart = cart.filter(item => item.type !== 'accommodation');
    const newItem: BookingItem = {
      id: hotel.id,
      type: 'accommodation',
      title: hotel.name,
      subtitle: `${hotel.location} • Rating: ${hotel.rating}★`,
      price: hotel.pricePerNight,
      details: { latitude: hotel.latitude, longitude: hotel.longitude }
    };
    setCart([...cleanCart, newItem]);
  };

  const handleAddCar = (car: CarRental) => {
    // Remove previous car
    const cleanCart = cart.filter(item => item.type !== 'car');
    const newItem: BookingItem = {
      id: car.id,
      type: 'car',
      title: car.model,
      subtitle: `${car.company} • ${car.type}`,
      price: car.pricePerDay
    };
    setCart([...cleanCart, newItem]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Extract selected hotel from cart to plot on map
  const bookedHotelItem = cart.find(item => item.type === 'accommodation');
  const bookedHotelCoord = bookedHotelItem ? {
    name: bookedHotelItem.title,
    // default coordinates in target cities if details omitted
    latitude: destination === "London" ? 51.5073 : destination === "Paris" ? 48.8566 : 40.7128,
    longitude: destination === "London" ? -0.1657 : destination === "Paris" ? 2.3522 : -74.0060
  } : null;

  // Helper to trigger select attractions based on itinerary clicks
  const handleSelectItinerarySpot = (spotName: string) => {
    const match = places.find(p => p.name.toLowerCase().includes(spotName.toLowerCase()) || spotName.toLowerCase().includes(p.name.toLowerCase()));
    if (match) {
      setSelectedPlace(match);
    } else {
      // Create a transient spot near current coordinates
      const fallbackSpot: RecommendationPlace = {
        name: spotName,
        category: "Sightseeing",
        description: "Dynamic custom attraction spot added to your active navigation route.",
        rating: 4.8,
        address: `${destination} Tourist Zone`,
        latitude: places[0]?.latitude || 51.5074,
        longitude: places[0]?.longitude || -0.1278
      };
      setSelectedPlace(fallbackSpot);
    }
  };

  const totalCost = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/10">
            A
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              <span>AEROPLAN PORTAL</span>
              <span className="px-1.5 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded text-[9px] tracking-normal font-bold">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Ticketing, Logistics, & Travel Planning Console</p>
          </div>
        </div>

        {/* Global controller elements */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          
          {/* Main destination selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
            <span className="text-slate-500 font-semibold uppercase text-[9px]">Select Trip:</span>
            <select
              value={destination}
              onChange={(e) => handleDestinationDropdown(e.target.value)}
              className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer"
              id="global-destination-dropdown"
            >
              <option value="London" className="bg-slate-900">London, United Kingdom</option>
              <option value="New York" className="bg-slate-900">New York, United States</option>
              <option value="Paris" className="bg-slate-900">Paris, France</option>
              <option value="Tokyo" className="bg-slate-900">Tokyo, Japan</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          {/* User profile capsule */}
          <div className="bg-slate-950 border border-slate-800/80 px-3 py-1 rounded-xl flex items-center gap-2 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 font-mono">Agent-Preview</span>
          </div>
        </div>
      </header>

      {/* Primary Dashboard layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (6 cols): Active Booking flow and Cart */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Booking Navigation Pills */}
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-md flex justify-between items-center">
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveTab('flights')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'flights'
                    ? "bg-sky-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="booking-tab-flights"
              >
                <Plane className="w-4 h-4 rotate-45" />
                <span>Flights</span>
              </button>

              <button
                onClick={() => setActiveTab('hotels')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'hotels'
                    ? "bg-sky-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="booking-tab-hotels"
              >
                <Hotel className="w-4 h-4" />
                <span>Lodging</span>
              </button>

              <button
                onClick={() => setActiveTab('cars')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'cars'
                    ? "bg-sky-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="booking-tab-cars"
              >
                <Car className="w-4 h-4" />
                <span>Rentals</span>
              </button>

              <button
                onClick={() => setActiveTab('gmail')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'gmail'
                    ? "bg-rose-600 text-white shadow-md"
                    : "text-slate-400 hover:text-rose-400"
                }`}
                id="booking-tab-gmail"
              >
                <Mail className="w-4 h-4" />
                <span>Gmail Sync</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-bold px-3 uppercase tracking-wider font-mono hidden sm:block">
              PORTAL: {destination.toUpperCase()}
            </div>
          </div>

          {/* Booking panel views */}
          <div className="transition-all">
            {activeTab === 'flights' && (
              <FlightBooking
                fromCity={fromCity}
                toCity={toCity}
                onChangeCities={handleFlightCityChange}
                onAddFlight={handleAddFlight}
                addedFlightId={cart.find(c => c.type === 'flight')?.id || null}
              />
            )}
            {activeTab === 'hotels' && (
              <AccommodationBooking
                toCity={destination}
                onAddAccommodation={handleAddHotel}
                addedHotelId={cart.find(h => h.type === 'accommodation')?.id || null}
              />
            )}
            {activeTab === 'cars' && (
              <CarRentalBooking
                onAddCar={handleAddCar}
                addedCarId={cart.find(c => c.type === 'car')?.id || null}
              />
            )}
            {activeTab === 'gmail' && (
              <GmailAssistant
                destination={destination}
                cart={cart}
                onAddFlight={handleAddFlight}
                onAddHotel={handleAddHotel}
                onAddCar={handleAddCar}
                onClearCart={handleClearCart}
              />
            )}
          </div>

          {/* Dynamic Travel Cart Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-400" />
                <span>My Active Travel Cart</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-all font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded-xl space-y-1">
                <p>Your travel bucket is currently empty.</p>
                <p className="text-[10px]">Reserve flights, boutique lodging, or cars above to construct your packet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex justify-between items-start text-xs relative group">
                      <div>
                        <span className="text-[9px] uppercase font-black text-sky-400 block tracking-wider mb-0.5">{item.type}</span>
                        <h4 className="font-bold text-slate-200 truncate max-w-[120px]">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">{item.subtitle}</p>
                      </div>
                      <div className="text-right flex flex-col justify-between items-end h-full">
                        <button
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="text-slate-600 hover:text-rose-400 p-0.5 rounded transition-all"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-slate-300 mt-2">${item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 border border-slate-850/80 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estimated Packet Cost</span>
                    <span className="text-lg font-black text-sky-400 font-mono">${totalCost}</span>
                  </div>

                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                    id="checkout-cart-btn"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Ticketing</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Map & Travel Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Interactive Map */}
          <MapPlanner
            destination={destination}
            places={places}
            placesSource={placesSource}
            loadingPlaces={loadingPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            bookedHotel={bookedHotelCoord}
          />

          {/* AI Itinerary section */}
          <ItineraryPlanner
            destination={destination}
            onSelectAttraction={handleSelectItinerarySpot}
          />

          {/* Pricing analysis chart */}
          <PricingAlerts
            currentCityFrom={fromCity}
            currentCityTo={toCity}
            onAddCartItem={() => {}}
          />
        </div>
      </main>

      {/* Checkout modal overlay */}
      <CheckoutModal
        cart={cart}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onClearCart={handleClearCart}
      />

      {/* Footer bar */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 text-center text-[10px] text-slate-600 font-mono">
        © 2026 AeroPlan Ticketing Systems Inc. Authorized and secured globally.
      </footer>
    </div>
  );
}
