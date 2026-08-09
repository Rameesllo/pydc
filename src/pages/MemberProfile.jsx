import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiMail, FiShield, FiCalendar, FiCamera, FiLogOut, FiSave } from "react-icons/fi";
import { supabase } from "../supabaseClient";

export default function MemberProfile() {
  const navigate = useNavigate();
  const [memberSession, setMemberSession] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("pydc_member_session");
    if (!savedSession) {
      navigate("/member-login");
      return;
    }
    try {
      const parsed = JSON.parse(savedSession);
      if (!parsed.isMember) {
        navigate("/");
        return;
      }
      setMemberSession(parsed);

      // Fetch profile details & image from Supabase
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("member_credentials")
          .select("image_url")
          .eq("email", parsed.email)
          .maybeSingle();
        if (!error && data?.image_url) {
          setProfileImage(data.image_url);
        }
        setLoading(false);
      };
      fetchProfile();
    } catch (err) {
      console.warn("Invalid session", err);
      navigate("/member-login");
    }
  }, [navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setProfileImage(base64);
      setSaving(true);
      try {
        const { error } = await supabase
          .from("member_credentials")
          .update({ image_url: base64 })
          .eq("email", memberSession.email);
        if (error) throw error;
        setToast("Profile photo updated successfully!");
      } catch (err) {
        console.error("Failed to upload photo", err);
        setToast("Failed to save photo in cloud.");
      } finally {
        setSaving(false);
        setTimeout(() => setToast(""), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("pydc_member_session");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 animate-fadeIn">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-xs font-bold">{toast}</p>
        </div>
      )}

      {/* Header Back Button */}
      <div className="max-w-xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-2.5 transition-all shadow-sm"
        >
          <FiArrowLeft className="mr-1.5 text-sm" /> Return to Home
        </Link>
      </div>

      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-6">
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Member Portal</p>
          
          {/* Avatar Area */}
          <div className="relative w-28 h-28 mx-auto group">
            <div className="w-full h-full rounded-full border-[3px] border-slate-200 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="text-4xl text-slate-400" />
              )}
            </div>
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow hover:bg-blue-500 transition-colors cursor-pointer"
              title="Change photo"
              disabled={saving}
            >
              <FiCamera className="text-sm" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-800">{memberSession.name}</h2>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mt-1.5">
              {memberSession.role}
            </span>
          </div>

          {/* Read-Only Member Information Details */}
          <div className="space-y-3.5 pt-4 text-left">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">Personal Details (Read Only)</h4>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <FiMail className="text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-xs text-slate-700 font-bold truncate">{memberSession.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <FiShield className="text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Designation / Role</p>
                <p className="text-xs text-slate-700 font-bold">{memberSession.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                <FiCalendar className="text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Session Active Since</p>
                <p className="text-xs text-slate-700 font-bold">
                  {memberSession.loggedInAt ? new Date(memberSession.loggedInAt).toLocaleString("en-IN") : "Now"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-left text-[11px] text-slate-500 leading-relaxed">
            💡 <span className="font-bold text-slate-700">Security notice:</span> Your login credentials (email, password, and designation) are managed by the club administrators. If you need to make changes, please contact the PYDC Admin team.
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiLogOut className="text-sm" /> Sign Out from This Device
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
