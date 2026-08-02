import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FiGrid, 
  FiArchive, 
  FiFilePlus, 
  FiCornerDownLeft, 
  FiTrendingUp, 
  FiLogOut,
  FiActivity,
  FiBell,
  FiHome,
  FiSettings,
  FiMenu
} from "react-icons/fi";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useHelpingHands();

  // Route security check: redirect to /admin/login if session doesn't exist
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
      navigate("/medical/admin/login");
    }
  }, [navigate]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    navigate("/");
  };

  const navItemClass = (path) => 
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
      isActive(path) 
        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  const mobileNavClass = (path) => 
    `flex flex-col items-center justify-center py-2 text-[10px] font-bold cursor-pointer transition-all ${
      isActive(path) 
        ? "text-blue-600 scale-105" 
        : "text-slate-400 hover:text-blue-500"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans pb-16 md:pb-0">
      
      {/* Desktop Sidebar (Left side) */}
      <aside className="bg-slate-900 text-slate-300 w-64 xl:w-72 shrink-0 flex flex-col justify-between hidden md:flex min-h-screen p-5 md:p-6 sticky top-0 z-40">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-10">
            <img
              src="/pydc_medical_logo.png"
              alt="PYDC Logo"
              className="w-10 h-10 object-contain rounded-full shrink-0"
            />
            <div>
              <h2 className="text-base font-black text-white tracking-wider">PYDC TRUST</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Admin Dashboard</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link to="/medical/admin/dashboard" className={navItemClass("/medical/admin/dashboard")}>
              <FiGrid /> Dashboard
            </Link>
            <Link to="/medical/admin/equipment" className={navItemClass("/medical/admin/equipment")}>
              <FiArchive /> Inventory
            </Link>
            <Link to="/medical/admin/borrow" className={navItemClass("/medical/admin/borrow")}>
              <FiFilePlus /> Borrow Entry
            </Link>
            <Link to="/medical/admin/return" className={navItemClass("/medical/admin/return")}>
              <FiCornerDownLeft /> Returns
            </Link>
            <Link to="/medical/admin/reports" className={navItemClass("/medical/admin/reports")}>
              <FiTrendingUp /> Reports
            </Link>
            <Link to="/medical/admin/settings" className={navItemClass("/medical/admin/settings")}>
              <FiSettings /> Settings
            </Link>
          </nav>
        </div>

        {/* Bottom options */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <Link to="/medical" className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition-colors">
            <FiHome /> Back to Public Site
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-950/20 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl font-semibold transition-all border border-red-900/10 cursor-pointer"
          >
            <FiLogOut /> Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Section */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <img
              src="/pydc_medical_logo.png"
              alt="PYDC"
              className="md:hidden w-8 h-8 object-contain rounded-full"
            />
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">PYDC Charity Trust Admin</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase hidden sm:block">Charitable Medical Equipment Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Badge */}
            <div className="relative p-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-slate-600 transition-colors" title="Overdue equipment warnings">
              <FiBell />
              {stats.overdue > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border border-white animate-bounce">
                  {stats.overdue}
                </span>
              )}
            </div>
            
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                A
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-700">Administrator</p>
                <p className="text-[9px] text-slate-400">pydc@gmail.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Children */}
        <main className="flex-1 p-5 md:p-6 lg:p-8 xl:p-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on mobile/tablet for Admin) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 backdrop-blur-md grid grid-cols-6 md:hidden z-40 shadow-lg px-2 text-slate-400">
        <Link to="/medical/admin/dashboard" className={`${mobileNavClass("/medical/admin/dashboard")} ${isActive("/medical/admin/dashboard") ? 'text-blue-500' : 'text-slate-400'}`}>
          <FiGrid className="text-lg mb-1" />
          <span>Dashboard</span>
        </Link>
        <Link to="/medical/admin/equipment" className={`${mobileNavClass("/medical/admin/equipment")} ${isActive("/medical/admin/equipment") ? 'text-blue-500' : 'text-slate-400'}`}>
          <FiArchive className="text-lg mb-1" />
          <span>Inventory</span>
        </Link>
        <Link to="/medical/admin/borrow" className={`${mobileNavClass("/medical/admin/borrow")} ${isActive("/medical/admin/borrow") ? 'text-blue-500' : 'text-slate-400'}`}>
          <FiFilePlus className="text-lg mb-1" />
          <span>Borrow</span>
        </Link>
        <Link to="/medical/admin/reports" className={`${mobileNavClass("/medical/admin/reports")} ${isActive("/medical/admin/reports") ? 'text-blue-500' : 'text-slate-400'}`}>
          <FiTrendingUp className="text-lg mb-1" />
          <span>Reports</span>
        </Link>
        <Link to="/medical/admin/settings" className={`${mobileNavClass("/medical/admin/settings")} ${isActive("/medical/admin/settings") ? 'text-blue-500' : 'text-slate-400'}`}>
          <FiSettings className="text-lg mb-1" />
          <span>Settings</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center justify-center py-2 text-[10px] font-bold cursor-pointer text-red-400 hover:text-red-300">
          <FiLogOut className="text-lg mb-1" />
          <span>Log Out</span>
        </button>
      </nav>

    </div>
  );
}
