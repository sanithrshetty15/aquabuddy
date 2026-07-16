"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/api.service';
import { Loader2, MapPin, Droplets, Thermometer, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface RobotLocation {
  id: string;
  name: string;
  code: string;
  model: string;
  status: string;
  lat: number;
  lng: number;
  waterGenerated: number;
  lastUpdated: string;
  owner?: { firstName: string; lastName: string };
}

// AIET Moodbidri campus center
const AIET_CENTER: [number, number] = [13.0456, 74.9818];
const DEFAULT_ZOOM = 16;

export default function LiveMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [robots, setRobots] = useState<RobotLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      import('leaflet'),
      import('leaflet-defaulticon-compatibility'),
    ]).then(() => {
      if (isActive) setIsMounted(true);
    });
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axiosInstance.get('/map/robots');
        if (res.data.success) setRobots(res.data.data);
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    };
    void fetchLocations();
  }, []);

  const statusColors: Record<string, string> = {
    ACTIVE: 'text-emerald-400',
    INACTIVE: 'text-foreground/50',
    MAINTENANCE: 'text-amber-400',
    ERROR: 'text-red-400',
  };

  if (!isMounted) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Live Map Tracking</h2>
          <p className="text-foreground/60 font-light text-sm">Monitor fleet operations at Alva&apos;s Institute of Engineering and Technology.</p>
        </div>
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden flex-1 min-h-[600px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <span className="text-xs text-foreground/50">Initializing geospatial engine...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Live Map Tracking</h2>
          <p className="text-foreground/60 font-light text-sm">Monitor fleet operations at Alva&apos;s Institute of Engineering and Technology.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              {robots.filter(r => r.status === 'ACTIVE').length} Active
            </span>
          </div>
          <span className="text-xs text-foreground/50">{robots.length} total units</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Map */}
        <div className="lg:col-span-9 bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] relative">
          <MapContainer
            center={AIET_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />
            {robots.map((robot) => (
              <Marker key={robot.id} position={[robot.lat, robot.lng]}>
                <Popup>
                  <div className="p-1.5 min-w-[200px]">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">{robot.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mb-2">{robot.code} · {robot.model}</p>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3" />
                        <span><strong>Status:</strong> {robot.status}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3 h-3" />
                        <span><strong>Water Yield:</strong> {robot.waterGenerated.toFixed(1)}L</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3 h-3" />
                        <span><strong>Last Updated:</strong> {new Date(robot.lastUpdated).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Robot List Sidebar */}
        <div className="lg:col-span-3 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider px-1">Fleet Units</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
          ) : robots.length === 0 ? (
            <p className="text-xs text-foreground/40 text-center py-8">No robots linked yet</p>
          ) : (
            robots.map((robot) => (
              <div key={robot.id} className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-4 hover:border-accent/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">{robot.name}</h4>
                  <span className={`text-[10px] font-semibold ${statusColors[robot.status] || 'text-foreground/50'}`}>{robot.status}</span>
                </div>
                <p className="text-[10px] text-foreground/50 font-mono mb-1">{robot.code}</p>
                <p className="text-[10px] text-foreground/50">Water: {robot.waterGenerated.toFixed(1)}L</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
