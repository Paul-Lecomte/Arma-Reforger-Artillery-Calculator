# Arma Reforger Artillery Calculator

This project is an artillery calculator for **Arma Reforger** designed to help players calculate the necessary parameters for artillery fire. The tool features an interactive map where users can select the firing location and target, and it will calculate the required number of charges, elevation, and azimuth needed to hit the target.

## Features

- **Interactive Map**: Select a firing position and a target on the map.
- **Artillery Parameters**: Calculate the number of charges, elevation, and azimuth for the artillery shot.
- **Customization**: Adjust the artillery type and other parameters based on your needs.

## Technologies

- **Next.js**: A React framework for building the app.
- **Leaflet.js** (or **Mapbox**): For displaying the interactive map and handling geospatial data.
- **JavaScript**: Core logic for calculating artillery parameters.

## Setup

### Prerequisites

- Node.js (>= 16.x.x)
- npm or yarn

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Paul-Lecomte/Arma-Reforger-Artillery-Calculator.git
   ```

2. Navigate into the project directory:
   ```bash
   cd Arma-Reforger-Artillery-Calculator
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Project Locally

To run the project locally in development mode:
```bash
npm run dev
```

## Usage

- Navigate to the map interface on the site.
- Click on the firing location and target location to select them.
- The app will calculate and display the number of charges, elevation, and azimuth required for the artillery shot.
- Adjust artillery settings (such as artillery type) to customize the calculations.
