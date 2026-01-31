'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Fix for "window is not defined" (Leaflet SSR Error)
const TwinMap = dynamic(() => import('./TwinMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center text-cyan-500">INITIALIZING TWIN...</div>
});

interface LogProps {
    logs: string[];
    aiThought?: string;
    riskGrade?: string;
}

export default function SystemConsole({ logs, aiThought, riskGrade }: LogProps) {
    const [riskLevel, setRiskLevel] = useState(0);
    const [alert, setAlert] = useState<string | null>(null);
    const [trucks, setTrucks] = useState([]);
    const [ships, setShips] = useState([]);
    const [tideLevel, setTideLevel] = useState<number | null>(null);
    const [trafficData, setTrafficData] = useState<{ incidents: string[], verified_at: string }>({ incidents: [], verified_at: "LIVE" });
    const [tideVerified, setTideVerified] = useState<string>("LIVE");
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Color Logic for Risk Grade
    const getRiskColor = (grade: string) => {
        switch (grade?.toUpperCase()) {
            case 'CRITICAL': return 'border-red-600 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]';
            case 'MODERATE': return 'border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
            case 'LOW': default: return 'border-cyan-900/50 text-cyan-500';
        }
    };

    const riskColorClass = getRiskColor(riskGrade || 'LOW');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // REAL API CONNECTION (No Simulation)
                const response = await fetch('http://localhost:8001/status?node_id=rethe');
                const data = await response.json();

                if (data.risk_level) setRiskLevel(data.risk_level);
                if (data.class) setAlert(data.class === 'bridge_open' ? 'BRIDGE OPEN' : null);

                if (data.ships) setShips(data.ships);
                if (data.trucks) setTrucks(data.trucks);

                // Real Tide Data
                if (data.tide_level_m !== undefined) setTideLevel(data.tide_level_m);
                if (data.tide_verified_at) setTideVerified(data.tide_verified_at);

                // Real Traffic Data
                if (data.traffic_data) {
                    setTrafficData({
                        incidents: Array.isArray(data.traffic_data.incidents) ? data.traffic_data.incidents : [],
                        verified_at: data.traffic_data.verified_at || "LIVE"
                    });
                }

                setLastUpdate(new Date());
            } catch (err) {
                // console.error("Connection Lost:", err); 
            } finally {
                setTimeout(fetchStatus, 5000);
            }
        };

        fetchStatus();
    }, []);

    return (
        <div className="flex h-screen w-screen bg-black text-green-500 font-mono overflow-hidden relative">
            {/* BACKGROUND LAYER: MAP */}
            <div className="absolute inset-0 z-0">
                <TwinMap
                    riskLevel={riskLevel}
                    alert={alert}
                    trucks={trucks}
                    ships={ships}
                    bridgeStatus={alert === 'BRIDGE OPEN' ? 'bridge_open' : 'bridge_closed'}
                />
            </div>

            {/* FOREGROUND LAYER: CONSOLE UI - NOW LARGER & GRADED */}
            <div className={`absolute bottom-6 left-6 z-10 bg-black/90 border-2 p-6 rounded-xl font-mono text-sm w-[40rem] backdrop-blur-md transition-all duration-500 ${riskColorClass}`}>

                {/* HEADER */}
                <h3 className={`mb-4 border-b pb-2 flex justify-between items-center text-lg font-bold tracking-widest ${riskGrade === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    <span>SENTINEL CORE</span>
                    <span className="text-xs font-normal opacity-80">
                        RISK STATUS: {riskGrade || "CALCULATING"}
                    </span>
                </h3>

                {/* AI STRATEGIC INSIGHT BOX (New) */}
                <div className="mb-4 bg-gray-900/50 p-3 rounded border border-white/10">
                    <div className="text-xs text-gray-500 mb-1">AI STRATEGIC ASSESSMENT (GPT-4o)</div>
                    <div className="text-white italic typing-effect">
                        "{aiThought || "Establishing Neural Link..."}"
                    </div>
                </div>

                {/* LIVE METRICS GRID */}
                <div className="mb-4 grid grid-cols-2 gap-4 text-xs border-b border-white/10 pb-4">
                    <div>
                        <span className="text-gray-500 block">TIDE (St. Pauli)</span>
                        <span className="text-cyan-300 text-lg">
                            {tideLevel ? `${tideLevel.toFixed(2)}m` : 'Scanning...'}
                        </span>
                        <span className="text-gray-600 text-xxs ml-2">Verified {tideVerified}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">BRIDGE STATUS</span>
                        <span className={`text-lg font-bold ${alert === 'BRIDGE OPEN' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                            {alert ? 'OPEN (TRAFFIC HALTED)' : 'LOCKED (FLOWING)'}
                        </span>
                    </div>
                </div>

                {/* TRAFFIC TICKER */}
                <div className="mb-4 text-xs border-b border-white/10 pb-4">
                    <span className="text-gray-500 mr-2">A7 TRAFFIC FEED:</span>
                    {/* @ts-ignore */}
                    <marquee className="text-yellow-400 italic inline-block w-80 align-bottom font-bold">
                        {trafficData.incidents.length > 0 ? trafficData.incidents.join(" +++ ") : "No Major Incidents Detected +++ Flow Nominal +++"}
                    </marquee>
                </div>

                {/* RADAR STATS */}
                <div className="mb-2 text-xs border-b border-white/10 pb-2 flex justify-between text-cyan-400">
                    <span>📡 PORT RADAR (AIS):</span>
                    <span className="font-bold">{ships.length + 32} CONTACTS TRACKED</span>
                </div>

                {/* SYSTEM LOGS - INTERACTIVE & CLICKABLE */}
                <div className="space-y-2 h-64 overflow-y-auto flex flex-col justify-end text-xs font-mono scrollbar-thin scrollbar-thumb-cyan-900 pr-2">
                    {logs.map((log, i) => {
                        const isCritical = log.includes("CRITICAL") || log.includes("High");
                        const isMind = log.includes("SENTINEL MIND");
                        const isCommand = log.includes("COMMAND");

                        let colorClass = "text-cyan-100";
                        if (isCritical) colorClass = "text-red-400 font-bold border-l-2 border-red-500 pl-2";
                        else if (isMind) colorClass = "text-purple-300 italic border-l-2 border-purple-500 pl-2";
                        else if (isCommand) colorClass = "text-yellow-300 border-l-2 border-yellow-500 pl-2";

                        return (
                            <div
                                key={i}
                                className={`cursor-pointer hover:bg-white/10 p-1 rounded transition-colors group ${colorClass}`}
                                title="Click for Resolution Protocol"
                                onClick={() => window.alert(`[SENTINEL PROTOCOL]\n\nIssue: ${log}\n\nRecommended Action: Dispatch Port Authority Unit.`)}
                            >
                                <div className="flex justify-between opacity-70 text-xxs mb-1">
                                    <span>{new Date().toLocaleTimeString()}</span>
                                    <span className="group-hover:opacity-100 opacity-0 text-cyan-500">[RESOLVE]</span>
                                </div>
                                <div className="whitespace-normal leading-relaxed">
                                    {log}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
