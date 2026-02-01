'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SystemConsole from '@/components/SystemConsole';
import RiskInterventionModal from '@/components/RiskInterventionModal';

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
    security_alerts?: { source: string, category: string, text: string, impact: string, timestamp: string }[];
    weather?: { condition: string; temperature: number; wind_speed: number; };
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
  const [sliderValue, setSliderValue] = useState(0); // -12 to +12. 0 is Live.
  const [playbackShips, setPlaybackShips] = useState<Ship[]>([]);

  // Simulation Context (History Playback)
  const [simBridgeStatus, setSimBridgeStatus] = useState<any>({ RETHE: "CLOSED", KATTWYK: "CLOSED" });
  const [simTrafficDensity, setSimTrafficDensity] = useState<number>(0);
  const [simWeather, setSimWeather] = useState<string>("CLEAR");
  const [simObstacles, setSimObstacles] = useState<string[]>([]);

  const [showRadar, setShowRadar] = useState<boolean>(true); // Radar Toggle
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeLabel, setCurrentTimeLabel] = useState("LIVE");
  const [tideLevel, setTideLevel] = useState(0);
  const [showTraffic, setShowTraffic] = useState(false); // Traffic overlay toggle (default OFF)

  // Future Prediction State
  const [futureData, setFutureData] = useState<any>(null);
  const [showFuture, setShowFuture] = useState(false);

  // --- CRISIS SCENARIO STATE ---
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [hasTriggeredCrisis, setHasTriggeredCrisis] = useState(false); // T+5 (Traffic)
  const [hasTriggeredIce, setHasTriggeredIce] = useState(false);       // T+11 (Ice)
  const [crisisType, setCrisisType] = useState<"TRAFFIC" | "ICE">("TRAFFIC");

  // --- AUTOPLAY LOOP ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSliderValue((prev) => {
          // Speed: 0.1h per tick (6 mins)
          const nextVal = prev + 0.1;

          // --- SEQUENTIAL ANOMALY DETECTION (CRISIS LOGIC) ---
          // The system monitors future time-horizons for probability cascades.
          // Event 1: Unscheduled Convoy Accumulation (Traffic Risk)
          if (nextVal >= 5.0 && nextVal < 5.2 && !hasTriggeredCrisis) {
            setIsPlaying(false);
            setHasTriggeredCrisis(true);
            setCrisisType("TRAFFIC"); // Trigger: MSC PREZIOSA Convoy
            setShowRiskModal(true);
            return nextVal;
          }

          // Event 2: Environmental Deterministic Lock (Weather Risk)
          // Flash Freeze combined with Tidal Low creates "Hydraulic Lock" probability
          if (nextVal >= 11.0 && nextVal < 11.2 && !hasTriggeredIce) {
            setIsPlaying(false);
            setHasTriggeredIce(true);
            setCrisisType("ICE"); // Trigger: CMA CGM ANTOINE Delay
            setShowRiskModal(true);
            return nextVal;
          }

          // Loop: -12 -> +12 (Continuous 24h Rolling Window)
          if (nextVal > 12) {
            return -12; // Loop back to start of history
          }
          return nextVal;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasTriggeredCrisis, hasTriggeredIce]);

  // Handle Crisis Actions
  const handleCrisisAction = (action: string) => {
    console.log(`User took action: ${action}`);
    setShowRiskModal(false);

    if (action.includes("DISPATCH")) {
      // ELEVEN LABS SCRIPT
      setAlert("🎙️ DISPATCH: 'ATTENTION ALL UNITS. ICE WARNING SECTOR 4. REROUTE VIA A7. ACKNOWLEDGE.'");
    } else if (action.includes("MOBILITHEK")) {
      setAlert("DATA SENT: T-STRATEGY-2026-ICE UPDATE PUSHED TO CLOUD.");
    } else {
      setAlert(`ACTION CONFIRMED: ${action}`);
    }

    // Clear alert after a few seconds and resume
    setTimeout(() => {
      setAlert(null);
      setIsPlaying(true);
    }, 6000); // Longer read time for script
  };

  // Notify AI during playback (every 5 slider steps)
  useEffect(() => {
    // Only notify every ~5% to avoid spam
    if (Math.floor(sliderValue) % 5 !== 0) return;
    if (!historyData) return;

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

        if (serverState.simulation_active && !alert && !showRiskModal) {
          setAlert("CRITICAL OVERRIDE: SENSOR ANOMALY DETECTED");
          setMetrics(serverState.savings);
          setRiskLevel(0.8);
          // ... Voice trigger logic ...
        }

        if (Math.abs(sliderValue) < 0.1 && serverState.visual_truth?.weather) {
          setSimWeather(serverState.visual_truth.weather.condition);
        }

      } catch (e) {
        console.error("Brain disconnected", e);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alert, historyData, sliderValue, showRiskModal]);

  // Effect: Calculate ships and environment based on Slider (Unified Mirror Logic)
  useEffect(() => {
    // If Slider is 0, use LIVE state
    if (Math.abs(sliderValue) < 0.1) {
      setPlaybackShips(state.visual_truth?.ships || []);
      setCurrentTimeLabel("LIVE");
      setShowFuture(false);
      return;
    }

    if (!historyData) return;

    const isFuture = sliderValue > 0;
    setShowFuture(isFuture);

    const start = historyData.window_start;
    const end = historyData.window_end;
    const displayTimestamp = end + (sliderValue * 3600);
    const displayDate = new Date(displayTimestamp * 1000);
    const label = displayDate.toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' });
    setCurrentTimeLabel(isFuture ? `${label} (PREDICTION)` : label);

    // --- CONTINUOUS SHIFT STRATEGY ---
    // Mirror past 24h into Future (-12h to +12h)
    let sourceTimestamp = end - (12 * 3600) + (sliderValue * 3600);
    if (sourceTimestamp < start) sourceTimestamp = start;
    if (sourceTimestamp > end) sourceTimestamp = end;

    const currentFrameShips: Ship[] = [];

    historyData.ships.forEach((hShip: any) => {
      const path = hShip.path;
      if (!path || path.length < 2) return;
      if (sourceTimestamp < path[0].ts || sourceTimestamp > path[path.length - 1].ts) return;

      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        if (sourceTimestamp >= p1.ts && sourceTimestamp <= p2.ts) {
          const r = (sourceTimestamp - p1.ts) / (p2.ts - p1.ts);
          const shipId = isFuture ? `PRED-${hShip.id}` : hShip.id;
          currentFrameShips.push({
            id: shipId,
            type: hShip.type,
            lat: p1.lat + (p2.lat - p1.lat) * r,
            lng: p1.lng + (p2.lng - p1.lng) * r,
            status: isFuture ? "PREDICTED_UNDERWAY" : hShip.status,
            imo: hShip.imo
          });
          break;
        }
      }
    });

    // --- GUARANTEED VISUALS (FUTURE) ---
    if (isFuture) {
      // 1. Hackathon Express (Always Moving)
      const prog = (Math.abs(sliderValue) % 12) / 12.0;
      currentFrameShips.push({
        id: "FUTURE-HACKATHON-EXPRESS",
        type: "Tanker",
        lat: 53.560 + (53.530 - 53.560) * prog,
        lng: 9.800 + (9.950 - 9.800) * prog,
        status: "PREDICTED_UNDERWAY",
        imo: "FUTURE-AI"
      });
      // 2. Ever Century (Static Anchor)
      currentFrameShips.push({
        id: "FUTURE-EVER-CENTURY",
        type: "Container Ship",
        lat: 53.5400,
        lng: 9.9350,
        status: "PREDICTED_MOORED",
        imo: "FUTURE-AI"
      });

      // 3. --- CRISIS SCENARIO V3 (HIGH RESOLUTION PATH) ---
      // Defined: Waltershof -> Köhlbrand -> Rethe -> All the way to Kattwyk
      // 6 Points to force the curve
      const KATTWYK_PATH = [
        { lat: 53.5300, lng: 9.9100 }, // 0: Waltershof Hub
        { lat: 53.5250, lng: 9.9250 }, // 1: Entering Köhlbrand
        { lat: 53.5180, lng: 9.9350 }, // 2: Bridge Approach N
        { lat: 53.5120, lng: 9.9380 }, // 3: Under Bridge
        { lat: 53.5000, lng: 9.9480 }, // 4: Past Rethe Junc
        { lat: 53.4940, lng: 9.9520 }  // 5: Kattwyk Alert Zone
      ];

      // Multi-Point Interpolation Helper
      const interpolatePath = (path: { lat: number, lng: number }[], p: number) => {
        if (p <= 0) return path[0];
        if (p >= 1) return path[path.length - 1];

        const totalSegments = path.length - 1;
        const segmentP = p * totalSegments;
        const idx = Math.floor(segmentP);
        const t = segmentP - idx;

        const p1 = path[idx];
        const p2 = path[idx + 1] || path[idx]; // Safety

        return {
          lat: p1.lat + (p2.lat - p1.lat) * t,
          lng: p1.lng + (p2.lng - p1.lng) * t
        }
      };

      // SHIP A: Arrives T+5.0 (Travels T+3.0 to T+5.0)
      if (sliderValue > 3.0 && sliderValue < 5.0) {
        const p = (sliderValue - 3.0) / 2.0; // 0 to 1 over 2h
        const pos = interpolatePath(KATTWYK_PATH, p);
        currentFrameShips.push({
          id: "MSC PREZIOSA",
          type: "Ultra-Large Container",
          lat: pos.lat,
          lng: pos.lng,
          status: "CRITICAL_PATH",
          imo: "9639206"
        });
      }
      // Hold Ship A at the bridge for a bit just in case (T+5.0 to T+5.5)
      else if (sliderValue >= 5.0 && sliderValue < 5.5) {
        const pos = KATTWYK_PATH[KATTWYK_PATH.length - 1];
        currentFrameShips.push({
          id: "MSC PREZIOSA",
          type: "Ultra-Large Container",
          lat: pos.lat,
          lng: pos.lng,
          status: "AWAITING_INSTRUCTION",
          imo: "9639206"
        });
      }

      // SHIP B: Arrives T+11.0 (Travels T+9.0 to T+11.0)
      if (sliderValue > 9.0 && sliderValue < 11.0) {
        const p = (sliderValue - 9.0) / 2.0;
        const pos = interpolatePath(KATTWYK_PATH, p);
        currentFrameShips.push({
          id: "CMA CGM ANTOINE",
          type: "Heavy Load Carrier",
          lat: pos.lat,
          lng: pos.lng,
          status: "CRITICAL_PATH",
          imo: "9706308"
        });
      }
    }

    setPlaybackShips(currentFrameShips);

    // Environment Mirroring
    if (historyData.timeline) {
      const snapshot = historyData.timeline.reduce((prev: any, curr: any) =>
        Math.abs(curr.ts - sourceTimestamp) < Math.abs(prev.ts - sourceTimestamp) ? curr : prev
      );
      if (snapshot) {
        setSimBridgeStatus(snapshot.bridges);
        setSimTrafficDensity(snapshot.traffic_density);
        setSimWeather(snapshot.weather);
      }
    }

  }, [sliderValue, historyData, state]);

  // Determine Data Source for UI
  const isHistory = sliderValue < 0 || sliderValue > 0;

  // Traffic Simulation Logic (Visuals)
  let simIncidents: string[] = [];
  if (isHistory) {
    if (simObstacles && simObstacles.length > 0) {
      simIncidents = simObstacles;
    } else {
      if (simTrafficDensity > 80) simIncidents = ["⛔ GRIDLOCK DETECTED: A7 ELBTUNNEL", "⚠️ TRAFFIC JAM: KÖHLBRANDBRÜCKE"];
      else if (simTrafficDensity > 50) simIncidents = ["⚠️ SLOW TRAFFIC: HAFEN CITY", "🚛 HEAVY TRUCK LOAD"];
    }
  }

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden select-none">

      {/* INTELLIGENCE LAYER: WEBCAMS */}
      {/* Teufelsbrück (Elbe Entrance) */}
      <a
        href="https://www.portofhamburg.com/en/webcam-teufelsbrueck/"
        target="_blank"
        className="absolute top-[65%] left-[10%] z-20 group"
      >
        <div className="bg-black/80 border border-green-500/50 p-1 rounded-full hover:scale-110 transition-transform cursor-pointer">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black text-[10px] text-green-400 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none border border-green-900">
          CAM: TEUFELSBRÜCK
        </div>
      </a>

      {/* Bubendey-Ufer (Elbe Pilot Station) */}
      <a
        href="https://www.youtube.com/results?search_query=hamburg+hafen+live"
        target="_blank"
        className="absolute top-[55%] left-[25%] z-20 group"
      >
        <div className="bg-black/80 border border-green-500/50 p-1 rounded-full hover:scale-110 transition-transform cursor-pointer">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black text-[10px] text-green-400 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none border border-green-900">
          CAM: BUBENDEY
        </div>
      </a>

      {/* Neuhof (Sector 4 Crisis Zone) */}
      <div className="absolute top-[35%] right-[30%] z-20 group">
        <div className="bg-black/80 border border-red-500 p-1.5 rounded-full hover:scale-110 transition-transform cursor-pointer animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black text-[10px] text-red-500 font-bold px-2 py-0.5 rounded opacity-100 whitespace-nowrap border border-red-900">
          CAM: SECTOR 4 (ACTIVE)
        </div>
      </div>

      {/* MODAL OVERLAY (Crisis) */}
      {showRiskModal && (
        <RiskInterventionModal
          onClose={() => setShowRiskModal(false)}
          onAction={handleCrisisAction}
          scenario={crisisType}
        />
      )}

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

      {/* System Console - Full Screen Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* @ts-ignore */}
        <SystemConsole
          logs={state.system_logs || []}
          aiThought={state.ai_thought}
          riskGrade={state.risk_grade}
          trucks={state.visual_truth?.trucks || []}
          ships={playbackShips.length > 0 ? playbackShips : (state.visual_truth?.ships || [])}
          tideLevel={state.visual_truth?.tide}
          trafficData={{
            incidents: isHistory ? simIncidents : (state.visual_truth?.traffic_alerts || []),
            verified_at: isHistory ? "SIMULATION" : "LIVE",
            density: isHistory ? simTrafficDensity : 0
          }}
        />
      </div>

      {/* SECURITY MONITOR - Bottom Left (Police/NINA) */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none flex flex-col gap-2 w-[400px]">
        {state.visual_truth?.security_alerts?.map((alert, idx) => (
          <div key={idx} className="bg-slate-900/90 border-l-4 border-yellow-500 p-3 rounded backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-left duration-500 w-full">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-yellow-400 bg-yellow-900/50 px-1 rounded">{alert.source}</span>
              <span className="text-[10px] text-gray-400 font-mono">{alert.timestamp.substring(11, 16)}</span>
            </div>
            <p className="text-sm text-gray-200 font-medium leading-tight">{alert.text}</p>
            <div className="mt-1 flex gap-2 text-[10px] text-gray-500">
              <span>CAT: {alert.category.toUpperCase()}</span>
              {alert.impact === 'HIGH' && <span className="text-red-500 font-bold blink">Create Impact Analysis...</span>}
            </div>
          </div>
        ))}
      </div>

      {/* HISTORY PLAYBACK PANEL - Bottom Right (Unified 48h) */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-auto bg-black/90 p-4 rounded-xl border border-cyan-500/50 w-[480px] backdrop-blur-lg">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-cyan-400">48H TEMPORAL ENGINE</span>
            <button
              onClick={() => setShowRadar(!showRadar)}
              className={`ml-2 px-2 py-1 rounded text-xs font-mono transition-all ${showRadar ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              ☁️ {showRadar ? "ON" : "OFF"}
            </button>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-mono border ${sliderValue === 0 ? 'bg-red-600 border-red-500 text-white' :
            sliderValue > 0 ? 'bg-purple-900 border-purple-500 text-purple-200' :
              'bg-blue-900 border-blue-500 text-cyan-200'
            }`}>
            {sliderValue === 0 ? "🔴 LIVE NOW" : currentTimeLabel}
          </span>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all ${isPlaying ? 'bg-orange-500 hover:bg-orange-400' : 'bg-cyan-700 hover:bg-cyan-600'}`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Unified -12 to +12 Slider */}
          <div className="flex-1 relative">
            {/* Center Marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500/50 -translate-x-1/2 pointer-events-none h-full z-0"></div>

            <input
              type="range"
              min="-12"
              max="12"
              step="0.1"
              value={sliderValue}
              onChange={(e) => {
                setSliderValue(parseFloat(e.target.value));
                setIsPlaying(false);
                setHasTriggeredCrisis(false); // Reset trigger on manual seek
              }}
              className="w-full h-4 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 relative z-10"
              style={{
                background: `linear-gradient(to right, 
                      #1e3a8a 0%, 
                      #1e3a8a 50%, 
                      #581c87 50%, 
                      #581c87 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
              <span>-12h (HISTORY)</span>
              <span className="text-red-500 font-bold">LIVE</span>
              <span>+12h (FUTURE)</span>
            </div>
          </div>

          <button
            onClick={() => { setSliderValue(0); setIsPlaying(false); setHasTriggeredCrisis(false); setHasTriggeredIce(false); }}
            className="px-2 py-1 bg-red-900 hover:bg-red-700 rounded text-xs border border-red-500"
          >
            RST
          </button>
        </div>

        {/* Info Row */}
        <div className="flex justify-between text-xs font-mono text-gray-500">
          <span>🚢 {playbackShips.length} vessels</span>
          <span className="text-cyan-400">🌊 Tide: {tideLevel.toFixed(1)}m</span>
          <span className={sliderValue > 0 ? "text-purple-400 font-bold" : "text-blue-400 font-bold"}>
            {sliderValue === 0 ? "REAL-TIME SENSORS" : sliderValue > 0 ? "PREDICTION AI" : "HISTORIC DATA"}
          </span>
        </div>
      </div>

      {/* Alert Overlay (Hide if Modal is open) */}
      {alert && !showRiskModal && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pulse pointer-events-none">
          <div className="border-4 border-red-600 bg-red-900/90 text-white px-12 py-6 rounded-lg backdrop-blur-md shadow-[0_0_50px_rgba(255,0,0,0.5)]">
            <h2 className="text-3xl font-black">{alert}</h2>
            <p className="text-center font-mono mt-2">VERIFICATION: EYE OF HAMBURG</p>
          </div>
        </div>
      )}

      {/* FUTURE PREDICTION OVERLAY */}
      {showFuture && futureData && (
        <div className="absolute top-20 right-6 z-40 bg-black/90 p-6 rounded-xl border-2 border-purple-500 w-[420px] backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-in slide-in-from-right duration-500">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            🔮 ORACLE 24H
            <span className="text-xs font-normal text-purple-300 bg-purple-900/50 px-2 rounded-full">PROBABILISTIC</span>
          </h2>

          <div className="space-y-4 font-mono text-xs">
            {futureData.events.map((event: any, i: number) => (
              <div key={i} className="border-l-2 border-purple-500 pl-3 py-1">
                <div className="flex justify-between text-purple-300 mb-1">
                  <span className="font-bold">{event.time} (+24h)</span>
                  <span className="opacity-70">{event.type}</span>
                </div>
                <p className="text-gray-300 leading-snug">{event.description}</p>
                {event.type === 'SENTINEL_ACTION' && (
                  <div className="mt-2 text-green-400 bg-green-900/20 p-2 rounded">
                    Action Status: {event.status}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-6 pt-4 border-t border-purple-500/30">
              <div className="text-xs text-center text-gray-500 mb-2">PROJECTED SAVINGS (EST.)</div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-purple-900/30 p-2 rounded">
                  <div className="text-xl font-bold text-white">€{futureData.impact_analysis.money_saved_eur}</div>
                  <div className="text-purple-400">Costs Prevented</div>
                </div>
                <div className="bg-green-900/30 p-2 rounded">
                  <div className="text-xl font-bold text-white">{futureData.impact_analysis.co2_saved_kg} kg</div>
                  <div className="text-green-400">CO2 Avoided</div>
                </div>
              </div>
            </div>
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
          showTraffic={showTraffic && !isHistory}

          // Enhanced Dynamic Props
          isLive={sliderValue === 0}
          simTrafficDensity={isHistory ? simTrafficDensity : 0} // Only show particles in history/future
          simWeather={isHistory ? simWeather : (state.visual_truth?.weather?.condition || "CLEAR")}
        />
      </div>

    </main>
  );
}
