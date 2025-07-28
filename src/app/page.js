"use client"
import dynamic from "next/dynamic";

// Importing the MapCalculator component dynamically to avoid server-side rendering issues
const MapCalculatorPage = dynamic(() => import("./components/MapCalculator"), { ssr: false });

export default function Page() {
    return <MapCalculatorPage />;
}