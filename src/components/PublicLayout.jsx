import { Link, useLocation } from "react-router-dom";
import { FiHome, FiGrid, FiFileText, FiUser, FiActivity } from "react-icons/fi";
import { trustInfo } from "../data/helping_hands";

export default function PublicLayout({ children }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/medical" && location.pathname === "/medical") return true;
    if (path !== "/medical" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navClass = (path) => 
    `flex flex-col items-center justify-center py-2 text-xs font-semibold cursor-pointer transition-all ${
      isActive(path) 
        ? "text-blue-600 scale-105" 
        : "text-slate-400 hover:text-blue-500"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 md:pb-0">
      
      {/* Desktop Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4.5 flex items-center justify-between">
          <Link to="/medical" className="flex items-center gap-3">
            {/* PYDC Trust Logo */}
            <img
              src="/pydc_medical_logo.png"
              alt="PYDC Logo"
              className="w-10 h-10 object-contain rounded-full"
            />
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                PYDC <span className="text-blue-600">Charity Trust</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Medical Equipment Loan System</p>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <nav className="flex items-center gap-8 font-medium text-sm">
            <Link to="/medical" className={isActive("/medical") && location.pathname === "/medical" ? "text-blue-600 font-semibold" : "text-slate-600 hover:text-blue-600"}>Home</Link>
            <Link to="/medical/equipment" className={isActive("/medical/equipment") ? "text-blue-600 font-semibold" : "text-slate-600 hover:text-blue-600"}>Equipment</Link>
            <Link to="/medical/request" className={isActive("/medical/request") ? "text-blue-600 font-semibold" : "text-slate-600 hover:text-blue-600"}>Request Equipment</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/medical/profile" className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-blue-600 transition-all">
              <FiUser className="text-lg" />
            </Link>
            <Link to="/medical/admin/login" className="btn-primary py-2 px-5 text-sm font-semibold cursor-pointer">
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Visible only on mobile/tablet) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 backdrop-blur-md grid grid-cols-4 md:hidden z-40 shadow-lg px-2">
        <Link to="/medical" className={navClass("/medical")}>
          <FiHome className="text-xl mb-1" />
          <span>Home</span>
        </Link>
        <Link to="/medical/equipment" className={navClass("/medical/equipment")}>
          <FiGrid className="text-xl mb-1" />
          <span>Equipment</span>
        </Link>
        <Link to="/medical/request" className={navClass("/medical/request")}>
          <FiFileText className="text-xl mb-1" />
          <span>Request</span>
        </Link>
        <Link to="/medical/profile" className={navClass("/medical/profile")}>
          <FiUser className="text-xl mb-1" />
          <span>Profile</span>
        </Link>
      </nav>
      
    </div>
  );
}
