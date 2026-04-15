"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

// Dynamically import Leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// We need to import Leaflet and the compatibility layer on the client side
let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet-defaulticon-compatibility');
}

export default function LiveMap() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Live Map Tracking</h2>
          <p className="text-gray-500 font-light text-sm">Monitor fleet operations and individual device geolocation.</p>
        </div>
        <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 overflow-hidden flex-1 min-h-[600px] relative flex items-center justify-center">
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Live Map Tracking</h2>
        <p className="text-gray-500 font-light text-sm">Monitor fleet operations and individual device geolocation.</p>
      </div>
      <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 overflow-hidden flex-1 min-h-[600px] relative">
        <MapContainer
          center={[12.9141, 74.8560]} // Mangaluru
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#0A0A0C' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[12.9141, 74.8560]}>
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-gray-900">AquaBuddy HQ</h3>
                <p className="text-sm text-gray-600">Mangaluru Operations Center</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
