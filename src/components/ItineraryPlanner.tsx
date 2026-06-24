import React, { useState, useEffect } from "react";
import { Itinerary, ItineraryDay } from "../types";
import { Calendar, Sparkles, MapPin, Compass, Clock, Check, HelpCircle, RefreshCw } from "lucide-react";

interface ItineraryPlannerProps {
  destination: string;
  onSelectAttraction: (attractionName: string) => void;
}

const STYLES = ["Balanced", "Adventure", "Relaxed", "Cultural", "Luxury"];

export default function ItineraryPlanner({ destination, onSelectAttraction }: ItineraryPlannerProps) {
  const [days, setDays] = useState<number>(3);
  const [style, setStyle] = useState<string>("Balanced");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [source, setSource] = useState<"gemini" | "simulation">("simulation");
  const [loading, setLoading] = useState(false);
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);

  // Load from local storage or generate first itinerary automatically on change of destination
  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination, days, travelStyle: style })
        });
        const data = await res.json();
        setItinerary(data.itinerary);
        setSource(data.source || "simulation");
        setActiveDayIdx(0);
      } catch (err) {
        console.error("Error generating itinerary:", err);
        setSource("simulation");
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [destination]);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, travelStyle: style })
      });
      const data = await res.json();
      setItinerary(data.itinerary);
      setSource(data.source || "simulation");
      setActiveDayIdx(0);
    } catch (err) {
      console.error("Error regenerating itinerary:", err);
      setSource("simulation");
    } finally {
      setLoading(false);
    }
  };

  const currentDay: ItineraryDay | undefined = itinerary?.days[activeDayIdx];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header and Style Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <span>AI Itinerary Architect</span>
            {source === "gemini" ? (
              <span className="px-1.5 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded text-[9px] font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Gemini AI
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-750 text-slate-400 rounded text-[9px] font-bold uppercase" title="Interactive fallback mode active due to API limits or credentials.">
                Simulated
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            Tailor a complete day-by-day travel map packed with dynamic sightseeing times and local expert tips.
          </p>
        </div>

        {/* Configurations */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Days selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">Days:</span>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 7].map(d => (
                <option key={d} value={d} className="bg-slate-900">{d} Day{d > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Style picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">Style:</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {STYLES.map(s => (
                <option key={s} value={s} className="bg-slate-900">{s}</option>
              ))}
            </select>
          </div>

          {/* Prompt AI Button */}
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="px-4 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Generate schedule</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Drafting personalized {style} adventure itinerary...</p>
          <p className="text-xs text-slate-500">Gemini is structuring your sightseeing timeline & expert tips.</p>
        </div>
      ) : itinerary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Day selection timeline strip */}
          <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none border-b md:border-b-0 md:border-r border-slate-800 md:pr-4">
            {itinerary.days.map((day, idx) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayIdx(idx)}
                className={`flex-shrink-0 w-full text-left p-3.5 rounded-xl transition-all border ${
                  activeDayIdx === idx
                    ? "bg-slate-950 border-sky-500 text-sky-400 shadow-lg"
                    : "bg-slate-900/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
                id={`itinerary-day-btn-${idx}`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Day {day.dayNumber}</div>
                <div className="text-xs font-semibold truncate mt-1 text-slate-200">{day.theme}</div>
              </button>
            ))}
          </div>

          {/* Day activities detailed list */}
          <div className="md:col-span-3 space-y-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
                DAY {currentDay?.dayNumber}: {currentDay?.theme}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {itinerary.summary}
              </p>
            </div>

            <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {currentDay?.activities.map((activity, idx) => (
                <div key={idx} className="flex gap-4 relative group">
                  {/* Timeline icon indicator */}
                  <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 z-10 group-hover:border-sky-500 transition-all">
                    <Clock className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-xl space-y-2 flex-1 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          {activity.timeOfDay}
                        </span>
                        <h5 className="text-sm font-bold text-slate-200 mt-0.5">{activity.title}</h5>
                      </div>
                      
                      <button
                        onClick={() => onSelectAttraction(activity.title)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-slate-200 rounded border border-slate-800 transition-all flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-sky-400" />
                        <span>Locate Spot</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{activity.description}</p>
                    
                    {activity.tip && (
                      <div className="text-[11px] text-slate-500 bg-slate-950 p-2 rounded-lg border border-slate-900 flex gap-1.5 items-start">
                        <span className="text-sky-400 font-bold shrink-0">💡 TIP:</span>
                        <span>{activity.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-800 p-12 text-center rounded-2xl text-slate-500 text-sm">
          No schedule has been designed. Select a travel style and days above to draft.
        </div>
      )}
    </div>
  );
}
