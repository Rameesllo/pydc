import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Portal from "./pages/Portal";
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
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";


import MemberLogin from "./pages/MemberLogin";
import MemberProfile from "./pages/MemberProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Portal Hub */}
        <Route path="/" element={<Portal />} />
        <Route path="/member-login" element={<MemberLogin />} />
        <Route path="/member/profile" element={<MemberProfile />} />

        {/* Library Subsystem Routes */}
        <Route path="/library" element={<ComingSoon />} />
        <Route path="/library/books" element={<ComingSoon />} />
        <Route path="/library/book/:id" element={<ComingSoon />} />
        <Route path="/library/login" element={<ComingSoon />} />
        <Route path="/library/dashboard" element={<ComingSoon />} />

        {/* Medical Equipment Subsystem Routes */}
        <Route path="/medical" element={<LandingPage />} />
        <Route path="/medical/equipment" element={<EquipmentList />} />
        <Route path="/medical/equipment/:id" element={<EquipmentDetails />} />
        <Route path="/medical/request" element={<RequestEquipment />} />
        <Route path="/medical/my-requests" element={<MyRequests />} />
        <Route path="/medical/profile" element={<Profile />} />
        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/equipment" element={<ProtectedRoute><EquipmentManagement /></ProtectedRoute>} />
        <Route path="/admin/borrow" element={<ProtectedRoute><BorrowEquipment /></ProtectedRoute>} />
        <Route path="/admin/return" element={<ProtectedRoute><ReturnEquipment /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Backward Compatibility Redirects */}
        <Route path="/medical/admin/*" element={<AdminLogin />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

