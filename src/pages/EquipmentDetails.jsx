import { Link, useParams } from "react-router-dom";
import { FiChevronLeft, FiCheck, FiInfo, FiActivity, FiArrowRight } from "react-icons/fi";
import PublicLayout from "../components/PublicLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function EquipmentDetails() {
  const { id } = useParams();
  const { equipment, loading } = useHelpingHands();

  const item = equipment.find(e => e.id === parseInt(id));

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex-1 max-w-7xl mx-auto px-6 md:px-10 py-8 w-full flex justify-center items-center">
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading item specifications...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!item) {
    return (
      <PublicLayout>
        <div className="flex-1 max-w-7xl mx-auto px-6 md:px-10 py-12 w-full text-center">
          <FiActivity className="text-slate-300 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Specifications not found</h3>
          <p className="text-slate-500 mt-2">The equipment record you are trying to view does not exist.</p>
          <Link to="/medical/equipment" className="btn-primary mt-6 inline-block py-2 px-6">
            Back to Catalog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const borrowedStock = item.total_stock - item.available_stock;

  return (
    <PublicLayout>
      <div className="flex-1 max-w-5xl mx-auto px-6 md:px-10 py-8 w-full">
        {/* Back Link */}
        <Link 
          to="/medical/equipment" 
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-8 transition-colors border border-slate-200 bg-white rounded-xl px-3.5 py-1.5 shadow-sm"
        >
          <FiChevronLeft className="mr-1" /> Back to Equipment
        </Link>

        {/* Details card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row mb-8">
          
          {/* Image */}
          <div className="w-full md:w-1/2 bg-slate-100/50 p-6 flex items-center justify-center relative min-h-[300px]">
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover max-h-[380px] rounded-2xl shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available'; }}
            />
            <div className="absolute top-6 left-6 text-xs uppercase font-bold tracking-widest text-white bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {item.category}
            </div>
          </div>

          {/* Details specs */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category & Status */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                  item.available_stock > 0 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {item.available_stock > 0 ? 'Available' : 'Out of Stock'}
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Medical Support Gear</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                {item.name}
              </h2>

              {/* Stats Block */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Total Stock</p>
                  <p className="text-lg font-black text-slate-700 mt-0.5">{item.total_stock}</p>
                </div>
                <div className="border-x border-slate-200">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Available</p>
                  <p className="text-lg font-black text-blue-600 mt-0.5">{item.available_stock}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Borrowed</p>
                  <p className="text-lg font-black text-orange-500 mt-0.5">{borrowedStock}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.description || 'This equipment is maintained under PYDC Charity Trust guidelines. It is sanitized, quality-tested, and prepared for active patient support care.'}
                </p>
              </div>

            </div>

            {/* Action booking */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              {item.available_stock > 0 ? (
                <Link 
                  to={`/medical/request?eqId=${item.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-blue-600/10 text-center flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  Request This Equipment <FiArrowRight />
                </Link>
              ) : (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center text-slate-500 text-sm font-semibold">
                  This item is currently out of stock. You can check back later or select alternative equipment.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Quality Guidelines Alert Box */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <FiInfo className="text-lg" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">PYDC Charity Trust Palliative Care Loan Guidelines</h4>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Medical equipment is supplied on a free, short-term lease (usually 30-90 days, extendable on medical request). Please return the equipment clean and fully functional so it can serve another patient in need.
            </p>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
