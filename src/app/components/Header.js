"use client"
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="text-white py-4">
            <div className="container mx-auto flex justify-between items-center px-6">
                <h1 className="text-2xl font-bold tracking-wide">
                    Arma Reforger Artillery Calculator
                </h1>

                {/* Burger Menu Button */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Navigation Links */}
                <nav className={`absolute md:static top-16 left-0 w-full md:w-auto bg-black md:bg-transparent transition-all duration-300 ${isOpen ? "block" : "hidden"} md:flex md:space-x-6`}>
                    <ul className="flex flex-col items-center md:flex-row space-y-4 md:space-y-0 md:space-x-6 p-6 md:p-0">
                        <li>
                            <Link href="/" className="hover:text-gray-400" onClick={() => setIsOpen(false)}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/" className="hover:text-gray-400" onClick={() => setIsOpen(false)}>
                                Calculator
                            </Link>
                        </li>
                        <li>
                            <Link href="/MapCalculator" className="hover:text-gray-400" onClick={() => setIsOpen(false)}>
                                Map Calculator
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