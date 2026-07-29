import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiBook, FiUser, FiSearch, FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path ? "text-primary font-semibold" : "text-slate-600 hover:text-primary";

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && navSearch.trim()) {
      navigate(`/library/books?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
      setMenuOpen(false);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-slate-100">
      <Link to="/library" className="flex items-center gap-3">
        <img 
          src="/pydc_logo.png" 
          alt="PYDC Public Library Logo" 
          className="w-10 h-10 object-contain rounded-full border border-slate-100 shadow-sm bg-white"
        />
        <h1 className="text-lg md:text-2xl font-black tracking-tight text-secondary">
          PYDC <span className="text-primary font-bold">PUBLIC LIBRARY</span>
        </h1>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 font-medium">
        <Link to="/library" className={isActive("/library")}>Home</Link>
        <Link to="/library/books" className={isActive("/library/books")}>Books</Link>
        <Link to="/" className="text-slate-600 hover:text-primary">Portal</Link>
        <a href="#footer" className="text-slate-600 hover:text-primary">About Us</a>
        <a href="#footer" className="text-slate-600 hover:text-primary">Contact</a>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        {/* Search Bar Desktop */}
        <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-full w-64 border border-slate-200 focus-within:border-primary/50 transition-colors">
          <FiSearch className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search books, author..." 
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="bg-transparent outline-none text-sm w-full" 
          />
        </div>

        <Link to="/library/dashboard" className="text-slate-600 hover:text-primary p-2 hover:bg-slate-50 rounded-xl transition-all" title="Dashboard">
          <FiUser className="text-xl" />
        </Link>
        <Link to="/library/login" className="btn-primary py-2 px-5 text-sm md:text-base md:px-6">
          Login
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors border border-slate-100 shadow-sm"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {menuOpen && (
        <div className="absolute top-[73px] left-0 w-full bg-white border-b border-slate-200 shadow-lg md:hidden flex flex-col p-6 gap-4 z-40 animate-fadeIn">
          <Link to="/library" className={`py-2 border-b border-slate-50 ${isActive("/library")}`} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/library/books" className={`py-2 border-b border-slate-50 ${isActive("/library/books")}`} onClick={() => setMenuOpen(false)}>Books</Link>
          <Link to="/" className="py-2 border-b border-slate-50 text-slate-600 hover:text-primary" onClick={() => setMenuOpen(false)}>Portal</Link>
          <a href="#footer" className="py-2 border-b border-slate-50 text-slate-600 hover:text-primary" onClick={() => setMenuOpen(false)}>About Us</a>
          <a href="#footer" className="py-2 text-slate-600 hover:text-primary" onClick={() => setMenuOpen(false)}>Contact</a>
          
          <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 mt-2">
            <FiSearch className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search books, author..." 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="bg-transparent outline-none text-sm w-full" 
            />
          </div>
        </div>
      )}
    </nav>
  );
}
