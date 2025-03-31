"use client"
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapCalculator = () => {
    const [firingPosition, setFiringPosition] = useState([51.505, -0.09]); // Initial firing position
    const [targetPosition, setTargetPosition] = useState([51.51, -0.1]); // Initial target position
    const [path, setPath] = useState([firingPosition, targetPosition]); // Path between firing and target positions
    const [elevation, setElevation] = useState(null); // Placeholder for elevation calculation

    // Handle click to select firing position and target position
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        if (!firingPosition) {
            setFiringPosition([lat, lng]);
        } else if (!targetPosition) {
            setTargetPosition([lat, lng]);
            setPath([firingPosition, [lat, lng]]);
        }
    };

    // Function to calculate elevation (dummy function for now)
    const calculateElevation = () => {
        if (firingPosition && targetPosition) {
            const distance = Math.sqrt(
                Math.pow(targetPosition[0] - firingPosition[0], 2) + Math.pow(targetPosition[1] - firingPosition[1], 2)
            );
            const elevationValue = Math.floor(distance * 0.1); // Dummy formula for elevation
            setElevation(elevationValue);
        }
    };

    // Run elevation calculation when target position is set
    React.useEffect(() => {
        if (targetPosition) {
            calculateElevation();
        }
    }, [targetPosition]);

    return (
        <div className="map-container">
            <h2 className="text-center text-2xl mb-6">Map Calculator</h2>
            <MapContainer
                center={firingPosition}
                zoom={13}
                style={{ height: '500px', width: '100%' }}
                whenCreated={(map) => map.on('click', handleMapClick)} // Handle map click
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Marker for Firing Position */}
                {firingPosition && (
                    <Marker position={firingPosition}>
                        <Popup>Firing Position</Popup>
                    </Marker>
                )}
                {/* Marker for Target Position */}
                {targetPosition && (
                    <Marker position={targetPosition}>
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

export default MapCalculator;