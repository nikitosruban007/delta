import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fbff] text-[#061733]">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
