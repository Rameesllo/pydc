import { useState } from "react";
import { FiSettings, FiCheckCircle, FiInfo, FiActivity } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { trustInfo as defaultTrustInfo } from "../data/helping_hands";

export default function Settings() {
  const [trustName, setTrustName] = useState(defaultTrustInfo.name);
  const [tagline, setTagline] = useState(defaultTrustInfo.tagline);
  const [phone, setPhone] = useState(defaultTrustInfo.phone);
  const [email, setEmail] = useState(defaultTrustInfo.email);
  const [address, setAddress] = useState(defaultTrustInfo.address);

  // Profile states
  const [adminName, setAdminName] = useState("Helping Hands Admin");
  const [adminEmail, setAdminEmail] = useState("pydc@gmail.com");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Cloudinary Config states
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(
    localStorage.getItem("cloudinary_cloud_name") || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ""
  );
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState(
    localStorage.getItem("cloudinary_api_key") || import.meta.env.VITE_CLOUDINARY_API_KEY || ""
  );
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState(
    localStorage.getItem("cloudinary_api_secret") || import.meta.env.VITE_CLOUDINARY_API_SECRET || ""
  );
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(
    localStorage.getItem("cloudinary_upload_preset") || ""
  );

  const [toastMessage, setToastMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSaveCloudinary = (e) => {
    e.preventDefault();
    setSubmitting(true);
    localStorage.setItem("cloudinary_cloud_name", cloudinaryCloudName.trim());
    localStorage.setItem("cloudinary_api_key", cloudinaryApiKey.trim());
    localStorage.setItem("cloudinary_api_secret", cloudinaryApiSecret.trim());
    localStorage.setItem("cloudinary_upload_preset", cloudinaryUploadPreset.trim());
    setTimeout(() => {
      setToastMessage("✅ Cloudinary API configuration saved! Image uploads are now enabled.");
      setSubmitting(false);
      setTimeout(() => setToastMessage(""), 5000);
    }, 600);
  };

  const handleSaveTrust = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setToastMessage("Trust organization profile updated successfully!");
      setSubmitting(false);
      setTimeout(() => setToastMessage(""), 4000);
    }, 600);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setToastMessage("Admin account settings saved!");
      setSubmitting(false);
      setTimeout(() => setToastMessage(""), 4000);
    }, 600);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setToastMessage("Admin password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSubmitting(false);
      setTimeout(() => setToastMessage(""), 4000);
    }, 800);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-xs text-slate-600">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-6 right-6 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
            <p className="text-sm font-semibold">{toastMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Trust Profile Setup */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FiSettings className="text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Trust Configuration</h3>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">NGO Information settings</p>
              </div>
            </div>

            <form onSubmit={handleSaveTrust} className="space-y-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">NGO Trust Name</label>
                <input
                  type="text"
                  value={trustName}
                  onChange={(e) => setTrustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Slogan / Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Headquarters Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer text-sm"
                >
                  {submitting ? "Saving changes..." : "Save Trust Settings"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Profile & Security Setup */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Form 2: Admin profile */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Admin settings</h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer text-xs"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>

            {/* Form 3: Password settings */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Change Password</h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer text-xs"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Form 4: Cloudinary API settings */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800">Cloudinary API Configuration</h3>
                {cloudinaryCloudName && cloudinaryApiKey ? (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FiCheckCircle /> Configured
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FiInfo /> Not Set
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">Configuring Cloudinary allows you to upload equipment images directly to your cloud storage from the Inventory panel. Credentials are pre-loaded from the <code className="bg-slate-100 px-1 rounded">.env</code> file.</p>
              
              <form onSubmit={handleSaveCloudinary} className="space-y-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Cloud Name</label>
                  <input
                    type="text"
                    placeholder="Enter Cloudinary Cloud Name"
                    value={cloudinaryCloudName}
                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">API Key</label>
                  <input
                    type="text"
                    placeholder="Enter Cloudinary API Key"
                    value={cloudinaryApiKey}
                    onChange={(e) => setCloudinaryApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">API Secret</label>
                  <input
                    type="password"
                    placeholder="Enter Cloudinary API Secret"
                    value={cloudinaryApiSecret}
                    onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Upload Preset (Optional/Unsigned)</label>
                  <input
                    type="text"
                    placeholder="Enter Unsigned Upload Preset if using unsigned API"
                    value={cloudinaryUploadPreset}
                    onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer text-xs shadow-md shadow-blue-600/10 transition-colors"
                >
                  Save Cloudinary Settings
                </button>
              </form>
            </div>


          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
