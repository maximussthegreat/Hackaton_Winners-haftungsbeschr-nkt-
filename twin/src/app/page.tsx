'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SystemConsole from '@/components/SystemConsole';

// Dynamic import to avoid SSR issues with Leaflet
const TwinMap = dynamic(() => import('@/components/TwinMap'), {
  ssr: false,
  loading: () => <div className="text-white p-10">Loading Holographic Twin...</div>
});

interface Truck { id: string; lat: number; lng: number; }
interface Ship { id: string; lat: number; lng: number; type: string; imo?: string; mmsi?: string; status?: string; }
interface Savings { fuel_saved_l: number; money_saved_eur: number; co2_saved_kg: number; }

interface SentinelState {
  simulation_active: boolean;
  system_logs: string[];
  ai_thought?: string;
  risk_grade?: string;
  visual_truth: {
    confidence: number;
    trucks?: Truck[];
    ships?: Ship[];
    tide?: number;
    traffic_alerts?: string[];
  };
  savings: Savings;
}

export default function Home() {
  const [riskLevel, setRiskLevel] = useState(0.0);
  const [metrics, setMetrics] = useState<Savings>({ fuel_saved_l: 0, money_saved_eur: 0, co2_saved_kg: 0 });
  const [alert, setAlert] = useState<string | null>(null);

  const [state, setState] = useState<SentinelState>({
    simulation_active: false,
    system_logs: ["Initialize..."],
    visual_truth: { confidence: 0.0, trucks: [], ships: [] },
    savings: { fuel_saved_l: 0, money_saved_eur: 0, co2_saved_kg: 0 }
  });

  // History State
  const [historyData, setHistoryData] = useState<any>(null);
  const [sliderValue, setSliderValue] = useState(100); // 0 to 100%
  const [playbackShips, setPlaybackShips] = useState<Ship[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeLabel, setCurrentTimeLabel] = useState("LIVE");
  const [tideLevel, setTideLevel] = useState(0);
  const [showTraffic, setShowTraffic] = useState(false); // Traffic overlay toggle (default OFF)

  // Playback auto-advance effect
  useEffect(() => {
    if (!isPlaying || sliderValue >= 100) return;

    const interval = setInterval(() => {
      setSliderValue(prev => {
        const next = prev + 0.5; // Advance 0.5% every 200ms = 40s for full playback
        if (next >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, sliderValue]);

  // Notify AI during playback (every 5 slider steps)
  useEffect(() => {
    if (sliderValue >= 100 || !historyData) return;

    // Only notify every ~5% to avoid spam
    if (Math.floor(sliderValue) % 5 !== 0) return;

    // Calculate current timestamp
    const start = historyData.window_start;
    const end = historyData.window_end;
    const targetTime = start + ((end - start) * (sliderValue / 100));
    const date = new Date(targetTime * 1000);
    setCurrentTimeLabel(date.toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }));

    // Simulate tide based on time (sinusoidal 12h cycle)
    const hours = date.getHours() + date.getMinutes() / 60;
    const tide = 2.0 + 1.5 * Math.sin((hours / 12) * Math.PI);
    setTideLevel(tide);

    // POST to AI with current state
    fetch('http://localhost:8002/playback/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: date.toISOString(),
        ships: playbackShips,
        tide_level_m: tide,
        mode: "HISTORIC_PLAYBACK"
      })
    }).catch(() => { }); // Ignore errors for now

  }, [Math.floor(sliderValue / 5), historyData, playbackShips]);

  // Polling for simulation state (Realtime)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8002/');
        const data = await res.json();
        const serverState = data.state;
        setState(serverState);

        // Fetch History once if not loaded
        if (!historyData) {
          const hRes = await fetch('http://localhost:8002/history');
          const hData = await hRes.json();
          setHistoryData(hData);
        }

        if (serverState.simulation_active && !alert) {
          setAlert("CRITICAL OVERRIDE: SENSOR ANOMALY DETECTED");
          setMetrics(serverState.savings);
          setRiskLevel(0.8);
          // ... Voice trigger logic ...
        }
      } catch (e) {
        console.error("Brain disconnected", e);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alert, historyData]);

  // Effect: Calculate ships based on Slider
  useEffect(() => {
    if (!historyData) return;

    // If Slider is Max, use REALTIME state
    if (sliderValue >= 100) {
      setPlaybackShips(state.visual_truth?.ships || []);
      return;
    }

    // Interpolate History
    const start = historyData.window_start;
    const end = historyData.window_end;
    const targetTime = start + ((end - start) * (sliderValue / 100));

    const currentFrameShips: Ship[] = [];

    historyData.ships.forEach((hShip: any) => {
      // Find closest path point
      // Path is sorted by ts (mostly)
      // Simple linear search for now (optimization: binary search)
      const path = hShip.path;
      if (!path || path.length < 2) return;

      // If before start or after end of path, skip
      if (targetTime < path[0].ts || targetTime > path[path.length - 1].ts) return;

      for (let i = 0; i < path.length - 1; i++) {
        if (targetTime >= path[i].ts && targetTime <= path[i + 1].ts) {
          // Interpolate
          const factor = (targetTime - path[i].ts) / (path[i + 1].ts - path[i].ts);
          const lat = path[i].lat + (path[i + 1].lat - path[i].lat) * factor;
          const lng = path[i].lng + (path[i + 1].lng - path[i].lng) * factor;

          currentFrameShips.push({
            id: hShip.id,
            lat,
            lng,
            type: hShip.type,
            imo: hShip.imo,
            mmsi: hShip.mmsi,
            status: path[i].status || "UNDERWAY"
          });
          break;
        }
      }
    });

    setPlaybackShips(currentFrameShips);

  }, [sliderValue, historyData, state.visual_truth]);


  return (
    <main className="flex min-h-screen flex-col bg-black text-white relative overflow-hidden">

      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 pointer-events-none flex justify-between items-start">
        <div className="bg-black/50 p-4 rounded-lg backdrop-blur-md border border-cyan-900/30">
          <h1 className="text-4xl font-bold tracking-tighter text-cyan-400">SENTINEL</h1>
          <p className="text-xs text-cyan-500 tracking-[0.3em] mt-1">THE ALL-SEEING PORT BRAIN</p>

          <div className="mt-4 flex gap-4 text-xs font-mono text-gray-400">
            <div>
              <span className="block text-gray-600">CONNECTED DRIVERS</span>
              <span className="text-green-400 text-xl">142</span>
            </div>
            <div>
              <span className="block text-gray-600">EYE CONFIDENCE</span>
              <span className="text-cyan-400 text-xl">
                {state.visual_truth?.confidence ? (state.visual_truth.confidence * 100).toFixed(1) : "0.0"}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right bg-black/50 p-4 rounded-lg backdrop-blur-md border border-green-900/30">
          <div className="text-6xl font-mono text-green-400">€{metrics.money_saved_eur}</div>
          <div className="text-sm text-green-700">CARBON CASH GENERATED</div>
          <div className="text-xs text-gray-500">{metrics.co2_saved_kg} kg CO2 PREVENTED</div>
        </div>
      </div>

      {/* System Console - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
        {/* @ts-ignore */}
        <SystemConsole
          logs={state.system_logs || []}
          aiThought={state.ai_thought}
          riskGrade={state.risk_grade}
          trucks={state.visual_truth?.trucks || []}
          ships={playbackShips.length > 0 ? playbackShips : (state.visual_truth?.ships || [])}
          tideLevel={state.visual_truth?.tide}
          trafficData={{
            incidents: state.visual_truth?.traffic_alerts || [],
            verified_at: "LIVE"
          }}
        />
      </div>

      {/* HISTORY PLAYBACK PANEL - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-auto bg-black/90 p-4 rounded-xl border border-cyan-500/50 w-[420px] backdrop-blur-lg">
        {/* Header Row with Traffic Toggle */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-cyan-400">24H TIME MACHINE</span>
            {/* Traffic Toggle Button */}
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${showTraffic ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
              title="Toggle TomTom Traffic Overlay"
            >
              🚗 {showTraffic ? "ON" : "OFF"}
            </button>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-mono ${sliderValue >= 100 ? 'bg-red-600 text-white' : 'bg-cyan-900 text-cyan-300'}`}>
            {sliderValue >= 100 ? "🔴 LIVE" : currentTimeLabel}
          </span>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center gap-3 mb-3">
          {/* Play/Pause Button */}
          <button
            onClick={() => {
              if (sliderValue >= 100) setSliderValue(0); // Reset if at end
              setIsPlaying(!isPlaying);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Slider */}
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={sliderValue}
              onChange={(e) => {
                setSliderValue(parseFloat(e.target.value));
                setIsPlaying(false); // Pause on manual seek
              }}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => { setSliderValue(0); setIsPlaying(false); }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            ⏮
          </button>

          {/* Live Button */}
          <button
            onClick={() => { setSliderValue(100); setIsPlaying(false); }}
            className="px-3 py-2 bg-red-900 hover:bg-red-700 rounded text-xs"
          >
            LIVE
          </button>
        </div>

        {/* Info Row */}
        <div className="flex justify-between text-xs font-mono text-gray-500">
          <span>🚢 {playbackShips.length} vessels</span>
          <span className="text-cyan-400">🌊 Tide: {tideLevel.toFixed(1)}m</span>
          <span>{sliderValue < 100 ? "Historic Analysis" : "Real-Time"}</span>
        </div>
      </div>

      {/* Alert Overlay */}
      {alert && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pulse pointer-events-none">
          <div className="border-4 border-red-600 bg-red-900/90 text-white px-12 py-6 rounded-lg backdrop-blur-md shadow-[0_0_50px_rgba(255,0,0,0.5)]">
            <h2 className="text-3xl font-black">{alert}</h2>
            <p className="text-center font-mono mt-2">VERIFICATION: EYE OF HAMBURG</p>
          </div>
        </div>
      )}

      {/* 2D Map Layer (Realistic Twin) */}
      <div className="absolute inset-0 z-0">
        <TwinMap
          riskLevel={riskLevel}
          alert={alert}
          trucks={state.visual_truth?.trucks || []}
          ships={playbackShips.length > 0 ? playbackShips : (state.visual_truth?.ships || [])}
          bridgeStatus={state.visual_truth?.trucks && state.visual_truth.trucks.length > 0 ? "bridge_open" : "bridge_closed"}
          showTraffic={showTraffic}
        />
      </div>

    </main>
  );
}
