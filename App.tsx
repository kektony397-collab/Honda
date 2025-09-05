import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import type { PositionEntry, SavedSession } from './types';
import { haversineDistance, polygonArea } from './utils/geolocation';
import Header from './components/Header';
import Controls from './components/Controls';
import Dashboard from './components/StatsGrid'; // Renamed from StatsGrid
import PointsTable from './components/PointsTable';
import FuelManager from './components/FuelManager';

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
};


const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [positions, setPositions] = usePersistentState<PositionEntry[]>("gps_temp_positions", []);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastSpeed, setLastSpeed] = useState<number>(0);
  const [startedAt, setStartedAt] = usePersistentState<number | null>("gps_temp_started_at", null);

  // Fuel Management State
  const [tankCapacity, setTankCapacity] = usePersistentState<number>('fuel_tank_capacity', 8); // Honda Dream Yug default
  const [avgMileage, setAvgMileage] = usePersistentState<number>('fuel_avg_mileage', 42); // Adjusted for engine wear
  const [currentFuel, setCurrentFuel] = usePersistentState<number>('fuel_current', 8);
  
  // Stop detection
  const stopDetectionTimer = useRef<number | null>(null);

  // Picture-in-Picture State
  const pipWindowRef = useRef<Window | null>(null);
  const pipRootRef = useRef<ReactDOM.Root | null>(null);
  const [isPipOpen, setIsPipOpen] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(false);

  useEffect(() => {
    if ('documentPictureInPicture' in window) {
      setIsPipSupported(true);
    }
  }, []);
  
  // Derived stats
  const totalDistanceMeters = positions.reduce((acc, cur, idx) => {
    if (idx === 0) return 0;
    const prev = positions[idx - 1];
    return acc + haversineDistance([prev.lat, prev.lon], [cur.lat, cur.lon]);
  }, 0);

  const totalDistanceKm = totalDistanceMeters / 1000;
  
  const elapsedSeconds = (positions.length > 0 && startedAt) ? (Date.now() - startedAt) / 1000 : 0;
  const avgSpeedKmh = elapsedSeconds > 0 ? (totalDistanceKm / (elapsedSeconds / 3600)) : 0;
  const areaCoveredM2 = polygonArea(positions.map((p) => [p.lat, p.lon]));
  const estimatedRangeKm = currentFuel * avgMileage;

  // Update fuel level based on distance traveled
  useEffect(() => {
    if (positions.length < 2) return;
    const lastPos = positions[positions.length - 2];
    const newPos = positions[positions.length - 1];
    const distanceM = haversineDistance([lastPos.lat, lastPos.lon], [newPos.lat, newPos.lon]);
    const distanceKm = distanceM / 1000;
    
    if (avgMileage > 0) {
      const fuelConsumed = distanceKm / avgMileage;
      setCurrentFuel(prev => Math.max(0, prev - fuelConsumed));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, avgMileage]);

  // Effect to update the PiP window whenever stats change
  useEffect(() => {
    if (isPipOpen && pipRootRef.current) {
      pipRootRef.current.render(
        <React.StrictMode>
            <Dashboard
                totalDistanceKm={totalDistanceKm}
                lastSpeed={lastSpeed}
                avgSpeedKmh={avgSpeedKmh}
                currentFuelL={currentFuel}
                tankCapacityL={tankCapacity}
                estimatedRangeKm={estimatedRangeKm}
            />
        </React.StrictMode>
      );
    }
  }, [isPipOpen, totalDistanceKm, lastSpeed, avgSpeedKmh, currentFuel, tankCapacity, estimatedRangeKm]);


  // Clear watch on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (stopDetectionTimer.current) {
        clearTimeout(stopDetectionTimer.current);
      }
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
    };
  }, [watchId]);

  const handleStopNotification = useCallback(() => {
     if (Notification.permission === 'granted') {
       new Notification('Bike Stopped', {
         body: 'Your bike has been stationary for 15 seconds.',
         icon: '/favicon.ico', // Optional: Add an icon
       });
     }
  }, []);

  const openPipDashboard = useCallback(async () => {
    if (!isPipSupported || pipWindowRef.current) return;
    try {
      const pip = await (window as any).documentPictureInPicture.requestWindow({
        width: 420,
        height: 380,
      });
      pipWindowRef.current = pip;

      // Copy styles
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
        pip.document.head.appendChild(el.cloneNode(true));
      });

      // Set up body and root element
      pip.document.body.className = "bg-gray-900 text-gray-200 p-4 font-sans";
      const pipRootEl = pip.document.createElement('div');
      pip.document.body.appendChild(pipRootEl);
      
      pipRootRef.current = ReactDOM.createRoot(pipRootEl);
      setIsPipOpen(true);
      
      // Listen for the window closing
      pip.addEventListener('pagehide', () => {
        pipRootRef.current?.unmount();
        pipRootRef.current = null;
        pipWindowRef.current = null;
        setIsPipOpen(false);
      }, { once: true });

    } catch(error) {
        console.error("Picture-in-Picture Error:", error);
        alert("Could not open Mini Dashboard. Your browser might not support it or permission was denied.");
    }
  }, [isPipSupported]);
  
  const startRecording = useCallback(() => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not available in your browser.");
      return;
    }

    const start = async () => {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm.state === "denied") {
          alert("Geolocation permission is denied. Please enable it in settings.");
          return;
        }
      } catch (e) { console.warn("Could not query geolocation permission.", e); }

      setIsRecording(true);
      if (!startedAt) {
        setStartedAt(Date.now());
      }
      
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed } = pos.coords;
          const currentSpeedMps = (isFinite(speed!) && speed! > 0) ? speed! : 0;
          const currentSpeedKmh = currentSpeedMps * 3.6;
          setLastSpeed(currentSpeedKmh);

          if (currentSpeedKmh < 1) { // Speed is low, potentially stopped
             if (!stopDetectionTimer.current) {
               stopDetectionTimer.current = window.setTimeout(handleStopNotification, 15000); // 15 seconds
             }
          } else { // Moving, clear the timer
             if (stopDetectionTimer.current) {
                clearTimeout(stopDetectionTimer.current);
                stopDetectionTimer.current = null;
             }
          }

          setPositions((prev) => [...prev, {
            lat: latitude, lon: longitude,
            accuracy: pos.coords.accuracy, altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy, heading: pos.coords.heading,
            speed: currentSpeedMps, timestamp: pos.timestamp || Date.now(),
          }]);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert(`Geolocation error: ${err.message}.`);
          setIsRecording(false);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
      setWatchId(id);
    };

    if (positions.length > 0 && !isRecording) {
      if (confirm("You have a temporary session. Starting a new recording will clear it. Continue?")) {
        setPositions([]); setStartedAt(null);
        start();
      }
    } else {
      start();
    }
  }, [startedAt, positions.length, isRecording, setPositions, setStartedAt, handleStopNotification]);

  const stopRecording = useCallback(() => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (stopDetectionTimer.current) clearTimeout(stopDetectionTimer.current);
    setWatchId(null);
    stopDetectionTimer.current = null;
    setIsRecording(false);
    setLastSpeed(0);
  }, [watchId]);

  const saveSession = useCallback(() => {
    if (positions.length === 0) {
      alert("No positions to save.");
      return;
    }
    try {
      const sessions: SavedSession[] = JSON.parse(localStorage.getItem("gps_saved_sessions") || "[]");
      const session: SavedSession = {
        id: Date.now(), name: `Session ${new Date().toLocaleString()}`, createdAt: Date.now(),
        positions, stats: { km: totalDistanceKm, avgKmh: avgSpeedKmh, areaM2: areaCoveredM2 },
      };
      sessions.push(session);
      localStorage.setItem("gps_saved_sessions", JSON.stringify(sessions));
      setPositions([]); setStartedAt(null);
      alert("Session saved!");
    } catch(e) {
      console.error("Failed to save session", e);
      alert("Could not save session.");
    }
  }, [positions, totalDistanceKm, avgSpeedKmh, areaCoveredM2, setPositions, setStartedAt]);
  
  const clearTemp = useCallback(() => {
    if (confirm("Clear all currently recorded points? This cannot be undone.")) {
      setPositions([]);
      setStartedAt(null);
    }
  }, [setPositions, setStartedAt]);
  
  const handleRefuel = useCallback((liters: number) => {
    setCurrentFuel(prev => Math.min(tankCapacity, prev + liters));
  }, [tankCapacity, setCurrentFuel]);

  const requestNotifications = useCallback(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
       new Notification("Notifications are already enabled!");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Notifications enabled!");
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Header isRecording={isRecording} />
        <main className="space-y-6 mt-4">
          <Controls 
            isRecording={isRecording}
            hasPoints={positions.length > 0}
            onStart={startRecording}
            onStop={stopRecording}
            onSave={saveSession}
            onClear={clearTemp}
            onRequestNotifications={requestNotifications}
            isPipSupported={isPipSupported}
            isPipOpen={isPipOpen}
            onOpenPip={openPipDashboard}
          />
          <Dashboard
            totalDistanceKm={totalDistanceKm}
            lastSpeed={lastSpeed}
            avgSpeedKmh={avgSpeedKmh}
            currentFuelL={currentFuel}
            tankCapacityL={tankCapacity}
            estimatedRangeKm={estimatedRangeKm}
          />
          <FuelManager 
            tankCapacity={tankCapacity}
            setTankCapacity={setTankCapacity}
            avgMileage={avgMileage}
            setAvgMileage={setAvgMileage}
            onRefuel={handleRefuel}
          />
          <PointsTable positions={positions} />
        </main>
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Created by Yash K Pathak</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
