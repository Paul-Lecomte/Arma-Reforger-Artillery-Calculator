const Footer = () => {
    return (
        <footer className="text-gray-400 text-xs text-center bottom-0 w-full">
            <p>&copy; {new Date().getFullYear()} Paul Lecomte • MIT License •
                <a href="https://github.com/Paul-Lecomte/Arma-Reforger-Artillery-Calculator"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="hover:text-white ml-1">
                    GitHub
                </a>
            </p>
        </footer>
    );
};

export default Footer;