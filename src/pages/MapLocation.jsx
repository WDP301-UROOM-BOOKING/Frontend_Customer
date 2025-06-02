import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapComponent = ({ addressMap }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const geocodeAddress = async () => {
      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: addressMap,
              format: "json",
              addressdetails: 1,
            },
          }
        );

        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setCoordinates({ lat, lon });
          setAddress(response.data[0].display_name);
        } else {
          setCoordinates("ABC");
        }
      } catch (err) {}
    };

    geocodeAddress();
  }, []);

  if (!coordinates || coordinates === "ABC") {
    return (
      <div>
        {coordinates === "ABC" ? "I am sorry, I cannot find address of hotels." : "Loading map..."}
      </div>
    );
  }
  return (
    <div style={{ height: "700px" }}>
      <MapContainer
        center={[coordinates.lat, coordinates.lon]}
        zoom={20}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[coordinates.lat, coordinates.lon]}>
          <Popup>
            Địa chỉ: {address}
            <br />
            <a
              href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lon}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              👉 Xem trên Google Maps
            </a>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
