import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiMail, FiLock, FiUser, FiCheckCircle, FiUserX, FiShield, FiLogOut } from "react-icons/fi";
import { supabase } from "../supabaseClient";

export default function MemberLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState("ask"); // "ask" | "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Default credentials in case database isn't populated yet
  const defaultCredentials = [
    { id: 1, email: "member@pydc.org", password: "123456", name: "PYDC Club Member", role: "Active Member" },
    { id: 2, email: "pydc@gmail.com", password: "123456", name: "Admin Member", role: "Committee Member" }
  ];

  useEffect(() => {
    // Check if already logged in
    const savedSession = localStorage.getItem("pydc_member_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setCurrentSession(parsed);
        // Load profile image from Supabase
        if (parsed.email) {
          const fetchImg = async () => {
            const { data, error } = await supabase
              .from("member_credentials")
              .select("image_url")
              .eq("email", parsed.email)
              .maybeSingle();
            if (!error && data?.image_url) {
              setProfileImage(data.image_url);
            }
          };
          fetchImg();
        }
      } catch (err) {
        console.warn("Invalid session", err);
      }
    }
  }, []);

  const handleGuestContinue = () => {
    const guestSession = {
      isMember: false,
      name: "Guest User",
      role: "Guest Visitor",
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem("pydc_member_session", JSON.stringify(guestSession));
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("pydc_member_session");
    setCurrentSession(null);
    setStep("ask");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let memberList = defaultCredentials;

    // Load custom credentials saved by Admin from Supabase or localStorage
    try {
      const storedLocal = localStorage.getItem("pydc_member_credentials");
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memberList = [...memberList, ...parsed];
        }
      }

      // Also try fetching from Supabase member_credentials table
      const { data, error: dbError } = await supabase.from("member_credentials").select("*");
      if (!dbError && Array.isArray(data) && data.length > 0) {
        memberList = [...memberList, ...data.map(d => ({
          email: d.email,
          password: d.password,
          name: d.name || d.email,
          role: d.role || "Club Member",
          imageUrl: d.image_url
        }))];
      }
    } catch (err) {
      console.warn("Using local fallback credentials list", err);
    }

    const matchedMember = memberList.find(
      (m) => m.email.trim().toLowerCase() === email.trim().toLowerCase() && m.password === password
    );

    if (matchedMember) {
      const session = {
        isMember: true,
        email: matchedMember.email,
        name: matchedMember.name || matchedMember.email.split("@")[0],
        role: matchedMember.role || "Club Member",
        loggedInAt: new Date().toISOString()
      };

      // Persistent session saved in localStorage
      localStorage.setItem("pydc_member_session", JSON.stringify(session));
      if (matchedMember.imageUrl) {
        setProfileImage(matchedMember.imageUrl);
      }
      setLoading(false);
      navigate("/");
    } else {
      setLoading(false);
      setError("Invalid Email or Password. Please contact the PYDC Admin if you do not have account credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-blue-100/60 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-100/60 blur-[120px] pointer-events-none" />

      {/* Header Back Button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 transition-all shadow-sm"
        >
          <FiArrowLeft className="mr-1.5 text-sm" /> Return to Portal
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg border border-blue-400 mb-3 flex items-center justify-center">
            <img src="/pydc_medical_logo.png" alt="PYDC Logo" className="w-full h-full object-cover rounded-full scale-110" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
            PYDC <span className="text-blue-600">CENTER</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Puliyamparambu Youth Development Center
          </p>
        </div>

        <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          
          {/* If already logged in as Member */}
          {currentSession && currentSession.isMember ? (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full mx-auto border-[3px] border-blue-200 shadow-lg overflow-hidden bg-blue-50">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-400">
                    <FiUser className="text-3xl" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-600">
                  Currently Logged In
                </span>
                <h2 className="text-xl font-black text-slate-800 mt-3">{currentSession.name}</h2>
                <p className="text-xs text-slate-500 mt-1">{currentSession.email}</p>
                <p className="text-[11px] text-amber-600 font-bold uppercase tracking-wider mt-2">{currentSession.role}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-blue-600 flex items-center gap-1.5">
                  <FiShield className="text-blue-500" /> Persistent Session Active
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  You stay logged in on this phone/device even when you close the browser. You will remain logged in until you tap sign out below.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Link
                  to="/"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-blue-600/30 text-center"
                >
                  Go to Main Portal
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiLogOut /> Sign Out from This Device
                </button>
              </div>
            </div>
          ) : step === "ask" ? (
            /* Step 1: Are you a Club Member? */
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Step 1 of 2</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">Are you a Club Member?</h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Please confirm your membership status with Puliyamparambu Youth Development Center.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Option 1: Yes, I am a Club Member */}
                <button
                  onClick={() => setStep("login")}
                  className="w-full group p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30 rounded-2xl flex items-center justify-between text-left transition-all duration-300 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <FiUser className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Yes, I am a Club Member</p>
                      <p className="text-[10px] text-blue-100/80 font-medium">Sign in with email & password assigned by Admin</p>
                    </div>
                  </div>
                  <span className="text-white text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                </button>

                {/* Option 2: No, Continue as Guest */}
                <button
                  onClick={handleGuestContinue}
                  className="w-full group p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-between text-left transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 group-hover:scale-110 transition-transform">
                      <FiUserX className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">No, Continue as Guest</p>
                      <p className="text-[10px] text-slate-500">Access public features without logging in</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Member Email & Password Login */
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Step 2 of 2</span>
                  <h2 className="text-lg font-black text-slate-800">Club Member Login</h2>
                </div>
                <button
                  onClick={() => { setStep("ask"); setError(""); }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                >
                  Change Option
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Member Email
                  </label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiMail className="text-base" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member@pydc.org"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiLock className="text-base" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-slate-600 space-y-1">
                  <p className="font-bold text-blue-600">🔑 Demo Member Account:</p>
                  <p>Email: <span className="font-mono text-slate-800">member@pydc.org</span></p>
                  <p>Password: <span className="font-mono text-slate-800">123456</span></p>
                  <p className="text-[10px] text-slate-400 pt-1">
                    Admins can create and assign more member credentials in the Admin Portal.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign In & Remember Me"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
