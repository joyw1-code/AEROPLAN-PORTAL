import React, { useState } from "react";
import { Flight } from "../types";
import { FLIGHTS } from "../data";
import { Plane, Calendar, Users, ArrowRight, Check, AlertCircle, Sparkles, Armchair, Info } from "lucide-react";

interface FlightBookingProps {
  fromCity: string;
  toCity: string;
  onChangeCities: (from: string, to: string) => void;
  onAddFlight: (flight: Flight, seats?: string[], passengersCount?: number) => void;
  addedFlightId: string | null;
}

const CITIES = ["New York (JFK)", "London (LHR)", "Paris (CDG)", "Tokyo (NRT)"];

// Helper to check if a seat is occupied (deterministic, stable layout)
const isSeatOccupied = (row: number, seatLetter: string) => {
  const val = (row * 7 + seatLetter.charCodeAt(0)) % 5;
  return val === 0 || val === 2; // ~40% seats are occupied
};

// Seat Selection Sub-Component
interface SeatMapProps {
  flightId: string;
  passengersCount: number;
  selected: string[];
  onSelectSeat: (seats: string[]) => void;
}

function SeatMap({ flightId, passengersCount, selected, onSelectSeat }: SeatMapProps) {
  const rows = [10, 11, 12, 14, 15, 16, 17, 18]; // Skip superstitious 13
  const seatLetters = ["A", "B", "C", "D", "E", "F"];

  const handleSeatClick = (seatCode: string) => {
    if (selected.includes(seatCode)) {
      onSelectSeat(selected.filter(s => s !== seatCode));
    } else {
      if (selected.length < passengersCount) {
        onSelectSeat([...selected, seatCode]);
      } else if (passengersCount === 1) {
        onSelectSeat([seatCode]);
      }
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-850/80 rounded-2xl p-5 space-y-4 max-w-md mx-auto" id={`seat-map-${flightId}`}>
      <div className="text-center space-y-1">
        <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
          <Armchair className="w-3 h-3 animate-pulse" />
          <span>Aircraft Seat Selection</span>
        </span>
        <h5 className="text-xs font-bold text-slate-200">Select {passengersCount} Seat{passengersCount > 1 ? 's' : ''} for your flight</h5>
        <p className="text-[10px] text-slate-500">
          Window: A & F • Aisle: C & D • Selected: {selected.length}/{passengersCount}
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-4 text-[9px] font-semibold text-slate-400 border-y border-slate-900 py-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-900 border border-slate-800"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-sky-600 border border-sky-500"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-900/40 border border-slate-850 text-slate-600 flex items-center justify-center font-bold text-[8px]">X</div>
          <span>Occupied</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="border border-dashed border-slate-800/80 rounded-2xl p-4 bg-slate-950/40 relative">
        <div className="w-full flex flex-col items-center mb-4">
          <div className="w-10 h-4 bg-slate-800 rounded-t-full flex items-center justify-center border border-b-0 border-slate-700">
            <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider">FRONT</span>
          </div>
          <div className="w-px h-2 bg-slate-700"></div>
        </div>

        <div className="space-y-2">
          {rows.map(row => (
            <div key={row} className="flex items-center justify-between gap-1">
              {/* Left seats (A, B, C) */}
              <div className="flex items-center gap-1">
                {["A", "B", "C"].map(letter => {
                  const seatCode = `${row}${letter}`;
                  const occupied = isSeatOccupied(row, letter);
                  const isSel = selected.includes(seatCode);

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={occupied}
                      onClick={() => handleSeatClick(seatCode)}
                      className={`w-7 h-7 rounded text-[9px] font-bold transition-all flex items-center justify-center ${
                        occupied
                          ? "bg-slate-900/30 border border-slate-900/10 text-slate-600 cursor-not-allowed"
                          : isSel
                          ? "bg-sky-600 border border-sky-400 text-white shadow-lg shadow-sky-600/30 scale-105"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-100"
                      }`}
                      title={occupied ? `Seat ${seatCode} (Occupied)` : `Seat ${seatCode} (${letter === 'A' || letter === 'F' ? 'Window' : 'Standard'})`}
                    >
                      {occupied ? "X" : letter}
                    </button>
                  );
                })}
              </div>

              {/* Aisle label */}
              <div className="w-6 text-center text-[9px] font-bold text-slate-600 font-mono">
                {row}
              </div>

              {/* Right seats (D, E, F) */}
              <div className="flex items-center gap-1">
                {["D", "E", "F"].map(letter => {
                  const seatCode = `${row}${letter}`;
                  const occupied = isSeatOccupied(row, letter);
                  const isSel = selected.includes(seatCode);

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={occupied}
                      onClick={() => handleSeatClick(seatCode)}
                      className={`w-7 h-7 rounded text-[9px] font-bold transition-all flex items-center justify-center ${
                        occupied
                          ? "bg-slate-900/30 border border-slate-900/10 text-slate-600 cursor-not-allowed"
                          : isSel
                          ? "bg-sky-600 border border-sky-400 text-white shadow-lg shadow-sky-600/30 scale-105"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-100"
                      }`}
                      title={occupied ? `Seat ${seatCode} (Occupied)` : `Seat ${seatCode} (${letter === 'A' || letter === 'F' ? 'Window' : 'Standard'})`}
                    >
                      {occupied ? "X" : letter}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col items-center mt-4">
          <div className="w-px h-2 bg-slate-700"></div>
          <div className="w-10 h-2 bg-slate-900 rounded-b-full border border-t-0 border-slate-800"></div>
        </div>
      </div>
    </div>
  );
}

export default function FlightBooking({
  fromCity,
  toCity,
  onChangeCities,
  onAddFlight,
  addedFlightId
}: FlightBookingProps) {
  const [date, setDate] = useState("2026-07-15");
  const [passengers, setPassengers] = useState(1);
  const [searchTriggered, setSearchTriggered] = useState(true);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Record<string, string[]>>({});

  // Filter flights based on cities
  const filteredFlights = FLIGHTS.filter(
    f => f.from.toLowerCase().includes(fromCity.toLowerCase()) && 
         f.to.toLowerCase().includes(toCity.toLowerCase())
  );

  const swapCities = () => {
    onChangeCities(toCity, fromCity);
  };

  return (
    <div className="space-y-6">
      {/* Flight Search panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Plane className="w-4 h-4 text-sky-400 rotate-45" />
          <span>Book Tickets & Flights</span>
        </div>

        <div className="grid grid-cols-12 gap-3 items-end">
          {/* From */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3 space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">From</label>
            <select
              value={fromCity}
              onChange={(e) => onChangeCities(e.target.value, toCity)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Swap icon */}
          <div className="col-span-12 sm:col-span-12 md:col-span-1 flex justify-center pb-1">
            <button
              onClick={swapCities}
              className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all hover:scale-105"
              type="button"
              title="Swap Cities"
              id="swap-cities-btn"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-90 md:rotate-0" />
            </button>
          </div>

          {/* To */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3 space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">To</label>
            <select
              value={toCity}
              onChange={(e) => onChangeCities(fromCity, e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Departure Date */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3 space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Departure Date</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 pl-8 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Passengers Selector */}
          <div className="col-span-12 sm:col-span-6 md:col-span-2 space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Passengers</label>
            <div className="relative">
              <select
                value={passengers}
                onChange={(e) => {
                  setPassengers(Number(e.target.value));
                  // Reset previous selections to avoid size mismatch
                  setSelectedSeats({});
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 pl-8 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <Users className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Flight Search results */}
      {searchTriggered && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-400 font-medium">
              Available Departures ({filteredFlights.length} flights)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Dates: {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {filteredFlights.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
              ⚠️ No direct flights available for this specific path. Try swapping cities or expanding your departure range.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredFlights.map((flight) => {
                const isAdded = addedFlightId === flight.id;
                const isExpanded = expandedFlightId === flight.id;
                const currentSeats = selectedSeats[flight.id] || [];

                return (
                  <div
                    key={flight.id}
                    className={`bg-slate-900 border rounded-2xl p-4 flex flex-col gap-4 transition-all ${
                      isAdded
                        ? "border-emerald-500/80 ring-2 ring-emerald-500/10 bg-slate-900/60"
                        : "border-slate-800 hover:border-slate-750 hover:bg-slate-900/90"
                    }`}
                    id={`flight-card-${flight.id}`}
                  >
                    {/* Top half: Flight detail row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {/* Left: Logo & Airline */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-lg shadow">
                          {flight.logo}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">{flight.airline}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-2 py-0.5 bg-slate-950 text-slate-400 text-[9px] uppercase font-bold tracking-wider rounded border border-slate-800">
                              Cabin: Economy
                            </span>
                            {flight.stops > 0 ? (
                              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] uppercase font-bold tracking-wider rounded">
                                {flight.stops} Stop{flight.stops > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase font-bold tracking-wider rounded">
                                Non-stop
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Timeline path */}
                      <div className="flex-1 flex items-center gap-4 md:gap-8 justify-between max-w-lg w-full">
                        <div className="text-center md:text-left">
                          <p className="text-xs text-slate-400 font-mono">{flight.departureTime}</p>
                          <p className="text-sm font-bold text-slate-200 mt-0.5">{fromCity.split(' ')[0]}</p>
                        </div>

                        {/* Flight path line */}
                        <div className="flex-1 flex flex-col items-center relative py-1">
                          <span className="text-[10px] text-slate-500 font-mono">{flight.duration}</span>
                          <div className="w-full h-0.5 bg-slate-800 relative mt-1">
                            <div className="w-2 h-2 rounded-full bg-sky-500 absolute left-0 -top-0.5"></div>
                            <div className="w-2 h-2 rounded-full bg-sky-500 absolute right-0 -top-0.5"></div>
                            {flight.stops > 0 && (
                              <div
                                className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute left-1/2 -translate-x-1/2 -top-1 border border-slate-900 cursor-help"
                                title={flight.layovers ? `Layover: ${flight.layovers[0].airport}` : "Layover"}
                              ></div>
                            )}
                            <Plane className="w-3.5 h-3.5 text-sky-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-95 animate-pulse" />
                          </div>
                          
                          {/* Layover detailed text right on timeline */}
                          {flight.stops === 0 ? (
                            <span className="text-[9px] text-slate-500 uppercase font-bold mt-1 tracking-wider">Non-stop</span>
                          ) : (
                            <div className="flex flex-col items-center mt-1">
                              <span className="text-[9px] text-amber-500 font-bold tracking-wider flex items-center gap-0.5">
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span>{flight.stops} Stop ({flight.layovers?.[0]?.airport})</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-center md:text-right">
                          <p className="text-xs text-slate-400 font-mono">{flight.arrivalTime}</p>
                          <p className="text-sm font-bold text-slate-200 mt-0.5">{toCity.split(' ')[0]}</p>
                        </div>
                      </div>

                      {/* Right: Booking price action */}
                      <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto gap-4 md:gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Adult Ticket ({passengers} Pax)</span>
                          <p className="text-xl font-extrabold text-slate-100">${flight.price * passengers}</p>
                        </div>

                        {isAdded ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow">
                              <Check className="w-3.5 h-3.5" />
                              <span>Flight Reserved</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                              className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline font-bold"
                            >
                              Edit Selected Seats
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow ${
                              isExpanded
                                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                : "bg-sky-600 hover:bg-sky-500 text-white"
                            }`}
                            id={`add-flight-btn-${flight.id}`}
                          >
                            {isExpanded ? (
                              <span>Close Seats</span>
                            ) : (
                              <>
                                <Armchair className="w-3.5 h-3.5" />
                                <span>Select Seats</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Detailed Layovers and Seat map dropdown panel */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/85 pt-4 mt-1 space-y-4 animate-fade-in bg-slate-900/40 rounded-xl p-3">
                        {/* Layover Breakdown (if any) */}
                        {flight.stops > 0 && flight.layovers && (
                          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 max-w-md mx-auto space-y-2">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <span>Transit & Layover Details</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              This route contains a scheduled layover. Baggage will be automatically checked through to your final destination: <strong className="text-slate-300">{toCity}</strong>.
                            </p>
                            <div className="space-y-1.5 pt-1">
                              {flight.layovers.map((lay, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[10px] font-mono border-t border-slate-950 pt-1.5">
                                  <span className="text-slate-500">STOP AIRPORT:</span>
                                  <span className="text-amber-400 font-bold">{lay.airport}</span>
                                  <span className="text-slate-500">DURATION:</span>
                                  <span className="text-slate-300 font-bold">{lay.duration}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Seat Selector */}
                        <SeatMap
                          flightId={flight.id}
                          passengersCount={passengers}
                          selected={currentSeats}
                          onSelectSeat={(seats) => {
                            setSelectedSeats({
                              ...selectedSeats,
                              [flight.id]: seats
                            });
                          }}
                        />

                        {/* Seat details policy notice */}
                        <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-start gap-2.5 max-w-md mx-auto">
                          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h6 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Flight & Seat Policies</h6>
                            <p className="text-[10px] text-slate-400">
                              Seats are held for up to 20 minutes during checkout. Standard meals, soft drinks, and in-flight movies are included.
                            </p>
                          </div>
                        </div>

                        {/* Book Tickets trigger */}
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            disabled={currentSeats.length !== passengers}
                            onClick={() => {
                              onAddFlight(flight, currentSeats, passengers);
                              setExpandedFlightId(null);
                            }}
                            className="w-full max-w-xs py-2.5 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>
                              {currentSeats.length === passengers
                                ? `Confirm Seats & Reserve`
                                : `Select ${passengers - currentSeats.length} more seat(s)`}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
