import { useState } from "react";
import { Link } from "react-router-dom";
import { FiFileText, FiClock, FiCheckCircle, FiActivity, FiArrowRight } from "react-icons/fi";
import PublicLayout from "../components/PublicLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function MyRequests() {
  const { requests, equipment, loading } = useHelpingHands();
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Pending", "Approved", "Returned"];

  const filteredRequests = requests.filter(req => {
    if (activeTab === "All") return true;
    return req.status === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Returned":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 max-w-4xl mx-auto px-6 md:px-10 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">My Requests</h2>
          <p className="text-xs text-slate-400 mt-1">Track current loan applications and active returns</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200 max-w-md">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white border border-slate-200 shadow-sm rounded-2xl h-24 animate-pulse"></div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <FiFileText className="text-slate-300 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No requests in this tab</h3>
            <p className="text-slate-500 text-sm mt-1">You haven't submitted any equipment request under this category.</p>
            <Link to="/medical/request" className="btn-primary mt-6 inline-block py-2.5 px-6 font-semibold">
              Submit Loan Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              // Find related equipment details
              const item = equipment.find(e => e.id === req.equipment_id);
              
              return (
                <div 
                  key={req.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Tiny equipment image thumbnail */}
                    {item?.image_url ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-sm">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                        <FiActivity className="text-2xl" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">REQ ID: #REQ-00{req.id}</span>
                      <h4 className="text-sm font-bold text-slate-800 mt-0.5">{item?.name || 'Medical Equipment'}</h4>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Duration:</span>
                          <span>{req.duration} Days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Patient:</span>
                          <span>{req.patient_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Submitted Date</p>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {new Date(req.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
