import React from 'react';

const Page = () => {
    const sections = [
        {
            title: 'How to Choose the Map, Faction, and Shell',
            content: (
                <>
                    <h3>Choosing Your Map</h3>
                    <p>
                        Start by selecting your map. The tool supports multiple military-style maps with different grid systems. Each map has its own specific conversion factor for accurate calculations. You’ll need to know the grid scale to make sure the artillery calculations are precise.
                    </p>
                    <h3>Selecting Your Faction</h3>
                    <p>
                        Choose between <strong>US</strong> and <strong>RU</strong> artillery. Each faction has unique data, including different artillery systems, ranges, and charge configurations.
                    </p>
                    <h3>Choosing Your Shell</h3>
                    <p>
                        After selecting the faction, choose the type of artillery round you want to use: <strong>HE</strong> (High Explosive), <strong>Smoke</strong>, <strong>Illumination</strong>. Each shell type has its own properties, such as range and dispersion.
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
                    <h3>Firing Position</h3>
                    <p>
                        The firing position refers to the location where your artillery will be stationed <strong style={{color: "red"}}>Red circle</strong>. Drag the marker of your firing position <strong style={{color: "green"}}>Green circle</strong>,
                        or select it directly on the map. The tool will use this position to calculate the distance to the target.
                    </p>
                    <h3>Target Area</h3>
                    <p>
                        Next, choose where you want your artillery to hit. You can select a target point on the interactive map. The tool will calculate the angle (azimuth), the rings needed on the shell and elevation necessary to hit the target accurately.
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
                    <h3>Results Display</h3>
                    <p>
                        Once the firing position and target area are set, the tool will calculate and display the necessary settings for firing the artillery. This includes the required azimuth, elevation, and charge settings. The results will also be shown on the map with range circles and other visual aids.
                    </p>
                    <p>
                        The results tab makes it easy to know exactly what adjustments you need to make to fire your artillery accurately, saving time and effort during gameplay.
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
                        The header section of the tool provides quick access to the main options, such as selecting the faction, round type, and charge settings. It also includes the map selection and a button to reset the entire tool for new calculations. This section is always visible and provides users with easy access to the most important features.
                    </p>
                </>
            ),
            imgSrc: '/about/map_header.png',
            imgAlt: 'Header Overview of Artillery Calculator',
        },
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center' }}>Arma Reforger Artillery Calculator</h1>
            {sections.map((section, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '40px',
                    }}
                >
                    <img
                        src={section.imgSrc}
                        alt={section.imgAlt}
                        style={{ width: '30%', height: 'auto', borderRadius: '8px' }}
                    />
                    <div style={{ maxWidth: '600px' }}>
                        <h2>{section.title}</h2>
                        <div>{section.content}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Page;