"use client"
import React, { useState, useEffect } from 'react';
import { artilleryData } from './components/Data'; // import the artilleryData

const interpolateMil = (rangeTable, distance) => {
    for (let i = 0; i < rangeTable.length - 1; i++) {
        if (distance >= rangeTable[i].range && distance <= rangeTable[i + 1].range) {
            const x1 = rangeTable[i].range;
            const y1 = rangeTable[i].mil;
            const x2 = rangeTable[i + 1].range;
            const y2 = rangeTable[i + 1].mil;
            return y1 + ((y2 - y1) / (x2 - x1)) * (distance - x1);
        }
    }
    return null;
};

const Home = () => {
    const [faction, setFaction] = useState('American');
    const [round, setRound] = useState('HE');
    const [charge, setCharge] = useState('0');
    const [distance, setDistance] = useState('');
    const [error, setError] = useState('');
    const [calculatedMil, setCalculatedMil] = useState(null);

    useEffect(() => {
        if (faction && round && !isNaN(distance) && distance) {
            const artillery = artilleryData[faction];
            if (artillery && artillery.rounds[round] && faction === 'Soviet') {
                const roundData = artillery.rounds[round][charge];
                if (roundData) {
                    const mil = interpolateMil(roundData, parseFloat(distance));
                    if (mil !== null) {
                        setCalculatedMil(mil);
                        setError('');
                    } else {
                        setCalculatedMil(null);
                        setError(`Distance must be within the available range.`);
                    }
                }
            }
        } else {
            setCalculatedMil(null);
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
                    <label htmlFor="charge" className="block text-lg font-medium">Charge</label>
                    <select
                        id="charge"
                        value={charge}
                        onChange={(e) => setCharge(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="0">Charge 0</option>
                        <option value="1">Charge 1</option>
                        <option value="2">Charge 2</option>
                        <option value="3">Charge 3</option>
                        <option value="4">Charge 4</option>
                    </select>
                </div>
            </form>
            {calculatedMil !== null && (
                <div className="mt-6 text-xl text-center font-semibold">
                    <p>Calculated Elevation: {Math.floor(calculatedMil)}</p>
                </div>
            )}
        </div>
    );
};

export default Home;