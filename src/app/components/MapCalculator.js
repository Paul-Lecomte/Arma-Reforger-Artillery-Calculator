"use client";
import React, {useState, useEffect} from "react";
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
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

import "leaflet/dist/leaflet.css";
import {debounce} from "lodash";

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
    const [isMenuOpen, setIsMenuOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const polylinePositions = [firingPosition, targetPosition];

    // Map images and bounds
    const maps = {
        map1: {
            imageUrl: "/maps/map1/arland.png",
            bounds: [[0, 0], [1000, 1000]],
            scaleFactor: 17.875 // Arland scale 100m
        },
        map2: {
            imageUrl: "/maps/map2/everon.png",
            bounds: [[0, 0], [1000, 1000]],
            scaleFactor: 8.58164, // Everon scale for 100m 8.58164
        },
    };

    // Function to interpolate MIL and dispersion based on range
    const interpolateMil = (roundData, distance) => {
        let lastMaxRange = 0;

        for (let rings = 0; rings <= 4; rings++) {
            const rangeTable = roundData[rings];
            if (!rangeTable) continue;

            const dispersion = rangeTable[0].dispersion;
            const maxRange = rangeTable[rangeTable.length - 1].range;


            if (distance < lastMaxRange) continue;

            if (distance >= lastMaxRange && distance <= maxRange) {
                // Iterate through the data to find the closest range
                for (let i = 1; i < rangeTable.length; i++) {
                    const current = rangeTable[i];
                    const previous = rangeTable[i - 1];

                    // If exact match, return the MIL value
                    if (distance === current.range) {
                        return {
                            mil: current.mil,
                            rings,
                            dispersion
                        };
                    }

                    // If the distance is between two ranges, interpolate
                    if (distance > previous.range && distance < current.range) {
                        const rangeDiff = current.range - previous.range;
                        const milDiff = current.mil - previous.mil;
                        const dMilPer100m = current.dMilPer100m;

                        // Interpolate MIL based on distance
                        const distanceDiff = distance - previous.range;
                        const milAdjustment = Math.round(distanceDiff / 100) * dMilPer100m;

                        const newMil = previous.mil + milAdjustment + milDiff * (distanceDiff / rangeDiff);


                        return {
                            mil: newMil,
                            rings,
                            dispersion
                        };
                    }
                }
            }

            lastMaxRange = maxRange;
        }

        return null;
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
    const debouncedCalculate = debounce(() => {
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
    }, 50); // 500 ms debounce time (adjust as necessary)

    // Trigger recalculation when any of these values change
    useEffect(() => {
        debouncedCalculate(); // Call the debounced function
    }, [firingPosition, targetPosition, mapType, faction, round, charge]);

    useEffect(() => {
        const updateMarkers = () => {
            setTimeout(() => { // Delay ensures markers are fully rendered
                const markers = document.querySelectorAll('.leaflet-marker-icon');

                if (markers.length >= 2) {
                    markers[0].src = '/marker/mortar.png';  // Firing position
                    markers[1].src = '/marker/shell.png';   // Target position
                }
            }, 100);
        };

        // Update markers when page loads with a 2-second delay
        const handlePageLoad = () => {
            setTimeout(() => {
                updateMarkers();
            }, 2000); // Delay of 2 seconds
        };

        // Run on component mount, and trigger on page load
        window.addEventListener('load', updateMarkers);

        // Trigger marker update whenever positions change
        updateMarkers();

        // Cleanup
        return () => {
            window.removeEventListener('load', handlePageLoad);
        };
    }, [firingPosition, targetPosition]);

    return (
        <div className="map-container relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="fixed top-3 left-16 z-50 bg-gray-800 text-white p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-110"
            >
                {isMenuOpen ? "▲" : "▼"}
            </button>

            {/* Options Chooser Container */}
            <div
                className={`fixed z-40 w-full bg-black p-2 md:p-4 flex flex-col md:flex-row md:justify-center items-center space-y-2 md:space-y-0 md:space-x-4 
                transition-all duration-300 ease-in-out 
                ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
            >
                {/* Map Switch Dropdown */}
                <div className="flex flex-col md:flex-row items-center">
                    <div className="flex flex-col items-center">
                        <label className="text-lg text-white">Map</label>
                        <select
                            value={mapType}
                            onChange={(e) => setMapType(e.target.value)}
                            className="p-2 border rounded bg-black text-white w-full md:w-auto"
                        >
                            <option value="map1">Arland</option>
                            <option value="map2">Everon</option>
                        </select>
                    </div>
                </div>

                {/* Faction & Round Selection */}
                <div className="flex flex-col items-center">
                    <label className="text-lg text-white">Faction</label>
                    <select
                        value={faction}
                        onChange={(e) => setFaction(e.target.value)}
                        className="p-2 border rounded bg-black text-white w-full md:w-auto"
                    >
                        <option value="American">American</option>
                        <option value="Soviet">Soviet</option>
                    </select>
                </div>
                <div className="flex flex-col items-center">
                    <label className="text-lg text-white">Shell</label>
                    <select
                        value={round}
                        onChange={(e) => setRound(e.target.value)}
                        className="p-2 border rounded bg-black text-white w-full md:w-auto"
                    >
                        <option value="HE">HE</option>
                        <option value="Smoke">Smoke</option>
                        <option value="Illumination">Illumination</option>
                    </select>
                </div>
            </div>

            {/* bottom menu*/}
            {calculatedMil !== null && (
            <div className="fixed bottom-4 z-50 bg-black flex flex-col w-full items-center">
                <div className="text-center flex flex-row">
                    <p className="mr-2">
                        <strong>Azimuth:</strong> {azimuth}° |
                    </p>
                    <p className="mr-2">
                        <strong>Elev mils:</strong> {calculatedMil.toFixed(1)} |
                    </p>
                    <p>
                        <strong>Rings:</strong> {calculatedRings}
                    </p>
                </div>
            </div>
            )}

            {/* Sidebar & map container */}
            <div className="relative h-screen">
                {/* Sidebar */}
                <button
                    onClick={toggleSidebar}
                    className="fixed top-3 left-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-110"
                >
                    {sidebarOpen ? "✖" : "☰"}
                </button>
                <div
                    className={`fixed z-30 w-48 bg-black/70 rounded-2xl text-white p-2 transition-transform duration-300 ${
                        sidebarOpen ? "translate-x-1" : "-translate-x-64"
                    } top-4/5 transform -translate-y-1/2`}
                >
                    <h3 className="text-lg">Artillery Calculation</h3>
                    {error && <p className="text-red-500">{error}</p>}

                    <p>
                        <strong>Distance:</strong> {distance}m
                    </p>
                    <p>
                        <strong>Azimuth:</strong> {azimuth}°
                    </p>
                    {calculatedMil !== null && (
                        <div>
                            <p>
                                <strong>Elev mils:</strong> {calculatedMil.toFixed(2)}
                            </p>
                            <p>
                                <strong>Rings:</strong> {calculatedRings}
                            </p>
                            <p>
                                <strong>Dispersion:</strong> {calculatedDispersion}m
                            </p>
                        </div>
                    )}
                    <span>----------------------------</span>
                    <p>
                        <strong>Elevation:</strong> {elevation} meters
                    </p>
                </div>

                {/* Map Component */}
                <div className={`relative transition-all duration-300 z-10 h-full`}>
                    <MapContainer
                        center={[500, 500]}
                        zoom={1}
                        maxZoom={4}
                        style={{
                            height: "100vh",
                            width: "100vw",
                            backgroundColor: "#8DB3BD"
                        }}
                        crs={L.CRS.Simple}
                        zoomControl={false}
                    >
                        <ImageOverlay url={maps[mapType].imageUrl} bounds={maps[mapType].bounds}/>
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
                        <Circle center={firingPosition} radius={8} color="red" fillOpacity={0.2}/>

                        {/* Red transparent circle around Target Position */}
                        <Circle
                            center={targetPosition}
                            radius={calculatedDispersion ? (calculatedDispersion * maps[mapType].scaleFactor) / 100 : 10}
                            color="green"
                            fillOpacity={0.2}
                        />

                        {/* Path between Firing Position and Target */}
                        <Polyline
                            positions={polylinePositions}
                            color="black"
                        >
                            <Tooltip
                                position={[(firingPosition[0] + targetPosition[0]) / 2, (firingPosition[1] + targetPosition[1]) / 2]}
                                direction="center"
                                offset={[0, 0]}
                                opacity={1}
                                permanent
                                className="custom-tooltip"
                            >

                                {/*{distance}m {azimuth}°*/}

                            </Tooltip>
                        </Polyline>
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default Page;