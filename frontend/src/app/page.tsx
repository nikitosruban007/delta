import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#efefef]">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}