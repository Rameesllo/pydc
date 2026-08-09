import { useState } from "react";
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiArchive, 
  FiX, 
  FiCamera,
  FiActivity,
  FiCheckCircle 
} from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function EquipmentManagement() {
  const { 
    equipment, 
    addEquipment, 
    editEquipment, 
    deleteEquipment, 
    loading 
  } = useHelpingHands();

  // Modal and form states
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cloudinary upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Wheelchairs");
  const [description, setDescription] = useState("");
  const [totalStock, setTotalStock] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [album, setAlbum] = useState("pydc_equipment");

  const categories = ["Wheelchairs", "Oxygen", "Hospital Beds", "Nebulizers", "Walkers", "Others"];

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Retrieve Cloudinary Config
    const cloudName = localStorage.getItem("cloudinary_cloud_name") || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
    const apiKey = localStorage.getItem("cloudinary_api_key") || import.meta.env.VITE_CLOUDINARY_API_KEY || "";
    const apiSecret = localStorage.getItem("cloudinary_api_secret") || import.meta.env.VITE_CLOUDINARY_API_SECRET || "";
    const uploadPreset = localStorage.getItem("cloudinary_upload_preset") || "";
    
    // Require Cloudinary config for shared public image URLs
    if (!cloudName) {
      setUploadError("Cloudinary Cloud Name is not configured. Set it in Settings.");
      return;
    }

    setUploading(true);
    setUploadError("");
    
    const formData = new FormData();
    formData.append("file", file);
    const cloudFolder = album?.trim() || "pydc_equipment";
    formData.append("folder", cloudFolder);
    formData.append("tags", cloudFolder);
    
    try {
      // Determine if signed or unsigned upload
      if (apiKey && apiSecret) {
        // SIGNED UPLOAD (Web Crypto API signature helper)
        const timestamp = Math.round(new Date().getTime() / 1000).toString();
        const paramsToSign = {
          folder: cloudFolder,
          tags: cloudFolder,
          timestamp,
        };
        const signatureBase = Object.keys(paramsToSign)
          .sort()
          .map((key) => `${key}=${paramsToSign[key]}`)
          .join('&');
        const msgBuffer = new TextEncoder().encode(`${signatureBase}${apiSecret}`);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
      } else if (uploadPreset) {
        // UNSIGNED UPLOAD
        formData.append("upload_preset", uploadPreset);
      } else {
        throw new Error("Neither Cloudinary credentials (API Key/Secret) nor Unsigned Upload Preset are configured in Settings.");
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || "Cloudinary API responded with an error.");
      }
      
      const data = await response.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        setUploadError("");
      } else {
        throw new Error("Invalid Cloudinary upload response.");
      }
    } catch (err) {
      console.warn("Cloudinary upload failed:", err);
      setUploadError(`Image upload failed: ${err.message}`);
      setImageUrl("");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenAdd = () => {
    setName("");
    setCategory("Wheelchairs");
    setDescription("");
    setTotalStock(1);
    setImageUrl("https://images.unsplash.com/photo-1579684389782-64d84b5e905d?q=80&w=600&auto=format&fit=crop");
    setAlbum("pydc_equipment");
    setUploadError("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setName(item.name);
    setCategory(item.category);
    setDescription(item.description || "");
    setTotalStock(item.total_stock);
    setImageUrl(item.image_url || "");
    setAlbum("pydc_equipment");
    setUploadError("");
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await addEquipment({
        name: name.trim(),
        category,
        description: description.trim(),
        total_stock: parseInt(totalStock),
        image_url: imageUrl.trim()
      });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("Error adding item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await editEquipment(selectedItem.id, {
        name: name.trim(),
        category,
        description: description.trim(),
        total_stock: parseInt(totalStock),
        image_url: imageUrl.trim()
      });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Error updating item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, itemName) => {
    if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      try {
        await deleteEquipment(id);
      } catch (err) {
        console.error(err);
        alert("Error deleting item: " + err.message);
      }
    }
  };

  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockSum = equipment.reduce((sum, e) => sum + (e.total_stock || 0), 0);
  const availableStockSum = equipment.reduce((sum, e) => sum + (e.available_stock || 0), 0);
  const borrowedStockSum = totalStockSum - availableStockSum;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Inventory Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage trust assets, check-in equipment, and edit quantities</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleOpenAdd}
              className="btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10"
            >
              <FiPlus /> Add New Equipment
            </button>
          </div>
        </div>

        {/* Summary metrics row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Stock sum</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{totalStockSum} Items</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
              <FiArchive />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Available Stock sum</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{availableStockSum} Items</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FiCheckCircle />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center justify-between border-l-4 border-l-blue-500">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">On Loan / Issued</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{borrowedStockSum} Items</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FiActivity />
            </div>
          </div>
        </section>

        {/* Filter / Search Area */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-80 focus-within:border-blue-400 focus-within:bg-white transition-colors">
            <FiSearch className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
            Catalog Size: {filteredEquipment.length} Items
          </span>
        </div>

        {/* Inventory Table */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl h-64 animate-pulse"></div>
        ) : filteredEquipment.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <FiArchive className="text-slate-300 text-5xl mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-700">No assets found</h3>
            <p className="text-slate-500 text-xs mt-1">Try modifying search tags or add new medical equipment.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-5">Equipment Preview</th>
                    <th className="p-5">Name & Category</th>
                    <th className="p-5 text-center">Total Stock</th>
                    <th className="p-5 text-center">Available Stock</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredEquipment.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Image Preview */}
                      <td className="p-5">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50 shadow-sm shrink-0">
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available'; }}
                          />
                        </div>
                      </td>
                      {/* Name & Category */}
                      <td className="p-5">
                        <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                        <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50/50 border border-blue-100 rounded px-2 mt-1 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </td>
                      {/* Total Stock */}
                      <td className="p-5 text-center font-bold text-slate-700">{item.total_stock}</td>
                      {/* Available Stock */}
                      <td className="p-5 text-center font-bold text-blue-600">{item.available_stock}</td>
                      {/* Status */}
                      <td className="p-5">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.available_stock > 0 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.available_stock > 0 ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="p-5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 border border-slate-200 hover:border-blue-500 rounded-xl text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
                          title="Edit Equipment Details"
                        >
                          <FiEdit2 className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-2 border border-slate-200 hover:border-red-500 rounded-xl text-slate-500 hover:text-red-600 cursor-pointer transition-colors"
                          title="Delete Equipment"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD EQUIPMENT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-8 relative">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 bg-slate-100 text-slate-500 hover:bg-slate-200 p-2 rounded-full cursor-pointer transition-colors"
              >
                <FiX />
              </button>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Add New Equipment</h3>
              <p className="text-slate-400 text-xs mb-6">Create a new inventory entry for charitable loan distribution.</p>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                {/* Name */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Equipment Name</label>
                  <input
                    type="text"
                    placeholder="Enter name (e.g. Standard Wheelchair)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    placeholder="Provide details about size, dimensions, or usage..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  ></textarea>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Total Stock Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={totalStock}
                    onChange={(e) => setTotalStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                {/* Cloudinary Album / Folder */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Cloudinary Album / Folder</label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="pydc_equipment"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Folder name used in Cloudinary; images upload to this album.</p>
                </div>

                {/* Image URL & Cloudinary Upload */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-400 font-bold uppercase tracking-wider">Equipment Image</label>
                    {uploading && <span className="text-[10px] text-blue-600 font-bold animate-pulse">Uploading to Cloudinary...</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Image URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/public-image.jpg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 mt-2">Use a public image URL or upload a file to Cloudinary so the image is visible on all devices.</p>
                  </div>

                  {imageUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-2 group shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available'; }} />
                      <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-[10px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="relative flex items-center justify-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors p-2 text-center cursor-pointer min-h-[38px]">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={uploading}
                      />
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 justify-center">
                        <FiCamera className="text-sm text-blue-500" />
                        Upload Image File
                      </span>
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-[10px] text-amber-600 font-semibold leading-relaxed mt-1">
                      ⚠️ {uploadError}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    {submitting ? "Saving..." : "Add Equipment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT EQUIPMENT MODAL */}
        {showEditModal && selectedItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-8 relative">
              <button 
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 bg-slate-100 text-slate-500 hover:bg-slate-200 p-2 rounded-full cursor-pointer transition-colors"
              >
                <FiX />
              </button>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Edit Equipment</h3>
              <p className="text-slate-400 text-xs mb-6">Modify inventory records and total stock properties.</p>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                {/* Name */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Equipment Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-colors"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  ></textarea>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Total Stock Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={totalStock}
                    onChange={(e) => setTotalStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                {/* Cloudinary Album / Folder */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Cloudinary Album / Folder</label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="pydc_equipment"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Folder name used in Cloudinary; images upload to this album.</p>
                </div>

                {/* Image URL & Cloudinary Upload */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-400 font-bold uppercase tracking-wider">Equipment Image</label>
                    {uploading && <span className="text-[10px] text-blue-600 font-bold animate-pulse">Uploading to Cloudinary...</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Image URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/public-image.jpg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 mt-2">Use a public image URL or upload a file to Cloudinary so the image is visible on all devices.</p>
                  </div>

                  {imageUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-2 group shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available'; }} />
                      <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-[10px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="relative flex items-center justify-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors p-2 text-center cursor-pointer min-h-[38px]">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={uploading}
                      />
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 justify-center">
                        <FiCamera className="text-sm text-blue-500" />
                        Upload Image File
                      </span>
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-[10px] text-amber-600 font-semibold leading-relaxed mt-1">
                      ⚠️ {uploadError}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    {submitting ? "Saving Changes..." : "Save Specifications"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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
