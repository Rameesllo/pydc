import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiActivity, FiArrowLeft } from "react-icons/fi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session) {
      navigate("/medical/admin/dashboard");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Simulate authentication check (configured per requirements)
    setTimeout(() => {
      if (email === "pydc@gmail.com" && password === "123456") {
        localStorage.setItem("admin_session", "true");
        navigate("/medical/admin/dashboard");
      } else {
        setError("Invalid email or password. Use: pydc@gmail.com / 123456");
        setSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background glowing blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1.5 transition-all mx-auto max-w-max"
        >
          <FiArrowLeft className="mr-1" /> Public Portal
        </Link>

        <div className="flex flex-col justify-center items-center gap-3 mb-6">
          <img
            src="/pydc_medical_logo.png"
            alt="PYDC Logo"
            className="w-16 h-16 object-contain rounded-full"
          />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">
            PYDC <span className="text-blue-600">Charity Trust</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Trust Administrator Portal</p>
        </div>

        <h2 className="mt-2 text-center text-xl font-bold tracking-tight text-slate-800">
          Sign in to Admin Dashboard
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white sm:text-sm bg-slate-50/50 outline-none transition-colors"
                  placeholder="pydc@gmail.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white sm:text-sm bg-slate-50/50 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-600/30 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all duration-300 hover:scale-[1.01] cursor-pointer"
              >
                {submitting ? "Signing in..." : "Sign in to Admin Console"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
