import { useState, useEffect } from "react";
import { FiActivity, FiUser } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../supabaseClient";

export default function Settings() {
  const sectionOptions = [
    { value: "main", label: "Main Office Bearers" },
    { value: "vice", label: "Vice Presidents" },
    { value: "joint", label: "Joint Secretaries" },
    { value: "trust", label: "Snehasparsham Charitable Trust" },
    { value: "library", label: "Public Library" }
  ];

  const getSectionFromRole = (role) => {
    const normalized = (role || "").toLowerCase();
    if (/vice|vp/.test(normalized)) return "vice";
    if (/joint secretary|js/.test(normalized)) return "joint";
    if (/chairman|convener/.test(normalized)) return "trust";
    if (/librarian|library/.test(normalized)) return "library";
    return "main";
  };

  const defaultCommitteeMembers = [
    { id: 1, section: "main", role: "President", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=President&background=1e293b&color=cbd5e1&size=150" },
    { id: 2, section: "main", role: "Secretary", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=Secretary&background=1e293b&color=cbd5e1&size=150" },
    { id: 3, section: "main", role: "Treasurer", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=Treasurer&background=1e293b&color=cbd5e1&size=150" },
    { id: 4, section: "vice", role: "VP 1", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=VP+1&background=1e293b&color=cbd5e1&size=150" },
    { id: 5, section: "vice", role: "VP 2", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=VP+2&background=1e293b&color=cbd5e1&size=150" },
    { id: 6, section: "joint", role: "JS 1", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=JS+1&background=1e293b&color=cbd5e1&size=150" },
    { id: 7, section: "joint", role: "JS 2", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=JS+2&background=1e293b&color=cbd5e1&size=150" },
    { id: 8, section: "trust", role: "Chairman", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=Chairman&background=1e293b&color=cbd5e1&size=100" },
    { id: 9, section: "trust", role: "Convener", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=Convener&background=1e293b&color=cbd5e1&size=100" },
    { id: 10, section: "trust", role: "Treasurer", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=Treasurer&background=1e293b&color=cbd5e1&size=100" },
    { id: 11, section: "library", role: "President", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=President&background=1e293b&color=cbd5e1&size=100" },
    { id: 12, section: "library", role: "Secretary", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=Secretary&background=1e293b&color=cbd5e1&size=100" },
    { id: 13, section: "library", role: "Librarian", name: "Name Here", imageUrl: "https://ui-avatars.com/api/?name=Librarian&background=1e293b&color=cbd5e1&size=100" }
  ];

  const [committeeMembers, setCommitteeMembers] = useState(defaultCommitteeMembers);

  const defaultMemberCredentials = [
    { id: 1, name: "PYDC Club Member", email: "member@pydc.org", password: "123456", role: "Active Member" }
  ];
  const [memberCredentials, setMemberCredentials] = useState(defaultMemberCredentials);
  const [activeSection, setActiveSection] = useState('committee'); // 'committee' or 'members'
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState("");
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState("");
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState("");
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState("");
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    const storedCloudName = localStorage.getItem("cloudinary_cloud_name") || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
    const storedApiKey = localStorage.getItem("cloudinary_api_key") || import.meta.env.VITE_CLOUDINARY_API_KEY || "";
    const storedApiSecret = localStorage.getItem("cloudinary_api_secret") || import.meta.env.VITE_CLOUDINARY_API_SECRET || "";
    const storedUploadPreset = localStorage.getItem("cloudinary_upload_preset") || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
    setCloudinaryCloudName(storedCloudName);
    setCloudinaryApiKey(storedApiKey);
    setCloudinaryApiSecret(storedApiSecret);
    setCloudinaryUploadPreset(storedUploadPreset);
  }, []);

  useEffect(() => {
    const storedCreds = localStorage.getItem("pydc_member_credentials");
    if (storedCreds) {
      try {
        const parsed = JSON.parse(storedCreds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMemberCredentials(parsed);
        }
      } catch (err) {
        console.warn("Invalid member credentials in localStorage", err);
      }
    }

    const fetchCommitteeMembers = async () => {
      let fallback = null;
      const storedCommittee = localStorage.getItem("pydc_committee_members");
      if (storedCommittee) {
        try { fallback = JSON.parse(storedCommittee); } catch (err) { console.warn("Invalid saved committee data", err); }
      }
      try {
        const { data, error } = await supabase.from("members").select("*").order("id", { ascending: true });
        if (error) throw error;
        if (Array.isArray(data) && data.length > 0) {
          setCommitteeMembers(data.map(member => ({
            id: member.id,
            section: member.section || getSectionFromRole(member.role || ""),
            role: member.role || "Member",
            name: member.name || "Name Here",
            imageUrl: member.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role || "Member")}&background=1e293b&color=cbd5e1&size=150`
          })));
          return;
        }
      } catch (err) {
        console.warn("Failed to load shared committee data", err);
      }
      if (Array.isArray(fallback) && fallback.length > 0) {
        setCommitteeMembers(fallback.map(member => ({
          ...member,
          section: member.section || getSectionFromRole(member.role || ""),
          imageUrl: member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role || "Member")}&background=1e293b&color=cbd5e1&size=150`
        })));
      }
    };
    fetchCommitteeMembers();
  }, []);

  // Committee handlers
  const handleUpdateCommitteeMember = (id, field, value) => {
    setCommitteeMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  const handleAddCommitteeMember = () => {
    const nextId = committeeMembers.length > 0 ? Math.max(...committeeMembers.map(m => m.id)) + 1 : 1;
    setCommitteeMembers(prev => [...prev, { id: nextId, section: "main", role: "Member", name: "Name Here", imageUrl: `https://ui-avatars.com/api/?name=Member+${nextId}&background=1e293b&color=cbd5e1&size=150` }]);
  };
  const handleRemoveCommitteeMember = (id) => {
    const member = committeeMembers.find(m => m.id === id);
    const confirmed = window.confirm(`Are you sure you want to remove committee member "${member?.name || 'this member'}"?`);
    if (confirmed) {
      setCommitteeMembers(prev => prev.filter(m => m.id !== id));
    }
  };
  const handleCommitteeImageUpload = async (id, file) => {
    if (!file) return;
    const cloudName = localStorage.getItem("cloudinary_cloud_name") || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
    const apiKey = localStorage.getItem("cloudinary_api_key") || import.meta.env.VITE_CLOUDINARY_API_KEY || "";
    const apiSecret = localStorage.getItem("cloudinary_api_secret") || import.meta.env.VITE_CLOUDINARY_API_SECRET || "";
    const uploadPreset = localStorage.getItem("cloudinary_upload_preset") || "";
    if (!cloudName) { setUploadError("Cloudinary cloud name is not configured. Please set it in Settings."); return; }
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "pydc_committee_images");
      formData.append("tags", "pydc_committee_images");
      if (apiKey && apiSecret) {
        const timestamp = Math.round(Date.now() / 1000).toString();
        const paramsToSign = { folder: "pydc_committee_images", tags: "pydc_committee_images", timestamp };
        const signatureBase = Object.keys(paramsToSign).sort().map(k => `${k}=${paramsToSign[k]}`).join("&");
        const msgBuffer = new TextEncoder().encode(`${signatureBase}${apiSecret}`);
        const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
      } else if (uploadPreset) {
        formData.append("upload_preset", uploadPreset);
      } else {
        throw new Error("Cloudinary credentials or upload preset are not configured.");
      }
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Cloudinary upload failed.");
      }
      handleUpdateCommitteeMember(id, "imageUrl", data.secure_url);
      setUploadError("");
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
      console.warn("Committee image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };
  const handleSaveCommittee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = committeeMembers.map(m => ({ id: m.id, section: m.section, role: m.role, name: m.name, image_url: m.imageUrl }));
    try {
      const { error } = await supabase.from("members").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      localStorage.setItem("pydc_committee_members", JSON.stringify(committeeMembers));
      setToastMessage("Committee members updated successfully!");
    } catch (err) {
      console.warn("Failed to save shared committee data", err);
      localStorage.setItem("pydc_committee_members", JSON.stringify(committeeMembers));
      setToastMessage("Saved locally only; shared committee storage unavailable.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  // Member credential handlers
  const handleUpdateMemberCred = (id, field, value) => {
    setMemberCredentials(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const handleAddMemberCred = () => {
    const nextId = memberCredentials.length > 0 ? Math.max(...memberCredentials.map(c => c.id)) + 1 : 1;
    setMemberCredentials(prev => [...prev, { id: nextId, name: `Member ${nextId}`, email: `member${nextId}@pydc.org`, password: "123456", role: "Club Member" }]);
  };
  const handleRemoveMemberCred = (id) => {
    const cred = memberCredentials.find(c => c.id === id);
    const confirmed = window.confirm(`Are you sure you want to remove the login account for "${cred?.name || 'this member'}"?`);
    if (confirmed) {
      setMemberCredentials(prev => prev.filter(c => c.id !== id));
    }
  };
  const handleSaveMemberCreds = async (e) => {
    e.preventDefault();
    localStorage.setItem("pydc_member_credentials", JSON.stringify(memberCredentials));
    try {
      await supabase.from("member_credentials").upsert(memberCredentials.map(c => ({ id: c.id, email: c.email, password: c.password, name: c.name, role: c.role, image_url: c.imageUrl })), { onConflict: "id" });
      setToastMessage("Member credentials saved successfully!");
    } catch (err) {
      console.warn("Supabase member sync error (local storage fallback active):", err);
    }
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSaveCloudinaryConfig = (e) => {
    e.preventDefault();
    if (!cloudinaryCloudName.trim()) {
      setSettingsError("Cloudinary cloud name is required.");
      return;
    }

    const setValue = (key, value) => {
      if (value.trim()) {
        localStorage.setItem(key, value.trim());
      } else {
        localStorage.removeItem(key);
      }
    };

    setValue("cloudinary_cloud_name", cloudinaryCloudName);
    setValue("cloudinary_api_key", cloudinaryApiKey);
    setValue("cloudinary_api_secret", cloudinaryApiSecret);
    setValue("cloudinary_upload_preset", cloudinaryUploadPreset);
    setSettingsError("");
    setToastMessage("Cloudinary settings saved.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profileImages, setProfileImages] = useState({});

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

  return (
    <AdminLayout>
      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="w-48 flex flex-col space-y-2">
          <button
            className={`text-left px-3 py-2 rounded ${activeSection === 'committee' ? 'bg-cyan-100 text-cyan-800' : 'bg-white text-slate-800'} transition`}
            onClick={() => setActiveSection('committee')}
          >
            Committee Members
          </button>
          <button
            className={`text-left px-3 py-2 rounded ${activeSection === 'members' ? 'bg-cyan-100 text-cyan-800' : 'bg-white text-slate-800'} transition`}
            onClick={() => setActiveSection('members')}
          >
            Assign Member Logins
          </button>
          <button
            className={`text-left px-3 py-2 rounded ${activeSection === 'cloudinary' ? 'bg-cyan-100 text-cyan-800' : 'bg-white text-slate-800'} transition`}
            onClick={() => setActiveSection('cloudinary')}
          >
            Cloudinary Settings
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 max-w-5xl space-y-8 animate-fadeIn text-xs text-slate-600">
          {toastMessage && (
            <div className="fixed top-6 right-6 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <p className="text-sm font-semibold">{toastMessage}</p>
            </div>
          )}

          {activeSection === 'committee' && (
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <FiActivity className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Committee Members</h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Edit portal committee names, roles, and images</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddCommitteeMember}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  + Add member
                </button>
              </div>

              <form onSubmit={handleSaveCommittee} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {committeeMembers.map(member => (
                    <div key={member.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">{member.role || "Member"}</h4>
                          <p className="text-[10px] text-slate-500">Role shown in portal group labels</p>
                        </div>
                        {committeeMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCommitteeMember(member.id)}
                            className="text-[10px] text-red-600 font-bold uppercase tracking-[0.2em] hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Section</label>
                        <select
                          value={member.section}
                          onChange={e => handleUpdateCommitteeMember(member.id, "section", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                        >
                          {sectionOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Role</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={e => handleUpdateCommitteeMember(member.id, "role", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={e => handleUpdateCommitteeMember(member.id, "name", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Image URL</label>
                        <input
                          type="url"
                          value={member.imageUrl}
                          onChange={e => handleUpdateCommitteeMember(member.id, "imageUrl", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                          placeholder="https://example.com/public-image.jpg"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">Use a public image URL so the profile shows on all devices.</p>
                        <div className="mt-3">
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Upload File to Cloudinary</label>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploading}
                            onChange={e => handleCommitteeImageUpload(member.id, e.target.files?.[0])}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                          />
                          {uploading && <p className="text-[10px] text-blue-600 mt-2">Uploading image to Cloudinary...</p>}
                          {uploadError && <p className="text-[10px] text-red-600 mt-2">{uploadError}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl cursor-pointer text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? "Saving members..." : "Save Committee Members"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'members' && (
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <FiActivity className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Assign Member Logins</h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Manage club member email/password credentials</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddMemberCred}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  + Add member
                </button>
              </div>

              <form onSubmit={handleSaveMemberCreds} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {memberCredentials.map(cred => (
                    <div key={cred.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-200">
                            {profileImages[cred.email] ? (
                              <img src={profileImages[cred.email]} alt={cred.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400">
                                <FiUser className="text-base" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">{cred.name || "Member"}</h4>
                            <p className="text-[10px] text-slate-400">
                              {profileImages[cred.email] ? "📷 Photo uploaded" : "Member login credentials"}
                            </p>
                          </div>
                        </div>
                        {memberCredentials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberCred(cred.id)}
                            className="text-[10px] text-red-600 font-bold uppercase tracking-[0.2em] hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Member Name</label>
                        <input
                          type="text"
                          value={cred.name || ""}
                          onChange={e => handleUpdateMemberCred(cred.id, "name", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                          placeholder="e.g. Rahul Kumar"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={cred.email || ""}
                          onChange={e => handleUpdateMemberCred(cred.id, "email", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                          placeholder="member@pydc.org"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Password</label>
                        <input
                          type="text"
                          value={cred.password || ""}
                          onChange={e => handleUpdateMemberCred(cred.id, "password", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors font-mono"
                          placeholder="Password"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Role / Designation</label>
                        <input
                          type="text"
                          value={cred.role || "Club Member"}
                          onChange={e => handleUpdateMemberCred(cred.id, "role", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                          placeholder="e.g. Executive Member"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer text-sm transition-colors"
                  >
                    Save Member Logins
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'cloudinary' && (
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <FiActivity className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Cloudinary Settings</h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Save Cloudinary values so uploads work across devices</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveCloudinaryConfig} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Cloudinary Cloud Name</label>
                    <input
                      type="text"
                      value={cloudinaryCloudName}
                      onChange={e => setCloudinaryCloudName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                      placeholder="e.g. your-cloud-name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Cloudinary API Key</label>
                    <input
                      type="text"
                      value={cloudinaryApiKey}
                      onChange={e => setCloudinaryApiKey(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                      placeholder="Optional for signed uploads"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Cloudinary API Secret</label>
                    <input
                      type="password"
                      value={cloudinaryApiSecret}
                      onChange={e => setCloudinaryApiSecret(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                      placeholder="Optional for signed uploads"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Cloudinary Upload Preset</label>
                    <input
                      type="text"
                      value={cloudinaryUploadPreset}
                      onChange={e => setCloudinaryUploadPreset(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                      placeholder="Optional for unsigned uploads"
                    />
                    <p className="text-[10px] text-slate-400 mt-2">Use upload preset when API key/secret are not stored in the browser.</p>
                  </div>
                </div>
                {settingsError && <p className="text-[10px] text-red-600">{settingsError}</p>}
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl cursor-pointer text-sm transition-colors"
                  >
                    Save Cloudinary Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
