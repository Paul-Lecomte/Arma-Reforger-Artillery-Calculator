import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
    return (
        <div>
            <Header />
            <div>
                Main
            </div>
            <Footer />
        </div>
    );
}