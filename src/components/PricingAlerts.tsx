import React, { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PriceHistoryPoint, PricingAlert } from "../types";
import { Bell, TrendingDown, TrendingUp, AlertCircle, Plus, Sparkles, Check, Trash2, HelpCircle } from "lucide-react";

interface PricingAlertsProps {
  currentCityFrom: string;
  currentCityTo: string;
  onAddCartItem: (item: any) => void;
}

export default function PricingAlerts({ currentCityFrom, currentCityTo, onAddCartItem }: PricingAlertsProps) {
  const [activeTab, setActiveTab] = useState<'flight' | 'accommodation' | 'car'>('flight');
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    currentPrice: 0,
    lowestPrice: 0,
    highestPrice: 0,
    averagePrice: 0,
    recommendation: "",
    analysis: ""
  });

  // Price alerts created by user
  const [alerts, setAlerts] = useState<PricingAlert[]>(() => {
    const saved = localStorage.getItem("aeroplan_price_alerts");
    return saved ? JSON.parse(saved) : [
      { id: "a1", type: "flight", from: "New York", to: "London", targetPrice: 420, currentPrice: 450, status: "active" },
      { id: "a2", type: "accommodation", from: "New York", to: "London", targetPrice: 150, currentPrice: 240, status: "active" }
    ];
  });

  const [targetPriceInput, setTargetPriceInput] = useState<string>("");
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Sync alerts to local storage
  useEffect(() => {
    localStorage.setItem("aeroplan_price_alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Fetch history when tab or cities change
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/price-history?type=${activeTab}&from=${encodeURIComponent(currentCityFrom)}&to=${encodeURIComponent(currentCityTo)}`);
        const data = await res.json();
        setHistory(data.history || []);
        setMetrics({
          currentPrice: data.currentPrice,
          lowestPrice: data.lowestPrice,
          highestPrice: data.highestPrice,
          averagePrice: data.averagePrice,
          recommendation: data.recommendation,
          analysis: data.analysis
        });
        
        // Populate default target price
        setTargetPriceInput(Math.round(data.currentPrice * 0.9).toString());
      } catch (err) {
        console.error("Error fetching price history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [activeTab, currentCityFrom, currentCityTo]);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetPriceInput);
    if (isNaN(val) || val <= 0) return;

    const newAlert: PricingAlert = {
      id: "alert-" + Date.now(),
      type: activeTab,
      from: currentCityFrom,
      to: currentCityTo,
      targetPrice: val,
      currentPrice: metrics.currentPrice,
      status: "active"
    };

    setAlerts([newAlert, ...alerts]);
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 3000);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "GREAT VALUE": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "GOOD PRICE": return "text-sky-400 bg-sky-500/10 border-sky-500/20";
      case "HIGH COST": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-400" />
            <span>Dynamic Pricing Insights & Alerts</span>
          </h3>
          <p className="text-xs text-slate-400">
            Monitor real-time rate shifts, examine 30-day historical trends, and establish smart budget targets.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto">
          {(['flight', 'accommodation', 'car'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === t
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      {/* Grid container: Chart & Details on left, Create Alert on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Key metrics cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Rate</span>
              <p className="text-xl font-bold text-slate-100 mt-1">${metrics.currentPrice}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lowest Seen</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">${metrics.lowestPrice}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Average Price</span>
              <p className="text-xl font-bold text-slate-300 mt-1">${metrics.averagePrice}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-center flex flex-col justify-center items-center">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRecommendationColor(metrics.recommendation)}`}>
                {metrics.recommendation}
              </span>
            </div>
          </div>

          {/* Pricing chart */}
          <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-4 h-[250px] flex flex-col justify-between relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center text-slate-400 text-xs gap-2">
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                Analyzing pricing histories...
              </div>
            ) : null}

            <div className="flex justify-between items-center text-xs text-slate-500 font-mono mb-2">
              <span>30-DAY FLUCUTATION HISTORY</span>
              <span className="text-sky-400 font-semibold">{currentCityFrom} ➔ {currentCityTo}</span>
            </div>

            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "10px", fontWeight: "bold" }}
                    itemStyle={{ color: "#38bdf8", fontSize: "11px" }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Recommendation Explanation */}
          <div className="bg-sky-950/20 border border-sky-500/10 rounded-xl p-3.5 flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-sky-300 block mb-0.5">Market Forecast Analysis</span>
              <p className="text-slate-300 leading-relaxed">{metrics.analysis}</p>
            </div>
          </div>
        </div>

        {/* Right column: Create alert form & User alerts */}
        <div className="space-y-4">
          <form onSubmit={handleCreateAlert} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Track Future Fare Drops</span>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Target Price ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  placeholder="e.g. 400"
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-bold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              {alertSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Alert Established!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Activate Price Alert</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center leading-normal">
              We'll trigger immediate alerts on this dashboard as soon as fare drops below your threshold.
            </p>
          </form>

          {/* Active alerts display */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">My Active Alerts</span>
            
            {alerts.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                No active target limits. Set one above to lock in deals.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div key={alert.id} className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs transition-all hover:border-slate-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-400 text-[9px] uppercase font-bold rounded border border-slate-800">
                          {alert.type}
                        </span>
                        <span className="font-semibold text-slate-300">
                          {alert.from} ➔ {alert.to}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Target: <span className="font-bold text-sky-400">${alert.targetPrice}</span> • Current: ${alert.currentPrice}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-all"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
