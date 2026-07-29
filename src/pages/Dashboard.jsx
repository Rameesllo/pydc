import { useState, useEffect } from "react";
import { 
  FiHome, 
  FiBook, 
  FiUsers, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiPieChart, 
  FiPlus, 
  FiCheck, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiAlertTriangle, 
  FiBookOpen, 
  FiMapPin, 
  FiInfo,
  FiCalendar,
  FiPhone,
  FiMail,
  FiUserPlus,
  FiCheckCircle,
  FiClock
} from "react-icons/fi";
import { Line, Pie } from "react-chartjs-2";
import { supabase } from "../supabaseClient";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { stats } from "../data/books";
import { Link, useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Fallback initial seeds if database tables are not built yet
const initialLocalMembers = [
  { id: 1, name: "Yasir Arafath", phone: "+91 9876543210", email: "yasir@pydc.org", created_at: new Date().toISOString() },
  { id: 2, name: "Fathima Riba", phone: "+91 9876543211", email: "riba@pydc.org", created_at: new Date().toISOString() },
  { id: 3, name: "Adil Nandan", phone: "+91 9876543212", email: "nandan@pydc.org", created_at: new Date().toISOString() }
];

const initialLocalCheckouts = [
  { id: 1, member_id: 1, book_id: 1, checkout_date: new Date().toISOString().split('T')[0], status: "Borrowed" },
  { id: 2, member_id: 1, book_id: 2, checkout_date: "2026-05-10", status: "Returned" }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "books" | "members"
  
  // Real-time Database States
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState(initialLocalMembers);
  const [checkouts, setCheckouts] = useState(initialLocalCheckouts);

  const [totalCount, setTotalCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search filters
  const [adminSearch, setAdminSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  // CRUD Modals and Toasts
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addCoverMode, setAddCoverMode] = useState("file");
  const [editCoverMode, setEditCoverMode] = useState("file");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnContext, setReturnContext] = useState(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  
  const [toastMessage, setToastMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active Contexts
  const [activeMemberForIssue, setActiveMemberForIssue] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  // Add Book State
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=250",
    rating: 4.8,
    reviews: 15,
    status: "Available",
    location: "Fiction Section - Shelf F3",
    isbn: "978-3161484100",
    year: 2024,
    language: "English",
    publisher: "BookNest Publishing",
    book_no: ""
  });

  // Edit Book State
  const [bookToEdit, setBookToEdit] = useState(null);

  // Delete Book State
  const [bookIdToDelete, setBookIdToDelete] = useState(null);
  const [bookTitleToDelete, setBookTitleToDelete] = useState("");

  // Add Member State
  const [newMember, setNewMember] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // Issue Book Form State
  const [selectedBookId, setSelectedBookId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch all databases with automatic fallback
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .order('id', { ascending: false });

      if (booksError) throw booksError;
      if (booksData) {
        setBooks(booksData);
        setTotalCount(booksData.length);
        
        const avail = booksData.reduce((sum, b) => sum + (b.status === "Available" ? 1 : 0), 0);
        setAvailableCount(avail);
        
        const outStock = booksData.reduce((sum, b) => sum + (b.status === "Not Available" || b.status === "Reserved" ? 1 : 0), 0);
        setOutOfStockCount(outStock);
      }

      // 2. Fetch members
      try {
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .order('id', { ascending: false });
        if (!membersError && membersData && membersData.length > 0) {
          setMembers(membersData);
        }
      } catch (e) {
        console.warn("Using local state for members", e);
      }

      // 3. Fetch checkouts
      try {
        const { data: checkoutsData, error: checkoutsError } = await supabase
          .from('checkouts')
          .select('*')
          .order('id', { ascending: false });
        if (!checkoutsError && checkoutsData && checkoutsData.length > 0) {
          setCheckouts(checkoutsData);
        }
      } catch (e) {
        console.warn("Using local state for checkouts", e);
      }

    } catch (err) {
      console.error("Error fetching data from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle converting local folder images into Base64 strings with ultra-low-size canvas compression
  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 200; // Perfect small thumbnail size
          const MAX_HEIGHT = 280; // Standard book aspect ratio
          let width = img.width;
          let height = img.height;

          // Scaled proportion mapping
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas image to JPEG with 0.3 quality (extremely low KB, super light!)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.3);
          
          if (isEdit) {
            setBookToEdit(prev => ({ ...prev, image: compressedBase64 }));
          } else {
            setNewBook(prev => ({ ...prev, image: compressedBase64 }));
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Download library books template CSV for excel bulk data copy-pasting
  const downloadCSVTemplate = () => {
    const headers = "Title,Author,Category,Book No,Cover Image URL,Shelf Location,ISBN,Year,Language,Publisher\n";
    const sample = "The Alchemist,Paulo Coelho,Fiction,BK-4012,https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=250,Fiction Section - Shelf F1,978-0062315007,1988,English,HarperCollins\n";
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pydc_library_books_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk CSV Book Importer
  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubmitting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          alert("Invalid CSV format. Please include headers and at least one data row!");
          setSubmitting(false);
          return;
        }

        const bookRecords = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          // Split line by commas supporting quotation marks!
          const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          const cleanedValues = values.map(v => v.trim().replace(/^["']|["']$/g, ''));

          if (cleanedValues.length < 3) continue; // Skip corrupted rows

          const bookRecord = {
            title: cleanedValues[0] || "Untitled Book",
            author: cleanedValues[1] || "Unknown Author",
            category: cleanedValues[2] || "General Section",
            book_no: cleanedValues[3] || `BK-${Math.floor(Math.random() * 90000) + 10000}`,
            image: cleanedValues[4] || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=250",
            location: cleanedValues[5] || "General Section - Shelf G1",
            isbn: cleanedValues[6] || "978-0000000000",
            year: parseInt(cleanedValues[7]) || 2024,
            language: cleanedValues[8] || "English",
            publisher: cleanedValues[9] || "Unknown Publisher",
            status: "Available",
            rating: 4.5,
            reviews: 0
          };

          bookRecords.push(bookRecord);
        }

        if (bookRecords.length === 0) {
          alert("No valid book records could be parsed from the CSV!");
          setSubmitting(false);
          return;
        }

        // Supabase batch insert (100 records per batch)
        const BATCH_SIZE = 100;
        let successCount = 0;
        let supabaseFailed = false;

        for (let idx = 0; idx < bookRecords.length; idx += BATCH_SIZE) {
          const batch = bookRecords.slice(idx, idx + BATCH_SIZE);
          const { error } = await supabase
            .from('books')
            .insert(batch);
          
          if (error) {
            console.warn("Supabase CSV batch insert failed, falling back to local memory state:", error.message);
            supabaseFailed = true;
          } else {
            successCount += batch.length;
          }
        }

        if (supabaseFailed && successCount === 0) {
          // If Supabase failed completely, insert into local React state!
          setBooks(prev => [...bookRecords, ...prev]);
          setTotalCount(prev => prev + bookRecords.length);
          const avail = bookRecords.reduce((sum, b) => sum + (b.status === "Available" ? 1 : 0), 0);
          setAvailableCount(prev => prev + avail);
          setToastMessage(`[Local Fallback] Successfully loaded ${bookRecords.length} books into offline memory catalog!`);
        } else {
          setToastMessage(`Successfully imported ${successCount} books into Supabase database catalog!`);
          fetchData();
        }

        setShowCSVModal(false);
        setTimeout(() => setToastMessage(""), 5000);

      } catch (err) {
        console.error("CSV import crash:", err);
        alert(`Bulk import error: ${err.message}`);
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsText(file);
  };

  // Add Book Action
  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.book_no.trim()) {
      alert("Please fill in Title, Author, and Book Number!");
      return;
    }
    setSubmitting(true);
    try {
      const bookData = {
        ...newBook,
        rating: parseFloat(newBook.rating),
        reviews: parseInt(newBook.reviews),
        year: parseInt(newBook.year),
        status: newBook.status
      };

      const { error } = await supabase
        .from('books')
        .insert([bookData]);

      if (error) throw error;

      setToastMessage(`"${newBook.title}" successfully added to database!`);
      setShowAddModal(false);
      
      // Reset form
      setNewBook({
        title: "",
        author: "",
        category: "Fiction",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=250",
        rating: 4.8,
        reviews: 15,
        status: "Available",
        location: "Fiction Section - Shelf F3",
        isbn: "978-3161484100",
        year: 2024,
        language: "English",
        publisher: "BookNest Publishing",
        book_no: ""
      });

      fetchData();
      setTimeout(() => setToastMessage(""), 4000);

    } catch (err) {
      console.error(err);
      alert("Failed to insert book: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Book Trigger
  const handleEditClick = (book) => {
    setBookToEdit({ ...book });
    setShowEditModal(true);
  };

  // Edit Book Submit
  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookToEdit.title.trim() || !bookToEdit.author.trim() || !bookToEdit.book_no.trim()) {
      alert("Please fill in Title, Author, and Book Number!");
      return;
    }
    setSubmitting(true);
    try {
      const updatedData = {
        ...bookToEdit,
        rating: parseFloat(bookToEdit.rating),
        reviews: parseInt(bookToEdit.reviews),
        year: parseInt(bookToEdit.year),
        status: bookToEdit.status
      };
      
      // Remove auto-generated fields before update
      delete updatedData.id;
      delete updatedData.created_at;

      const { error } = await supabase
        .from('books')
        .update(updatedData)
        .eq('id', bookToEdit.id);

      if (error) throw error;

      setToastMessage(`"${bookToEdit.title}" specifications updated successfully!`);
      setShowEditModal(false);
      fetchData();
      
      setTimeout(() => setToastMessage(""), 4000);

    } catch (err) {
      console.error(err);
      alert("Failed to update book: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Book Actions
  const handleDeleteClick = (bookId, title) => {
    setBookIdToDelete(bookId);
    setBookTitleToDelete(title);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookIdToDelete);

      if (error) throw error;

      setToastMessage(`"${bookTitleToDelete}" has been deleted from the database.`);
      setShowDeleteModal(false);
      fetchData();

      setTimeout(() => setToastMessage(""), 4000);

    } catch (err) {
      console.error(err);
      alert("Failed to delete book: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Add Member Action
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.phone.trim() || !newMember.email.trim()) {
      alert("Please fill in member Name, Phone, and Email!");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Try to insert to Supabase
      const { data, error } = await supabase
        .from('members')
        .insert([newMember])
        .select();

      if (error) throw error;

      setToastMessage(`New Member "${newMember.name}" successfully registered!`);
      setShowAddMemberModal(false);
      setNewMember({ name: "", phone: "", email: "" });
      fetchData();
      setTimeout(() => setToastMessage(""), 4000);

    } catch (err) {
      console.warn("Supabase member write failed, falling back to local memory update:", err.message);
      // Fallback local insert
      const fallbackMember = {
        id: members.length + 1,
        ...newMember,
        created_at: new Date().toISOString()
      };
      setMembers([fallbackMember, ...members]);
      setToastMessage(`[Local State] Member "${newMember.name}" registered successfully!`);
      setShowAddMemberModal(false);
      setNewMember({ name: "", phone: "", email: "" });
      setTimeout(() => setToastMessage(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Give/Issue Book Action
  const handleIssueBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      alert("Please select a book!");
      return;
    }
    
    // Resolve target member
    const targetMember = activeMemberForIssue || members.find(m => m.id === parseInt(selectedMemberId));
    if (!targetMember) {
      alert("Please select a registered library member!");
      return;
    }

    setSubmitting(true);
    const targetBook = books.find(b => b.id === parseInt(selectedBookId));
    if (!targetBook) {
      setSubmitting(false);
      return;
    }

    try {
      // 1. Write Checkout to database
      const checkoutPayload = {
        member_id: targetMember.id,
        book_id: targetBook.id,
        checkout_date: issueDate,
        status: "Borrowed"
      };

      const { error: checkoutError } = await supabase
        .from('checkouts')
        .insert([checkoutPayload]);

      // 2. Toggle book status to Reserved / Borrowed
      const { error: bookError } = await supabase
        .from('books')
        .update({ status: 'Reserved' })
        .eq('id', targetBook.id);

      if (checkoutError || bookError) throw (checkoutError || bookError);

      setToastMessage(`"${targetBook.title}" successfully issued to ${targetMember.name}!`);
      setShowIssueModal(false);
      setSelectedBookId("");
      setSelectedMemberId("");
      fetchData();
      setTimeout(() => setToastMessage(""), 4000);

    } catch (err) {
      console.warn("Supabase checkout failed, applying to local state fallback:", err.message);
      // Local fallback checkout logic
      const fallbackCheckout = {
        id: checkouts.length + 1,
        member_id: targetMember.id,
        book_id: targetBook.id,
        checkout_date: issueDate,
        status: "Borrowed"
      };
      
      setCheckouts([fallbackCheckout, ...checkouts]);
      
      // Update local book status
      setBooks(books.map(b => b.id === targetBook.id ? { ...b, status: 'Reserved' } : b));
      setToastMessage(`[Local State] "${targetBook.title}" issued to ${targetMember.name}!`);
      setShowIssueModal(false);
      setSelectedBookId("");
      setSelectedMemberId("");
      setTimeout(() => setToastMessage(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Return Book Action (Updates checkout record status to 'Returned' so history is preserved!)
  const handleMarkReturned = async (checkoutId, bookId, memberName) => {
    try {
      // 1. Update Checkout status to 'Returned' in Supabase to preserve history
      const { error: checkoutError } = await supabase
        .from('checkouts')
        .update({ status: 'Returned' })
        .eq('id', checkoutId);

      // 2. Update Book status back to 'Available'
      const { error: bookError } = await supabase
        .from('books')
        .update({ status: 'Available' })
        .eq('id', bookId);

      if (checkoutError || bookError) throw (checkoutError || bookError);

      setToastMessage(`Book marked returned successfully! History updated.`);
      fetchData();
      setTimeout(() => setToastMessage(""), 4000);

    } catch (err) {
      console.warn("Supabase return failed, falling back to local update:", err.message);
      // Local fallback return updates checkout status instead of deleting it
      setCheckouts(checkouts.map(c => c.id === checkoutId ? { ...c, status: 'Returned' } : c));
      setBooks(books.map(b => b.id === bookId ? { ...b, status: 'Available' } : b));
      setToastMessage(`[Local State] Book returned successfully! History preserved.`);
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  // Category distribution aggregation
  const getPieChartData = () => {
    const counts = {};
    books.forEach(b => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    
    const labels = Object.keys(counts);
    const data = Object.values(counts);

    if (labels.length === 0) {
      return {
        labels: ['No Books'],
        datasets: [{ data: [1], backgroundColor: ['#E2E8F0'], borderWidth: 0 }]
      };
    }

    const colors = [
      '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#E2E8F0', '#94A3B8', '#F1F5F9'
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
        }
      ]
    };
  };

  const lineChartData = {
    labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Live'],
    datasets: [
      {
        label: 'Total Books in Catalog',
        data: [10, 15, 20, 30, 45, books.length],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  // Filters
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(adminSearch.toLowerCase()) ||
    b.category.toLowerCase().includes(adminSearch.toLowerCase()) ||
    (b.isbn && b.isbn.toLowerCase().includes(adminSearch.toLowerCase())) ||
    (b.book_no && b.book_no.toLowerCase().includes(adminSearch.toLowerCase()))
  );

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.phone.includes(memberSearch) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex animate-fadeIn">
      
      {/* Sidebar */}
      <aside className={`bg-[#0f172a] text-slate-300 w-64 shrink-0 transition-all duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute h-full z-50'}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-3">
            <img 
              src="/pydc_logo.png" 
              alt="PYDC Logo" 
              className="w-8 h-8 object-contain rounded-full bg-white shadow-sm border border-slate-700"
            />
            PYDC <span className="text-xs text-slate-400 font-normal">Admin</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <FiX className="text-2xl" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "overview" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-800"
            }`}
          >
            <FiHome /> Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab("books")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "books" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-800"
            }`}
          >
            <FiBook /> Book Catalog
          </button>

          <button 
            onClick={() => setActiveTab("members")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "members" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-800"
            }`}
          >
            <FiUsers /> Members Directory
          </button>

          <div className="border-t border-slate-800 my-4 pt-4 space-y-1">
            <p className="text-slate-500 text-xs font-semibold px-4 mb-2 uppercase tracking-wider">Quick Controls</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-xl transition-colors pl-6 text-sm text-slate-400 hover:text-white"
            >
              <FiPlus /> Add New Book
            </button>
            <button 
              onClick={() => setShowAddMemberModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-xl transition-colors pl-6 text-sm text-slate-400 hover:text-white"
            >
              <FiUserPlus /> Add New Member
            </button>
            <button 
              onClick={() => {
                setActiveMemberForIssue(null); // Enables Member select dropdown
                setSelectedBookId("");
                setSelectedMemberId("");
                setShowIssueModal(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-xl transition-colors pl-6 text-sm text-slate-400 hover:text-white"
            >
              <FiBookOpen /> Issue / Give Book
            </button>
          </div>
        </nav>
        
        <div className="p-4">
          <Link to="/library" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-red-400 font-semibold">
            <FiLogOut /> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden flex flex-col h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-primary">
              <FiMenu className="text-2xl" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-secondary capitalize">
                {activeTab === 'overview' ? 'Consolidated Overview' : activeTab === 'books' ? 'Catalog Suite' : 'Registered Members'}
              </h2>
              <p className="text-sm text-slate-500">PYDC Public Library Management Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'members' ? (
              <button 
                onClick={() => setShowAddMemberModal(true)}
                className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2"
              >
                <FiUserPlus /> Add Member
              </button>
            ) : (
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2"
              >
                <FiPlus /> Add Book
              </button>
            )}
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          
          {/* Toast Alert Banner */}
          {toastMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl flex items-center gap-3 shadow-sm animate-fadeIn">
              <span className="p-1 bg-green-500 text-white rounded-full"><FiCheck className="text-xs" /></span>
              <p className="font-semibold text-sm">{toastMessage}</p>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium text-sm">Syncing live library catalog...</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Tab 1: Consolidated Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Real-time Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <p className="text-slate-500 text-sm font-medium mb-2">Total Catalog Titles</p>
                      <h3 className="text-3xl font-extrabold text-secondary mb-1">{totalCount}</h3>
                      <p className="text-green-500 text-xs flex items-center gap-1 font-semibold">● Real-time synced</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <p className="text-slate-500 text-sm font-medium mb-2">Available for Borrowing</p>
                      <h3 className="text-3xl font-extrabold text-secondary mb-1">{availableCount}</h3>
                      <p className="text-green-500 text-xs flex items-center gap-1 font-semibold">● Ready for checkout</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <p className="text-slate-500 text-sm font-medium mb-2">Issued to Members</p>
                      <h3 className="text-3xl font-extrabold text-orange-500 mb-1">{checkouts.filter(c => c.status === 'Borrowed').length}</h3>
                      <p className="text-orange-400 text-xs flex items-center gap-1 font-semibold">● Active library holds</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <p className="text-slate-500 text-sm font-medium mb-2">Registered Members</p>
                      <h3 className="text-3xl font-extrabold text-secondary mb-1">{members.length}</h3>
                      <p className="text-green-500 text-xs flex items-center gap-1 font-semibold">● Valid library cards</p>
                    </div>
                  </div>

                  {/* Dynamic Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Line Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-secondary">Acquisitions Growth</h3>
                        <span className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full font-bold font-mono">Real-time</span>
                      </div>
                      <div className="flex-1 min-h-[250px]">
                        <Line data={lineChartData} options={lineChartOptions} />
                      </div>
                    </div>

                    {/* Dynamic Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-secondary">Category Distribution</h3>
                        <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">100% True</span>
                      </div>
                      <div className="flex-1 min-h-[250px] flex items-center justify-center">
                        <div className="w-full max-w-[200px]">
                          <Pie data={getPieChartData()} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: Book Catalog crud */}
              {activeTab === "books" && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn flex flex-col">
                  
                  {/* Search and Table Actions */}
                  <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-xl w-full md:w-96 focus-within:border-primary transition-all shadow-sm">
                      <FiSearch className="text-slate-400 mr-2" />
                      <input 
                        type="text"
                        placeholder="Search catalog titles, author, Book No..."
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full text-secondary"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => setShowCSVModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-xl text-sm flex items-center gap-2 shadow-md shadow-green-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all w-full md:w-auto justify-center cursor-pointer"
                      >
                        📁 Bulk Import (CSV)
                      </button>
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary py-2 px-5 text-sm flex items-center gap-2 shrink-0 w-full md:w-auto justify-center shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <FiPlus /> Add New Book
                      </button>
                    </div>
                  </div>

                  {/* Main CRUD Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Book Details</th>
                          <th className="px-6 py-4 font-semibold">Category</th>
                          <th className="px-6 py-4 font-semibold">ISBN & Shelf</th>
                          <th className="px-6 py-4 font-semibold">Book No</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-secondary">
                        {filteredBooks.map((book) => (
                          <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-12 h-16 bg-slate-100 rounded-lg shrink-0 overflow-hidden shadow-md border border-slate-200">
                                <img src={book.image} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-secondary text-base">{book.title}</p>
                                <p className="text-slate-500 text-xs">by <span className="text-primary font-semibold">{book.author}</span></p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                                {book.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-mono text-xs text-slate-500">{book.isbn || 'No ISBN'}</p>
                              <p className="text-slate-400 text-xs mt-0.5">{book.location || 'Shelf F3'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-50 text-primary text-sm font-mono font-bold rounded-lg border border-blue-100">
                                {book.book_no || "BK-9021"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                book.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${book.status === 'Available' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                {book.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 justify-center">
                                <button 
                                  onClick={() => handleEditClick(book)}
                                  className="p-2 bg-blue-50 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-sm"
                                  title="Edit Specs"
                                >
                                  <FiEdit2 />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(book.id, book.title)}
                                  className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm"
                                  title="Delete Book"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredBooks.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center py-12 text-slate-400">
                              <FiInfo className="text-3xl mx-auto mb-2 text-slate-300" />
                              <p className="font-medium">No books matching your query found.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* Tab 3: Members Directory (Circulation Suite) */}
              {activeTab === "members" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Controls */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl w-full md:w-96 focus-within:border-primary transition-all shadow-sm">
                      <FiSearch className="text-slate-400 mr-2" />
                      <input 
                        type="text"
                        placeholder="Search member name, email, phone..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full text-secondary"
                      />
                    </div>
                    <button 
                      onClick={() => setShowAddMemberModal(true)}
                      className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 shrink-0 w-full md:w-auto justify-center"
                    >
                      <FiUserPlus /> Add New Member
                    </button>
                  </div>

                  {/* Member Directory Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member) => {
                      // Separate current active borrows vs return history
                      const activeCheckouts = checkouts.filter(c => c.member_id === member.id && c.status === 'Borrowed');
                      const returnedHistory = checkouts.filter(c => c.member_id === member.id && c.status === 'Returned');

                      return (
                        <div key={member.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden hover:shadow-md transition-shadow">
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                          
                          {/* Member Main Metadata */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center font-bold text-lg border border-blue-100">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-secondary text-lg">{member.name}</h4>
                              <p className="text-slate-400 text-xs flex items-center gap-1"><FiCalendar /> Joined {new Date(member.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Member Contacts */}
                          <div className="space-y-2 text-sm text-slate-600 border-t border-b border-slate-100 py-3 mb-4">
                            <p className="flex items-center gap-2"><FiPhone className="text-slate-400" /> {member.phone}</p>
                            <p className="flex items-center gap-2"><FiMail className="text-slate-400 truncate" /> <span className="truncate">{member.email}</span></p>
                          </div>

                          {/* Borrowing Operations & Logs */}
                          <div className="flex-1 space-y-4">
                            
                            {/* Section 1: Active Holds */}
                            <div>
                              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1"><FiClock className="text-orange-400" /> Currently Borrowed ({activeCheckouts.length})</p>
                              {activeCheckouts.length > 0 ? (
                                <div className="space-y-2">
                                  {activeCheckouts.map(checkout => {
                                    const linkedBook = books.find(b => b.id === checkout.book_id);
                                    return (
                                      <div key={checkout.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs gap-2">
                                        <div className="truncate">
                                          <p className="font-bold text-secondary truncate">{linkedBook ? linkedBook.title : 'Database Book'}</p>
                                          <p className="text-slate-500 font-mono text-[10px] mt-0.5">No: {linkedBook ? linkedBook.book_no : 'N/A'} | Issued: {checkout.checkout_date}</p>
                                        </div>
                                        <button 
                                          onClick={() => {
                                            setReturnContext({
                                              checkoutId: checkout.id,
                                              bookId: checkout.book_id,
                                              bookTitle: linkedBook ? linkedBook.title : 'Database Book',
                                              memberName: member.name
                                            });
                                            setShowReturnModal(true);
                                          }}
                                          className="shrink-0 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white px-2.5 py-1 rounded-lg font-bold border border-green-200 transition-colors"
                                          title="Mark Returned"
                                        >
                                          Return
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200 text-center">No active holds</p>
                              )}
                            </div>

                            {/* Section 2: Returns History */}
                            <div>
                              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1"><FiCheckCircle className="text-green-500" /> Return History ({returnedHistory.length})</p>
                              {returnedHistory.length > 0 ? (
                                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                                  {returnedHistory.map(checkout => {
                                    const linkedBook = books.find(b => b.id === checkout.book_id);
                                    return (
                                      <div key={checkout.id} className="bg-slate-100/50 p-2 rounded-lg text-[11px] border border-slate-200/50 flex justify-between gap-2">
                                        <span className="text-slate-600 font-medium truncate">{linkedBook ? linkedBook.title : 'Catalog Book'}</span>
                                        <span className="shrink-0 text-slate-400 font-mono font-bold text-[9px]">No: {linkedBook ? linkedBook.book_no : 'N/A'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic text-center p-1">No past return history</p>
                              )}
                            </div>

                          </div>

                          {/* Issue Button */}
                          <button 
                            onClick={() => {
                              setActiveMemberForIssue(member);
                              setSelectedBookId("");
                              setSelectedMemberId("");
                              setShowIssueModal(true);
                            }}
                            className="mt-6 w-full py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold rounded-xl text-sm transition-all border border-primary/20 flex items-center justify-center gap-1.5"
                          >
                            <FiPlus /> Issue Book (Check Out)
                          </button>
                        </div>
                      );
                    })}

                    {filteredMembers.length === 0 && (
                      <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <FiInfo className="text-3xl mx-auto mb-2 text-slate-300" />
                        <p className="font-medium">No registered library members matched your search.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* Bulk CSV Import Modal Overlay */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative border border-slate-100 my-8 animate-fadeIn">
            <button 
              onClick={() => setShowCSVModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-6 border border-green-200">
              📁
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">Bulk Import Books (CSV)</h3>
            <p className="text-slate-500 text-sm mb-6">
              Upload a standard CSV spreadsheet to batch import hundreds or thousands of books at once.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 mb-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Step 1: Download the Excel Template</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We've prepared an Excel-compatible template containing all the correct columns. Simply download it, paste your book details into it, and save it as a CSV.
              </p>
              <button 
                type="button"
                onClick={downloadCSVTemplate}
                className="bg-white hover:bg-slate-100 text-primary border border-slate-200 py-2 px-4 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                📥 Download CSV Template
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 mb-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Step 2: Upload CSV and Import</h4>
              
              <div className="relative border-2 border-dashed border-slate-200 hover:border-green-500/50 transition-colors rounded-2xl p-6 bg-white flex flex-col items-center justify-center text-center cursor-pointer group">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={submitting}
                />
                {submitting ? (
                  <div className="text-center py-2">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs font-bold text-green-600 animate-pulse">Importing books...</p>
                    <p className="text-[10px] text-slate-400 mt-1">Parsing and batch-inserting into database</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                      📁
                    </div>
                    <p className="text-xs font-bold text-secondary">Choose Prepared CSV File</p>
                    <p className="text-[10px] text-slate-400 mt-1">Select from computer folders (.csv only)</p>
                  </>
                )}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed flex gap-2">
              <span>💡</span>
              <p>
                <strong>Tip:</strong> Columns must be: <em>Title, Author, Category, Book No, Cover Image URL, Shelf Location, ISBN, Year, Language, Publisher</em>. Row details containing commas should be enclosed in double quotes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative border border-slate-100 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl mb-6">
              📚
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">Add New Book to Live Database</h3>
            <p className="text-slate-500 text-sm mb-6">
              Fill in the specifications below to insert a new title into your live Supabase database tables.
            </p>

            <form onSubmit={handleAddBookSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Book Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Sapiens"
                    value={newBook.title}
                    onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Author Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Yuval Noah Harari"
                    value={newBook.author}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
                  <select 
                    value={newBook.category}
                    onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary cursor-pointer"
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Self Help">Self Help</option>
                    <option value="Science">Science</option>
                    <option value="Technology">Technology</option>
                    <option value="History">History</option>
                    <option value="Finance">Finance</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Book Number (Book No) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. BK-9021"
                    value={newBook.book_no}
                    onChange={(e) => setNewBook({...newBook, book_no: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold text-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Published Year</label>
                  <input 
                    type="number"
                    value={newBook.year}
                    onChange={(e) => setNewBook({...newBook, year: parseInt(e.target.value) || 2024})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">ISBN</label>
                  <input 
                    type="text"
                    placeholder="e.g. 978-0062316097"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Language</label>
                  <input 
                    type="text"
                    value={newBook.language}
                    onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Publisher</label>
                  <input 
                    type="text"
                    value={newBook.publisher}
                    onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Shelf Location</label>
                  <select 
                    value={newBook.location}
                    onChange={(e) => setNewBook({...newBook, location: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary cursor-pointer font-medium"
                  >
                    <option value="Fiction Section - Shelf F1">Fiction Section - Shelf F1</option>
                    <option value="Fiction Section - Shelf F2">Fiction Section - Shelf F2</option>
                    <option value="Fiction Section - Shelf F3">Fiction Section - Shelf F3</option>
                    <option value="Self Help - Shelf S1">Self Help - Shelf S1</option>
                    <option value="Self Help - Shelf S2">Self Help - Shelf S2</option>
                    <option value="Science - Shelf SC1">Science - Shelf SC1</option>
                    <option value="Technology - Shelf T1">Technology - Shelf T1</option>
                    <option value="History - Shelf H1">History - Shelf H1</option>
                    <option value="Finance - Shelf FN1">Finance - Shelf FN1</option>
                    <option value="Productivity - Shelf P1">Productivity - Shelf P1</option>
                    <option value="General Section - Shelf G1">General Section - Shelf G1</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-600">Cover Book Image *</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button 
                        type="button" 
                        onClick={() => setAddCoverMode("file")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${addCoverMode === 'file' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-secondary'}`}
                      >
                        Upload File
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setAddCoverMode("url")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${addCoverMode === 'url' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-secondary'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {addCoverMode === "file" ? (
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {newBook.image ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={newBook.image} 
                            alt="Cover Preview" 
                            className="w-12 h-16 object-cover rounded-md shadow-md border border-slate-200"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-secondary">Local Image Selected</p>
                            <p className="text-[10px] text-slate-400 font-mono">Ready to upload cover</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                            📁
                          </div>
                          <p className="text-xs font-bold text-secondary">Choose Cover Image</p>
                          <p className="text-[10px] text-slate-400 mt-1">Select from computer folders (PNG, JPG, WebP)</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Paste cover image URL..."
                      value={newBook.image}
                      onChange={(e) => setNewBook({...newBook, image: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold shadow-md shadow-primary/30 hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Book...
                    </>
                  ) : (
                    "Save Book"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal Overlay */}
      {showEditModal && bookToEdit && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative border border-slate-100 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl mb-6">
              ✏️
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">Edit Book Specifications</h3>
            <p className="text-slate-500 text-sm mb-6">
              Modify the book records below. Your updates will propagate in real-time to the database.
            </p>

            <form onSubmit={handleEditBookSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Book Title *</label>
                  <input 
                    type="text" 
                    required
                    value={bookToEdit.title}
                    onChange={(e) => setBookToEdit({...bookToEdit, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Author Name *</label>
                  <input 
                    type="text" 
                    required
                    value={bookToEdit.author}
                    onChange={(e) => setBookToEdit({...bookToEdit, author: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
                  <select 
                    value={bookToEdit.category}
                    onChange={(e) => setBookToEdit({...bookToEdit, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary cursor-pointer"
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Self Help">Self Help</option>
                    <option value="Science">Science</option>
                    <option value="Technology">Technology</option>
                    <option value="History">History</option>
                    <option value="Finance">Finance</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Book Number (Book No) *</label>
                  <input 
                    type="text"
                    required
                    value={bookToEdit.book_no || ''}
                    onChange={(e) => setBookToEdit({...bookToEdit, book_no: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold text-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Published Year</label>
                  <input 
                    type="number"
                    value={bookToEdit.year}
                    onChange={(e) => setBookToEdit({...bookToEdit, year: parseInt(e.target.value) || 2024})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">ISBN</label>
                  <input 
                    type="text"
                    value={bookToEdit.isbn || ''}
                    onChange={(e) => setBookToEdit({...bookToEdit, isbn: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Language</label>
                  <input 
                    type="text"
                    value={bookToEdit.language || 'English'}
                    onChange={(e) => setBookToEdit({...bookToEdit, language: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Publisher</label>
                  <input 
                    type="text"
                    value={bookToEdit.publisher || ''}
                    onChange={(e) => setBookToEdit({...bookToEdit, publisher: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Shelf Location</label>
                  <select 
                    value={bookToEdit.location || "Fiction Section - Shelf F3"}
                    onChange={(e) => setBookToEdit({...bookToEdit, location: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary cursor-pointer font-medium"
                  >
                    <option value="Fiction Section - Shelf F1">Fiction Section - Shelf F1</option>
                    <option value="Fiction Section - Shelf F2">Fiction Section - Shelf F2</option>
                    <option value="Fiction Section - Shelf F3">Fiction Section - Shelf F3</option>
                    <option value="Self Help - Shelf S1">Self Help - Shelf S1</option>
                    <option value="Self Help - Shelf S2">Self Help - Shelf S2</option>
                    <option value="Science - Shelf SC1">Science - Shelf SC1</option>
                    <option value="Technology - Shelf T1">Technology - Shelf T1</option>
                    <option value="History - Shelf H1">History - Shelf H1</option>
                    <option value="Finance - Shelf FN1">Finance - Shelf FN1</option>
                    <option value="Productivity - Shelf P1">Productivity - Shelf P1</option>
                    <option value="General Section - Shelf G1">General Section - Shelf G1</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-600">Cover Book Image *</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button 
                        type="button" 
                        onClick={() => setEditCoverMode("file")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${editCoverMode === 'file' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-secondary'}`}
                      >
                        Upload File
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditCoverMode("url")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${editCoverMode === 'url' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-secondary'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {editCoverMode === "file" ? (
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, true)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {bookToEdit.image ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={bookToEdit.image} 
                            alt="Cover Preview" 
                            className="w-12 h-16 object-cover rounded-md shadow-md border border-slate-200"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-secondary">Local Image Selected</p>
                            <p className="text-[10px] text-slate-400 font-mono">Ready to upload cover</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                            📁
                          </div>
                          <p className="text-xs font-bold text-secondary">Choose Cover Image</p>
                          <p className="text-[10px] text-slate-400 mt-1">Select from computer folders (PNG, JPG, WebP)</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Paste cover image URL..."
                      value={bookToEdit.image}
                      onChange={(e) => setBookToEdit({...bookToEdit, image: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold shadow-md shadow-primary/30 hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Book Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 animate-fadeIn">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
              <FiAlertTriangle />
            </div>
            <h3 className="text-2xl font-bold text-center text-secondary mb-2">Delete Book?</h3>
            <p className="text-slate-500 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-secondary">"{bookTitleToDelete}"</span> from the library catalog? This action is permanent and cannot be undone.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold transition-colors text-sm"
              >
                No, Keep it
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="flex-1 bg-red-500 text-white py-3.5 rounded-xl font-semibold shadow-md shadow-red-500/20 hover:bg-red-600 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal Overlay */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 animate-fadeIn">
            <button 
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl mb-6">
              <FiUserPlus />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">Register Library Member</h3>
            <p className="text-slate-500 text-sm mb-6">
              Register a member to authorize book checkouts in the circulation desk.
            </p>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Member Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Yasir Arafath"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone Number *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. yasir@pydc.org"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold shadow-md shadow-primary/30 hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal Overlay (Enhanced to support general checkout!) */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 animate-fadeIn">
            <button 
              onClick={() => setShowIssueModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl mb-6">
              📖
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">Check Out Book</h3>
            <p className="text-slate-500 text-sm mb-6">
              Issue a book copy to {activeMemberForIssue ? <span className="font-semibold text-secondary">{activeMemberForIssue.name}</span> : "a registered library member"}.
            </p>

            <form onSubmit={handleIssueBookSubmit} className="space-y-4">
              {/* Member Selection (only visible if opened generally) */}
              {!activeMemberForIssue && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Select Library Member *</label>
                  <select 
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary cursor-pointer"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Select Available Book *</label>
                <select 
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary cursor-pointer"
                >
                  <option value="">-- Choose from Catalog --</option>
                  {books.filter(b => b.status === 'Available').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} (No: {b.book_no || 'N/A'})
                    </option>
                  ))}
                </select>
                {books.filter(b => b.status === 'Available').length === 0 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ No books are currently available for checkout!</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Checkout Date</label>
                <input 
                  type="date" 
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm text-secondary"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting || books.filter(b => b.status === 'Available').length === 0}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold shadow-md shadow-primary/30 hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Confirming...
                    </>
                  ) : (
                    "Confirm Checkout"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Book Confirmation Modal */}
      {showReturnModal && returnContext && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 animate-fadeIn">
            <button 
              onClick={() => setShowReturnModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
              <FiCheckCircle />
            </div>
            <h3 className="text-2xl font-bold text-center text-secondary mb-2">Confirm Return</h3>
            <p className="text-slate-500 text-center mb-6">
              Are you sure you want to mark <span className="font-semibold text-secondary">"{returnContext.bookTitle}"</span> as returned by <span className="font-semibold text-secondary">{returnContext.memberName}</span>?
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowReturnModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold transition-colors text-sm"
              >
                No, Keep
              </button>
              <button 
                onClick={async () => {
                  setShowReturnModal(false);
                  await handleMarkReturned(returnContext.checkoutId, returnContext.bookId, returnContext.memberName);
                }}
                className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-semibold shadow-md shadow-green-600/20 hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                Yes, Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
