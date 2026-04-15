"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const FRAME_COUNT = 240;
const preloadedImages: HTMLImageElement[] = [];

const NARRATIVE_STEPS = [
  {
    id: "01",
    label: "PRECISION",
    title: "Component Excellence",
    text: "Engineered for performance, precision, and long-term reliability. Every element is tested to meet aerospace standards.",
    accent: "Excellence",
    range: [0, 0.25],
  },
  {
    id: "02",
    label: "FLOW",
    title: "Air Intake & Filtration",
    text: "High-efficiency intake and dust filtration working in sync to harvest the purest particles from the atmosphere.",
    accent: "Filtration",
    range: [0.25, 0.5],
  },
  {
    id: "03",
    label: "CORE",
    title: "Cooling & Condensation",
    text: "Advanced cooling technology converts ambient humidity into pure, delicious water using minimal energy states.",
    accent: "Condensation",
    range: [0.5, 0.75],
  },
  {
    id: "04",
    label: "OUTPUT",
    title: "Water Collection System",
    text: "Pure water is collected, sterilized, and delivered efficiently. A closed-loop system for the modern home.",
    accent: "System",
    range: [0.75, 1.0],
  },
];

export const CanvasSequence = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT]);

  useEffect(() => {
    // Preload images into memory
    let loaded = 0;
    for (let i = 1; i <= FRAME_COUNT; i++) {
        const indexStr = i.toString().padStart(3, "0");
        const img = new Image();
        img.src = `/sequence/ezgif-frame-${indexStr}.jpg`;
        img.onload = () => {
        loaded++;
        if (loaded === FRAME_COUNT) {
            setImagesLoaded(true);
        }
        };
        preloadedImages[i - 1] = img;
    }
  }, []);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !preloadedImages[index]) return;

    const img = preloadedImages[index];
    
    // Clear and fill dark void
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    
    // Fit image to canvas (contain/cover logic)
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );
  };

  useEffect(() => {
    const unsub = frameIndex.on("change", (latest) => {
      const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(latest) - 1));
      if (index !== currentFrame) {
        setCurrentFrame(index);
        requestAnimationFrame(() => drawFrame(index));
      }
    });
    return () => unsub();
  }, [frameIndex, currentFrame]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
          if (imagesLoaded) drawFrame(currentFrame);
        }
      }
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imagesLoaded, currentFrame]);

  return (
    <section ref={containerRef} className="relative h-[400vh] w-full bg-[#050505]">
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row overflow-hidden">
        
        {/* Loading Indicator */}
        {!imagesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-[60] bg-[#050505] transition-opacity duration-1000">
            <div className="text-white flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="tracking-widest font-light text-xs uppercase text-white/40">Calibrating System</p>
            </div>
          </div>
        )}

        {/* LEFT COLUMN: Narrative Text (Sticky) */}
        <div className="w-full lg:w-1/2 h-full flex items-center px-8 md:px-12 lg:px-24 z-10 pt-20 lg:pt-0">
          <div className="relative w-full h-[300px] flex items-center">
            {NARRATIVE_STEPS.map((step) => (
              <StepContent 
                key={step.id} 
                step={step} 
                progress={scrollYProgress} 
              />
            ))}
            
            {/* Final CTA Overlay for the last phase */}
            <FinalCTA progress={scrollYProgress} />
          </div>
        </div>

        {/* RIGHT COLUMN: Robot Animation */}
        <div className="w-full lg:w-1/2 h-full relative group">
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent z-10 pointer-events-none" />
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </div>
      </div>
    </section>
  );
};

// Sub-component for individual narrative steps
const StepContent = ({ step, progress }: { step: typeof NARRATIVE_STEPS[0], progress: MotionValue<number> }) => {
  // Clamp ranges to [0, 1] and ensure they are unique and increasing
  const range = [
    Math.max(0, step.range[0] - 0.05),
    step.range[0],
    step.range[1],
    Math.min(1, step.range[1] + 0.05)
  ];

  // Remove duplicates and ensure monotonic increase
  const uniqueRange = Array.from(new Set(range)).sort((a, b) => a - b);
  // If we removed duplicates, we need to match the output array length
  const outputOpacity = uniqueRange.length === 4 ? [0, 1, 1, 0] : uniqueRange.length === 3 ? [0, 1, 0] : [1, 1];
  const outputY = uniqueRange.length === 4 ? [24, 0, 0, -12] : uniqueRange.length === 3 ? [24, 0, -12] : [0, 0];

  const opacity = useTransform(progress, uniqueRange, outputOpacity);
  const y = useTransform(progress, uniqueRange, outputY);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center pointer-events-none"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] tracking-[0.4em] font-bold text-[#0EA5E9] uppercase">{step.id} — {step.label}</span>
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-6 leading-[1.1]">
        {step.title.split(step.accent)[0]}
        <span className="text-[#0EA5E9] text-glow">{step.accent}</span>
        {step.title.split(step.accent)[1]}
      </h2>
      <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-md">
        {step.text}
      </p>
    </motion.div>
  );
};

// Final Phase CTA transition
const FinalCTA = ({ progress }: { progress: MotionValue<number> }) => {
  const opacity = useTransform(progress, [0.88, 0.95], [0, 1]);
  const y = useTransform(progress, [0.88, 0.95], [20, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center pointer-events-auto"
    >
      <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tighter leading-none">
        Water Independence <br/>
        <span className="text-glow text-[#0EA5E9]">Simplified.</span>
      </h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/buy-robot" className="px-10 py-5 bg-[#0EA5E9] text-white rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_30px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2 group">
          Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="/plans" className="px-8 py-5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-full text-white font-medium transition-colors flex items-center justify-center">
            View Pricing
        </Link>
      </div>
    </motion.div>
  );
};
