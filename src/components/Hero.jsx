import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBookOpen, FiCheckCircle, FiUsers, FiGrid } from "react-icons/fi";
import { stats } from "../data/books";
import { motion } from "framer-motion";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/library/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="grid lg:grid-cols-2 items-center px-6 md:px-10 py-16 md:py-24 gap-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-primary font-bold text-xs mb-4 tracking-widest uppercase">Read More, Know More</div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight text-secondary">
          Welcome to <br />
          <span className="text-primary">PYDC PUBLIC LIBRARY</span>
        </h1>
        
        <p className="mt-6 text-slate-500 text-lg md:text-xl max-w-lg leading-relaxed">
          Thousands of books, endless knowledge.
          Find, read and explore your next favorite book.
        </p>
        
        <div className="flex mt-10 gap-3 max-w-lg bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex-1 flex items-center px-4">
            <FiSearch className="text-slate-400 text-xl" />
            <input 
              type="text" 
              placeholder="Search books, author, category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-transparent outline-none px-3 py-2 text-slate-700"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-primary/30"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
            <FiBookOpen className="text-2xl text-primary mb-2" />
            <h2 className="text-xl font-bold text-secondary">{stats.totalBooks.toLocaleString()}+</h2>
            <p className="text-xs text-slate-500 mt-1">Total Books</p>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
            <FiCheckCircle className="text-2xl text-primary mb-2" />
            <h2 className="text-xl font-bold text-secondary">{stats.availableBooks.toLocaleString()}+</h2>
            <p className="text-xs text-slate-500 mt-1">Available Books</p>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
            <FiUsers className="text-2xl text-primary mb-2" />
            <h2 className="text-xl font-bold text-secondary">{stats.totalMembers.toLocaleString()}+</h2>
            <p className="text-xs text-slate-500 mt-1">Members</p>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
            <FiGrid className="text-2xl text-primary mb-2" />
            <h2 className="text-xl font-bold text-secondary">25+</h2>
            <p className="text-xs text-slate-500 mt-1">Categories</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative flex justify-center items-center h-[480px] w-full"
      >
        {/* Massive premium colored blurs floating outside/behind the image */}
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-blue-400/25 rounded-full blur-[100px] opacity-70 -z-10"></div>
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-80 -z-10"></div>
        
        {/* The clean, sharp premium container with a true WebkitMaskImage ellipse to blur the borders organically into the background and glowing blurs */}
        <div 
          className="relative h-full w-full flex items-center justify-center"
          style={{
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
          }}
        >
          <img 
            src="/hero_illustration.jpg" 
            alt="Library Illustration" 
            className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
          />
        </div>
      </motion.div>
    </section>
  );
}
