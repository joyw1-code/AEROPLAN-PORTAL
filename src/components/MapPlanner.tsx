import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { RecommendationPlace } from "../types";
import { MapPin, Navigation, Eye, Star, Info, Compass } from "lucide-react";

interface MapPlannerProps {
  destination: string;
  places: RecommendationPlace[];
  placesSource?: "gemini" | "simulation";
  loadingPlaces: boolean;
  selectedPlace: RecommendationPlace | null;
  onSelectPlace: (place: RecommendationPlace | null) => void;
  bookedHotel: { name: string; latitude: number; longitude: number } | null;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY !== "";

export default function MapPlanner({
  destination,
  places,
  placesSource = "simulation",
  loadingPlaces,
  selectedPlace,
  onSelectPlace,
  bookedHotel
}: MapPlannerProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 }); // default London
  const [zoom, setZoom] = useState(13);
  const [infoOpen, setInfoOpen] = useState(false);

  // Update center when places list changes
  useEffect(() => {
    if (places && places.length > 0) {
      // average latitudes and longitudes
      const lats = places.map(p => p.latitude);
      const lngs = places.map(p => p.longitude);
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
      setZoom(12);
    }
  }, [places]);

  useEffect(() => {
    if (selectedPlace) {
      setMapCenter({ lat: selectedPlace.latitude, lng: selectedPlace.longitude });
      setZoom(14);
      setInfoOpen(true);
    }
  }, [selectedPlace]);

  // Premium vector simulation map fallback when Google Maps API key is not supplied
  const renderSimulatedMap = () => {
    return (
      <div className="relative w-full h-[520px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Sky/Ambient Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-25"></div>
        
        {/* Compass card */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-300 font-mono">
          <Compass className="w-4 h-4 text-sky-400 animate-spin-slow" />
          <span>SIMULATED VISTA MAP • {destination.toUpperCase()}</span>
        </div>

        {/* Dynamic Simulated Roads & Coordinates */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Highway Loop */}
          <path d="M 50 150 Q 300 450 750 250 T 1150 150" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" opacity="0.4" />
          <path d="M 50 150 Q 300 450 750 250 T 1150 150" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" opacity="0.8" />

          {/* Sibling Road */}
          <path d="M 200 50 L 500 480" fill="none" stroke="#334155" strokeWidth="6" opacity="0.3" />
          <path d="M 900 80 Q 600 300 300 450" fill="none" stroke="#334155" strokeWidth="6" opacity="0.3" />

          {/* Booked Route simulation if hotel exists */}
          {bookedHotel && places.length > 0 && (
            <g>
              <line x1="150" y1="200" x2="350" y2="280" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 5" opacity="0.7" />
              <circle cx="150" cy="200" r="4" fill="#f43f5e" />
              <circle cx="350" cy="280" r="4" fill="#38bdf8" />
            </g>
          )}
        </svg>

        {/* Render interactive vector markers */}
        <div className="absolute inset-0 z-0">
          {/* Center Point */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800 pointer-events-none">
            <Compass className="w-40 h-40 opacity-10" />
          </div>

          {/* Place Markers based on responsive mapping slots */}
          {places.map((place, idx) => {
            // Distribute places deterministically across the visual grid container
            const xPercent = 15 + ((idx * 161) % 70);
            const yPercent = 20 + ((idx * 193) % 65);
            const isSelected = selectedPlace?.name === place.name;

            return (
              <button
                key={place.name}
                onClick={() => onSelectPlace(place)}
                style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-10`}
                id={`sim-marker-${idx}`}
              >
                <div className={`relative flex flex-col items-center`}>
                  {/* Pin Drop */}
                  <div className={`flex items-center justify-center rounded-full p-2.5 shadow-lg border transition-all ${
                    isSelected 
                      ? "bg-sky-500 text-white scale-110 border-white ring-4 ring-sky-500/30" 
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700 group-hover:scale-105"
                  }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  
                  {/* Mini name tag */}
                  <div className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap border shadow transition-all ${
                    isSelected 
                      ? "bg-slate-900 border-sky-400 text-sky-400 font-semibold" 
                      : "bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}>
                    {place.name}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Booked Hotel Marker */}
          {bookedHotel && (
            <div 
              style={{ left: "25%", top: "45%" }} 
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
              id="sim-hotel-marker"
            >
              <div className="bg-rose-500 text-white p-2 rounded-full shadow-lg ring-4 ring-rose-500/20 border border-white">
                <Navigation className="w-4 h-4 rotate-45" />
              </div>
              <div className="mt-1 px-2 py-0.5 bg-slate-950 border border-rose-500 text-rose-400 rounded text-[10px] font-bold whitespace-nowrap">
                🏨 {bookedHotel.name} (My Lodging)
              </div>
            </div>
          )}
        </div>

        {/* Selected Place Overlay Detail Panel */}
        {selectedPlace ? (
          <div className="relative z-10 m-4 p-4 bg-slate-900/95 border border-slate-800 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] uppercase font-bold rounded-full tracking-wider border border-sky-500/20">
                  {selectedPlace.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedPlace.rating.toFixed(1)}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1">{selectedPlace.name}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-xl">{selectedPlace.description}</p>
              {selectedPlace.address && (
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-600" /> {selectedPlace.address}
                </p>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => {
                  // Simulate directions
                  alert(`Routing from ${bookedHotel ? bookedHotel.name : "Your Location"} to ${selectedPlace.name}... (Routing successfully initialized)`);
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </button>
              <button 
                onClick={() => onSelectPlace(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 m-4 p-3 bg-slate-900/80 border border-slate-800/50 rounded-xl backdrop-blur text-center">
            <p className="text-xs text-slate-400">
              💡 Select any place marker above to preview attractions, read curated tips, and simulate active navigation.
            </p>
          </div>
        )}

        {/* API Info bar */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono px-4">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-600" />
            <span>Interactive Vector Blueprint Engine active.</span>
          </span>
          <span className="text-slate-400">
            Coordinates: {mapCenter.lat.toFixed(4)}° N, {mapCenter.lng.toFixed(4)}° E
          </span>
        </div>
      </div>
    );
  };

  const renderGoogleMap = () => {
    return (
      <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            center={mapCenter}
            zoom={zoom}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: "100%", height: "100%" }}
            onCenterChanged={(e) => {
              if (e.detail?.center) {
                setMapCenter(e.detail.center);
              }
            }}
          >
            {places.map((place, idx) => (
              <AdvancedMarker
                key={place.name}
                position={{ lat: place.latitude, lng: place.longitude }}
                onClick={() => onSelectPlace(place)}
              >
                <Pin 
                  background={selectedPlace?.name === place.name ? "#38bdf8" : "#0f172a"} 
                  borderColor={selectedPlace?.name === place.name ? "#fff" : "#38bdf8"}
                  glyphColor="#fff"
                />
              </AdvancedMarker>
            ))}

            {bookedHotel && (
              <AdvancedMarker
                position={{ lat: bookedHotel.latitude, lng: bookedHotel.longitude }}
                title="Your Accommodation"
              >
                <Pin background="#f43f5e" borderColor="#ffffff" glyphColor="#ffffff" />
              </AdvancedMarker>
            )}

            {infoOpen && selectedPlace && (
              <InfoWindow
                position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
                onCloseClick={() => {
                  setInfoOpen(false);
                  onSelectPlace(null);
                }}
              >
                <div className="p-1 max-w-[200px] text-slate-900">
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded-full uppercase">
                    {selectedPlace.category}
                  </span>
                  <h4 className="font-bold text-sm mt-1">{selectedPlace.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{selectedPlace.description}</p>
                  <p className="text-xs font-semibold text-slate-800 mt-1">⭐ {selectedPlace.rating.toFixed(1)} / 5</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span>Interactive Travel Guide Map</span>
          </h3>
          <p className="text-xs text-slate-400">
            Explore premium attractions and plot scenic routes in {destination}.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {placesSource === "gemini" ? (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold rounded-full flex items-center gap-1">
              ✨ Gemini AI
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-750 text-slate-400 text-xs font-semibold rounded-full" title="Interactive fallback mode active due to API limits or credentials.">
              Simulated recommendations fallback
            </span>
          )}

          {hasValidKey && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              GOOGLE MAPS ACTIVE
            </span>
          )}
        </div>
      </div>

      {loadingPlaces ? (
        <div className="w-full h-[520px] bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Scanning locations and fetching dynamic recommendations...</p>
        </div>
      ) : hasValidKey ? (
        renderGoogleMap()
      ) : (
        renderSimulatedMap()
      )}
    </div>
  );
}
