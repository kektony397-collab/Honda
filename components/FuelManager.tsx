import React, { useState } from 'react';

interface FuelManagerProps {
    tankCapacity: number;
    setTankCapacity: (value: number) => void;
    avgMileage: number;
    setAvgMileage: (value: number) => void;
    onRefuel: (liters: number) => void;
}

const FuelManager: React.FC<FuelManagerProps> = ({ tankCapacity, setTankCapacity, avgMileage, setAvgMileage, onRefuel }) => {
    const [refuelAmount, setRefuelAmount] = useState('');

    const handleRefuelClick = () => {
        const liters = parseFloat(refuelAmount);
        if (!isNaN(liters) && liters > 0) {
            onRefuel(liters);
            setRefuelAmount('');
        } else {
            alert('Please enter a valid number of liters.');
        }
    };
    
    return (
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Fuel & Bike Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Settings Column */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="tank-capacity" className="text-sm font-medium text-gray-400 block">Tank Capacity (Liters)</label>
                        <input
                            id="tank-capacity"
                            type="number"
                            value={tankCapacity}
                            onChange={(e) => setTankCapacity(parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full rounded-lg p-2.5 bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                            placeholder="e.g., 8"
                        />
                    </div>
                     <div>
                        <label htmlFor="avg-mileage" className="text-sm font-medium text-gray-400 block">Avg. Mileage (km/L)</label>
                        <input
                            id="avg-mileage"
                            type="number"
                            value={avgMileage}
                            onChange={(e) => setAvgMileage(parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full rounded-lg p-2.5 bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                            placeholder="e.g., 42"
                        />
                    </div>
                </div>

                {/* Refuel Column */}
                <div className="space-y-4">
                     <div>
                        <label htmlFor="refuel-amount" className="text-sm font-medium text-gray-400 block">Log Petrol Refill (Liters)</label>
                         <div className="mt-1 flex items-center gap-2">
                             <input
                                id="refuel-amount"
                                type="number"
                                value={refuelAmount}
                                onChange={(e) => setRefuelAmount(e.target.value)}
                                className="w-full rounded-lg p-2.5 bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                placeholder="e.g., 5.5"
                            />
                            <button
                                onClick={handleRefuelClick}
                                className="px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                            >
                                Add
                            </button>                         </div>
                    </div>
                    <p className="text-xs text-gray-500 pt-1">
                        Note: Defaults are based on a Honda Dream Yug 2014 with a repaired engine (42 km/L). Adjust to match your bike.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FuelManager;
