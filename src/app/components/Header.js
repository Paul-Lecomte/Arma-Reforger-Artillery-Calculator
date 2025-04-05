"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="text-white py-4 bg-black z-50">
            <div className="container flex px-6" style={{ marginLeft: "5rem" }}>
                <h1 className="text-2xl font-bold tracking-wide hidden md:block transition-opacity duration-300">
                    Arma Reforger Artillery Calculator
                </h1>

                {/* Burger Menu Button */}
                <button
                    className="md:hidden bg-gray-800 p-2 rounded-lg text-white focus:outline-none absolute top-4 right-4 z-50"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Navigation Links */}
                <nav
                    className={`absolute md:static top-12 right-0 md:w-auto transition-all duration-300 md:flex md:space-x-6 ${
                        isOpen ? "animate-slideFadeIn" : "hidden"
                    }`}
                    style={{ zIndex: 40 }}
                >
                    <ul
                        className={`flex flex-col items-end md:flex-row space-y-4 md:space-y-0 md:space-x-6 p-6 md:p-0 rounded-lg absolute top-5 right-4 ${
                            isOpen ? "bg-gray-800" : ""
                        } md:bg-transparent`}
                    >
                        <li>
                            <Link href="/" className="hover:text-gray-400" onClick={() => setIsOpen(false)}>
                                Map
                            </Link>
                        </li>
                        <li>
                            <Link href="/Calculator" className="hover:text-gray-400" onClick={() => setIsOpen(false)}>
                                Calculator
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="hover:text-gray-400" onClick={() => setIsOpen(false)}>
                                About
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;