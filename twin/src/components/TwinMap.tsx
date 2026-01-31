'use client';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom Icons
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
    iconAnchor: [12, 12] // Reverted to Center (GPS Exact)
});

interface TwinMapProps {
    riskLevel: number;
    alert: string | null;
    trucks?: { id: string, lat: number, lng: number }[];
    ships?: { id: string, lat: number, lng: number, type: string }[];
}

export default function TwinMap({ riskLevel, alert, trucks = [], ships = [], bridgeStatus = "bridge_closed" }: TwinMapProps & { bridgeStatus?: string }) {
    // Bridge Locations (Use consistent ID 'rethe')
    // Bridge Locations (Exact Google Maps Coordinates)
    const bridges = [
        { node_id: "rethe", lat: 53.5008, lng: 9.9710 }, // Rethe Bridge (Exact)
        { node_id: "kattwyk", lat: 53.4938, lng: 9.9530 } // Kattwyk Bridge (Refined)
    ];

    // Use the first bridge's coordinates as the initial center
    const initialCenter: [number, number] = [bridges[0].lat, bridges[0].lng];

    // Define icons inside component or globally (prevents 'not found' error)
    const bridgeOpenIcon = L.divIcon({ className: 'custom-icon', html: '🔴', iconSize: [24, 24] });
    const bridgeClosedIcon = L.divIcon({ className: 'custom-icon', html: '🔵', iconSize: [24, 24] }); // Changed to Blue to distinguish from "Yellow/Green"

    return (
        <MapContainer
            center={initialCenter}
            zoom={14} // Zoomed out slightly to see both
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
            attributionControl={false}
        >
            {/* Standard OpenStreetMap (High Fidelity for Land/Water distinction) */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* BRIDGE MARKERS (Show All) */}
            {bridges.map((b) => (
                <div key={b.node_id}>
                    {/* Main Bridge Marker */}
                    <Marker position={[b.lat, b.lng]} icon={bridgeStatus === 'bridge_open' ? bridgeOpenIcon : bridgeClosedIcon}>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg">{b.node_id.toUpperCase()} BRIDGE</h3>
                                <div className={`badge ${bridgeStatus === 'bridge_open' ? 'badge-error' : 'badge-success'} mt-1`}>
                                    {bridgeStatus === 'bridge_open' ? 'OPEN (TRAFFIC STOPPED)' : 'CLOSED (TRAFFIC FLOWING)'}
                                </div>
                                <p className="text-xs mt-2 text-gray-400">Status inferred from Live AIS Proximity</p>
                            </div>
                        </Popup>
                    </Marker>
                </div>
            ))}

            {/* TRAFFIC FLOW LINE (Hohe Schaar Straße - High Precision) */}
            {/* Must strictly follow the road curve to avoid "Driving on Water" */}
            <Polyline
                positions={[
                    [53.4900, 9.9450], // Kattwyk South Start
                    [53.4920, 9.9480], // Approach Junction
                    [53.4938, 9.9530], // Kattwyk Bridge Node
                    [53.4945, 9.9560], // Curve East
                    [53.4955, 9.9600], // Hohe Schaar Straight
                    [53.4970, 9.9640], // Gentle bend
                    [53.4990, 9.9680], // Approaching Rethe
                    [53.5008, 9.9710], // Rethe Bridge Center (Traffic crosses HERE)
                    [53.5020, 9.9720], // North Exit
                    [53.5030, 9.9730]  // Final Termination
                ]}
                pathOptions={{
                    color: bridgeStatus === 'bridge_open' ? 'red' : 'lime',
                    weight: 6,
                    opacity: 0.6,
                    dashArray: bridgeStatus === 'bridge_open' ? '5, 10' : undefined
                }}
            >
                <Popup>
                    <div className="text-black font-bold">
                        BRIDGE ROAD STATUS: {bridgeStatus === 'bridge_open' ? 'CONGESTED (STOPPED)' : 'FREE FLOW'}
                    </div>
                </Popup>
            </Polyline>

            {/* Dynamic Realtime Trucks */}
            {trucks.map((t) => (
                <Marker key={t.id} position={[t.lat, t.lng]} icon={truckIcon}>
                    <Popup><div className="text-black text-xs">{t.id} (HGV)</div></Popup>
                </Marker>
            ))}

            {/* Dynamic Realtime Ships */}
            {ships.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={shipIcon}>
                    <Popup><div className="text-black text-xs">{s.id}</div></Popup>
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
