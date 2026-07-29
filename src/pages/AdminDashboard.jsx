import { Link } from "react-router-dom";
import { 
  FiArchive, 
  FiCheckCircle, 
  FiClock, 
  FiAlertTriangle, 
  FiUserCheck,
  FiXCircle,
  FiCornerDownLeft,
  FiPhone,
  FiMapPin,
  FiUser,
  FiArrowRight,
  FiInfo
} from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function AdminDashboard() {
  const { 
    equipment, 
    borrowers, 
    requests, 
    stats, 
    updateRequestStatus, 
    returnEquipment 
  } = useHelpingHands();

  const getStatusBadge = (status) => {
    switch (status) {
      case "Borrowed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Returned":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Overdue":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getRequestBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // Recent borrow logs (limit to 5)
  const recentBorrows = borrowers.slice(0, 5);

  // Active Pending requests
  const pendingRequests = requests.filter(r => r.status === "Pending");

  // Overdue borrowers list
  const overdueRecords = borrowers.filter(b => b.status === "Overdue" || (b.status === "Borrowed" && b.expected_return_date < new Date().toISOString().split("T")[0]));

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fadeIn">
        
        {/* Metric widgets */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Inventory</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <FiArchive className="text-xl" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Available Now</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{stats.available}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <FiCheckCircle className="text-xl" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Borrowed</p>
              <h3 className="text-3xl font-black text-blue-600 mt-1">{stats.borrowed}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <FiClock className="text-xl" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center justify-between border-l-4 border-l-red-500">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Overdue Alerts</p>
              <h3 className="text-3xl font-black text-red-600 mt-1">{stats.overdue}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0 animate-pulse">
              <FiAlertTriangle className="text-xl" />
            </div>
          </div>

        </section>

        {/* Alerts Grid */}
        {overdueRecords.length > 0 && (
          <section className="bg-red-50/50 border border-red-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-red-800 font-bold mb-4">
              <FiAlertTriangle className="text-lg" />
              <h4>Overdue Equipment Alerts ({overdueRecords.length})</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdueRecords.map(rec => {
                const equip = equipment.find(e => e.id === rec.equipment_id);
                return (
                  <div key={rec.id} className="bg-white border border-red-100 shadow-sm rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-red-600 font-bold tracking-wider uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100">Overdue</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: #BOR-{rec.id}</span>
                      </div>
                      <h5 className="font-bold text-slate-800 mt-2 text-sm">{rec.name}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{equip?.name || 'Medical Equipment'}</p>
                      
                      <div className="text-xs space-y-1 mt-3">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <FiPhone className="text-[10px] text-slate-400" />
                          <span>{rec.phone}</span>
                        </div>
                        <div className="text-red-600 font-medium">
                          Expected Return: {new Date(rec.expected_return_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => returnEquipment(rec.id, new Date().toISOString().split("T")[0], "Returned via overdue alert")}
                        className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
                      >
                        Mark Returned
                      </button>
                      <a
                        href={`tel:${rec.phone}`}
                        className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                        title="Call Borrower"
                      >
                        <FiPhone className="text-xs" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Requests & Borrows Layout Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Citizen Request Logs Approval */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Pending Requests</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Citizen loan submissions</p>
                </div>
                {pendingRequests.length > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {pendingRequests.length} New
                  </span>
                )}
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <FiUserCheck className="text-4xl mx-auto text-slate-200" />
                  <p className="text-xs font-semibold">All requests approved!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(req => {
                    const item = equipment.find(e => e.id === req.equipment_id);
                    return (
                      <div key={req.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs space-y-3">
                        {/* Header: Name + ID */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <FiUser className="text-xs" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">{req.user_name}</h4>
                              <p className="text-[10px] text-slate-400">Submitted request</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-lg">#REQ-{req.id}</span>
                        </div>

                        {/* Contact Details */}
                        <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2 text-slate-600">
                            <FiPhone className="text-slate-400 shrink-0" />
                            <span className="font-semibold">{req.phone || '—'}</span>
                            <a href={`tel:${req.phone}`} className="ml-auto text-blue-600 font-bold hover:underline">Call</a>
                          </div>
                          {req.address && (
                            <div className="flex items-start gap-2 text-slate-600">
                              <FiMapPin className="text-slate-400 shrink-0 mt-0.5" />
                              <span>{req.address}</span>
                            </div>
                          )}
                          {req.patient_name && req.patient_name !== req.user_name && req.patient_name !== 'Same as Borrower' && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <FiUser className="text-slate-400 shrink-0" />
                              <span>Patient: <span className="font-semibold text-slate-700">{req.patient_name}</span></span>
                            </div>
                          )}
                        </div>

                        {/* Equipment + Duration */}
                        <div className="flex items-center justify-between text-[11px] bg-blue-50 border border-blue-100 p-2.5 rounded-xl">
                          <span className="font-bold text-slate-700">{item?.name || 'Medical Equipment'}</span>
                          <span className="text-blue-600 font-bold bg-white border border-blue-200 px-2 py-0.5 rounded-lg">{req.duration || 30} Days</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => updateRequestStatus(req.id, "Approved")}
                            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors text-[11px]"
                          >
                            ✓ Approve Loan
                          </button>
                          <button
                            onClick={() => updateRequestStatus(req.id, "Rejected")}
                            className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-xl font-bold cursor-pointer transition-colors text-[11px]"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link to="/medical/my-requests" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5">
                View All Submitted Requests <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Column 2: Recent Borrow Records */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Recent Borrow Records</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Active equipment rentals history</p>
                </div>
                <Link to="/medical/admin/borrow" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  New Entry <FiArrowRight />
                </Link>
              </div>

              {recentBorrows.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <FiInfo className="text-4xl mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-semibold">No borrow records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3">Borrower / Patient</th>
                        <th className="pb-3">Equipment</th>
                        <th className="pb-3">Borrow Date</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {recentBorrows.map(rec => {
                        const equip = equipment.find(e => e.id === rec.equipment_id);
                        return (
                          <tr key={rec.id} className="text-slate-600">
                            <td className="py-3.5 pr-2">
                              <p className="font-bold text-slate-800">{rec.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Patient: {rec.patient_name}</p>
                            </td>
                            <td className="py-3.5 pr-2 font-semibold text-slate-700">{equip?.name || 'Equipment'}</td>
                            <td className="py-3.5 pr-2">{new Date(rec.borrow_date).toLocaleDateString()}</td>
                            <td className="py-3.5 text-right flex items-center justify-end gap-2">
                              {rec.status === "Borrowed" && (
                                <button
                                  onClick={() => returnEquipment(rec.id, new Date().toISOString().split("T")[0], "Returned early from dashboard")}
                                  className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition-colors rounded-lg text-[10px] font-bold border border-green-200 cursor-pointer"
                                  title="Mark Returned"
                                >
                                  Mark Returned
                                </button>
                              )}
                              <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(rec.status)}`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link to="/medical/admin/return" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5">
                Manage Asset Returns & History <FiArrowRight />
              </Link>
            </div>
          </div>

        </section>

      </div>
    </AdminLayout>
  );
}
