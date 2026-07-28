import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTripStore, type Stop } from "../store/useTripStore";

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: #2563eb; color: white; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 14px;">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const MapUpdater = ({ stops, center }: { stops: Stop[]; center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView(center, 12);
    }
  }, [stops, center, map]);
  return null;
};

export const MapView: React.FC = () => {
  const { session } = useTripStore();

  if (!session) return null;

  const allStops = session.itinerary.flatMap((day) => day.stops);
  const center: [number, number] = [
    session.destinationMeta.lat || 0,
    session.destinationMeta.lng || 0,
  ];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={center} zoom={12} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater stops={allStops} center={center} />
        {allStops.map((stop, index) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={createNumberedIcon(index + 1)}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-sm">{stop.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{stop.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
