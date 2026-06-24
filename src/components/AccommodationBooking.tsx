import React, { useState } from "react";
import { Accommodation } from "../types";
import { ACCOMMODATIONS } from "../data";
import { Hotel, Star, ShieldCheck, Check, Filter, Utensils, Wifi, Sparkles, MapPin } from "lucide-react";

interface AccommodationBookingProps {
  toCity: string;
  onAddAccommodation: (hotel: Accommodation) => void;
  addedHotelId: string | null;
}

export default function AccommodationBooking({
  toCity,
  onAddAccommodation,
  addedHotelId
}: AccommodationBookingProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(400);

  // Filter based on city
  const cityCode = toCity.toLowerCase();
  const filteredHotels = ACCOMMODATIONS.filter(h => {
    const matchesCity = h.location.toLowerCase().includes(cityCode.split(' ')[0]) || 
                        h.location.toLowerCase().includes(cityCode);
    const matchesRating = selectedRating ? h.rating >= selectedRating : true;
    const matchesPrice = h.pricePerNight <= maxPrice;
    return matchesCity && matchesRating && matchesPrice;
  });

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Hotel className="w-4 h-4 text-sky-400" />
          <span>Curated Lodgings in {toCity}</span>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Price slide */}
          <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto">
            <span>Price:</span>
            <input
              type="range"
              min="100"
              max="400"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="accent-sky-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer w-24"
            />
            <span className="font-bold text-slate-200">${maxPrice}/night</span>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Rating:</span>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
              {[null, 4.4, 4.7].map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedRating(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    selectedRating === r
                      ? "bg-sky-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id={`rating-filter-btn-${i}`}
                >
                  {r === null ? "All" : `${r}★+`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lodging cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHotels.length === 0 ? (
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
            ⚠️ No lodges match your current filters in this area. Try raising the price slider.
          </div>
        ) : (
          filteredHotels.map((hotel) => {
            const isAdded = addedHotelId === hotel.id;
            return (
              <div
                key={hotel.id}
                className={`bg-slate-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:border-slate-700/80 ${
                  isAdded ? "border-sky-500 ring-2 ring-sky-500/10" : "border-slate-800"
                }`}
                id={`hotel-card-${hotel.id}`}
              >
                {/* Hero image header */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-800 text-xs text-amber-400 font-bold shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{hotel.rating.toFixed(1)}</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800/80 px-2.5 py-1 rounded-lg text-xs text-slate-200 font-bold shadow">
                    ${hotel.pricePerNight} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                  </div>
                </div>

                {/* Info block */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-100">{hotel.name}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" /> {hotel.location}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1">
                    {hotel.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-950/80 text-slate-400 text-[10px] rounded border border-slate-850"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Action button */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-850">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Free cancellation
                    </span>

                    <button
                      onClick={() => onAddAccommodation(hotel)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                        isAdded
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-sky-600 text-white hover:bg-sky-500"
                      }`}
                      id={`add-hotel-btn-${hotel.id}`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Reserved</span>
                        </>
                      ) : (
                        <span>Select Lodge</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
