import React from 'react';

const Page = () => {
    const sections = [
        {
            title: 'How to Choose the Map, Faction, and Shell',
            content: (
                <>
                    <h3 className="text-lg font-semibold mb-1">Choosing Your Map</h3>
                    <p className="mb-3">
                        Start by selecting your map. The tool supports multiple military-style maps with different grid systems...
                    </p>
                    <h3 className="text-lg font-semibold mb-1">Selecting Your Faction</h3>
                    <p className="mb-3">
                        Choose between <strong>US</strong> and <strong>RU</strong> artillery...
                    </p>
                    <h3 className="text-lg font-semibold mb-1">Choosing Your Shell</h3>
                    <p>
                        After selecting the faction, choose the type of artillery round you want to use...
                    </p>
                </>
            ),
            imgSrc: '/about/map_options.png',
            imgAlt: 'Selecting Map, Faction, and Shell',
        },
        {
            title: 'Setting Up the Firing Position and Target Area',
            content: (
                <>
                    <h3 className="text-lg font-semibold mb-1">Firing Position</h3>
                    <p className="mb-3">
                        The firing position refers to the location where your artillery will be stationed <span className="text-red-500 font-bold">Red circle</span>. Drag the marker of your firing position <span className="text-green-500 font-bold">Green circle</span>...
                    </p>
                    <h3 className="text-lg font-semibold mb-1">Target Area</h3>
                    <p>
                        Next, choose where you want your artillery to hit...
                    </p>
                </>
            ),
            imgSrc: '/about/map_radius_rings.png',
            imgAlt: 'Setting Firing Position and Target Area',
        },
        {
            title: 'Viewing Results',
            content: (
                <>
                    <h3 className="text-lg font-semibold mb-1">Results Display</h3>
                    <p className="mb-3">
                        Once the firing position and target area are set, the tool will calculate and display the necessary settings...
                    </p>
                    <p>
                        The results tab makes it easy to know exactly what adjustments you need...
                    </p>
                </>
            ),
            imgSrc: '/about/map_results.png',
            imgAlt: 'Results Tab',
        },
        {
            title: 'Header Overview',
            content: (
                <>
                    <p>
                        The header section of the tool provides quick access to the main options...
                    </p>
                </>
            ),
            imgSrc: '/about/map_header.png',
            imgAlt: 'Header Overview of Artillery Calculator',
        },
    ];

    return (
        <div className="px-4 py-8 max-w-screen-xl mx-auto text-white">
            {sections.map((section, index) => (
                <div
                    key={index}
                    className={`flex flex-col md:flex-row ${
                        index % 2 !== 0 ? 'md:flex-row-reverse' : ''
                    } items-center gap-8 mb-16`}
                >
                    <img
                        src={section.imgSrc}
                        alt={section.imgAlt}
                        className="w-full md:w-1/2 rounded-lg shadow-lg"
                    />
                    <div className="w-full md:w-1/2">
                        <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                        <div className="text-sm leading-relaxed text-gray-300">{section.content}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Page;