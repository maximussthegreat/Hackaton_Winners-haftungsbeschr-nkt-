'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SystemConsole from '@/components/SystemConsole';

// Dynamic import to avoid SSR issues with Leaflet
const TwinMap = dynamic(() => import('@/components/TwinMap'), {
  ssr: false,
  loading: () => <div className="text-white p-10">Loading Holographic Twin...</div>
});

export default function Home() {
  const [riskLevel, setRiskLevel] = useState(0.0);
  const [metrics, setMetrics] = useState({ fuel_saved_l: 0, money_saved_eur: 0, co2_saved_kg: 0 });
  const [alert, setAlert] = useState<string | null>(null);
  const [state, setState] = useState({
    simulation_active: false,
    system_logs: ["Initialize..."],
    visual_truth: { confidence: 0.0 }
  });

  // Polling for simulation state
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8002/');
        const data = await res.json();
        const serverState = data.state;
        setState(serverState);

        if (serverState.simulation_active && !alert) {
          setAlert("CRITICAL OVERRIDE: SENSOR ANOMALY DETECTED");
          setMetrics(serverState.savings);
          setRiskLevel(0.8);

          // Trigger Voice
          const speech = "Anomaly contained. Sensor deviation at Rethe Hub verified visually. 42 units rerouted. Projected savings: 787 Euros.";
          const utterance = new SpeechSynthesisUtterance(speech);
          utterance.rate = 1.1;
          utterance.pitch = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      } catch (e) {
        console.error("Brain disconnected", e);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alert]);

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
              <span className="text-cyan-400 text-xl">{(state.visual_truth?.confidence || 0) * 100}%</span>
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
        <SystemConsole logs={state.system_logs || []} />
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
        <TwinMap riskLevel={riskLevel} alert={alert} />
      </div>

    </main>
  );
}
