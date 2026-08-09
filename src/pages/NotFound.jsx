import { Link } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center bg-slate-900/95 border border-slate-800 rounded-[2rem] p-10 shadow-2xl shadow-black/30">
        <div className="text-7xl font-black text-blue-500 mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-center sm:gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            <FiHome /> Back to Portal
          </Link>
          <Link
            to="/medical"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft /> Medical Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
