import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center bg-slate-900/95 border border-slate-800 rounded-[2rem] p-10 shadow-2xl shadow-black/30">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Public Library Coming Soon</h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
          The Public Library feature is currently paused while we focus on the medical equipment portal. We will bring the library experience back soon.
        </p>
        <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-center sm:gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Back to Portal
          </Link>
          <Link
            to="/medical"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition-colors"
          >
            Go to Medical Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
