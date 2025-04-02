"use client"
import dynamic from "next/dynamic";

const MapCalculatorPage = dynamic(() => import("./components/MapCalculator"), { ssr: false });

export default function Page() {
    return <MapCalculatorPage />;
}