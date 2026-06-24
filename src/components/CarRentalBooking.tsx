import React, { useState } from "react";
import { CarRental } from "../types";
import { CAR_RENTALS } from "../data";
import { Car, Check, Star, Fuel, Settings, HelpCircle, AlertCircle } from "lucide-react";

interface CarRentalBookingProps {
  onAddCar: (car: CarRental) => void;
  addedCarId: string | null;
}

export default function CarRentalBooking({ onAddCar, addedCarId }: CarRentalBookingProps) {
  const [selectedType, setSelectedType] = useState<string>("All");

  const filteredCars = CAR_RENTALS.filter(car => {
    if (selectedType === "All") return true;
    return car.type.toLowerCase().includes(selectedType.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Car className="w-4 h-4 text-sky-400" />
          <span>Select Ground Transportation / Cars</span>
        </div>

        {/* Filter pills */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto scrollbar-none">
          {["All", "SUV", "Sedan", "Sports", "Compact"].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === type
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id={`car-type-btn-${type}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCars.map((car) => {
          const isAdded = addedCarId === car.id;
          return (
            <div
              key={car.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden flex flex-col sm:flex-row gap-4 p-4 transition-all hover:border-slate-700/80 ${
                isAdded ? "border-sky-500 ring-2 ring-sky-500/10" : "border-slate-800"
              }`}
              id={`car-card-${car.id}`}
            >
              {/* Car image */}
              <div className="w-full sm:w-40 h-32 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden shrink-0 relative">
                <img
                  src={car.image}
                  alt={car.model}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Specs & actions */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                    {car.company}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200">{car.model}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{car.type}</p>
                </div>

                {/* Specs row */}
                <div className="flex gap-3 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    {car.transmission}
                  </span>
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-slate-500" />
                    {car.fuelType}
                  </span>
                </div>

                {/* Pricing block */}
                <div className="flex justify-between items-center border-t border-slate-850 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Daily Rate</span>
                    <p className="text-sm font-extrabold text-slate-100">${car.pricePerDay} / day</p>
                  </div>

                  <button
                    onClick={() => onAddCar(car)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                      isAdded
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-sky-600 text-white hover:bg-sky-500"
                    }`}
                    id={`add-car-btn-${car.id}`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Reserved</span>
                      </>
                    ) : (
                      <span>Select Car</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
