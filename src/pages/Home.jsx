import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BookCard from "../components/BookCard";
import Footer from "../components/Footer";
import { useSupabase } from "../hooks/useSupabase";

export default function Home() {
  const { books, loading } = useSupabase();
  const featuredBooks = books.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <Hero />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-10 py-12 w-full">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary">Featured Books</h2>
          <p className="text-slate-500 mt-2">Explore some of our handpicked books</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white border border-slate-200 shadow-sm rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
