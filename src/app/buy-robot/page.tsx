import { Navbar } from "@/components/Navbar";

export default function BuyRobot() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-20 px-4">
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Reserve Your AquaBuddy</h1>
            <p className="text-gray-400 font-light mb-8 max-w-xl mx-auto">
               Secure your unit directly through Stripe. Production volume is limited.
            </p>
            <button className="px-12 py-5 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mx-auto">
                Pay with Stripe
            </button>
        </div>
      </div>
    </div>
  );
}
