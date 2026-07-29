import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiSearch, 
  FiActivity, 
  FiHeart, 
  FiCheckCircle, 
  FiClock, 
  FiCornerDownLeft,
  FiArrowRight
} from "react-icons/fi";
import PublicLayout from "../components/PublicLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { equipment, stats, loading } = useHelpingHands();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medical/equipment?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: "Wheelchairs" },
    { name: "Oxygen" },
    { name: "Hospital Beds" },
    { name: "Nebulizers" },
    { name: "Walkers" },
    { name: "Others" }
  ];

  const popularItems = equipment;

  // Auto-slide effect for the hero banner
  useEffect(() => {
    if (popularItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % popularItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [popularItems]);

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <section className="bg-white px-5 md:px-10 py-6 md:py-16 border-b border-slate-100 relative">
        <div className="max-w-4xl mx-auto flex flex-col items-start text-left space-y-4 md:space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/50 rounded-full px-3 py-1.5 tracking-wider uppercase">
            <img src="/pydc_medical_logo.png" alt="PYDC" className="w-5 h-5 object-contain rounded-full" />
            PYDC Charity Trust
          </span>
          
          <h2 className="w-full text-center text-4xl md:text-6xl font-black text-slate-800 leading-tight" style={{ fontFamily: "'Noto Sans Malayalam', sans-serif" }}>
              നവയൗവനം <br />
              <span className="text-blue-600">ജനനന്മക്ക്</span>
            </h2>

            <p className="text-slate-400 text-sm md:text-base font-medium italic tracking-wide">
              — New Youth for Public Welfare
            </p>

            {/* Mobile/Desktop Integrated Search Input */}
            <div className="relative w-full md:max-w-sm">
              <form onSubmit={handleSearchSubmit} className="flex gap-1.5 w-full bg-slate-50 p-1 md:p-2 border border-slate-200 rounded-xl md:rounded-2xl shadow-sm focus-within:border-blue-500 focus-within:bg-white transition-all">
                <div className="flex-1 flex items-center px-2 md:px-3">
                  <FiSearch className="text-slate-400 text-sm md:text-lg mr-1.5 md:mr-2" />
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none py-1 md:py-2 text-[11px] md:text-sm text-slate-700 placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-semibold text-[11px] md:text-sm px-4 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Live Autocomplete Dropdown */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {(() => {
                    const filtered = equipment.filter(e => 
                      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      e.category.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="px-4 py-3 text-sm text-slate-500 text-center">
                          No matching equipment found.
                        </div>
                      );
                    }

                    return (
                      <ul className="max-h-60 overflow-y-auto py-2">
                        {filtered.map(item => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery(item.name);
                                navigate(`/medical/equipment?search=${encodeURIComponent(item.name)}`);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between group transition-colors cursor-pointer border-l-2 border-transparent hover:border-blue-500"
                            >
                              <div>
                                <p className="text-[13px] md:text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{item.name}</p>
                                <p className="text-[10px] md:text-xs text-slate-400 font-medium">{item.category}</p>
                              </div>
                              <FiArrowRight className="text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
      </section>

      {/* Featured Equipment Slider */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-5 md:py-8 w-full">
        {popularItems.length > 0 && (
          <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-100 group bg-slate-900">
            {/* Sliding Track */}
            <div 
              className="flex w-full h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {popularItems.map((item) => (
                <div 
                  key={item.id}
                  className="w-full h-full shrink-0 relative bg-white flex items-center justify-center"
                >
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/800x400?text=No+Image'} 
                    alt={item.name}
                    className="w-full h-full object-contain p-6"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white w-full">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-200 bg-blue-900/60 px-2 py-1 rounded-md backdrop-blur-sm">
                      {item.category}
                    </span>
                    <h3 className="text-lg md:text-2xl font-bold mt-2 leading-tight">
                      {item.name}
                    </h3>
                    <div className="mt-2 text-sm text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.available_stock > 0 ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                        {item.available_stock > 0 ? "Available Now" : "Currently Borrowed"}
                      </span>
                      <Link to={`/medical/equipment/${item.id}`} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold shadow-lg">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Slider Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {popularItems.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'bg-white w-4' : 'bg-white/40 w-1.5'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </section>


      {/* Equipment Categories — horizontal scrollable flex row */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-4 md:py-6 w-full">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm md:text-base font-bold text-slate-800">Browse by Category</h3>
          <Link to="/medical/equipment" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0">
            View All <FiArrowRight />
          </Link>
        </div>

        {/* Horizontal pill row — no wrap, scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/medical/equipment?category=${encodeURIComponent(cat.name)}`}
              className="shrink-0 bg-white border border-slate-200 hover:border-blue-500/50 hover:bg-blue-50 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>


      {/* Popular Equipment List */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-8 w-full mb-12">
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-bold text-slate-800">Popular Equipment</h3>
          <p className="text-xs text-slate-400 mt-1">Most requested support gear ready for pickup</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white border border-slate-200 shadow-sm rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image */}
                <div className="h-44 bg-white relative overflow-hidden shrink-0 flex items-center justify-center p-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                  />
                  <div className="absolute top-3 left-3 text-[9px] uppercase font-bold tracking-widest text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                    {item.category}
                  </div>
                  
                  {/* Stock status badge */}
                  <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                    item.available_stock > 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {item.available_stock > 0 ? 'Available' : 'Out of Stock'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
                      Available: <span className="font-bold text-slate-700">{item.available_stock}</span> / {item.total_stock}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link 
                      to={`/medical/equipment/${item.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Details <FiArrowRight />
                    </Link>
                    {item.available_stock > 0 ? (
                      <Link 
                        to={`/medical/request?eqId=${item.id}`}
                        className="bg-blue-600 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Request
                      </Link>
                    ) : (
                      <button 
                        disabled
                        className="bg-slate-100 text-slate-400 text-[11px] font-semibold py-1.5 px-3 rounded-lg cursor-not-allowed"
                      >
                        Out of stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-400 shrink-0">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="font-bold text-slate-700">Helping Hands Charity Trust (Reg. No. NGO-2026-Chennai)</p>
          <p>Address: Near Central Library, Padiyanallur, Chennai - 600052</p>
          <p className="pt-2">© 2026 PYDC Trust. All rights reserved.</p>
        </div>
      </footer>
    </PublicLayout>
  );
}
