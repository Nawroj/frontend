import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import L from "leaflet";

const countryCoords = {
  US: [37.0902, -95.7129],
  CA: [56.1304, -106.3468],
  GB: [55.3781, -3.4360],
  DE: [51.1657, 10.4515],
  FR: [46.6034, 1.8883],
  AU: [-25.2744, 133.7751],
  CN: [35.8617, 104.1954],
  RU: [61.5240, 105.3188],
  IN: [20.5937, 78.9629],
  BR: [-14.2350, -51.9253],
  JP: [36.2048, 138.2529],
  KR: [35.9078, 127.7669],
  ZA: [-30.5595, 22.9375],
  NG: [9.0820, 8.6753],
  AR: [-38.4161, -63.6167],
  CL: [-35.6751, -71.5430],
  MX: [23.6345, -102.5528],
  IT: [41.8719, 12.5674],
  ES: [40.4637, -3.7492],
  SE: [60.1282, 18.6435],
  NO: [60.4720, 8.4689],
  FI: [61.9241, 25.7482],
  PL: [51.9194, 19.1451],
  NL: [52.1326, 5.2913],
  BE: [50.5039, 4.4699],
  CH: [46.8182, 8.2275],
  TR: [38.9637, 35.2433],
  IR: [32.4279, 53.6880],
  SA: [23.8859, 45.0792],
  EG: [26.8206, 30.8025],
  PK: [30.3753, 69.3451],
  ID: [-0.7893, 113.9213],
  TH: [15.8700, 100.9925],
  MY: [4.2105, 101.9758],
  VN: [14.0583, 108.2772],
  PH: [13.41, 122.56],
  NZ: [-40.9006, 174.8860],
  SG: [1.3521, 103.8198],
  HK: [22.3193, 114.1694],
  UA: [48.3794, 31.1656],
  RO: [45.9432, 24.9668],
  BG: [42.7339, 25.4858],
  GR: [39.0742, 21.8243],
  PT: [39.3999, -8.2245],
  IL: [31.0461, 34.8516],
  AE: [23.4241, 53.8478],
  QA: [25.3548, 51.1839],
  KW: [29.3117, 47.4818],
  KZ: [48.0196, 66.9237],
  CZ: [49.8175, 15.4730],
  SK: [48.6690, 19.6990],
  HU: [47.1625, 19.5033],
  AT: [47.5162, 14.5501]
};

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatLayer = L.heatLayer(points, { radius: 25, blur: 15 }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

function IPHeatmap({ token }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/threats/ips-with-country", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Raw response data:", data);
        console.log("Using token:", token);


        const countryCounter = {};
        data.forEach(({ country_code }) => {
          if (country_code && countryCoords[country_code]) {
            countryCounter[country_code] = (countryCounter[country_code] || 0) + 1;
          }
        });

        const generatedPoints = [];
        for (const [country, count] of Object.entries(countryCounter)) {
          const coords = countryCoords[country];
          for (let i = 0; i < count; i++) {
            generatedPoints.push(coords);
          }
        }

        setLocations(generatedPoints);
      } catch (err) {
        console.error("Error fetching heatmap data:", err);
        setError("Failed to load heatmap data.");
      } finally {
        setLoading(false);
      }
    };


    fetchLocations();
  }, [token]);


  return (
    <div className="bg-white mt-8 p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">IP Geolocation Heatmap</h2>

      {loading ? (
        <div className="text-gray-500 text-center">Loading heatmap...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : locations.length === 0 ? (
        <div className="text-gray-500 text-center">
          No geolocation data available. Try again later or check if threat data exists.
        </div>
      ) : (
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={false}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <HeatmapLayer points={locations} />
        </MapContainer>
      )}
    </div>
  );


}

export default IPHeatmap;
