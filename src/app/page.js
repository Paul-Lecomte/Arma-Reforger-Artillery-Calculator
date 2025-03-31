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
            "HE": {
                "0": [
                    { range: 50, mil: 1455 },
                    { range: 100, mil: 1411 },
                    { range: 150, mil: 1365 },
                    { range: 200, mil: 1318 },
                    { range: 250, mil: 1268 },
                    { range: 300, mil: 1217 },
                    { range: 350, mil: 1159 },
                    { range: 400, mil: 1095 },
                    { range: 450, mil: 1023 },
                    { range: 500, mil: 922 }
                ],
                "1": [
                    { range: 100, mil: 1446 },
                    { range: 200, mil: 1392 },
                    { range: 300, mil: 1335 },
                    { range: 400, mil: 1275 },
                    { range: 500, mil: 1212 },
                    { range: 600, mil: 1141 },
                    { range: 700, mil: 1058 },
                    { range: 800, mil: 952 }
                ],
                "2": [
                    { range: 200, mil: 1432 },
                    { range: 300, mil: 1397 },
                    { range: 400, mil: 1362 },
                    { range: 500, mil: 1325 },
                    { range: 600, mil: 1288 },
                    { range: 700, mil: 1248 },
                    { range: 800, mil: 1207 },
                    { range: 900, mil: 1162 },
                    { range: 1000, mil: 1114 },
                    { range: 1100, mil: 1060 },
                    { range: 1200, mil: 997 },
                    { range: 1300, mil: 914 },
                    { range: 1400, mil: 755 }
                ],
                "3": [
                    { range: 200, mil: 1432 },
                    { range: 300, mil: 1397 },
                    { range: 400, mil: 1362 },
                    { range: 500, mil: 1325 },
                    { range: 600, mil: 1288 },
                    { range: 700, mil: 1248 },
                    { range: 800, mil: 1207 },
                    { range: 900, mil: 1162 },
                    { range: 1000, mil: 1114 },
                    { range: 1100, mil: 1060 },
                    { range: 1200, mil: 997 },
                    { range: 1300, mil: 914 },
                    { range: 1400, mil: 755 },
                    { range: 1500, mil: 1040 },
                    { range: 1600, mil: 991 },
                    { range: 1700, mil: 932 },
                    { range: 1800, mil: 851 }
                ],
                "4": [
                    { range: 400, mil: 1418 },
                    { range: 500, mil: 1398 },
                    { range: 600, mil: 1376 },
                    { range: 700, mil: 1355 },
                    { range: 800, mil: 1333 },
                    { range: 900, mil: 1311 },
                    { range: 1000, mil: 1288 },
                    { range: 1100, mil: 1264 },
                    { range: 1200, mil: 1240 },
                    { range: 1300, mil: 1215 },
                    { range: 1400, mil: 1189 },
                    { range: 1500, mil: 1161 },
                    { range: 1600, mil: 1133 },
                    { range: 1700, mil: 1102 },
                    { range: 1800, mil: 1069 },
                    { range: 1900, mil: 1034 },
                    { range: 2000, mil: 995 },
                    { range: 2100, mil: 950 },
                    { range: 2200, mil: 896 },
                    { range: 2300, mil: 820 }
                ]
            },
            "Smoke": {
                "1": [
                    { range: 50, mil: 1450 },
                    { range: 100, mil: 1399 },
                    { range: 150, mil: 1347 },
                    { range: 200, mil: 1292 },
                    { range: 250, mil: 1235 },
                    { range: 300, mil: 1172 },
                    { range: 350, mil: 1102 },
                    { range: 400, mil: 1020 },
                    { range: 450, mil: 898 }
                ],
                "2": [
                    { range: 200, mil: 1381 },
                    { range: 300, mil: 1319 },
                    { range: 400, mil: 1252 },
                    { range: 500, mil: 1179 },
                    { range: 600, mil: 1097 },
                    { range: 700, mil: 993 },
                    { range: 800, mil: 805 }
                ],
                "3": [
                    { range: 300, mil: 1387 },
                    { range: 400, mil: 1348 },
                    { range: 500, mil: 1308 },
                    { range: 600, mil: 1266 },
                    { range: 700, mil: 1222 },
                    { range: 800, mil: 1175 },
                    { range: 900, mil: 1123 },
                    { range: 1000, mil: 1065 },
                    { range: 1100, mil: 994 },
                    { range: 1200, mil: 902 }
                ],
                "4": [
                    { range: 400, mil: 1387 },
                    { range: 500, mil: 1357 },
                    { range: 600, mil: 1327 },
                    { range: 700, mil: 1286 },
                    { range: 800, mil: 1264 },
                    { range: 900, mil: 1231 },
                    { range: 1000, mil: 1196 },
                    { range: 1100, mil: 1159 },
                    { range: 1200, mil: 1119 },
                    { range: 1300, mil: 1075 },
                    { range: 1400, mil: 1026 },
                    { range: 1500, mil: 969 },
                    { range: 1600, mil: 896 },
                    { range: 1700, mil: 753 }
                ]
            }
        }
    }
};

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