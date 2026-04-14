import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CanvasSequence } from "@/components/CanvasSequence";
import { Carousel } from "@/components/Carousel";

export default function Home() {
  return (
    <main className="flex flex-col bg-background selection:bg-accent selection:text-white">
      <Navbar />
      <Hero />
      <CanvasSequence />
      <Carousel />
    </main>
  );
}
