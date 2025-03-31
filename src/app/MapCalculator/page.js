"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

// Dynamically import react-leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

const Page = () => {
    const [firingPosition, setFiringPosition] = useState([51.505, -0.09]);
    const [targetPosition, setTargetPosition] = useState([51.51, -0.1]);
    const [elevation, setElevation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [azimuth, setAzimuth] = useState(null);

    // Custom icons
    const mortarIcon = new L.Icon({
        iconUrl: "/mortar.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

    const shellIcon = new L.Icon({
        iconUrl: "/shell.png",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });

    // Prevent dragging the image instead of the marker
    useEffect(() => {
        const images = document.querySelectorAll(".leaflet-marker-icon, .leaflet-marker-shadow");
        images.forEach((img) => img.setAttribute("draggable", "false"));

        document.addEventListener("dragstart", (e) => {
            if (e.target.tagName === "IMG") {
                e.preventDefault();
            }
        });

        return () => {
            document.removeEventListener("dragstart", (e) => {
                if (e.target.tagName === "IMG") {
                    e.preventDefault();
                }
            });
        };
    }, []);

    // Function to calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Radius of the Earth in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    // Function to calculate azimuth (bearing)
    const calculateAzimuth = (lat1, lon1, lat2, lon2) => {
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const λ1 = (lon1 * Math.PI) / 180;
        const λ2 = (lon2 * Math.PI) / 180;

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x =
            Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const θ = Math.atan2(y, x);

        let bearing = (θ * 180) / Math.PI; // Convert radians to degrees
        return (bearing + 360) % 360; // Normalize to 0-360 degrees
    };

    // Calculate elevation, distance, and azimuth whenever positions change
    useEffect(() => {
        const lat1 = firingPosition[0];
        const lon1 = firingPosition[1];
        const lat2 = targetPosition[0];
        const lon2 = targetPosition[1];

        setDistance(calculateDistance(lat1, lon1, lat2, lon2).toFixed(2)); // Distance in meters
        setAzimuth(calculateAzimuth(lat1, lon1, lat2, lon2).toFixed(2)); // Azimuth in degrees
        setElevation(Math.floor(distance * 0.1)); // Dummy elevation formula
    }, [firingPosition, targetPosition]);

    return (
        <div className="map-container">
            <h2 className="text-center text-2xl mb-6">Map Calculator</h2>

            <MapContainer center={firingPosition} zoom={13} style={{ height: "500px", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

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
                <Circle center={firingPosition} radius={50} color="red" fillOpacity={0.2} />

                {/* Red transparent circle around Target Position */}
                <Circle center={targetPosition} radius={50} color="red" fillOpacity={0.2} />

                {/* Path between Firing Position and Target (updates in real-time) */}
                <Polyline positions={[firingPosition, targetPosition]} color="blue" />
            </MapContainer>

            {/* Display Calculated Values */}
            <div className="text-center mt-4">
                {distance !== null && <p className="text-xl">Distance: {distance} meters</p>}
                {azimuth !== null && <p className="text-xl">Azimuth: {azimuth}°</p>}
                {elevation !== null && <p className="text-xl">Elevation: {elevation}°</p>}
            </div>
        </div>
    );
};

export default Page;