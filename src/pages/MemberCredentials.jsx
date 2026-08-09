import { useState, useEffect } from "react";
import { FiKey, FiUser } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../supabaseClient";

export default function MemberCredentials() {
  const defaultMemberCredentials = [
    { id: 1, name: "PYDC Club Member", email: "member@pydc.org", password: "123456", role: "Active Member" }
  ];

  const [memberCredentials, setMemberCredentials] = useState(defaultMemberCredentials);
  const [toastMessage, setToastMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profileImages, setProfileImages] = useState({});

  // Load profile images uploaded by members from localStorage
  useEffect(() => {
    const images = {};
    memberCredentials.forEach((cred) => {
      if (cred.email) {
        const img = localStorage.getItem(`pydc_profile_img_${cred.email}`);
        if (img) images[cred.email] = img;
      }
    });
    setProfileImages(images);
  }, [memberCredentials]);

  // Load member profile images from Supabase/Local
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const { data, error } = await supabase.from("member_credentials").select("*");
        if (!error && Array.isArray(data)) {
          const images = {};
          const creds = data.map(d => {
            if (d.email && d.image_url) {
              images[d.email] = d.image_url;
            }
            return {
              id: d.id,
              email: d.email,
              password: d.password,
              name: d.name,
              role: d.role,
              imageUrl: d.image_url
            };
          });
          setMemberCredentials(creds);
          setProfileImages(images);
        }
      } catch (err) {
        console.warn("Failed to load member credentials", err);
      }
    };
    fetchCredentials();
  }, []);

  const handleUpdateMemberCred = (id, field, value) => {
    setMemberCredentials((prev) => prev.map((cred) => cred.id === id ? { ...cred, [field]: value } : cred));
  };

  const handleAddMemberCred = () => {
    const nextId = memberCredentials.length > 0 ? Math.max(...memberCredentials.map(c => c.id)) + 1 : 1;
    setMemberCredentials((prev) => [
      ...prev,
      { id: nextId, name: `Member ${nextId}`, email: `member${nextId}@pydc.org`, password: "123456", role: "Club Member" }
    ]);
  };

  const handleRemoveMemberCred = (id) => {
    const cred = memberCredentials.find(c => c.id === id);
    const confirmed = window.confirm(`Are you sure you want to remove the login account for "${cred?.name || 'this member'}"?`);
    if (confirmed) {
      setMemberCredentials((prev) => prev.filter((cred) => cred.id !== id));
    }
  };

  const handleSaveMemberCreds = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    localStorage.setItem("pydc_member_credentials", JSON.stringify(memberCredentials));
    try {
      await supabase.from("member_credentials").upsert(
        memberCredentials.map(c => ({ id: c.id, email: c.email, password: c.password, name: c.name, role: c.role, image_url: c.imageUrl })),
        { onConflict: "id" }
      );
      setToastMessage("Member credentials saved successfully!");
    } catch (err) {
      console.warn("Supabase member sync error (local storage fallback active):", err);
      setToastMessage("Saved locally; sync failed.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-xs text-slate-600">
        {toastMessage && (
          <div className="fixed top-6 right-6 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <p className="text-sm font-semibold">{toastMessage}</p>
          </div>
        )}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <FiKey className="text-xl" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Club Member Login Accounts</h3>
          </div>
          <form onSubmit={handleSaveMemberCreds} className="space-y-4">
            <button type="button" onClick={handleAddMemberCred} className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-lg hover:bg-cyan-200 transition">
              + Add Account
            </button>
            {memberCredentials.map((cred) => (
              <div key={cred.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
                {/* Member avatar + name row */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-200">
                    {profileImages[cred.email] ? (
                      <img src={profileImages[cred.email]} alt={cred.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400">
                        <FiUser className="text-lg" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{cred.name || "Unnamed Member"}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {profileImages[cred.email] ? "📷 Photo uploaded by member" : "No photo uploaded yet"}
                    </p>
                  </div>
                </div>
                {/* Fields grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Name</label>
                    <input type="text" value={cred.name} onChange={e => handleUpdateMemberCred(cred.id, "name", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email</label>
                    <input type="email" value={cred.email} onChange={e => handleUpdateMemberCred(cred.id, "email", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Password</label>
                    <input type="text" value={cred.password} onChange={e => handleUpdateMemberCred(cred.id, "password", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Role</label>
                    <input type="text" value={cred.role} onChange={e => handleUpdateMemberCred(cred.id, "role", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                  </div>
                </div>
                <button type="button" onClick={() => handleRemoveMemberCred(cred.id)} className="text-red-500 hover:text-red-700 text-[11px] font-bold hover:underline transition-colors">
                  ✕ Remove Account
                </button>
              </div>
            ))}
            <div className="flex justify-end">
              <button type="submit" disabled={submitting} className="px-5 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition disabled:opacity-50">
                {submitting ? "Saving..." : "Save Credentials"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
