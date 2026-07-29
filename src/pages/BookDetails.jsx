import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import { useSupabase } from "../hooks/useSupabase";
import { FiChevronLeft, FiHeart, FiCheck, FiMapPin, FiStar, FiShare2, FiCalendar, FiClock, FiX } from "react-icons/fi";

export default function BookDetails() {
  const { id } = useParams();
  const { books, loading } = useSupabase();
  const book = books.find(b => b.id === parseInt(id)) || books[0];
  const similarBooks = books.filter(b => b.category === book.category && b.id !== book.id).slice(0, 4);

  // Dynamic interactive states
  const [isReserved, setIsReserved] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-6 md:px-10 py-8 w-full flex justify-center items-center">
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading book details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleReservation = () => {
    setIsReserved(true);
    setShowModal(true);
  };

  const handleCancelReservation = () => {
    setIsReserved(false);
    setShowModal(false);
  };

  const displayedStatus = isReserved ? "Reserved" : book.status;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-10 py-8 w-full">
        <Link to="/library/books" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-8 transition-colors">
          <FiChevronLeft className="mr-1" /> Back to Books
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-12 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 mb-16">
          
          {/* Left Column - Image */}
          <div className="w-full lg:w-1/3 shrink-0 flex flex-col items-center">
            <div className="bg-slate-100 w-full rounded-2xl p-8 flex justify-center mb-6 relative group overflow-hidden">
              <img 
                src={book.image} 
                alt={book.title} 
                className="w-full max-w-[280px] object-cover shadow-2xl rounded-sm group-hover:scale-105 transition-transform duration-500"
              />
              {isReserved && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white font-bold px-4 py-1.5 rounded-full shadow-lg text-sm flex items-center gap-1.5 animate-bounce">
                  <FiCheck /> Reserved
                </div>
              )}
            </div>
            <div className="flex gap-4 w-full">
              {isReserved ? (
                <button 
                  onClick={handleCancelReservation}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium shadow-md shadow-red-500/20 hover:bg-red-600 transition-colors animate-fadeIn"
                >
                  Cancel Hold
                </button>
              ) : (
                <button 
                  onClick={handleReservation}
                  disabled={book.status !== "Available"}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    book.status === "Available"
                      ? "bg-primary text-white shadow-md shadow-primary/30 hover:bg-blue-700"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {book.status === "Available" ? "Reserve Book" : "Out of Stock"}
                </button>
              )}
              <button 
                onClick={() => setInWishlist(!inWishlist)}
                className={`flex-1 border py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm ${
                  inWishlist 
                    ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100" 
                    : "bg-white text-secondary border-slate-200 hover:bg-slate-50"
                }`}
              >
                <FiHeart className={inWishlist ? "fill-red-500 text-red-500" : ""} /> 
                {inWishlist ? "In Wishlist" : "Wishlist"}
              </button>
            </div>
          </div>

          {/* Middle Column - Details */}
          <div className="w-full lg:w-1/3">
            <h1 className="text-4xl font-bold text-secondary mb-2">{book.title}</h1>
            <p className="text-lg text-slate-500 mb-4">by <span className="text-primary font-medium">{book.author}</span></p>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(star => (
                  <FiStar key={star} className={star <= Math.round(book.rating) ? "fill-current" : ""} />
                ))}
              </div>
              <span className="font-medium text-secondary">{book.rating}</span>
              <span className="text-slate-400 text-sm">({book.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="flex gap-3 mb-8">
              <span className="px-3 py-1 bg-blue-50 text-primary text-sm font-medium rounded-lg">{book.category}</span>
              <span className="px-3 py-1 bg-orange-50 text-orange-600 text-sm font-medium rounded-lg">Best Seller</span>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Book No</p>
                <p className="font-bold text-primary font-mono text-base">{book.book_no || "BK-9021"}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">ISBN</p>
                <p className="font-medium text-secondary">{book.isbn || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Published Year</p>
                <p className="font-medium text-secondary">{book.year}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Publisher</p>
                <p className="font-medium text-secondary">{book.publisher}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Language</p>
                <p className="font-medium text-secondary">{book.language}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Status */}
          <div className="w-full lg:w-1/3">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
              <h3 className="font-bold text-secondary mb-4">Book Status</h3>
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 rounded-full mt-1 ${
                  displayedStatus === 'Available' 
                    ? 'bg-green-100 text-green-600' 
                    : displayedStatus === 'Reserved' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-red-100 text-red-600'
                }`}>
                  <FiCheck />
                </div>
                <div>
                  <p className={`font-semibold ${
                    displayedStatus === 'Available' 
                      ? 'text-green-600' 
                      : displayedStatus === 'Reserved' 
                        ? 'text-orange-600' 
                        : 'text-red-600'
                  }`}>
                    {displayedStatus}
                  </p>
                  <p className="text-sm text-slate-500">Live acquisition status</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full mt-1 bg-blue-100 text-primary">
                  <FiMapPin />
                </div>
                <div>
                  <p className="font-semibold text-secondary">Location</p>
                  <p className="text-sm text-slate-500">{book.location}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="font-semibold text-secondary mb-2">Member Rating</p>
                  <div className="flex text-yellow-400 mb-1">
                    {[1,2,3,4,5].map(star => (
                      <FiStar key={star} className={star <= Math.round(book.rating) ? "fill-current" : ""} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">{book.rating} ({book.reviews} reviews)</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-secondary mb-4">Share</h3>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md" title="Share on Facebook">
                  <FiShare2 />
                </button>
                <button className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md" title="Share on WhatsApp">
                  <FiShare2 />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md" title="Copy Link">
                  <FiShare2 />
                </button>
              </div>
            </div>
          </div>
          
        </div>

        {/* Similar Books */}
        <div>
          <h2 className="text-2xl font-bold text-secondary mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarBooks.map(b => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      </main>

      {/* Reservation Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 animate-fadeIn">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
              🎉
            </div>
            <h3 className="text-2xl font-bold text-center text-secondary mb-2">Reservation Placed!</h3>
            <p className="text-slate-500 text-center mb-6">
              We have successfully placed a hold on Santiago's copy of <span className="font-semibold text-secondary">"{book.title}"</span>.
            </p>

            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm mb-6">
              <div className="flex items-center gap-3 text-slate-600">
                <FiMapPin className="text-primary text-lg" />
                <div>
                  <p className="font-semibold text-secondary">Pickup Location</p>
                  <p>{book.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <FiCalendar className="text-primary text-lg" />
                <div>
                  <p className="font-semibold text-secondary">Pickup Deadline</p>
                  <p>Hold expires in 3 days (May 21, 2026)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <FiClock className="text-primary text-lg" />
                <div>
                  <p className="font-semibold text-secondary">Library Hours</p>
                  <p>Mon - Fri: 8:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold shadow-md shadow-primary/30 hover:bg-blue-700 transition-colors"
            >
              Got it, Thank you!
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
