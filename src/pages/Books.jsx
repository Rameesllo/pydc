import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import { categories } from "../data/books";
import { useSupabase } from "../hooks/useSupabase";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("Sort by: Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { books, loading } = useSupabase();

  // Sync state if query parameter changes from navbar/hero
  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearchQuery(q);
    setCurrentPage(1);
  }, [searchParams]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
    if (val.trim()) {
      setSearchParams({ search: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = activeCategory === "All Categories" || book.category === activeCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "Sort by: Rating") {
      return b.rating - a.rating;
    } else if (sortBy === "Sort by: Title (A-Z)") {
      return a.title.localeCompare(b.title);
    } else {
      // Sort by newest published year
      return b.year - a.year;
    }
  });

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-10 py-8 w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-xl font-bold text-secondary mb-4 md:mb-6">Categories</h2>
            <div className="flex flex-row overflow-x-auto gap-2 md:flex-col pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`whitespace-nowrap md:w-full md:text-left py-2 px-4 rounded-xl font-medium transition-colors shrink-0 ${
                    activeCategory === cat
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Catalog */}
        <div className="flex-1">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full sm:w-96">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search books..." 
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <select 
                value={activeCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl outline-none shadow-sm flex-1 sm:flex-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="All Categories">All Categories</option>
                {categories.filter(c => c !== "All Categories").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl outline-none shadow-sm flex-1 sm:flex-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="Sort by: Newest">Sort by: Newest</option>
                <option value="Sort by: Rating">Sort by: Rating</option>
                <option value="Sort by: Title (A-Z)">Sort by: Title (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white border border-slate-200 shadow-sm rounded-2xl h-80 animate-pulse animate-duration-1000"></div>
              ))
            ) : currentBooks.length > 0 ? (
              currentBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-secondary mb-2">No books found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && sortedBooks.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:bg-slate-200"
                }`}
              >
                <FiChevronLeft />
              </button>
              
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "text-slate-600 hover:bg-slate-200 bg-white border border-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:bg-slate-200"
                }`}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
