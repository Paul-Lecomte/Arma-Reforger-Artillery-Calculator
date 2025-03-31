"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

// Dynamically import react-leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

const Page = () => {
    const [firingPosition, setFiringPosition] = useState([51.505, -0.09]);
    const [targetPosition, setTargetPosition] = useState([51.51, -0.1]);
    const [elevation, setElevation] = useState(null);
    const [faction, setFaction] = useState("American");
    const [artilleryType, setArtilleryType] = useState("HE");
    const [charge, setCharge] = useState("0");

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

    // Calculate elevation when positions change
    useEffect(() => {
        const calculateElevation = () => {
            const distance = Math.sqrt(
                Math.pow(targetPosition[0] - firingPosition[0], 2) +
                Math.pow(targetPosition[1] - firingPosition[1], 2)
            );
            setElevation(Math.floor(distance * 0.1)); // Dummy elevation formula
        };

        calculateElevation();
    }, [firingPosition, targetPosition]);

    return (
        <div className="map-container">
            <h2 className="text-center text-2xl mb-6">Map Calculator</h2>
            <div className="mb-4 flex justify-center space-x-4">
                <div>
                    <label htmlFor="faction" className="block text-lg font-medium">Faction</label>
                    <select
                        id="faction"
                        value={faction}
                        onChange={(e) => setFaction(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="American">American</option>
                        <option value="Soviet">Soviet</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="artilleryType" className="block text-lg font-medium">Artillery Type</label>
                    <select
                        id="artilleryType"
                        value={artilleryType}
                        onChange={(e) => setArtilleryType(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="HE">HE</option>
                        <option value="Illumination">Illumination</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="charge" className="block text-lg font-medium">Charge</label>
                    <select
                        id="charge"
                        value={charge}
                        onChange={(e) => setCharge(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {[...Array(5).keys()].map((num) => (
                            <option key={num} value={num}>Charge {num}</option>
                        ))}
                    </select>
                </div>
            </div>

            <MapContainer center={firingPosition} zoom={13} style={{ height: "500px", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Draggable Marker for Firing Position */}
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

                {/* Draggable Marker for Target Position */}
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

                {/* Path between Firing Position and Target */}
                <Polyline positions={[firingPosition, targetPosition]} color="blue" />
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