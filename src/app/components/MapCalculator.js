"use client";
import React, {useState, useEffect} from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { artilleryData } from '../components/Data';
import { useMapEvent } from 'react-leaflet';
import { useMap } from 'react-leaflet';
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });


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

    //------------------------------------------------------------------------------------------------------------------
    // Maps tiles and images
    // Map images and bounds
    const maps = {
        map1: {
            imageUrl: "/maps/map1/arland.png",
            bounds: [[0, 0], [905, 1026]],
            scaleFactor: 18.4,
            type: "image",
            defaultFiring: [450, 450],
            defaultTarget: [600, 600]
        },
        map2: {
            imageUrl: "/maps/map2/everon.png",
            bounds: [[0, 0], [1084.3, 1011]],
            scaleFactor: 8.58164,
            type: "image",
            defaultFiring: [450, 450],
            defaultTarget: [600, 600]
        },
        map1_tiles: {
            tileUrl: "/maps/arland-map-tiles/{z}/{x}/{y}/tile.jpg",
            bounds: [[0, 0], [4000, 4000]],
            scaleFactor: 7.9,
            type: "tile",
            defaultFiring: [10, 50],
            defaultTarget: [10, 120]
        },
        map2_tiles: {
            tileUrl: "/maps/everon-map-tiles/{z}/{x}/{y}/tile.jpg",
            bounds: [[0, 0], [12800, 12800]],
            scaleFactor: 8,
            type: "tile",
            defaultFiring: [250, 450],
            defaultTarget: [250, 500]
        }
    };

    // Custom Leaflet TileLayer with flipped Y
    class FlippedYTileLayer extends L.TileLayer {
        constructor(tileUrl, options) {
            super(tileUrl, options); // Pass tileUrl and options to parent class
            this.tileUrl = tileUrl; // Store the tileUrl
        }

        getTileUrl(coords) {
            const z = this._getZoomForUrl();
            const x = coords.x;
            const y = Math.pow(2, z) - 1 - coords.y; // Flip the Y axis
            console.log(`Requesting tile at Z: ${z}, X: ${x}, Y: ${y}`); // 🪵 Log here

            // Dynamically set the tile URL based on the flipped coordinates
            return this.tileUrl.replace("{z}", z).replace("{x}", x).replace("{y}", y);
        }
    }

    // Updated FlippedTileLayer component
    const FlippedTileLayer = ({ mapType, minZoom = 0, maxZoom = 5 }) => {
        const map = useMap();

        useEffect(() => {
            const mapConfig = maps[mapType]; // Get map configuration based on mapType

            if (!mapConfig || mapConfig.type !== "tile") {
                console.error("Invalid map type or configuration");
                return;
            }

            const layer = new FlippedYTileLayer(mapConfig.tileUrl, {
                tileSize: 256,
                minZoom,
                maxZoom,
                noWrap: true,
                //bounds are currently bugged
                //bounds: mapConfig.bounds,
            });

            map.addLayer(layer);
            return () => {
                map.removeLayer(layer);
            };
        }, [map, mapType, minZoom, maxZoom]);

        return null;
    };

    // Updated getMapLayer function to handle both Arland and Everon tiles
    const getMapLayer = (mapType) => {
        const map = maps[mapType];
        if (!map) return null;

        if (map.type === "image") {
            return (
                <>
                    <ImageOverlay url={map.imageUrl} bounds={map.bounds} />
                </>
            );
        } else if (map.type === "tile") {
            console.log("Initializing FlippedTileLayer for", mapType);
            return (
                <>
                    <FlippedTileLayer mapType={mapType} />
                </>
            );
        }
        return null;
    };
    //------------------------------------------------------------------------------------------------------------------

    const MapClickHandler = () => {
        const map = useMapEvent({
            click(e) {
                const { lat, lng } = e.latlng;
                setTargetPosition([lat, lng]); // Left-click sets target
            },
            contextmenu(e) {
                const { lat, lng } = e.latlng;
                setFiringPosition([lat, lng]); // Right-click sets firing position
            }
        });

        return null;
    };


    useEffect(() => {
        setFiringPosition([centerY, centerX]);  // Set firing position to center of map
        setTargetPosition([centerY + 100, centerX + 100]);  // Set target position near the center
    }, [mapType]);  // Recalculate when mapType changes

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

    const { bounds } = maps[mapType];
    const centerY = (bounds[0][0] + bounds[1][0]) / 2;
    const centerX = (bounds[0][1] + bounds[1][1]) / 2;

    useEffect(() => {
        const config = maps[mapType];

        if (config?.defaultFiring && config?.defaultTarget) {
            setFiringPosition(config.defaultFiring);
            setTargetPosition(config.defaultTarget);
        }
    }, [mapType]);

    return (
        <div className="map-container relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="fixed top-2 left-4 z-50 bg-white/10 text-white p-3 rounded-full border border-white/30 shadow-md hover:bg-white/20 hover:shadow-lg transition-all duration-300"
                title="Toggle Sidebar"
            >
                {isMenuOpen ? "←" : "→"}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 z-40 bg-black/90 backdrop-blur-md w-72 h-full p-5 flex flex-col space-y-6 transform transition-transform duration-300 ease-in-out ${
                    isMenuOpen ? "translate-x-0" : "-translate-x-full"
                } shadow-xl`}
            >
                <h2 className="text-2xl font-semibold text-white mb-4">Artillery Tools</h2>

                {/* Map Selector */}
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Map</label>
                    <select
                        value={mapType}
                        onChange={(e) => setMapType(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="map1">Arland</option>
                        <option value="map1_tiles">Arland Sat</option>
                        <option value="map2">Everon</option>
                        <option value="map2_tiles">Everon Sat</option>
                    </select>
                </div>

                {/* Faction & Round */}
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Faction</label>
                    <select
                        value={faction}
                        onChange={(e) => setFaction(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                    >
                        <option value="American">American</option>
                        <option value="Soviet">Soviet</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-1">Shell</label>
                    <select
                        value={round}
                        onChange={(e) => setRound(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                    >
                        <option value="HE">HE</option>
                        <option value="Smoke">Smoke</option>
                        <option value="Illumination">Illumination</option>
                    </select>
                </div>

                {/* Artillery Info */}
                <div className="mt-6 text-white space-y-1 text-sm">
                    <h3 className="text-base font-bold">Fire Solution</h3>
                    {error && <p className="text-red-400">{error}</p>}
                    <p><strong>Distance:</strong> {distance}m</p>
                    <p><strong>Azimuth:</strong> {azimuth}°</p>
                    {calculatedMil !== null && (
                        <>
                            <p><strong>Elevation (mils):</strong> {calculatedMil.toFixed(1)}</p>
                            <p><strong>Rings:</strong> {calculatedRings}</p>
                            <p><strong>Dispersion:</strong> {calculatedDispersion}m</p>
                        </>
                    )}
                    <hr className="border-gray-700 my-2"/>
                    <p><strong>Elevation:</strong> {elevation} meters</p>
                </div>
            </div>

            {/* Bottom Menu */}
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

            {/* Map Component */}
            <div className={`relative transition-all duration-300 z-10 h-full`}>
                <MapContainer
                    center={[centerY, centerX]}
                    zoom={0}
                    maxZoom={5}
                    style={{
                        height: "100vh",
                        width: "100vw",
                        backgroundColor: "#8DB3BD"
                    }}
                    crs={L.CRS.Simple}
                    zoomControl={false}
                >
                    {getMapLayer(mapType)} {/* Render the correct map layer */}

                    {ringRanges.map((range, index) =>
                        range ? (
                            <Circle
                                key={index}
                                center={firingPosition}
                                radius={range}
                                pathOptions={{
                                    color: ["purple", "blue", "green", "yellow", "orange"][index],
                                    fillOpacity: 0,
                                    weight: 1.5,
                                    dashArray: "4",
                                }}
                            />
                        ) : null
                    )}

                    <Marker
                        position={firingPosition}
                        draggable={true}
                        eventHandlers={{
                            drag: (e) => setFiringPosition([e.latlng.lat, e.latlng.lng]),
                        }}
                    >
                        <Popup>Firing Position</Popup>
                    </Marker>

                    <Marker
                        position={targetPosition}
                        draggable={true}
                        eventHandlers={{
                            drag: (e) => setTargetPosition([e.latlng.lat, e.latlng.lng]),
                        }}
                    >
                        <Popup>Target Position</Popup>
                    </Marker>

                    <Circle
                        center={firingPosition}
                        radius={8}
                        color="red"
                        fillOpacity={0.5}
                        stroke={false}
                    />

                    <Circle
                        center={targetPosition}
                        radius={calculatedDispersion ? (calculatedDispersion * maps[mapType].scaleFactor) / 100 : 10}
                        color="green"
                        fillOpacity={0.5}
                        stroke={false}
                    />

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
                        </Tooltip>
                    </Polyline>
                    <MapClickHandler/>
                </MapContainer>
            </div>
        </div>
    );
};

export default Page;