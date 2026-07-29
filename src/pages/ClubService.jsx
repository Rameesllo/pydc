import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiSearch, 
  FiActivity, 
  FiInfo, 
  FiCheckCircle, 
  FiClock, 
  FiDatabase,
  FiUser,
  FiMapPin,
  FiGrid,
  FiTag,
  FiCalendar,
  FiCpu
} from "react-icons/fi";
import { supabase } from "../supabaseClient";
import { equipment as fallbackEquipment } from "../data/equipment";

// Fallback members for checkout dropdown
const initialLocalMembers = [
  { id: 1, name: "Yasir Arafath", phone: "+91 9876543210", email: "yasir@pydc.org" },
  { id: 2, name: "Fathima Riba", phone: "+91 9876543211", email: "riba@pydc.org" },
  { id: 3, name: "Adil Nandan", phone: "+91 9876543212", email: "nandan@pydc.org" }
];

export default function ClubService() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  
  // Members & Checkouts
  const [members, setMembers] = useState(initialLocalMembers);
  const [checkouts, setCheckouts] = useState([]);
  
  // Active Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [checkoutDate, setCheckoutDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Equipment
      try {
        const { data: equipData, error: equipError } = await supabase
          .from("equipment")
          .select("*")
          .order("id", { ascending: true });

        if (equipError) throw equipError;

        if (equipData && equipData.length > 0) {
          setItems(equipData);
        } else {
          setItems(fallbackEquipment);
        }
      } catch (err) {
        console.warn("Failed to fetch equipment from Supabase, falling back to local mock data:", err?.message || err);
        setItems(fallbackEquipment);
      }

      // 2. Fetch Members (for checkout dropdowns)
      try {
        const { data: membersData } = await supabase
          .from("members")
          .select("*")
          .order("name", { ascending: true });
        if (membersData && membersData.length > 0) {
          setMembers(membersData);
        }
      } catch (e) {
        console.warn("Using offline fallback members list:", e?.message || e);
      }

      // 3. Fetch checkouts
      try {
        const { data: checkoutsData } = await supabase
          .from("equipment_checkouts")
          .select("*, members(name)")
          .eq("status", "Borrowed");
        if (checkoutsData) {
          setCheckouts(checkoutsData);
        }
      } catch (e) {
        console.warn("Offline checkouts status fallback:", e?.message || e);
      }
    } catch (globalErr) {
      console.error("Global fetch error in ClubService:", globalErr);
      setItems(fallbackEquipment);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats calculation
  const totalCount = items.length;
  const availableCount = items.filter(i => i.status === "Available").length;
  const borrowedCount = items.filter(i => i.status === "Borrowed" || i.status === "Reserved").length;

  // Filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.serial_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "All" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Display types
  const types = ["All", "Board Game", "Sports Equipment", "AV / Electronics"];

  // Open item details helper
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Checkout submission
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      alert("Please select a club member!");
      return;
    }
    setSubmitting(true);

    try {
      // 1. Update status in database
      const { error: equipError } = await supabase
        .from("equipment")
        .update({ status: "Borrowed" })
        .eq("id", selectedItem.id);

      // 2. Log checkout entry
      const { error: checkoutError } = await supabase
        .from("equipment_checkouts")
        .insert([{
          member_id: parseInt(selectedMemberId),
          equipment_id: selectedItem.id,
          checkout_date: checkoutDate,
          status: "Borrowed"
        }]);

      if (equipError || checkoutError) throw (equipError || checkoutError);

      setToastMessage(`"${selectedItem.name}" has been successfully checked out!`);
      setShowCheckoutModal(false);
      setSelectedItem(null);
      fetchData();
      setTimeout(() => setToastMessage(""), 4000);
    } catch (err) {
      console.warn("Offline fallback checkout performed", err.message);
      
      // Fallback local update
      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: "Borrowed" } : i));
      setToastMessage(`[Local Fallback] "${selectedItem.name}" marked as Borrowed in browser memory!`);
      setShowCheckoutModal(false);
      setSelectedItem(null);
      setTimeout(() => setToastMessage(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Return submission
  const handleReturnSubmit = async (itemId, itemName) => {
    setSubmitting(true);
    try {
      // 1. Update equipment status back to 'Available'
      const { error: equipError } = await supabase
        .from("equipment")
        .update({ status: "Available" })
        .eq("id", itemId);

      // 2. Update checkout record if any
      try {
        const { error: chkError } = await supabase
          .from("equipment_checkouts")
          .update({ status: "Returned" })
          .eq("equipment_id", itemId)
          .eq("status", "Borrowed");
      } catch(e) {
        console.warn("Could not write return log to Supabase", e);
      }

      if (equipError) throw equipError;

      setToastMessage(`"${itemName}" is now marked as Available!`);
      setSelectedItem(null);
      fetchData();
      setTimeout(() => setToastMessage(""), 4000);
    } catch (err) {
      console.warn("Offline fallback return performed", err.message);
      
      // Fallback local update
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: "Available" } : i));
      setToastMessage(`[Local Fallback] "${itemName}" marked as Available in browser memory!`);
      setSelectedItem(null);
      setTimeout(() => setToastMessage(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white shadow-sm border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium text-sm border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 shadow-sm"
          >
            <FiArrowLeft /> Back to Portal
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <img 
              src="/pydc_logo.png" 
              alt="PYDC Logo" 
              className="w-8 h-8 object-contain rounded-full bg-slate-100 p-0.5 border border-slate-200"
            />
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-secondary">
              PYDC <span className="text-violet-600 font-extrabold">MEDICAL EQUIPMENT</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            Charity Booking Portal
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-10 py-8">
        
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Medical Equipment</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <FiGrid className="text-xl" />
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Available for Checkout</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">{availableCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FiCheckCircle className="text-xl" />
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Currently Checked Out</p>
              <h3 className="text-3xl font-bold text-amber-600 mt-1">{borrowedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FiClock className="text-xl" />
            </div>
          </div>
        </section>

        {/* Filter & Search Controls */}
        <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedType === t 
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/20" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-80 focus-within:border-violet-400 focus-within:bg-white transition-colors">
            <FiSearch className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, serial no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            />
          </div>
        </section>

        {/* Grid List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white border border-slate-200 shadow-sm rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <FiActivity className="text-slate-300 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No items found</h3>
            <p className="text-slate-500 text-sm mt-1">Try modifying your search query or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Type Badge */}
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                    {item.type}
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm ${
                    item.status === 'Available' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {item.status}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-violet-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono uppercase">Serial: {item.serial_no}</p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FiMapPin className="text-slate-400" />
                        <span>{item.location || 'Not Specified'}</span>
                      </div>
                      {item.publisher && item.publisher !== 'N/A' && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FiCpu className="text-slate-400" />
                          <span>Mfr: {item.publisher}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button 
                      onClick={() => handleItemClick(item)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 cursor-pointer"
                    >
                      <FiInfo className="text-sm" /> Detailed Specifications
                    </button>
                    
                    {item.status === "Available" ? (
                      <button 
                        onClick={() => {
                          setSelectedItem(item);
                          setShowCheckoutModal(true);
                        }}
                        className="btn-primary py-1.5 px-4 text-xs bg-violet-600 hover:bg-violet-700 cursor-pointer"
                      >
                        Checkout
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReturnSubmit(item.id, item.name)}
                        className="py-1.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer transition-colors"
                      >
                        Mark Returned
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Item Details Modal */}
      {selectedItem && !showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row relative">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 bg-slate-100 text-slate-500 hover:bg-slate-200 p-2 rounded-full cursor-pointer transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Image Column */}
            <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-slate-100">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                {selectedItem.type}
              </div>
            </div>

            {/* Right Specifications Column */}
            <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{selectedItem.name}</h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    selectedItem.status === 'Available' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {selectedItem.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Serial: {selectedItem.serial_no}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <FiMapPin />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Storage Location</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedItem.location || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <FiCpu />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manufacturer / Publisher</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedItem.publisher || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <FiCalendar />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acquisition Year</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedItem.year || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
                {selectedItem.status === "Available" ? (
                  <button 
                    onClick={() => setShowCheckoutModal(true)}
                    className="flex-1 btn-primary py-3 bg-violet-600 hover:bg-violet-700 text-sm cursor-pointer shadow-md shadow-violet-600/10 text-center"
                  >
                    Checkout Equipment
                  </button>
                ) : (
                  <button 
                    onClick={() => handleReturnSubmit(selectedItem.id, selectedItem.name)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold cursor-pointer text-center"
                  >
                    Mark Returned
                  </button>
                )}
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-600 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Selection Modal */}
      {showCheckoutModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-8 relative">
            <button 
              onClick={() => {
                setShowCheckoutModal(false);
                setSelectedItem(null);
              }}
              className="absolute top-4 right-4 bg-slate-100 text-slate-500 hover:bg-slate-200 p-2 rounded-full cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Checkout Equipment</h3>
            <p className="text-slate-500 text-xs mb-6">Assigning <span className="font-semibold text-slate-700">"{selectedItem.name}"</span> to a club member.</p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Active Member</label>
                <select 
                  value={selectedMemberId} 
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-500 focus:bg-white"
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Checkout Date</label>
                <input 
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-500 focus:bg-white"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary py-3 bg-violet-600 hover:bg-violet-700 text-sm font-semibold shadow-md shadow-violet-600/10 cursor-pointer text-center"
                >
                  {submitting ? "Processing..." : "Confirm Checkout"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setSelectedItem(null);
                  }}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-12">
        <p>© 2026 Padiyanallur Youth Development Club (PYDC). All rights reserved.</p>
      </footer>
    </div>
  );
}
