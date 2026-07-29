import { Link } from "react-router-dom";
import { FiBookmark } from "react-icons/fi";

export default function BookCard({ book }) {
  return (
    <div className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col relative">
      <button className="absolute top-3 right-3 p-2 bg-white/70 backdrop-blur-sm rounded-full text-slate-400 hover:text-primary hover:bg-white transition-colors z-10 shadow-sm">
        <FiBookmark />
      </button>
      <Link to={`/library/book/${book.id}`} className="block relative overflow-hidden bg-slate-100/50 pt-8 pb-4 px-6 flex justify-center border-b border-slate-100">
        <img 
          src={book.image} 
          alt={book.title} 
          className="h-48 w-32 object-cover shadow-lg group-hover:scale-105 transition-transform duration-500 rounded-sm"
        />
      </Link>
      <div className="p-5 flex-1 flex flex-col bg-white">
        <h3 className="font-bold text-secondary text-lg truncate" title={book.title}>{book.title}</h3>
        <p className="text-slate-500 text-sm mb-4">{book.author}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">{book.category}</span>
          <span className={`text-xs font-semibold ${book.status === 'Available' ? 'text-green-500' : 'text-red-500'}`}>
            {book.status}
          </span>
        </div>
      </div>
    </div>
  );
}
