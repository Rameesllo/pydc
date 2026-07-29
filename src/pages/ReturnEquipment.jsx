import { useState } from "react";
import { 
  FiCornerDownLeft, 
  FiSearch, 
  FiX,
  FiUser,
  FiPhone, 
  FiMapPin,
  FiCheckCircle,
  FiClock
} from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function ReturnEquipment() {
  const { borrowers, equipment, returnEquipment, loading } = useHelpingHands();

  // Search & Modal States
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [returnedBy, setReturnedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeRecords = borrowers.filter(b => b.status === "Borrowed" || b.status === "Overdue");
  const returnedRecords = borrowers.filter(b => b.status === "Returned");

  const filteredRecords = activeRecords.filter(b => {
    const equip = equipment.find(e => e.id === b.equipment_id);
    return b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (b.patient_name && b.patient_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
           (equip && equip.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleOpenReturn = (record) => {
    setSelectedRecord(record);
    setReturnDate(new Date().toISOString().split("T")[0]);
    setNotes("Returned in good condition");
    setReturnedBy(""); // force staff to enter their name
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    if (!returnedBy.trim()) {
      alert("Please enter who is submitting / receiving this return.");
      return;
    }
    setSubmitting(true);
    try {
      await returnEquipment(selectedRecord.id, returnDate, notes, returnedBy.trim());
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Return registration failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fadeIn">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Return Equipment</h2>
            <p className="text-xs text-slate-400 mt-0.5">Track active loans, log returns, and update stock counts</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              Active Loans: {activeRecords.length}
            </span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              Returned: {returnedRecords.length}
            </span>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-80 focus-within:border-blue-400 focus-within:bg-white transition-colors">
            <FiSearch className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by borrower, patient, equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">
            Showing {filteredRecords.length} active record{filteredRecords.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Active Loans Grid ── */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl h-64 animate-pulse" />
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <FiCornerDownLeft className="text-slate-300 text-5xl mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-700">No active borrow records</h3>
            <p className="text-slate-500 text-xs mt-1">There are no items currently borrowed or overdue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map(rec => {
              const equip = equipment.find(e => e.id === rec.equipment_id);
              return (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        rec.status === "Overdue"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {rec.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">#BOR-{rec.id}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{rec.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Patient: {rec.patient_name}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                      <p className="font-bold text-slate-700">{equip?.name || "Medical Equipment"}</p>
                      <p className="text-slate-400 mt-1">Qty: {rec.quantity || 1}</p>
                    </div>

                    <div className="text-xs space-y-2 text-slate-500">
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-slate-400 shrink-0" />
                        <span>{rec.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FiMapPin className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{rec.address}</span>
                      </div>
                    </div>

                    <div className="pt-2 text-xs border-t border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Borrow Date:</span>
                        <span className="font-semibold">{new Date(rec.borrow_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expected Return:</span>
                        <span className={`font-semibold ${rec.status === "Overdue" ? "text-red-600" : "text-slate-600"}`}>
                          {new Date(rec.expected_return_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenReturn(rec)}
                    className="w-full mt-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FiCornerDownLeft /> Mark Returned & In-Stock
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Return History Table (with "Returned By" column) ── */}
        {returnedRecords.length > 0 && (
          <section className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FiCheckCircle />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Return History</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">
                  {returnedRecords.length} completed return{returnedRecords.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Borrower / Patient</th>
                    <th className="px-5 py-3.5">Equipment</th>
                    <th className="px-5 py-3.5">Borrow Date</th>
                    <th className="px-5 py-3.5">Returned On</th>
                    {/* ✅ THE "WHO SUBMITTED IT" COLUMN */}
                    <th className="px-5 py-3.5 text-blue-600">Returned By</th>
                    <th className="px-5 py-3.5">Condition Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {returnedRecords.map(rec => {
                    const equip = equipment.find(e => e.id === rec.equipment_id);
                    
                    let returnedBy = rec.returned_by;
                    let displayNotes = rec.notes || "—";
                    
                    if (!returnedBy && rec.notes && rec.notes.includes("(Returned By: ")) {
                      const match = rec.notes.match(/\(Returned By: (.*?)\)/);
                      if (match) {
                        returnedBy = match[1];
                        displayNotes = rec.notes.replace(/\n?\(Returned By: .*?\)/, "").trim() || "—";
                      }
                    }

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400">#BOR-{rec.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-800">{rec.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Patient: {rec.patient_name}</p>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-700">
                          {equip?.name || "Medical Equipment"}
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">Qty: {rec.quantity || 1}</p>
                        </td>
                        <td className="px-5 py-3.5">{new Date(rec.borrow_date).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          {rec.actual_return_date
                            ? new Date(rec.actual_return_date).toLocaleDateString()
                            : <span className="text-slate-300">—</span>}
                        </td>
                        {/* ✅ Returned By value */}
                        <td className="px-5 py-3.5">
                          {returnedBy ? (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-[10px] font-bold">
                              <FiUser className="text-blue-500" />
                              {returnedBy}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 max-w-[180px] truncate" title={displayNotes}>
                          {displayNotes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── RETURN MODAL ── */}
        {showModal && selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden p-8 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-slate-100 text-slate-500 hover:bg-slate-200 p-2 rounded-full cursor-pointer transition-colors"
              >
                <FiX />
              </button>

              <h3 className="text-lg font-bold text-slate-800 mb-1">Register Return</h3>
              <p className="text-slate-400 text-xs mb-6">Confirm equipment return and restore stock.</p>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Borrower summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-700">{selectedRecord.name}</p>
                  <p className="text-slate-400 text-[11px]">
                    Returning: <strong>{equipment.find(e => e.id === selectedRecord.equipment_id)?.name || "Medical Gear"}</strong>
                  </p>
                  <p className="text-slate-400 text-[11px]">Qty: {selectedRecord.quantity || 1}</p>
                </div>

                {/* ✅ Returned By — required */}
                <div>
                  <label className="block text-slate-500 font-bold uppercase tracking-wider mb-2">
                    Received / Submitted By <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FiUser className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Staff / volunteer name..."
                      value={returnedBy}
                      onChange={(e) => setReturnedBy(e.target.value)}
                      className="w-full pl-9 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Person who physically accepted and checked the returned item</p>
                </div>

                {/* Return date */}
                <div>
                  <label className="block text-slate-500 font-bold uppercase tracking-wider mb-2">Actual Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-500 font-bold uppercase tracking-wider mb-2">Condition / Notes</label>
                  <textarea
                    placeholder="E.g. Cleaned, fully functional, minor scratch..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-colors"
                  >
                    {submitting ? "Saving..." : "Confirm Return"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
