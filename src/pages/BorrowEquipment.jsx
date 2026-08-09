import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFilePlus, FiUserCheck, FiX, FiCalendar } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function BorrowEquipment() {
  const navigate = useNavigate();
  const { equipment, addBorrower } = useHelpingHands();

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [patientName, setPatientName] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !equipmentId) {
      alert("Please fill in all required fields (Name, Phone, Equipment).");
      return;
    }
    setSubmitting(true);

    let finalReturnDate = expectedReturnDate;
    if (!finalReturnDate) {
      const bDate = new Date(borrowDate);
      bDate.setDate(bDate.getDate() + 30);
      finalReturnDate = bDate.toISOString().split("T")[0];
    }

    try {
      await addBorrower({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        patient_name: patientName.trim() || name.trim(),
        equipment_id: parseInt(equipmentId),
        quantity: parseInt(quantity),
        borrow_date: borrowDate,
        expected_return_date: finalReturnDate,
        notes: notes.trim()
      });
      setSuccess(true);
      
      // Reset form
      setName("");
      setPhone("");
      setAddress("");
      setPatientName("");
      setEquipmentId("");
      setQuantity("1");
      setExpectedReturnDate("");
      setNotes("");

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Checkout failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto animate-fadeIn space-y-6">
        
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold shadow-sm">
            <FiUserCheck className="text-lg animate-bounce" />
            <span>Equipment checkout successful! Available stock has been reduced.</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FiFilePlus className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Borrow Equipment Entry</h2>
              <p className="text-xs text-slate-400 mt-0.5">Register a manual equipment lease checkout for a citizen.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-600">
            {/* Borrower name */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Borrower Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Enter borrower full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Borrower Phone Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Borrower Address</label>
              <textarea
                placeholder="Enter complete residential address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="2.5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              ></textarea>
            </div>

            {/* Patient Name */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Patient Name (If different)</label>
              <input
                type="text"
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Equipment Selection */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Equipment to Checkout <span className="text-red-500">*</span></label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors"
                required
              >
                <option value="">-- Choose Equipment --</option>
                {equipment.map((e) => (
                  <option 
                    key={e.id} 
                    value={e.id}
                    disabled={e.available_stock <= 0}
                  >
                    {e.name} ({e.available_stock > 0 ? `Stock: ${e.available_stock}` : 'Out of Stock'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Quantity <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Borrow Date</label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Expected Return Date</label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Internal Staff Notes</label>
              <textarea
                placeholder="Details of physical condition, reference letters, etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center shadow-md shadow-blue-600/10 cursor-pointer text-sm"
              >
                {submitting ? "Processing Checkout..." : "Register Borrow Checkout"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="px-6 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
