'use client';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

interface TwinMapProps {
    riskLevel: number;
    alert: string | null;
    trucks?: { id: string, lat: number, lng: number }[];
    ships?: { id: string, lat: number, lng: number, type: string, imo?: string, mmsi?: string, status?: string }[];
    showTraffic?: boolean;
}

export default function TwinMap({
    riskLevel,
    alert,
    trucks = [],
    ships = [],
    bridgeStatus = "bridge_closed",
    showTraffic = false
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

    return (
        <MapContainer
            center={initialCenter}
            zoom={14}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
            attributionControl={false}
        >
            {/* Base Map: CartoDB Voyager - ALWAYS visible */}
            <TileLayer
                attribution='&copy; OpenStreetMap &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* TomTom Traffic Flow Overlay - ALWAYS rendered, toggle via opacity */}
            <TileLayer
                url={tomtomTrafficFlow}
                opacity={showTraffic ? 0.8 : 0}
            />

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
                                <span>{s.type || 'Unknown'}</span>
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
