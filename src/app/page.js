"use client";
import React, { useState, useEffect } from 'react';
import { artilleryData } from './components/Data'; // import the artilleryData

// Function to find the appropriate number of rings and calculate mil
const interpolateMil = (roundData, distance) => {
    for (let rings = 4; rings >= 0; rings--) {
        const rangeTable = roundData[rings];
        if (!rangeTable) continue;

        const dispersion = rangeTable[0].dispersion; // Extract dispersion from first entry

        for (let i = 1; i < rangeTable.length - 1; i++) { // Start at 1 to skip dispersion object
            if (distance >= rangeTable[i].range && distance <= rangeTable[i + 1].range) {
                const x1 = rangeTable[i].range;
                const y1 = rangeTable[i].mil;
                const x2 = rangeTable[i + 1].range;
                const y2 = rangeTable[i + 1].mil;
                return {
                    mil: y1 + ((y2 - y1) / (x2 - x1)) * (distance - x1),
                    rings,
                    dispersion
                };
            }
        }
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