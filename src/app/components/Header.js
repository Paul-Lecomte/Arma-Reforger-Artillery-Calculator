import Link from "next/link";

const Header = () => {
    return (
        <header className="text-white py-4">
            <div className="container mx-auto flex justify-between items-center px-6">
                <h1 className="text-2xl font-bold tracking-wide">
                    Arma Reforger artillery calculator
                </h1>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/" className="hover:text-gray-400">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/calculator" className="hover:text-gray-400">
                                Calculator
                            </Link>
                        </li>
                        <li>
                            <Link href="/MapCalculator" className="hover:text-gray-400">
                                Map calculator
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="hover:text-gray-400">
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