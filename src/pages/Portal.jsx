import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

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

  useEffect(() => {
    const savedCommittee = localStorage.getItem("pydc_committee_members");
    if (savedCommittee) {
      try {
        const parsed = JSON.parse(savedCommittee);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCommitteeMembers(parsed.map((member) => ({
            ...member,
            section: member.section || getSectionFromRole(member.role || ""),
            imageUrl: member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role || "Member")}&background=1e293b&color=cbd5e1&size=150`
          })));
        }
      } catch (err) {
        console.warn("Invalid committee data in localStorage", err);
      }
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Translucent Blue Compact Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-blue-600/70 backdrop-blur-md border-b border-blue-400/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-2.5 flex items-center justify-between">
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
            <span className="text-[10px] text-white font-semibold px-2.5 py-0.5 rounded-full bg-blue-700/60 border border-blue-300/30 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">Services</span> Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Slideshow Section — Full screen fit minus header */}
      <section className="relative w-full overflow-hidden bg-slate-950 flex items-center justify-center border-b border-slate-800 h-[60vh] md:h-[calc(100svh-52px)]">
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
            {/* Layer 1: Top vignette */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />
            {/* Layer 2: Bottom text fade — tall & rich */}
            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
            {/* Layer 3: Subtle left shade for depth */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950/30 to-transparent pointer-events-none" />
          </div>
        ))}

        {/* Heading Overlaid on Bottom — Premium Layout */}
        <div className="absolute bottom-12 sm:bottom-16 z-20 w-full px-6 sm:px-10 max-w-5xl mx-auto left-0 right-0 pointer-events-none">
          {/* Decorative accent line */}
          <div className="w-12 h-[3px] bg-blue-500 rounded-full mb-3 mx-auto sm:mx-0" />
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-2xl text-center sm:text-left">
            Puliyamparambu Youth<br className="hidden sm:block" /> Development Center
          </h2>
          <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start flex-wrap">
            <p className="text-blue-300 text-sm sm:text-lg md:text-xl font-bold tracking-wide drop-shadow-md" style={{ fontFamily: "'Noto Sans Malayalam', sans-serif" }}>
              നവയൗവനം ജനനന്മക്ക്
            </p>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-400 opacity-60" />
            <span className="text-slate-300 text-xs sm:text-sm font-normal opacity-80 italic">New Youth for Public Welfare</span>
          </div>
        </div>

        {/* Nav Arrows — sleek glass style */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3.5 rounded-full bg-white/10 hover:bg-blue-600/80 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center justify-center shadow-xl hover:scale-110 hover:border-blue-400"
        >
          <FiChevronLeft className="text-lg md:text-xl" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3.5 rounded-full bg-white/10 hover:bg-blue-600/80 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center justify-center shadow-xl hover:scale-110 hover:border-blue-400"
        >
          <FiChevronRight className="text-lg md:text-xl" />
        </button>

        {/* Slide Indicators — bottom centre */}
        <div className="absolute bottom-4 sm:bottom-5 z-20 flex gap-2 left-1/2 -translate-x-1/2">
          {slides.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer ${idx === currentSlide ? "bg-blue-400 w-8 shadow-[0_0_8px_rgba(96,165,250,0.8)]" : "bg-white/30 hover:bg-white/70 w-4"}`}
            />
          ))}
        </div>
      </section>

      {/* Services Section — 2 Boxes in One Line on Mobile & Laptop */}
      <section className="w-full max-w-7xl mx-auto px-3 md:px-8 py-10 md:py-14 z-20 flex-1 flex flex-col justify-center">

        {/* 2 Service Boxes in Single Line (Grid 2-cols on ALL screens) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-5xl mx-auto">
          {/* Card 1: Medical Equipment */}
          <Link
            to="/medical"
            className="group relative border border-blue-500/30 rounded-2xl md:rounded-3xl hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 flex flex-col justify-between h-[220px] sm:h-[260px] md:h-[290px] overflow-hidden shadow-lg"
          >
            {/* Background Image */}
            <img
              src="/medical_service_bg.png"
              alt="Medical Equipment"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Light gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-transparent group-hover:from-white/95 transition-all duration-500"></div>

            {/* Content */}
            <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm sm:text-xl md:text-2xl font-semibold text-blue-900 mb-1 sm:mb-2 group-hover:text-blue-700 transition-colors leading-snug drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
                  Medical Equipment
                </h3>
                <p className="text-blue-950 font-bold text-[11px] sm:text-xs md:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                  Free medical equipment loans including wheelchairs, oxygen concentrators, and hospital beds.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-blue-900/20 text-blue-700 font-bold text-[11px] sm:text-xs md:text-sm">
                <span>Medical Portal</span>
                <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300 shrink-0" />
              </div>
            </div>
          </Link>

          {/* Card 2: Public Library */}
          <Link
            to="/library"
            className="group relative border border-violet-500/30 rounded-2xl md:rounded-3xl hover:border-violet-400 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 flex flex-col justify-between h-[220px] sm:h-[260px] md:h-[290px] overflow-hidden shadow-lg"
          >
            {/* Background Image */}
            <img
              src="/library_service_bg.png"
              alt="Public Library"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Light gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-transparent group-hover:from-white/95 transition-all duration-500"></div>

            {/* Content */}
            <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm sm:text-xl md:text-2xl font-semibold text-violet-900 mb-1 sm:mb-2 group-hover:text-violet-700 transition-colors leading-snug drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
                  Public Library
                </h3>
                <p className="text-violet-950 font-bold text-[11px] sm:text-xs md:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                  Browse our digital book catalog, view details, search sections, and reserve books easily.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-violet-900/20 text-violet-700 font-bold text-[11px] sm:text-xs md:text-sm">
                <span>Library Portal</span>
                <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300 shrink-0" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Committee Section */}
      <section className="w-full bg-slate-950 border-t border-slate-800 py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              OUR COMMITEE
            </h2>
            <div className="w-12 h-1 bg-blue-500 rounded-full" />
          </div>

          {/* --- Line 1: Main Office Bearers --- */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 sm:mb-12">
            {committeeMembers.filter((member) => member.section === "main").map((member) => (
              <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-3xl py-6 px-3 sm:py-10 sm:px-6 flex flex-col items-center justify-center h-full text-center hover:border-slate-700 transition-all duration-300 shadow-lg">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-800 overflow-hidden mb-2 sm:mb-4 border-2 sm:border-[3px] border-slate-700">
                  <a href={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=150`} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=150`} alt={member.role} className="w-full h-full object-cover object-center rounded-full" />
                  </a>
                </div>
                <h3 className="text-[10px] sm:text-base font-bold text-white mb-0.5 sm:mb-1 leading-tight">{member.name || "Name Here"}</h3>
                <p className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest mb-1 sm:mb-3">{member.role}</p>
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
                  <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl py-5 px-2 sm:py-8 sm:px-4 flex flex-col items-center justify-center h-full text-center hover:border-slate-700 transition-all shadow-md">
                    <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-slate-800 overflow-hidden mb-1.5 sm:mb-3 border border-slate-700">
                      <a href={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=150`} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=150`} alt={member.role} className="w-full h-full object-cover object-center rounded-full" />
                      </a>
                    </div>
                    <h3 className="text-[9px] sm:text-sm font-bold text-white leading-tight">{member.name || "Name Here"}</h3>
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
                  <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl py-5 px-2 sm:py-8 sm:px-4 flex flex-col items-center justify-center h-full text-center hover:border-slate-700 transition-all shadow-md">
                    <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-slate-800 overflow-hidden mb-1.5 sm:mb-3 border border-slate-700">
                      <a href={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=150`} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=150`} alt={member.role} className="w-full h-full object-cover object-center rounded-full" />
                      </a>
                    </div>
                    <h3 className="text-[9px] sm:text-sm font-bold text-white leading-tight">{member.name || "Name Here"}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Line 3: Charitable Trust & Public Library --- */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5">
              <div className="flex justify-center mb-4">
                <span className="bg-cyan-500 text-slate-900 text-[8px] sm:text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"> Charitable Trust</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {committeeMembers.filter((member) => member.section === "trust").map((member) => (
                  <div key={member.id} className="flex flex-col items-center justify-center h-full text-center bg-slate-900 py-3 px-1 rounded-xl border border-slate-900 hover:border-cyan-500/30 transition-all">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border border-slate-700">
                      <a href={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=100`} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=100`} alt={member.role} className="w-full h-full object-cover object-center rounded-full" />
                      </a>
                    </div>
                    <p className="text-cyan-300 text-[7px] sm:text-[8px] font-bold uppercase mb-0.5 sm:mb-1">{member.role}</p>
                    <h3 className="text-[8px] sm:text-[9px] font-semibold text-white leading-tight">{member.name || "Name Here"}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5">
              <div className="flex justify-center mb-4">
                <span className="bg-cyan-500 text-slate-900 text-[8px] sm:text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Public Library</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {committeeMembers.filter((member) => member.section === "library").map((member) => (
                  <div key={member.id} className="flex flex-col items-center justify-center h-full text-center bg-slate-900 py-3 px-1 rounded-xl border border-slate-900 hover:border-cyan-500/30 transition-all">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border border-slate-700">
                      <a href={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=100`} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.role)}&background=1e293b&color=cbd5e1&size=100`} alt={member.role} className="w-full h-full object-cover object-center rounded-full" />
                      </a>
                    </div>
                    <p className="text-cyan-300 text-[7px] sm:text-[8px] font-bold uppercase mb-0.5 sm:mb-1">{member.role}</p>
                    <h3 className="text-[8px] sm:text-[9px] font-semibold text-white leading-tight">{member.name || "Name Here"}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formal Minimalist Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-800/80 py-6 px-6 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-500">
          <div className="flex items-center gap-2.5">

            <span className="font-bold text-slate-400">Puliyamparambu Youth Development Center</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 font-medium">
            <Link to="/medical" className="hover:text-blue-400 transition-colors">Medical Portal</Link>
            <Link to="/library" className="hover:text-blue-400 transition-colors">Library Portal</Link>
            <Link to="/medical/admin/login" className="hover:text-blue-400 transition-colors">Admin Login</Link>
          </div>

          <p>© 2026 PYDC. All rights reserved | Crafted by: <a href="https://www.instagram.com/remiize.llo" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">Rameesllo</a></p>
        </div>
      </footer>
    </div>
  );
}
