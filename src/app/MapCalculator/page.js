"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

// Dynamically import react-leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const ImageOverlay = dynamic(() => import("react-leaflet").then((mod) => mod.ImageOverlay), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

// Scale factor: Each square represents 100 meters.
const SCALE_FACTOR = 100; // 1 square = 100 meters

const Page = () => {
    const [firingPosition, setFiringPosition] = useState([500, 500]);
    const [targetPosition, setTargetPosition] = useState([600, 600]);
    const [distance, setDistance] = useState(null);
    const [azimuth, setAzimuth] = useState(null);
    const [elevation, setElevation] = useState(null);
    const [mapType, setMapType] = useState("map1");

    // Map images and bounds
    const maps = {
        map1: {
            imageUrl: "/maps/map1/arland.png",
            bounds: [[0, 0], [1000, 1000]], // Adjust these bounds to match your image scale
        },
        map2: {
            imageUrl: "/maps/map2/everon.png",
            bounds: [[0, 0], [1000, 1000]], // Adjust these bounds as needed
        },
    };

    // Calculate Distance in meters using Euclidean formula
    const calculateDistance = (x1, y1, x2, y2) => {
        const pixelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return (pixelDistance / 18) * SCALE_FACTOR; // Convert pixels to meters
    };

    // Calculate Azimuth (angle in a 2D plane)
    const calculateAzimuth = (x1, y1, x2, y2) => {
        let angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        return (angle + 360) % 360;
    };

    useEffect(() => {
        const dist = calculateDistance(firingPosition[0], firingPosition[1], targetPosition[0], targetPosition[1]).toFixed(2);
        const azi = calculateAzimuth(firingPosition[0], firingPosition[1], targetPosition[0], targetPosition[1]).toFixed(2);

        setDistance(dist);
        setAzimuth(azi);
        setElevation(Math.floor(dist * 0.1)); // Example elevation calculation
    }, [firingPosition, targetPosition]);

    return (
        <div className="map-container">
            <h2 className="text-center text-2xl mb-4">Map Calculator</h2>

            {/* Map Switch Dropdown */}
            <div className="text-center mb-4 bg-black">
                <label className="mr-2 text-lg">Select Map:</label>
                <select
                    value={mapType}
                    onChange={(e) => setMapType(e.target.value)}
                    className="p-2 border rounded bg-black"
                >
                    <option value="map1">Arland</option>
                    <option value="map2">Everon</option>
                </select>
            </div>

            {/* Map Component */}
            <MapContainer center={[600, 500]} zoom={2} style={{ height: "600px", width: "100%" }} crs={L.CRS.Simple}>
                <ImageOverlay url={maps[mapType].imageUrl} bounds={maps[mapType].bounds} />

                {/* Draggable Firing Position Marker */}
                <Marker
                    position={firingPosition}
                    draggable={true}
                    eventHandlers={{
                        drag: (e) => setFiringPosition([e.latlng.lat, e.latlng.lng]),
                    }}
                >
                    <Popup>Firing Position</Popup>
                </Marker>

                {/* Draggable Target Position Marker */}
                <Marker
                    position={targetPosition}
                    draggable={true}
                    eventHandlers={{
                        drag: (e) => setTargetPosition([e.latlng.lat, e.latlng.lng]),
                    }}
                >
                    <Popup>Target Position</Popup>
                </Marker>

                {/* Red transparent circle around Firing Position */}
                <Circle center={firingPosition} radius={10} color="red" fillOpacity={0.2} />

                {/* Red transparent circle around Target Position */}
                <Circle center={targetPosition} radius={10} color="green" fillOpacity={0.2} />

                {/* Path between Firing Position and Target */}
                <Polyline positions={[firingPosition, targetPosition]} color="blue" />
            </MapContainer>

            {/* Display Calculations */}
            <div className="text-center mt-4">
                {distance !== null && <p className="text-xl">Distance: {distance} meters</p>}
                {azimuth !== null && <p className="text-xl">Azimuth: {azimuth}°</p>}
                {elevation !== null && <p className="text-xl">Elevation: {elevation}°</p>}
            </div>
        </div>
    );
};

export default Page;