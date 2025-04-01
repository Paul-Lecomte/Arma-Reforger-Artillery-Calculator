"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { artilleryData } from '../components/Data';

// Dynamically import react-leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const ImageOverlay = dynamic(() => import("react-leaflet").then((mod) => mod.ImageOverlay), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

// Function to interpolate MIL and dispersion based on range
const interpolateMil = (roundData, distance) => {
    let lastMaxRange = 0; // Variable to track the last max range that was used
    for (let rings = 0; rings <= 4; rings++) {
        const rangeTable = roundData[rings];
        if (!rangeTable) continue;

        const dispersion = rangeTable[0].dispersion; // Extract dispersion from first entry

        // Get the max range for this ring
        const maxRange = rangeTable[rangeTable.length - 1].range;

        // If the current distance has not maxed out the previous ring, skip this ring
        if (distance < lastMaxRange) continue;

        // If the distance is within the range for this ring
        if (distance >= lastMaxRange && distance <= maxRange) {
            for (let i = 1; i < rangeTable.length - 1; i++) { // Start at 1 to skip dispersion object
                if (distance >= rangeTable[i].range && distance <= rangeTable[i + 1].range) {
                    const x1 = rangeTable[i].range;
                    const y1 = rangeTable[i].mil;
                    const x2 = rangeTable[i + 1].range;
                    const y2 = rangeTable[i + 1].mil;
                    return {
                        mil: y1 + ((y2 - y1) / (x2 - x1)) * (distance - x1),
                        rings, // Return the current ring level
                        dispersion
                    };
                }
            }
        }

        // Update the lastMaxRange to the current ring's max range
        lastMaxRange = maxRange;
    }
    return null;
};

// Scale factor: Each square represents 100 meters.
const SCALE_FACTOR = 100; // 1 square = 100 meters

const Page = () => {
    const [firingPosition, setFiringPosition] = useState([500, 500]);
    const [targetPosition, setTargetPosition] = useState([600, 600]);
    const [distance, setDistance] = useState(null);
    const [azimuth, setAzimuth] = useState(null);
    const [elevation, setElevation] = useState(null);
    const [mapType, setMapType] = useState("map1");

    // Additional state variables for artillery calculations
    const [faction, setFaction] = useState("American");
    const [round, setRound] = useState("HE");
    const [charge, setCharge] = useState("0");
    const [calculatedMil, setCalculatedMil] = useState(null);
    const [calculatedRings, setCalculatedRings] = useState(null);
    const [calculatedDispersion, setCalculatedDispersion] = useState(null);
    const [error, setError] = useState("");
    const [ringRanges, setRingRanges] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Map images and bounds
    const maps = {
        map1: {
            imageUrl: "/maps/map1/arland.png",
            bounds: [[0, 0], [1000, 1000]],
            scaleFactor: 18 // Arland scale 100m
        },
        map2: {
            imageUrl: "/maps/map2/everon.png",
            bounds: [[0, 0], [1000, 1000]],
            scaleFactor: 8.58164, // Everon scale for 100m
        },
    };

    // Calculate Distance in meters using Euclidean formula
    const calculateDistance = (x1, y1, x2, y2, scaleFactor) => {
        const pixelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return (pixelDistance / scaleFactor) * 100; // Convert pixels to meters
    };

    // Calculate Azimuth (angle in a 2D plane)
    const calculateAzimuth = (x1, y1, x2, y2) => {
        let angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        return (angle + 360) % 360;
    };

    // Recalculate the MIL, rings, and dispersion when the distance or other params change
    useEffect(() => {
        const scaleFactor = maps[mapType].scaleFactor;

        const dist = calculateDistance(
            firingPosition[0],
            firingPosition[1],
            targetPosition[0],
            targetPosition[1],
            scaleFactor
        ).toFixed(2);

        setDistance(dist);

        const azi = calculateAzimuth(
            firingPosition[0],
            firingPosition[1],
            targetPosition[0],
            targetPosition[1]
        ).toFixed(2);

        setAzimuth(azi);
        setElevation(Math.floor(dist * 0.1)); // Example elevation calculation

        if (faction && round && !isNaN(dist) && dist) {
            const artillery = artilleryData[faction];
            if (!artillery) {
                setError('Artillery data for the selected faction is missing.');
                return;
            }

            const roundData = artillery.rounds[round];
            if (!roundData) {
                setError(`No data available for the selected round type: ${round}`);
                return;
            }

            // Get max ranges for each ring and convert them to pixels
            const maxRanges = [];
            for (let rings = 0; rings <= 4; rings++) {
                if (roundData[rings]) {
                    const maxRange = roundData[rings][roundData[rings].length - 1].range;
                    maxRanges.push((maxRange * scaleFactor) / 100); // Convert meters to pixels
                } else {
                    maxRanges.push(null);
                }
            }

            setRingRanges(maxRanges);
            setError("");

            const result = interpolateMil(roundData, parseFloat(dist));

            if (result) {
                setCalculatedMil(result.mil);
                setCalculatedRings(result.rings);
                setCalculatedDispersion(result.dispersion);
            } else {
                setCalculatedMil(null);
                setCalculatedRings(null);
                setCalculatedDispersion(null);
                setError(`Distance must be within the available range.`);
            }
        }
    }, [firingPosition, targetPosition, mapType, faction, round, charge]);

    return (
        <div className="map-container relative">
            {/* options chooser container */}
            <div className="fixed z-40 w-full bg-black">
                {/* Map Switch Dropdown */}
                <div className="text-center mb-4 ">
                    <label className="mr-2 text-lg">Select Map:</label>
                    <select
                        value={mapType}
                        onChange={(e) => setMapType(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="map1">Arland</option>
                        <option value="map2">Everon</option>
                    </select>
                </div>

                {/* Faction & Round Selection */}
                <div className="text-center mb-4">
                    <label className="mr-2 text-lg">Faction:</label>
                    <select
                        value={faction}
                        onChange={(e) => setFaction(e.target.value)}
                        className="p-2 border rounded bg-black"
                    >
                        <option value="American">American</option>
                        <option value="Soviet">Soviet</option>
                    </select>

                    <label className="mr-2 text-lg ml-4">Round Type:</label>
                    <select
                        value={round}
                        onChange={(e) => setRound(e.target.value)}
                        className="p-2 border rounded bg-black"
                    >
                        <option value="HE">HE</option>
                        <option value="Smoke">Smoke</option>
                        <option value="Illumination">Illumination</option>
                    </select>
                </div>
            </div>

            {/* Sidebar & map container */}
            <div className="relative h-screen">
                {/* Sidebar */}
                <button
                    onClick={toggleSidebar}
                    className="bg-black p-2 rounded mb-4 absolute left-[5px] top-1/4 transform -translate-y-1/2 z-40"
                >
                    {sidebarOpen ? "Close" : "Open"} Menu
                </button>
                <div className={`fixed z-30 w-64 bg-black rounded-2xl text-white p-4 transition-transform duration-300 ${sidebarOpen ? "translate-x-1" : "-translate-x-64"} top-1/2 transform -translate-y-1/2`}>
                    <h3 className="text-xl">Artillery Calculation</h3>
                    {error && <p className="text-red-500">{error}</p>}

                    <p><strong>Distance:</strong> {distance} meters</p>
                    <p><strong>Azimuth:</strong> {azimuth}°</p>
                    {calculatedMil !== null && (
                        <div>
                            <p><strong>MIL:</strong> {calculatedMil.toFixed(2)}</p>
                            <p><strong>Rings:</strong> {calculatedRings}</p>
                            <p><strong>Dispersion:</strong> {calculatedDispersion}</p>
                        </div>
                    )}
                    <span>----------------------------</span>
                    <p><strong>Elevation:</strong> {elevation} meters</p>
                </div>

                {/* Map Component */}
                <div className={`relative transition-all duration-300 z-10 h-full`}>
                    <MapContainer center={[600, 500]} zoom={2} style={{ height: "100%", width: "100%", backgroundColor: "#8DB3BD" }} crs={L.CRS.Simple}>
                        <ImageOverlay url={maps[mapType].imageUrl} bounds={maps[mapType].bounds} />
                        {ringRanges.map((range, index) =>
                            range ? (
                                <Circle
                                    key={index}
                                    center={firingPosition}
                                    radius={range}
                                    pathOptions={{
                                        color: ["purple", "blue", "green", "yellow", "orange"][index],
                                        fillOpacity: 0, // Adjust fill transparency
                                        weight: 2, // Thinner lines
                                        dashArray: "5, 5", // Dashed effect (5px on, 5px off)
                                    }}
                                />
                            ) : null
                        )}

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
                        <Circle center={firingPosition} radius={8} color="red" fillOpacity={0.2} />

                        {/* Red transparent circle around Target Position */}
                        <Circle
                            center={targetPosition}
                            radius={calculatedDispersion ? (calculatedDispersion * maps[mapType].scaleFactor) / 100 : 10}
                            color="green"
                            fillOpacity={0.2}
                        />

                        {/* Path between Firing Position and Target */}
                        <Polyline positions={[firingPosition, targetPosition]} color="blue" />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default Page;