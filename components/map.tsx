import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

export default function Map() {
  const position = [13.621775, 123.194824]; // Naga City coordinates
  return (
    <div className="rounded-lg shadow-black/20 shadow-lg p-2 h-[30rem]">
      <MapContainer center={[position[0], position[1]]} style={{height: "100%", width: "100%"}} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[position[0], position[1]]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
