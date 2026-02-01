import React from 'react';

interface RiskInterventionModalProps {
    onClose: () => void;
    onAction: (action: string) => void;
    scenario: "TRAFFIC" | "ICE";
}

export default function RiskInterventionModal({ onClose, onAction, scenario }: RiskInterventionModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border-2 border-red-500 rounded-2xl w-[600px] shadow-[0_0_100px_rgba(220,38,38,0.5)] overflow-hidden">

                {/* Header */}
                <div className="bg-red-900/50 p-6 flex justify-between items-center border-b border-red-500/50">
                    <div className="flex items-center gap-4">
                        <div className="animate-pulse bg-red-600 w-4 h-4 rounded-full shadow-[0_0_20px_red]"></div>
                        <h2 className="text-2xl font-black text-white tracking-widest">CRITICAL PREDICTION</h2>
                    </div>
                    <span className="text-red-300 font-mono text-xs border border-red-500 px-2 py-1 rounded">
                        CONFIDENCE: {scenario === "TRAFFIC" ? "98.4%" : "94.2%"}
                    </span>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">

                    <div className="space-y-4">

                        {/* SCENARIO A: TRAFFIC CONVOY */}
                        {scenario === "TRAFFIC" && (
                            <div className="bg-slate-800 p-4 rounded border-l-4 border-red-500">
                                <h3 className="text-gray-400 text-xs font-bold mb-1">DETECTED ANOMALY (T+5h)</h3>
                                <p className="text-white font-mono text-sm leading-relaxed">
                                    <span className="text-red-400 font-bold">UNSCHEDULED CONVOY DETECTED.</span><br />
                                    "MSC PREZIOSA" + 2 Tugs converging on Kattwyk.<br />
                                    <span className="text-xs text-gray-400">Risk of closure overlap &gt; 45 mins.</span>
                                </p>
                            </div>
                        )}

                        {/* SCENARIO B: ICE DELAY */}
                        {scenario === "ICE" && (
                            <div className="bg-slate-800 p-4 rounded border-l-4 border-cyan-500">
                                <h3 className="text-cyan-400 text-xs font-bold mb-1">DETECTED ANOMALY (T+11h)</h3>
                                <p className="text-white font-mono text-sm leading-relaxed">
                                    <span className="text-cyan-300 font-bold">ICE ACCRETION ALERT.</span><br />
                                    Vessel "CMA CGM ANTOINE" delayed by Flash Freeze.<br />
                                    <span className="text-xs text-gray-400">Hydraulic Lock Risk on Bridge Mechanism.</span>
                                </p>
                            </div>
                        )}

                        {/* LIVE OPTICAL VERIFICATION */}
                        <div className="mt-4 border border-slate-700 bg-black rounded overflow-hidden relative group">
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse z-10">
                                ● LIVE OPTICAL FEED (SECTOR 4)
                            </div>
                            <img
                                src={`https://www.hafen-hamburg.de/assets/files/webcam/cta.jpg?t=${new Date().getTime()}`}
                                alt="Live Port Feed"
                                className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent p-2">
                                <p className="text-[10px] text-gray-300 font-mono">SOURCE: HPA SENSOR NETWORK (NEUHOF/ADM)</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* EXTERNAL VERIFICATION LINKS */}
                <div className="flex gap-2 mb-2">
                    <a
                        href={scenario === "TRAFFIC" ? "https://www.marinetraffic.com/en/ais/details/ships/imo:9639206" : "https://www.marinetraffic.com/en/ais/details/ships/imo:9706308"}
                        target="_blank"
                        className="flex-1 bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-xs font-bold py-2 px-3 rounded border border-blue-700 flex items-center justify-center gap-2 transition-colors"
                    >
                        📡 TRACK VESSEL (MARINE TRAFFIC)
                    </a>
                    <a
                        href="https://www.hafen-hamburg.de/en/vessels/arrivals/"
                        target="_blank"
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-bold py-2 px-3 rounded border border-gray-600 flex items-center justify-center gap-2 transition-colors"
                    >
                        📋 PORT SCHEDULE (OFFICIAL)
                    </a>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <div className="flex-1 bg-slate-800 p-3 rounded border-l-4 border-yellow-500">
                        <h3 className="text-gray-400 text-xs font-bold mb-1">ROOT CAUSE</h3>
                        <p className="text-gray-200 text-xs">
                            {scenario === "TRAFFIC"
                                ? "Illegal Convoy Pattern (3 ships < 500m gap)."
                                : "Temp -1.8°C causing mechanical hesitation."}
                        </p>
                    </div>
                    <div className="flex-1 bg-slate-800 p-3 rounded border-l-4 border-orange-500">
                        <h3 className="text-gray-400 text-xs font-bold mb-1">PROJECTED IMPACT</h3>
                        <p className="text-gray-200 text-xs">
                            Total Gridlock &gt; {scenario === "TRAFFIC" ? "45m" : "2h"}.<br />
                            {scenario === "TRAFFIC" ? "A7 Traffic Jam." : "Tug Assist Mandatory."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                <div className="text-yellow-400 font-bold mb-1">AI RECOMMENDATION</div>
                <p className="text-yellow-200/80 text-sm">
                    {scenario === "TRAFFIC"
                        ? "Notify Driver Dispatch to reroute approaching heavy goods vehicles immediately to avoid A7 deadlock."
                        : "Deploy Ice Breaker Tugs to Sector 4 and warm bridge hydraulics. Notify Drivers of long delay."
                    }
                </p>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6">
                <button
                    onClick={() => onAction('DISPATCH')}
                    className="group bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-400 p-4 rounded-lg transition-all flex flex-col items-center gap-2"
                >
                    <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-cyan-400">CALL DISPATCH</span>
                </button>

                <button
                    onClick={() => onAction('MOBILITHEK')}
                    className="group bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-green-400 p-4 rounded-lg transition-all flex flex-col items-center gap-2"
                >
                    <span className="text-2xl group-hover:scale-110 transition-transform">📡</span>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-green-400">MOBILITHEK PUSH</span>
                </button>

                <button
                    onClick={() => onAction('TWITTER')}
                    className="group bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-blue-400 p-4 rounded-lg transition-all flex flex-col items-center gap-2"
                >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🐦</span>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-blue-400">POST ALERT</span>
                </button>
            </div>

        </div>

                {/* Footer */ }
    <div className="bg-gray-900 p-4 flex justify-between items-center border-t border-gray-800">
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs underline">
            IGNORE WARNING (Simulation Logs Updated)
        </button>
        <div className="text-xs font-mono text-red-500 animate-pulse">
            WAITING FOR HUMAN AUTHORIZATION...
        </div>
    </div>

            </div >
        </div >
    );
}
