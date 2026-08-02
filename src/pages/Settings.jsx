import { useState, useEffect } from "react";
import { FiActivity } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";

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

  useEffect(() => {
    const storedCommittee = localStorage.getItem("pydc_committee_members");
    if (storedCommittee) {
      try {
        const parsed = JSON.parse(storedCommittee);
        if (Array.isArray(parsed) && parsed.length) {
          setCommitteeMembers(parsed.map((member) => ({
            ...member,
            section: member.section || getSectionFromRole(member.role || ""),
            imageUrl: member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role || "Member")}&background=1e293b&color=cbd5e1&size=150`
          })));
        }
      } catch (err) {
        console.warn("Unable to load committee settings", err);
      }
    }
  }, []);

  const handleUpdateCommitteeMember = (id, field, value) => {
    setCommitteeMembers((prev) => prev.map((member) => member.id === id ? { ...member, [field]: value } : member));
  };

  const handleCommitteeImageFileChange = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleUpdateCommitteeMember(id, "imageUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCommitteeMember = () => {
    const nextId = committeeMembers.length > 0 ? Math.max(...committeeMembers.map((m) => m.id)) + 1 : 1;
    setCommitteeMembers((prev) => [
      ...prev,
      {
        id: nextId,
        role: "Member",
        name: "Name Here",
        imageUrl: `https://ui-avatars.com/api/?name=Member+${nextId}&background=1e293b&color=cbd5e1&size=150`
      }
    ]);
  };

  const handleRemoveCommitteeMember = (id) => {
    setCommitteeMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const [toastMessage, setToastMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSaveCommittee = (e) => {
    e.preventDefault();
    setSubmitting(true);
    localStorage.setItem("pydc_committee_members", JSON.stringify(committeeMembers));
    setTimeout(() => {
      setToastMessage("Committee members updated successfully!");
      setSubmitting(false);
      setTimeout(() => setToastMessage(""), 4000);
    }, 600);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn text-xs text-slate-600">

        {toastMessage && (
          <div className="fixed top-6 right-6 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <p className="text-sm font-semibold">{toastMessage}</p>
          </div>
        )}

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
              {committeeMembers.map((member) => (
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
                      onChange={(e) => handleUpdateCommitteeMember(member.id, "section", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                    >
                      {sectionOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Role</label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleUpdateCommitteeMember(member.id, "role", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleUpdateCommitteeMember(member.id, "name", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Upload Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCommitteeImageFileChange(member.id, e.target.files[0])}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
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
      </div>
    </AdminLayout>
  );
}
