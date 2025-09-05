import React from 'react';
import { fmtNumber } from '../utils/geolocation';

// A private, reusable StatCard component for this grid
interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  children?: React.ReactNode;
  className?: string;
  indicatorColor?: 'green' | 'yellow' | 'gray';
}
const StatCard: React.FC<StatCardProps> = ({ label, value, unit, children, className, indicatorColor }) => (
  <div className={`p-4 rounded-2xl bg-black/20 border border-white/10 shadow-lg ring-1 ring-inset ring-white/10 ${className}`}>
    <div className="flex items-center justify-between text-sm text-gray-300">
      <span>{label}</span>
      {indicatorColor && (
         <span className={`h-3 w-3 rounded-full ${
            indicatorColor === 'green' ? 'bg-green-500' :
            indicatorColor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
         }`} title={`Efficiency Indicator: ${indicatorColor}`}></span>
      )}
    </div>
    <div className="font-bold text-3xl text-white mt-1">
      {value} <span className="text-xl font-medium text-gray-400">{unit}</span>
    </div>
    {children}
  </div>
);


interface DashboardProps {
  totalDistanceKm: number;
  lastSpeed: number;
  avgSpeedKmh: number;
  currentFuelL: number;
  tankCapacityL: number;
  estimatedRangeKm: number;
}

const Dashboard: React.FC<DashboardProps> = ({ totalDistanceKm, lastSpeed, avgSpeedKmh, currentFuelL, tankCapacityL, estimatedRangeKm }) => {
  const fuelPercentage = tankCapacityL > 0 ? (currentFuelL / tankCapacityL) * 100 : 0;
  
  const getEfficiencyIndicator = (): 'green' | 'yellow' | 'gray' => {
    if (avgSpeedKmh === 0) return 'gray';
    if (avgSpeedKmh >= 40 && avgSpeedKmh <= 55) return 'green';
    return 'yellow';
  };

  return (
    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4">Live Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Speed" value={fmtNumber(lastSpeed, 1)} unit="km/h" />
        <StatCard label="Distance" value={fmtNumber(totalDistanceKm, 2)} unit="km" />
        <StatCard label="Avg Speed" value={fmtNumber(avgSpeedKmh, 1)} unit="km/h" indicatorColor={getEfficiencyIndicator()} />
        <StatCard label="Est. Range" value={fmtNumber(estimatedRangeKm, 0)} unit="km" />
        <StatCard label="Fuel Level" value={fmtNumber(currentFuelL, 2)} unit="Liters" className="col-span-2 md:col-span-4">
            <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                <div 
                    className="bg-red-600 h-2.5 rounded-full" 
                    style={{ width: `${fuelPercentage}%` }}
                ></div>
            </div>
        </StatCard>
      </div>
    </div>
  );
};

export default Dashboard;
