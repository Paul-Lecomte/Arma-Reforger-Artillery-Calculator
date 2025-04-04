"use client";
import React, { useState, useEffect } from 'react';
import { artilleryData } from '../components/Data'; // import the artilleryData

// Function to find the appropriate number of rings and calculate mil
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
                    const dMilPer100m = previous.dMilPer100m;

                    // Interpolate MIL based on distance and apply dMilPer100m
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

const Home = () => {
    const [faction, setFaction] = useState('American');
    const [round, setRound] = useState('HE'); // Default shell type
    const [charge, setCharge] = useState('0');
    const [distance, setDistance] = useState('');
    const [error, setError] = useState('');
    const [calculatedMil, setCalculatedMil] = useState(null);
    const [calculatedRings, setCalculatedRings] = useState(null);

    const [calculatedDispersion, setCalculatedDispersion] = useState(null);

    useEffect(() => {
        if (faction && round && !isNaN(distance) && distance) {
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

            const result = interpolateMil(roundData, parseFloat(distance));

            if (result) {
                setCalculatedMil(result.mil);
                setCalculatedRings(result.rings);
                setCalculatedDispersion(result.dispersion);
                setError('');
            } else {
                setCalculatedMil(null);
                setCalculatedRings(null);
                setCalculatedDispersion(null);
                setError(`Distance must be within the available range.`);
            }
        } else {
            setCalculatedMil(null);
            setCalculatedRings(null);
            setCalculatedDispersion(null);
        }
    }, [faction, round, charge, distance]);

    return (
        <div className="max-w-md mx-auto bg-[#262626] text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-6">Artillery Calculator</h2>
            <form className="space-y-4">
                <div>
                    <label htmlFor="distance" className="block text-lg font-medium">Distance to Target (m)</label>
                    <input
                        type="number"
                        id="distance"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter distance"
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div>
                    <label htmlFor="faction" className="block text-lg font-medium">Faction</label>
                    <select
                        id="faction"
                        value={faction}
                        onChange={(e) => setFaction(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {Object.keys(artilleryData).map((faction) => (
                            <option key={faction} value={faction}>{faction}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="round" className="block text-lg font-medium">Shell Type</label>
                    <select
                        id="round"
                        value={round}
                        onChange={(e) => setRound(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="HE">HE</option>
                        <option value="Smoke">Smoke</option>
                        <option value="Illumination">Illumination</option>
                    </select>
                </div>
            </form>
            {calculatedMil !== null && (
                <div className="mt-6 text-xl text-center font-semibold">
                    <p>Calculated Elevation: {Math.floor(calculatedMil)} MIL</p>
                    <p>Number of Rings: {calculatedRings}</p>
                    <p>Dispersion: {calculatedDispersion} m</p>
                </div>
            )}
        </div>
    );
};

export default Home;