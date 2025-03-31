'use client';
import { useState, useEffect } from 'react';

const artilleryData = {
    "American": {
        name: "M1A1 155mm Howitzer",
        rounds: {
            "HE": [500, 1000, 1500, 2000],
            "Smoke": [600, 1100, 1600, 2100],
            "Illumination": [700, 1200, 1700, 2200],
            "Practice Round": [800, 1300, 1800, 2300]
        }
    },
    "Soviet": {
        name: "ML-20 152mm Howitzer",
        rounds: {
            "HE": [550, 1050, 1550, 2050],
            "Smoke": [650, 1150, 1650, 2150],
            "Illumination": [750, 1250, 1750, 2250],
            "Practice Round": [850, 1350, 1850, 2350]
        }
    }
};

const Home = () => {
    const [faction, setFaction] = useState('American');
    const [round, setRound] = useState('HE');
    const [charge, setCharge] = useState(0);
    const [distance, setDistance] = useState('');
    const [error, setError] = useState('');
    const [calculatedMil, setCalculatedMil] = useState(null);

    useEffect(() => {
        if (faction && round && !isNaN(distance) && distance) {
            const artillery = artilleryData[faction];
            const roundRanges = artillery.rounds[round];
            if (artillery && roundRanges && distance >= 100 && distance <= roundRanges[3]) {
                let mil;
                if (faction === 'American') {
                    mil = (-2.18e-12 * Math.pow(distance, 2)) - (0.237 * distance) + 1001.53;
                } else if (faction === 'Soviet') {
                    mil = (-1.05e-7 * Math.pow(distance, 2)) - (0.213 * distance) + 1141.65;
                }
                setCalculatedMil(mil);
                setError('');
            } else {
                setCalculatedMil(null);
                setError(distance < 100 || distance > roundRanges[3] ? `Distance must be between 100 and ${roundRanges[3]} meters.` : 'Invalid faction, round, or distance.');
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
                    <label htmlFor="round" className="block text-lg font-medium">Round Type</label>
                    <select
                        id="round"
                        value={round}
                        onChange={(e) => setRound(e.target.value)}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {Object.keys(artilleryData[faction].rounds).map((roundType) => (
                            <option key={roundType} value={roundType}>{roundType}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="charge" className="block text-lg font-medium">Charge Level</label>
                    <select
                        id="charge"
                        value={charge}
                        onChange={(e) => setCharge(parseInt(e.target.value))}
                        className="w-full mt-2 p-3 rounded-lg bg-[#0D0D0D] border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {[0, 1, 2, 3, 4].map((c) => (
                            <option key={c} value={c}>Charge {c}</option>
                        ))}
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