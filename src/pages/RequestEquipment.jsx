import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FiFileText, FiCheckCircle, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import PublicLayout from "../components/PublicLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function RequestEquipment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { equipment, addRequest, loading } = useHelpingHands();

  const preselectedId = searchParams.get("eqId") || "";

  // Form states
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [patientName, setPatientName] = useState("");
  const [equipmentId, setEquipmentId] = useState(preselectedId);
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRequestId, setNewRequestId] = useState(null);

  useEffect(() => {
    if (preselectedId) {
      setEquipmentId(preselectedId);
    }
  }, [preselectedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !phone.trim() || !equipmentId) {
      alert("Please fill in all required fields (Name, Phone, Equipment)!");
      return;
    }
    setSubmitting(true);

    try {
      const requestPayload = {
        user_name: userName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        patient_name: patientName.trim() || "Same as Borrower",
        equipment_id: parseInt(equipmentId),
        duration: parseInt(duration),
        notes: notes.trim()
      };

      const result = await addRequest(requestPayload);
      if (result) {
        setNewRequestId(result.id);
        setFormSubmitted(true);
      }
    } catch (err) {
      console.error("Failed to submit equipment request:", err);
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Find selected item metadata for receipt screen
  const selectedItem = equipment.find(e => e.id === parseInt(equipmentId));

  return (
    <PublicLayout>
      <div className="flex-1 max-w-2xl mx-auto px-6 md:px-10 py-8 w-full">
        {/* Back Link */}
        <Link 
          to="/medical/equipment" 
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors border border-slate-200 bg-white rounded-xl px-3 py-1.5 shadow-sm"
        >
          <FiArrowLeft className="mr-1" /> View Catalog
        </Link>

        {formSubmitted ? (
          /* SUCCESS SCREEN */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center animate-fadeIn space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto">
              ✅
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800">Request Sent!</h2>
              <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">
                Your request has been sent to the admin.<br />
                <span className="font-semibold text-slate-700">They will call you back shortly.</span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 max-w-xs mx-auto">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Equipment Requested</p>
              <p className="font-bold text-slate-800">{selectedItem?.name || 'Medical Equipment'}</p>
            </div>

            <button
              onClick={() => {
                setFormSubmitted(false);
                setUserName("");
                setPhone("");
                setAddress("");
                setPatientName("");
                setNotes("");
                setEquipmentId("");
              }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-md"
            >
              Request Another Item
            </button>
          </div>
        ) : (
          /* FORM SCREEN */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FiFileText className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Request Equipment</h2>
                <p className="text-xs text-slate-400 mt-0.5">Please provide borrower and patient information.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="Enter contact number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Delivery Address</label>
                <textarea
                  placeholder="Enter complete residential address for delivery"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                ></textarea>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Patient Name (If different)</label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Select Equipment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Equipment <span className="text-red-500">*</span></label>
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

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Duration Needed <span className="text-red-500">*</span></label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors"
                  required
                >
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Additional Note (Optional)</label>
                <textarea
                  placeholder="Provide diagnosis, prescription notes, or requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-center shadow-md shadow-blue-600/10 cursor-pointer text-sm"
                >
                  {submitting ? "Submitting Application..." : "Submit Request Application"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
