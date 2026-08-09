import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight, FiUser, FiMail, FiShield, FiLogOut, FiCamera, FiX, FiShare
} from "react-icons/fi";
import { supabase } from "../supabaseClient";

export default function Portal() {
  const [currentSlide, setCurrentSlide] = useState(0);
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
  const [memberSession, setMemberSession] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Detect iOS and verify if NOT already running in standalone PWA mode
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = sessionStorage.getItem("pydc_ios_prompt_dismissed");

    if (isIos && !isStandalone && !isDismissed) {
      setShowIosPrompt(true);
    }
  }, []);

  useEffect(() => {
    // Read persistent member login session
    const savedSession = localStorage.getItem("pydc_member_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setMemberSession(parsed);
        // Load profile image for this member from Supabase
        if (parsed.email) {
          const fetchProfilePic = async () => {
            const { data, error } = await supabase
              .from("member_credentials")
              .select("image_url")
              .eq("email", parsed.email)
              .maybeSingle();
            if (!error && data?.image_url) {
              setProfileImage(data.image_url);
            }
          };
          fetchProfilePic();
        }
      } catch (err) {
        console.warn("Invalid session stored", err);
      }
    }
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

  const handleProfileImageUpload = async (e) => {
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
      if (memberSession?.email) {
        try {
          await supabase
            .from("member_credentials")
            .update({ image_url: base64 })
            .eq("email", memberSession.email);
        } catch (dbErr) {
          console.error("Failed to save profile picture to Supabase", dbErr);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMemberLogout = () => {
    localStorage.removeItem("pydc_member_session");
    setMemberSession(null);
    setProfileImage(null);
    setShowProfile(false);
  };

  useEffect(() => {
    const fetchCommitteeMembers = async () => {
      let fallback = null;
      const savedCommittee = localStorage.getItem("pydc_committee_members");
      if (savedCommittee) {
        try {
          fallback = JSON.parse(savedCommittee);
        } catch (err) {
          console.warn("Invalid committee data in localStorage", err);
        }
      }

      try {
        const { data, error } = await supabase.from("members").select("*").order("id", { ascending: true });
        if (error) throw error;
        if (Array.isArray(data) && data.length > 0) {
          setCommitteeMembers(data.map((member) => ({
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
        setCommitteeMembers(fallback.map((member) => ({
          ...member,
          section: member.section || getSectionFromRole(member.role || ""),
          imageUrl: member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role || "Member")}&background=1e293b&color=cbd5e1&size=150`
        })));
      }
    };

    fetchCommitteeMembers();
  }, []);

  const slides = [
    { id: 1, image: "/pydc_slide1.png" },
    { id: 2, image: "/pydc_slide2.png" },
    { id: 3, image: "/pydc_slide3.jpg" },
    { id: 4, image: "/pydc_slide4.png" },
    { id: 5, image: "/pydc_slide5.png" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Dark Navy Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-blue-700 border-b border-blue-900/40 shadow-lg" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 4px)', paddingBottom: '4px' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-white/80 shadow-sm shrink-0 flex items-center justify-center bg-white">
              <img
                src="/pydc_medical_logo.png"
                alt="PYDC Logo"
                className="w-full h-full object-cover scale-125"
              />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-wider text-white leading-tight">
                PYDC <span className="text-blue-900 text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-white/90 shadow-sm">CENTER</span>
              </h1>
              <p className="text-[8px] md:text-[9px] text-blue-100 font-bold tracking-widest uppercase">Puliyamparambu Youth Development Center</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {memberSession && memberSession.isMember ? (
              <div className="relative" ref={profileRef}>
                {/* Profile Avatar Button */}
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white/80 hover:border-white shadow-md overflow-hidden cursor-pointer transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 relative"
                  title={memberSession.name}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white">
                      <FiUser className="text-base md:text-lg" />
                    </div>
                  )}
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-700 animate-pulse" />
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-200 z-50 overflow-hidden animate-fadeIn">
                    {/* Header with close */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 pt-5 pb-8 relative">
                      <button
                        onClick={() => setShowProfile(false)}
                        className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        <FiX className="text-lg" />
                      </button>
                      <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest">Member Profile</p>
                    </div>

                    {/* Avatar overlapping header */}
                    <div className="flex flex-col items-center -mt-7 px-5">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-[3px] border-white shadow-lg overflow-hidden bg-slate-100">
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400">
                              <FiUser className="text-2xl" />
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-black text-slate-800 mt-2">{memberSession.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mt-1">
                        {memberSession.role}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 truncate max-w-full">{memberSession.email}</p>
                    </div>

                    {/* Navigation Link to View Full Profile */}
                    <div className="px-5 pt-5 pb-2">
                      <Link
                        to="/member/profile"
                        onClick={() => setShowProfile(false)}
                        className="w-full py-2.5 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FiUser className="text-sm" /> View Full Profile
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="px-5 pb-4 pt-1">
                      <button
                        onClick={handleMemberLogout}
                        className="w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FiLogOut className="text-sm" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/member-login"
                className="text-[11px] md:text-xs text-white font-bold px-3.5 py-1 rounded-full bg-blue-900 hover:bg-blue-800 border border-blue-300/40 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm hover:scale-105"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Slideshow Section — Taller screen fit */}
      <section className="relative w-full overflow-hidden bg-white flex items-center justify-center h-[80vh] md:h-[90vh]">
        {/* Background Slides */}
        {slides.map((slide, index) => (
          <div
            key={`slide-${slide.id}`}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          >
            {/* Enhanced Image — no blur, rich contrast & saturation */}
            <img
              src={slide.image}
              alt="PYDC Club Banner"
              className="w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out"
              style={{ filter: 'brightness(1.05) contrast(1.08) saturate(1.15)', transform: index === currentSlide ? 'scale(1.04)' : 'scale(1)' }}
            />
            {/* Layer 1: Top vignette blending into sticky header */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-950/80 via-blue-900/30 to-transparent pointer-events-none" />
            {/* Layer 2: Bottom fade — White shade touch matching page background */}
            <div className="absolute inset-x-0 bottom-0 h-64 sm:h-72 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none" />
            {/* Layer 3: Subtle left shade for depth */}
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-blue-950/20 to-transparent pointer-events-none" />
          </div>
        ))}

        {/* Heading Overlaid on Bottom — White Touch Theme */}
        <div className="absolute bottom-10 sm:bottom-14 z-20 w-full px-6 sm:px-10 max-w-5xl mx-auto left-0 right-0 pointer-events-none">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight drop-shadow-sm text-center sm:text-left">
            Puliyamparambu Youth<br className="hidden sm:block" /> Development Center
          </h2>
          <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start flex-wrap">
            <p className="text-blue-700 text-sm sm:text-lg md:text-xl font-bold tracking-wide drop-shadow-sm" style={{ fontFamily: "'Noto Sans Malayalam', sans-serif" }}>
              നവയൗവനം ജനനന്മക്ക്
            </p>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-400/80" />
            <span className="text-slate-600 text-xs sm:text-sm font-semibold opacity-90 italic">New Youth for Public Welfare</span>
          </div>
        </div>

      </section>

      {/* Services Section — 2 Boxes in One Line on Mobile & Laptop */}
      <section className="w-full max-w-7xl mx-auto px-3 md:px-8 py-10 md:py-14 z-20 flex-1 flex flex-col justify-center">

        {/* Section Heading */}
        <div className="flex flex-col items-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            OUR SERVICES
          </h2>
          <div className="w-12 h-1 bg-blue-500 rounded-full" />
        </div>

        {/* 2 Service Boxes in Single Line (Grid 2-cols on ALL screens) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-3xl mx-auto">
          {/* Card 1: Medical Equipment */}
          <Link
            to="/medical"
            className="group relative bg-gradient-to-br from-black/100 to-blue-500 border border-blue-800/40 rounded-xl sm:rounded-2xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Content */}
            <div className="relative z-10 p-3 sm:p-4 md:p-5 flex flex-col justify-between h-full">
              <div>
                {/* Symbol */}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-950/40 border border-blue-500/30 group-hover:border-blue-400 flex items-center justify-center mb-2 sm:mb-3 transition-colors">
                  <span className="text-blue-400 text-base sm:text-xl font-black leading-none">✚</span>
                </div>
                <h3 className="text-xs sm:text-base md:text-lg font-bold text-white mb-0.5 sm:mb-1 group-hover:text-blue-200 transition-colors leading-snug">
                  Medical Equipment
                </h3>
                <p className="text-blue-200/80 font-bold text-[9px] sm:text-[11px] md:text-xs leading-relaxed line-clamp-2">
                  Free medical equipment loans including wheelchairs, oxygen concentrators, and hospital beds.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 sm:pt-3 mt-3 sm:mt-4 border-t border-blue-500/20 text-blue-300 font-bold text-[9px] sm:text-[11px] md:text-xs">
                <span>Medical Portal</span>
                <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300 shrink-0" />
              </div>
            </div>
          </Link>

          {/* Card 2: Public Library */}
          <Link
            to="/library"
            className="group relative bg-gradient-to-br from-black/100 to-blue-500 border border-blue-800/40 rounded-xl sm:rounded-2xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Content */}
            <div className="relative z-10 p-3 sm:p-4 md:p-5 flex flex-col justify-between h-full">
              <div>
                {/* Symbol */}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-950/40 border border-blue-500/30 group-hover:border-blue-400 flex items-center justify-center mb-2 sm:mb-3 transition-colors">
                  <span className="text-blue-400 text-base sm:text-xl leading-none">📖</span>
                </div>
                <h3 className="text-xs sm:text-base md:text-lg font-bold text-white mb-0.5 sm:mb-1 group-hover:text-blue-200 transition-colors leading-snug">
                  Public Library
                </h3>
                <p className="text-blue-200/80 font-bold text-[9px] sm:text-[11px] md:text-xs leading-relaxed line-clamp-2">
                  Coming soon — library features are paused while we focus on the medical portal.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 sm:pt-3 mt-3 sm:mt-4 border-t border-blue-500/20 text-blue-300 font-bold text-[9px] sm:text-[11px] md:text-xs">
                <span>Coming Soon</span>
                <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300 shrink-0" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Committee Section */}
      <section className="w-full bg-white border-t border-slate-200 py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">
              OUR COMMITTEE
            </h2>
            <div className="w-12 h-1 bg-blue-500 rounded-full" />
          </div>

          {/* --- Line 1: Main Office Bearers --- */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 sm:mb-12">
            {committeeMembers.filter((member) => member.section === "main").map((member) => (
              <div key={member.id} className="relative bg-gradient-to-br from-black/100 to-blue-500 border border-blue-800/40 rounded-xl sm:rounded-3xl py-6 px-3 sm:py-10 sm:px-6 flex flex-col items-center justify-center h-full text-center hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden group shadow-sm">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-950/40 overflow-hidden mb-2 sm:mb-4 border-2 sm:border-[3px] border-blue-500/30 group-hover:border-blue-400 transition-colors shadow-sm">
                  <div className="block w-full h-full">
                    <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e3a8a&color=ffffff&size=150`} alt={member.role} className="w-full h-full object-cover object-center rounded-full group-hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>
                <h3 className="relative z-10 text-[10px] sm:text-base font-bold text-white mb-0.5 sm:mb-1 leading-tight group-hover:text-blue-200 transition-colors">{member.name || "Name Here"}</h3>
                <p className="relative z-10 text-blue-200/90 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest mb-1 sm:mb-3">{member.role}</p>
              </div>
            ))}
          </div>

          {/* --- Line 2: Vice Presidents & Joint Secretaries --- */}
          <div className="grid grid-cols-2 gap-4 sm:gap-10 mb-8 sm:mb-12">
            {/* Vice Presidents Group */}
            <div>
              <div className="flex justify-center mb-3 sm:mb-6">
                <span className="bg-amber-500 text-slate-900 text-[8px] sm:text-xs font-bold px-2 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wider text-center">Vice Presidents</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {committeeMembers.filter((member) => member.section === "vice").map((member) => (
                  <div key={member.id} className="relative bg-gradient-to-br from-black/100 to-blue-500 border border-blue-800/40 rounded-xl sm:rounded-2xl py-5 px-2 sm:py-8 sm:px-4 flex flex-col items-center justify-center h-full text-center hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden group shadow-sm">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-blue-950/40 overflow-hidden mb-1.5 sm:mb-3 border border-blue-500/30 group-hover:border-blue-400 transition-colors shadow-sm">
                      <div className="block w-full h-full">
                        <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e3a8a&color=ffffff&size=150`} alt={member.role} className="w-full h-full object-cover object-center rounded-full group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    </div>
                    <h3 className="relative z-10 text-[9px] sm:text-sm font-bold text-white leading-tight group-hover:text-blue-200 transition-colors">{member.name || "Name Here"}</h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Joint Secretaries Group */}
            <div>
              <div className="flex justify-center mb-3 sm:mb-6">
                <span className="bg-amber-500 text-slate-900 text-[8px] sm:text-xs font-bold px-2 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wider text-center">Joint Secretaries</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {committeeMembers.filter((member) => member.section === "joint").map((member) => (
                  <div key={member.id} className="relative bg-gradient-to-br from-black/100 to-blue-500 border border-blue-800/40 rounded-xl sm:rounded-2xl py-5 px-2 sm:py-8 sm:px-4 flex flex-col items-center justify-center h-full text-center hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden group shadow-sm">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-blue-950/40 overflow-hidden mb-1.5 sm:mb-3 border border-blue-500/30 group-hover:border-blue-400 transition-colors shadow-sm">
                      <div className="block w-full h-full">
                        <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e3a8a&color=ffffff&size=150`} alt={member.role} className="w-full h-full object-cover object-center rounded-full group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    </div>
                    <h3 className="relative z-10 text-[9px] sm:text-sm font-bold text-white leading-tight group-hover:text-blue-200 transition-colors">{member.name || "Name Here"}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Line 3: Charitable Trust & Public Library --- */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="relative bg-gradient-to-br from-black/100 to-blue-500 border border-blue-800/40 rounded-3xl p-4 sm:p-5 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex justify-center mb-4">
                <span className="bg-blue-950/40 border border-blue-500/30 text-white text-[8px] sm:text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"> Charitable Trust</span>
              </div>
              <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3">
                {committeeMembers.filter((member) => member.section === "trust").map((member) => (
                  <div key={member.id} className="flex flex-col items-center justify-center h-full text-center bg-blue-950/20 py-3 px-1 rounded-xl border border-transparent hover:border-blue-400 hover:bg-blue-950/40 transition-all group">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border border-blue-500/20 group-hover:border-blue-400 transition-colors shadow-sm">
                      <div className="block w-full h-full">
                        <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e3a8a&color=ffffff&size=100`} alt={member.role} className="w-full h-full object-cover object-center rounded-full group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    </div>
                    <p className="text-blue-200 text-[7px] sm:text-[8px] font-bold uppercase mb-0.5 sm:mb-1">{member.role}</p>
                    <h3 className="text-[8px] sm:text-[9px] font-semibold text-white leading-tight group-hover:text-blue-200 transition-colors">{member.name || "Name Here"}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-black/100 to-blue-500 border border-blue-800/40 rounded-3xl p-4 sm:p-5 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex justify-center mb-4">
                <span className="bg-blue-950/40 border border-blue-500/30 text-white text-[8px] sm:text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Public Library</span>
              </div>
              <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3">
                {committeeMembers.filter((member) => member.section === "library").map((member) => (
                  <div key={member.id} className="flex flex-col items-center justify-center h-full text-center bg-blue-950/20 py-3 px-1 rounded-xl border border-transparent hover:border-blue-400 hover:bg-blue-950/40 transition-all group">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border border-blue-500/20 group-hover:border-blue-400 transition-colors shadow-sm">
                      <div className="block w-full h-full">
                        <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e3a8a&color=ffffff&size=100`} alt={member.role} className="w-full h-full object-cover object-center rounded-full group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    </div>
                    <p className="text-blue-200 text-[7px] sm:text-[8px] font-bold uppercase mb-0.5 sm:mb-1">{member.role}</p>
                    <h3 className="text-[8px] sm:text-[9px] font-semibold text-white leading-tight group-hover:text-blue-200 transition-colors">{member.name || "Name Here"}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formal Minimalist Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 px-6 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-600">Puliyamparambu Youth Development Center</span>
          </div>

          <div className="flex items-center gap-5 text-slate-500 font-medium">
            <Link to="/medical" className="hover:text-blue-600 transition-colors">Medical Portal</Link>
            <Link to="/library" className="hover:text-blue-600 transition-colors">Library Portal</Link>
            <Link to="/admin/login" className="hover:text-blue-600 transition-colors">Admin Login</Link>
          </div>

          <p>© 2026 PYDC. All rights reserved | Crafted by: <a href="https://www.instagram.com/remiize.llo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 transition-colors font-semibold">Rameesllo</a></p>
        </div>
      </footer>

      {/* iOS PWA Install Prompt Banner */}
      {showIosPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-blue-900/40 z-50 animate-fadeIn space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <span className="text-lg">📲</span>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Install App on iPhone</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Access PYDC directly from your home screen</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowIosPrompt(false);
                sessionStorage.setItem("pydc_ios_prompt_dismissed", "true");
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <FiX className="text-base" />
            </button>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl p-3 text-[11px] leading-relaxed text-slate-300 space-y-2">
            <p className="flex items-center gap-1.5 font-semibold text-white">
              1. Tap the Share button <FiShare className="text-blue-400 text-sm shrink-0" /> at the bottom of Safari.
            </p>
            <p className="flex items-center gap-1.5 font-semibold text-white">
              2. Scroll down and tap "Add to Home Screen" ➕.
            </p>
            <p className="text-[10px] text-slate-400">
              This installs the application directly on your phone without going through the App Store.
            </p>
          </div>

          <button
            onClick={() => {
              setShowIosPrompt(false);
              sessionStorage.setItem("pydc_ios_prompt_dismissed", "true");
            }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] transition-colors cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      )}
    </div>
  );
}
