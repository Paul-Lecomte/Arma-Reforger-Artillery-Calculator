import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Arma Reforger Artillery Calculator - Range, Elevation & Azimuth Calculations",
    description: "The best Arma Reforger artillery calculator for calculating range, elevation, and azimuth for artillery shots in Arma Reforger. Includes real-time elevation calculation, round selection (HE, Smoke, Illumination, Practice), and multiple rounds per faction.",
    keywords: "Arma Reforger, artillery calculator, artillery range, artillery elevation, artillery azimuth, Arma Reforger calculator, artillery rounds, military artillery, HE rounds, Smoke rounds, Illumination rounds, Practice rounds",
    icons: {
        icon: '/mortar.ico', // Your favicon
    },
    locale: "en_US", // Specify the locale for better targeting
    verification: {
        google: "d80MGB5E1JUNxMxIX5pA55b9gqj0uWptqNb4gpAqfEw",
    },
};

export default function RootLayout({ children }) {
    console.log(
        "%cHold up!",
        "color: red; font-size: 24px; font-weight: bold;"
    );
    console.log(
        "%cPlease do not copy this site without proper credit.\nAuthor: Paul Lecomte",
        "color: white; font-size: 14px;"
    );
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} h-screen flex flex-col bg-[#0D0D0D]`}>
        {/* This will show up immediately after the DOCTYPE */}
        <div
            dangerouslySetInnerHTML={{
                __html: `<!--
    Please do not copy the site without leaving my authorship (Enj0y)
-->`,
            }}
        />
        <Header className="h-[10%]"/>
        <main className="flex-1 h-[80%] overflow-auto">{children}</main>
        <Footer className="h-[10%]" />
        {/* Added Vercel Analytics */}
        <Analytics />
        </body>
        </html>
    );
}