import { Link } from "react-router-dom";
import { FiBookOpen, FiArrowRight, FiActivity } from "react-icons/fi";

export default function Portal() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50/40 via-slate-50 to-violet-50/40 text-slate-800 flex flex-col relative overflow-hidden font-sans">
      {/* Soft blue and violet background glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/10 blur-[130px] pointer-events-none"></div>
      
      {/* Subtle Grid overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="/pydc_logo.png" 
            alt="PYDC Logo" 
            className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-slate-200 shadow-md"
          />
          <div>
            <h1 className="text-xl font-black tracking-wider text-slate-800">PYDC</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Youth Development Club</p>
          </div>
        </div>
        <div className="text-xs text-slate-600 font-medium px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 backdrop-blur-sm shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          All Services Online
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-12 w-full z-10">
        <div className="text-center mb-16 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50">
            Welcome to PYDC Portal
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
            Medical Equipment Charity Trust Management
          </h2>
          <p className="text-slate-500 mt-4 text-base md:text-lg">
            Access, borrow, and manage our medical equipment charity inventory and public library catalog from a single consolidated dashboard.
          </p>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Card 1: Library Service */}
          <Link 
            to="/library" 
            className="group relative bg-white/70 border border-slate-200/80 rounded-3xl p-8 hover:bg-white hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-md flex flex-col justify-between h-[320px] overflow-hidden shadow-sm"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300"></div>
            
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <FiBookOpen className="text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                Public Library
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Browse our extensive book catalog, view details/reviews, search through sections, and borrow/return items easily.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mt-6">
              Enter Library Portal
              <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>

          {/* Card 2: Club Equipment & Games */}
          <Link 
            to="/medical" 
            className="group relative bg-white/70 border border-slate-200/80 rounded-3xl p-8 hover:bg-white hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 backdrop-blur-md flex flex-col justify-between h-[320px] overflow-hidden shadow-sm"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all duration-300"></div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <FiActivity className="text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-violet-600 transition-colors">
                Medical Equipment
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Reserve and request wheelchairs, oxygen concentrators, hospital beds, and other patient support medical equipment for charity distribution.
              </p>
            </div>

            <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm mt-6">
              Enter Equipment Portal
              <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 text-center text-slate-400 text-xs border-t border-slate-200 z-10 shrink-0">
        <p>© 2026 Padiyanallur Youth Development Club (PYDC). All rights reserved.</p>
      </footer>
    </div>
  );
}
