'use client';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom Icons
const truckIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #fca5a5; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #fca5a5;"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5]
});

const shipIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #0ea5e9; width: 20px; height: 20px; border-radius: 2px; border: 2px solid white; box-shadow: 0 0 15px #0ea5e9;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

interface TwinMapProps {
    riskLevel: number;
    alert: string | null;
    trucks?: { id: string, lat: number, lng: number }[];
    ships?: { id: string, lat: number, lng: number, type: string }[];
}

export default function TwinMap({ riskLevel, alert, trucks = [], ships = [] }: TwinMapProps) {
    // Rethe Bridge Coordinates
    const center: [number, number] = [53.5005, 9.9705];

    return (
        <MapContainer
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
            attributionControl={false}
        >
            {/* Dark "Holographic" Map Tile */}
            <TileLayer
                attribution='&copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Rethe Bridge Marker */}
            <Circle
                center={center}
                radius={alert ? 150 : 30}
                pathOptions={{
                    color: alert ? '#ff0000' : '#00ff00',
                    fillColor: alert ? '#ff0000' : '#00ff00',
                    fillOpacity: alert ? 0.6 : 0.4
                }}
            >
                <Popup>
                    <div className="text-black text-xs font-mono">
                        <h3 className="font-bold">RETHE BRIDGE (HUB)</h3>
                        <p>STATUS: {alert ? "CRITICAL FAILURE" : "OPTIMAL"}</p>
                    </div>
                </Popup>
            </Circle>

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
                    center={center}
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
