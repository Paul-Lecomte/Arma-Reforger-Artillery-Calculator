"use client"
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet'; // Import Leaflet for custom icon

// Dynamically import MapContainer, TileLayer, Marker, Polyline, and Popup to ensure they are only rendered on the client side
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';

const page = () => {
    const [firingPosition, setFiringPosition] = useState([51.505, -0.09]); // Initial firing position
    const [targetPosition, setTargetPosition] = useState([51.51, -0.1]); // Initial target position
    const [path, setPath] = useState([firingPosition, targetPosition]); // Path between firing and target positions
    const [elevation, setElevation] = useState(null); // Placeholder for elevation calculation
    const [faction, setFaction] = useState('American'); // Default faction
    const [artilleryType, setArtilleryType] = useState('HE'); // Default artillery type
    const [charge, setCharge] = useState('0'); // Default charge

    // Custom icons for firing and target positions
    const mortarIcon = new L.Icon({
        iconUrl: '/mortar.png', // Path to mortar image
        iconSize: [40, 40], // Adjust size of icon
        iconAnchor: [20, 40], // Set the anchor point
    });

    const shellIcon = new L.Icon({
        iconUrl: '/shell.webp', // Path to shell image
        iconSize: [30, 30], // Adjust size of icon
        iconAnchor: [15, 30], // Set the anchor point
    });

    // Handle left-click to select firing position and target position
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        if (!firingPosition) {
            setFiringPosition([lat, lng]);
        } else if (!targetPosition) {
            setTargetPosition([lat, lng]);
            setPath([firingPosition, [lat, lng]]);
        }
    };

    // Dummy function to calculate elevation
    const calculateElevation = () => {
        if (firingPosition && targetPosition) {
            const distance = Math.sqrt(
                Math.pow(targetPosition[0] - firingPosition[0], 2) + Math.pow(targetPosition[1] - firingPosition[1], 2)
            );
            const elevationValue = Math.floor(distance * 0.1); // Dummy formula for elevation
            setElevation(elevationValue);
        }
    };

    // Update elevation whenever the target position is set
    useEffect(() => {
        if (targetPosition) {
            calculateElevation();
        }
    }, [targetPosition]);

    return (
        <div className="map-container">
            <h2 className="text-center text-2xl mb-6">Map Calculator</h2>
            <div className="mb-4 flex justify-center space-x-4">
                {/* Dropdown for faction selection */}
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

                {/* Dropdown for artillery type */}
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

                {/* Dropdown for charge */}
                <div>
                    <label htmlFor="charge" className="block text-lg font-medium">Charge</label>
                    <select
                        id="charge"
                        value={charge}
                        onChange={(e) => setCharge(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="0">Charge 0</option>
                        <option value="1">Charge 1</option>
                        <option value="2">Charge 2</option>
                        <option value="3">Charge 3</option>
                        <option value="4">Charge 4</option>
                    </select>
                </div>
            </div>

            <MapContainer
                center={firingPosition}
                zoom={13}
                style={{ height: '500px', width: '100%' }}
                whenCreated={(map) => map.on('click', handleMapClick)} // Left-click handler
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Marker for Firing Position */}
                {firingPosition && (
                    <Marker position={firingPosition} icon={mortarIcon}>
                        <Popup>Firing Position</Popup>
                    </Marker>
                )}
                {/* Marker for Target Position */}
                {targetPosition && (
                    <Marker position={targetPosition} icon={shellIcon}>
                        <Popup>Target Position</Popup>
                    </Marker>
                )}
                {/* Path Line between Firing Position and Target */}
                {firingPosition && targetPosition && (
                    <Polyline positions={path} color="blue" />
                )}
            </MapContainer>

            {/* Elevation and other information */}
            {elevation !== null && (
                <div className="text-center mt-4">
                    <p className="text-xl">Elevation: {elevation}°</p>
                </div>
            )}
        </div>
    );
};

export default page;