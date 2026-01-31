'use client';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix native Leaflet marker icon issue in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function TwinMap({ riskLevel, alert }: { riskLevel: number, alert: string | null }) {
    // Rethe Bridge Coordinates
    const center: [number, number] = [53.5005, 9.9705];

    return (
        <MapContainer
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
        >
            {/* Dark "Holographic" Map Tile */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Rethe Bridge Marker */}
            <Circle
                center={center}
                radius={alert ? 300 : 50}
                pathOptions={{
                    color: alert ? '#ff0000' : '#00ff00',
                    fillColor: alert ? '#ff0000' : '#00ff00',
                    fillOpacity: alert ? 0.6 : 0.2
                }}
            >
                <Popup>
                    <div className="text-black">
                        <h3 className="font-bold">Rethe Bridge (Hub)</h3>
                        <p>Status: {alert ? "CRITICAL FAILURE" : "Nominal"}</p>
                    </div>
                </Popup>
            </Circle>

            {/* Mock Vessels */}
            <Marker position={[53.504, 9.960]} icon={icon}>
                <Popup><div className="text-black">Vessel: CMA CGM JACQUES SAADE</div></Popup>
            </Marker>
            <Marker position={[53.498, 9.980]} icon={icon}>
                <Popup><div className="text-black">Vessel: HMM ALGECIRAS</div></Popup>
            </Marker>

            {/* Bio-Risk Fog Visualization (as large circle overlay) */}
            {riskLevel > 0.5 && (
                <Circle
                    center={center}
                    radius={1200}
                    pathOptions={{
                        color: 'transparent',
                        fillColor: '#44ff00',
                        fillOpacity: 0.2
                    }}
                />
            )}
        </MapContainer>
    );
}
