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

    const [path, setPath] = useState([firingPosition, targetPosition]);

    // Custom icons
    const mortarIcon = new L.Icon({
        iconUrl: "/mortar.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

    const shellIcon = new L.Icon({
        iconUrl: "/shell.webp",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });

    // Calculate elevation whenever positions change
    useEffect(() => {
        const calculateElevation = () => {
            const distance = Math.sqrt(
                Math.pow(targetPosition[0] - firingPosition[0], 2) +
                Math.pow(targetPosition[1] - firingPosition[1], 2)
            );
            setElevation(Math.floor(distance * 0.1)); // Dummy elevation formula
        };

        setPath([firingPosition, targetPosition]); // Update line path
        calculateElevation();
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
                    icon={mortarIcon}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => setFiringPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]),
                    }}
                >
                    <Popup>Firing Position</Popup>
                </Marker>

                {/* Draggable Target Position Marker */}
                <Marker
                    position={targetPosition}
                    icon={shellIcon}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => setTargetPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]),
                    }}
                >
                    <Popup>Target Position</Popup>
                </Marker>

                {/* Red transparent circle around Firing Position */}
                <Circle center={firingPosition} radius={50} color="red" fillOpacity={0.2} />

                {/* Red transparent circle around Target Position */}
                <Circle center={targetPosition} radius={50} color="red" fillOpacity={0.2} />

                {/* Path between Firing Position and Target (updates in real-time) */}
                <Polyline positions={path} color="blue" />
            </MapContainer>

            {elevation !== null && (
                <div className="text-center mt-4">
                    <p className="text-xl">Elevation: {elevation}°</p>
                </div>
            )}
        </div>
    );
};

export default Page;