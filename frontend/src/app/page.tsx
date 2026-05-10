import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LandingFooter from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-[#061733]">
      <Navbar />
      <Hero />
      <Features />
      <LandingFooter />
    </main>
  );
}