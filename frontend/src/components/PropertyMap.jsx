import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

function FitBounds({ properties, center }) {
  const map = useMap();
  useEffect(() => {
    const points = properties.map((item) => [Number(item.latitude), Number(item.longitude)]).filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
    if (points.length) map.fitBounds(points, { padding: [35, 35], maxZoom: 13 });
    else map.setView(center, 11);
  }, [map, properties, center]);
  return null;
}

export default function PropertyMap({ properties = [], center = [17.385, 78.4867], selected }) {
  const points = properties.filter((p) => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)));
  const start = selected && Number.isFinite(Number(selected.latitude)) ? [Number(selected.latitude), Number(selected.longitude)] : center;
  return <MapContainer center={start} zoom={11} scrollWheelZoom className="h-[420px]">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <FitBounds properties={points} center={center} />
    {points.map((property) => <Marker key={property._id} position={[Number(property.latitude), Number(property.longitude)]}><Popup><strong>{property.title}</strong><br />₹{Number(property.rent).toLocaleString('en-IN')} / month<br /><Link to={`/properties/${property._id}`}>View details</Link></Popup></Marker>)}
    {selected && !points.some((property) => property._id === selected._id) && Number.isFinite(Number(selected.latitude)) && <Marker position={[Number(selected.latitude), Number(selected.longitude)]}><Popup>{selected.title}</Popup></Marker>}
  </MapContainer>;
}
