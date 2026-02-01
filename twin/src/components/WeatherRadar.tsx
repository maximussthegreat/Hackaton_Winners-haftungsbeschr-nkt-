'use client';
import { TileLayer, WMSTileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface WeatherRadarProps {
    weather: string; // CLEAR, RAIN, SNOW, FOG
    isLive: boolean; // True = RainViewer, False = Sim
    show: boolean;
}

export default function WeatherRadar({ weather, isLive, show }: WeatherRadarProps) {
    const map = useMap();
    const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number>(0);

    // --- RAINVIEWER LIVE LAYER ---
    // API: https://tilecache.rainviewer.com/v2/radar/{ts}/{size}/{z}/{x}/{y}/{color}/{smooth}_{snow}.png
    // For simplicity, we grab the latest (or typical) timestamp if possible, or just use a generic recent source.
    // RainViewer requires a timestamp. A common hack is to fetch their JSON to get the latest TS, 
    // but for a React component we might need a fixed URL or a quick fetch.
    // We'll use a valid timestamp or a placeholder if complex.
    // Better yet: "OpenWeatherMap" precipitation layer might be easier? 
    // Let's stick to RainViewer but we need the Unix TS. We will assume 'now' for Live, but tiles might 404 if not exact.
    // Hack: Use 'now' from specialized "latest" endpoint if available, but standard is TS.
    // Alternative: DWD WMS?
    // Let's use OpenWeatherMap tile as fallback/primary if Free:
    // "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY" -> Need Key?
    // Let's use the DWD WMS SERVICE via Leaflet. WMS is reliable.
    // DWD RX-Produkt (Composite)

    const dwdWmsUrl = "https://maps.dwd.de/geoserver/dwd/wms";

    // --- SIMULATION RENDERER ---
    useEffect(() => {
        if (!show || isLive) {
            if (simCanvasRef.current) simCanvasRef.current.remove();
            cancelAnimationFrame(animationRef.current);
            return;
        }

        if (weather === 'CLEAR') return;

        // Create Canvas for Sim Rain/Snow
        const canvas = L.DomUtil.create('canvas', 'leaflet-zoom-animated') as HTMLHTMLCanvasElement;
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '30';
        map.getPanes().overlayPane.appendChild(canvas);
        simCanvasRef.current = canvas;

        const drops: any[] = [];
        const count = weather === 'RAIN' ? 500 : 800; // More for snow

        for (let i = 0; i < count; i++) {
            drops.push({
                x: Math.random() * map.getSize().x,
                y: Math.random() * map.getSize().y,
                speed: Math.random() * 5 + 5,
                length: Math.random() * 10 + 5
            });
        }

        const render = () => {
            if (!simCanvasRef.current) return;
            const ctx = simCanvasRef.current.getContext('2d');
            if (!ctx) return;
            const size = map.getSize();
            simCanvasRef.current.width = size.x;
            simCanvasRef.current.height = size.y;

            // Reset transform to match map panel (simplified, usually need DomUtil.setPosition logic)
            // With 'leaflet-zoom-animated', position is handled by Leaflet, we just draw relative?
            // Actually, simplest is to just make it screen-size overlay fixed?
            // No, map moves. 
            // Let's put it in a fixed div in page.tsx? 
            // No, let's try to stick to map specific.

            const topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);

            ctx.clearRect(0, 0, size.x, size.y);
            ctx.fillStyle = weather === 'SNOW' ? 'rgba(255,255,255,0.6)' : 'rgba(150,150,255,0.4)';
            ctx.strokeStyle = 'rgba(150,150,255,0.4)';
            ctx.lineWidth = 1;

            drops.forEach(d => {
                d.y += d.speed;
                if (d.y > size.y) d.y = 0;

                if (weather === 'SNOW') {
                    ctx.beginPath();
                    ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d.x, d.y + d.length);
                    ctx.stroke();
                }
            });
            animationRef.current = requestAnimationFrame(render);
        }
        render();

        return () => {
            cancelAnimationFrame(animationRef.current);
            if (simCanvasRef.current) simCanvasRef.current.remove();
        }

    }, [show, isLive, weather, map]);

    if (!show) return null;

    // LIVE MODE: Display DWD Radar (Precipitation)
    if (isLive) {
        return (
            <WMSTileLayer
                url={dwdWmsUrl}
                layers="dwd:RX-Produkt"
                format="image/png"
                transparent={true}
                version="1.1.1"
                opacity={0.6}
                zIndex={20}
            />
        );
    }

    return null; // Sim handled by Effect
}
