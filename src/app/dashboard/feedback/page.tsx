export default function FeedbackTracker() {
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
         <h2 className="text-2xl font-bold text-white tracking-tight mb-1">User Feedback</h2>
         <p className="text-gray-500 font-light text-sm">Voice your thoughts directly to the product engineering team.</p>
      </div>
      <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 p-8 flex flex-col items-center justify-center min-h-[500px]">
         <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
             <span className="text-2xl opacity-50">💬</span>
         </div>
         <h3 className="text-lg font-medium text-white mb-2">Feedback Portal Active</h3>
         <p className="text-gray-500 font-light text-sm max-w-md text-center">Incoming user requests and suggestions are being parsed.</p>
      </div>
    </div>
  );
}
