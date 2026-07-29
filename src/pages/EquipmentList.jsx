import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch, FiGrid, FiArrowRight, FiActivity } from "react-icons/fi";
import PublicLayout from "../components/PublicLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function EquipmentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { equipment, loading } = useHelpingHands();

  const urlCategory = searchParams.get("category") || "All";
  const urlSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All");
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const categories = ["All", "Wheelchairs", "Oxygen", "Hospital Beds", "Nebulizers", "Walkers", "Others"];

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const params = {};
    if (cat !== "All") params.category = cat;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    setSearchParams(params);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const params = {};
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (val.trim()) params.search = val.trim();
    setSearchParams(params);
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PublicLayout>
      <div className="flex-1 max-w-7xl mx-auto px-6 md:px-10 py-8 w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Medical Equipment Catalog</h2>
            <p className="text-xs text-slate-400 mt-1">Check availability and request patient support equipment</p>
          </div>

          {/* Search bar */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-80 shadow-sm focus-within:border-blue-500 transition-colors">
            <FiSearch className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or keyword..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-slate-200 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white border border-slate-200 shadow-sm rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm max-w-lg mx-auto mt-12">
            <FiActivity className="text-slate-300 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No medical gear found</h3>
            <p className="text-slate-500 text-sm mt-1">Try modifying your category filter or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <Link
                key={item.id}
                to={`/medical/equipment/${item.id}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Image & Category badge */}
                <div className="h-48 overflow-hidden bg-white relative shrink-0 flex items-center justify-center p-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                  />
                  <div className="absolute top-4 left-4 text-[9px] uppercase font-bold tracking-widest text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                    {item.category}
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-sm ${
                    item.available_stock > 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {item.available_stock > 0 ? 'Available' : 'Out of Stock'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Inventory Status</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        Available: <span className="text-blue-600">{item.available_stock}</span> / {item.total_stock}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Check Specs <FiArrowRight />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
