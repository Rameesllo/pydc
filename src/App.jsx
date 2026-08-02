import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Portal from "./pages/Portal";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import EquipmentList from "./pages/EquipmentList";
import EquipmentDetails from "./pages/EquipmentDetails";
import RequestEquipment from "./pages/RequestEquipment";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import EquipmentManagement from "./pages/EquipmentManagement";
import BorrowEquipment from "./pages/BorrowEquipment";
import ReturnEquipment from "./pages/ReturnEquipment";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";


// Initialize Cloudinary credentials from .env to localStorage on first load
function initCloudinaryConfig() {
  const envCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const envApiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const envApiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  if (envCloudName && !localStorage.getItem("cloudinary_cloud_name")) {
    localStorage.setItem("cloudinary_cloud_name", envCloudName);
  }
  if (envApiKey && !localStorage.getItem("cloudinary_api_key")) {
    localStorage.setItem("cloudinary_api_key", envApiKey);
  }
  if (envApiSecret && !localStorage.getItem("cloudinary_api_secret")) {
    localStorage.setItem("cloudinary_api_secret", envApiSecret);
  }
}
initCloudinaryConfig();


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Portal Hub */}
        <Route path="/" element={<Portal />} />

        {/* Library Subsystem Routes */}
        <Route path="/library" element={<Home />} />
        <Route path="/library/books" element={<Books />} />
        <Route path="/library/book/:id" element={<BookDetails />} />
        <Route path="/library/login" element={<Login />} />
        <Route path="/library/dashboard" element={<Dashboard />} />

        {/* Medical Equipment Subsystem Routes */}
        <Route path="/medical" element={<LandingPage />} />
        <Route path="/medical/equipment" element={<EquipmentList />} />
        <Route path="/medical/equipment/:id" element={<EquipmentDetails />} />
        <Route path="/medical/request" element={<RequestEquipment />} />
        <Route path="/medical/my-requests" element={<MyRequests />} />
        <Route path="/medical/profile" element={<Profile />} />
        <Route path="/medical/admin/login" element={<AdminLogin />} />
        <Route path="/medical/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/medical/admin/equipment" element={<ProtectedRoute><EquipmentManagement /></ProtectedRoute>} />
        <Route path="/medical/admin/borrow" element={<ProtectedRoute><BorrowEquipment /></ProtectedRoute>} />
        <Route path="/medical/admin/return" element={<ProtectedRoute><ReturnEquipment /></ProtectedRoute>} />
        <Route path="/medical/admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/medical/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

