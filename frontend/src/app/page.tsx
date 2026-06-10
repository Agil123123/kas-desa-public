import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Features from "@/components/Features";
import Personas from "@/components/Personas";
import StrukturOrganisasi from "@/components/StrukturOrganisasi";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <HeroSection />
      <Features />
      <StrukturOrganisasi />
      <Personas />
      <Footer />
    </main>
  );
}
