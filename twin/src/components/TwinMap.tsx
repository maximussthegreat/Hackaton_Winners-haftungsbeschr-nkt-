import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import WeatherRadar from './WeatherRadar';

// --- SIMULATED TRAFFIC FLOW (TomTom Style) --- 
// Replaces "Particles" with clean, colored vector segments
const TrafficFlowSimulation = ({ density, show }: { density: number, show: boolean }) => {
    if (!show) return null;

    // Color Scale: Green (Fast) -> Orange -> Red (Jam)
    const color = density > 80 ? '#ef4444' : density > 50 ? '#f97316' : '#22c55e';
    const opacity = 0.8;
    const weight = 6;

    // A7 Segment
    const pathA7 = [
        [53.5500, 9.9150], [53.5400, 9.9160], [53.5300, 9.9180], [53.5150, 9.9280], [53.5000, 9.9320]
    ] as [number, number][]; // Explicit tuple

    // Köhlbrand Segment
    const pathKohlbrand = [
        [53.5100, 9.9600], [53.5150, 9.9550], [53.5200, 9.9450], [53.5250, 9.9350]
    ] as [number, number][];

    return (
        <>
            <Polyline positions={pathA7} pathOptions={{ color, weight, opacity }} />
            <Polyline positions={pathKohlbrand} pathOptions={{ color, weight, opacity }} />
        </>
    )
}

// TomTom API Key
const TOMTOM_API_KEY = 'hcgO55oPrfrKQtQYL45OMBDB705jrZcV';

// Custom Icons with Emojis
const truckIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="font-size: 20px; filter: drop-shadow(0 0 5px orange);">🚛</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const shipIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="font-size: 24px; filter: drop-shadow(0 0 8px cyan);">🚢</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Road Segments for Traffic Visualization (Lat/Lng Arrays)
const roadSegments = [
    // --- MAIN ARTERIES (Use thicker weight) ---
    // A7 Elbtunnel & Approach
    {
        points: [[53.5500, 9.9150], [53.5400, 9.9160], [53.5300, 9.9180], [53.5150, 9.9280], [53.5000, 9.9320]],
        type: "artery"
    },
    // B75 / Wilhelmsburg Logic
    {
        points: [[53.5100, 10.0000], [53.5000, 9.9900], [53.4900, 9.9850]],
        type: "artery"
    },

    // --- CRITICAL PORT INFRASTRUCTURE ---
    // Köhlbrandbrücke (Iconic Curve)
    {
        points: [[53.5100, 9.9600], [53.5150, 9.9550], [53.5200, 9.9450], [53.5250, 9.9350]],
        type: "bridge"
    },
    // Rethe Bridge Network
    {
        points: [[53.5040, 9.9710], [53.5008, 9.9710], [53.4900, 9.9710]], // North-South axis
        type: "bridge"
    },
    // Kattwyk Bridge Network
    {
        points: [[53.4938, 9.9400], [53.4938, 9.9530], [53.4938, 9.9700]], // West-East axis
        type: "bridge"
    },

    // --- FEEDER ROADS (Internal Port) ---
    { points: [[53.5200, 9.9450], [53.5200, 9.9800]], type: "feeder" }, // Cross connection
    { points: [[53.5008, 9.9710], [53.5000, 9.9850]], type: "feeder" },
    { points: [[53.5300, 9.9180], [53.5300, 9.9500]], type: "feeder" }  // Container Terminal Access
];

interface TwinMapProps {
    riskLevel: number;
    alert: string | null;
    trucks?: { id: string, lat: number, lng: number }[];
    ships?: { id: string, lat: number, lng: number, type: string, imo?: string, mmsi?: string, status?: string }[];
    showTraffic?: boolean;
    // New Props for Dynamic Sim
    isLive?: boolean;
    simTrafficDensity?: number; // 0-100
    simWeather?: string; // CLEAR, RAIN, SNOW
}

// --- ROBUST TILE LAYER FIX (Bypassing React-Leaflet Component Bug) ---
import { useMap } from 'react-leaflet';

const StableTileLayer = ({ url, attribution, opacity = 1 }: { url: string, attribution?: string, opacity?: number }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!map) return;

        const layer = L.tileLayer(url, {
            attribution,
            opacity: opacity
        });

        layer.addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, url, attribution, opacity]);

    return null;
};

export default function TwinMap({
    riskLevel,
    alert,
    trucks = [],
    ships = [],
    bridgeStatus = "bridge_closed",
    showTraffic = true,
    isLive = true,
    simTrafficDensity = 0,
    simWeather = "CLEAR"
}: TwinMapProps & { bridgeStatus?: string }) {
    // Bridge Locations
    const bridges = [
        { node_id: "rethe", lat: 53.5008, lng: 9.9710 },
        { node_id: "kattwyk", lat: 53.4938, lng: 9.9530 }
    ];

    const initialCenter: [number, number] = [bridges[0].lat, bridges[0].lng];

    const bridgeOpenIcon = L.divIcon({ className: 'custom-icon', html: '🔴', iconSize: [24, 24] });
    const bridgeClosedIcon = L.divIcon({ className: 'custom-icon', html: '🔵', iconSize: [24, 24] });

    // TomTom Traffic Overlay URL - relative0 style is TRANSPARENT
    const tomtomTrafficFlow = `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;

    // Dynamic Traffic Color Logic
    const trafficColor = bridgeStatus === 'bridge_open' ? '#ff0000' : '#44ff00';

    return (
        <MapContainer
            center={initialCenter}
            zoom={14}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
            attributionControl={false}
        >
            {/* Base Map: CartoDB Voyager - ALWAYS visible */}
            <StableTileLayer
                attribution='&copy; OpenStreetMap &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* TomTom Traffic - Structure Overlay (Static) */}
            <StableTileLayer
                url={tomtomTrafficFlow}
                opacity={0.8}
            />

            {/* DYNAMIC LAYERS */}

            {/* 1. Traffic Lines (Simulated Flow) - REMOVED PER USER REQUEST ("No fake lines") */}
            {/* Base TomTom Layer handles visuals for now (Static but Real) */}

            {/* 2. Weather Radar */}
            <WeatherRadar weather={simWeather} isLive={isLive} show={true} />

            {/* DYNAMIC TRAFFIC OVERLAY (Holographic Lines) - REMOVED PER USER REQUEST */}

            {/* BRIDGE MARKERS */}
            {bridges.map((b) => (
                <Marker
                    key={b.node_id}
                    position={[b.lat, b.lng]}
                    icon={bridgeStatus === 'bridge_open' ? bridgeOpenIcon : bridgeClosedIcon}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-lg">{b.node_id.toUpperCase()} BRIDGE</h3>
                            <div className={`badge ${bridgeStatus === 'bridge_open' ? 'badge-error' : 'badge-success'} mt-1`}>
                                {bridgeStatus === 'bridge_open' ? 'OPEN (TRAFFIC STOPPED)' : 'CLOSED (TRAFFIC FLOWING)'}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* TRAFFIC STATUS NODES (Cleaner Alternative to Lines) */}
            {/* TRAFFIC SENSORS REMOVED PER USER REQUEST */}

            {/* Dynamic Realtime Trucks */}
            {trucks.map((t) => (
                <Marker key={t.id} position={[t.lat, t.lng]} icon={truckIcon}>
                    <Popup><div className="text-black text-xs">{t.id} (HGV)</div></Popup>
                </Marker>
            ))}

            {/* Dynamic Realtime Ships with Rich Info Popups */}
            {ships.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={shipIcon}>
                    <Popup>
                        <div className="text-black text-xs min-w-[180px]">
                            <div className="font-bold text-sm border-b pb-1 mb-1">{s.id}</div>
                            <div className="grid grid-cols-2 gap-1">
                                <span className="text-gray-500">Type:</span>
                                <span className={s.type}>{s.type || 'Unknown'}</span>
                                {s.status && (
                                    <>
                                        <span className="text-gray-500">Status:</span>
                                        <span className={`font-semibold ${s.status === 'UNDERWAY' ? 'text-green-600' : s.status === 'MOORED' ? 'text-blue-600' : 'text-orange-500'}`}>
                                            {s.status}
                                        </span>
                                    </>
                                )}
                                {s.imo && (
                                    <>
                                        <span className="text-gray-500">IMO:</span>
                                        <span>{s.imo}</span>
                                    </>
                                )}
                                {s.mmsi && (
                                    <>
                                        <span className="text-gray-500">MMSI:</span>
                                        <span>{s.mmsi}</span>
                                    </>
                                )}
                            </div>
                            <div className="mt-2 pt-1 border-t text-center">
                                <a
                                    href={`https://www.marinetraffic.com/en/ais/details/ships/imo:${s.imo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline text-xs"
                                >
                                    📊 View on MarineTraffic
                                </a>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Bio-Risk Fog Visualization */}
            {riskLevel > 0.5 && (
                <Circle
                    center={initialCenter}
                    radius={1200}
                    pathOptions={{
                        color: 'transparent',
                        fillColor: '#44ff00',
                        fillOpacity: 0.15
                    }}
                />
            )}
        </MapContainer>
    );
}
