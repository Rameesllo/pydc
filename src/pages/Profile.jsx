import { Link } from "react-router-dom";
import { FiUser, FiSettings, FiActivity, FiKey, FiMail, FiPhone } from "react-icons/fi";
import PublicLayout from "../components/PublicLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

export default function Profile() {
  const { requests, stats } = useHelpingHands();

  return (
    <PublicLayout>
      <div className="flex-1 max-w-xl mx-auto px-6 md:px-10 py-12 w-full">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-8">
          
          {/* Avatar Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-3xl shadow-sm">
              🧑‍⚕️
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Helping Hands Citizen Portal</h3>
              <p className="text-xs text-slate-400 mt-1">General public account for medical loan management</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
              <h4 className="text-xl font-black text-slate-800">{requests.length}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Requests Logged</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
              <h4 className="text-xl font-black text-blue-600">Active</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Loan Status Tracking</p>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <FiMail className="text-slate-400" />
              <span>guest@helpinghands.org</span>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="text-slate-400" />
              <span>+91 9876543210</span>
            </div>
            <div className="flex items-center gap-3">
              <FiActivity className="text-slate-400" />
              <span>Role: Public Guest Account</span>
            </div>
          </div>

          {/* Admin panel redirect gate */}
          <div className="pt-6 border-t border-slate-100">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Are you a Trust staff member?</h4>
                <p className="text-slate-500 text-xs mt-1">Log in with your administrator account to manage equipment, returns, and write reports.</p>
              </div>
              <Link 
                to="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-600/10 cursor-pointer"
              >
                <FiKey className="text-base" /> Access Administrator Portal
              </Link>
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
