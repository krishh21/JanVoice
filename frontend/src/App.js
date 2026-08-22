import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UPGovHeader from './components/UPGovHeader';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CommunityComplaints from './pages/CommunityComplaints';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import ComplaintDetails from './pages/ComplaintDetails';
import NewComplaint from './components/NewComplaint';
import AdminDashboard from './pages/admin/AdminDashboard';
import Departments from './pages/admin/Departments';
import Analytics from './pages/admin/Analytics';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';
import UserManagement from '../src/pages/admin/UserManagement';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();
  
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <UPGovHeader />
        <main className="page-shell px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={
              !user ? <Login /> : <Navigate to="/dashboard" />
            } />
            <Route path="/register" element={
              !user ? <Register /> : <Navigate to="/dashboard" />
            } />
            <Route path="/forgot-password" element={
              !user ? <ForgotPassword /> : <Navigate to="/dashboard" />
            } />
            <Route path="/reset-password/:resettoken" element={
              !user ? <ResetPassword /> : <Navigate to="/dashboard" />
            } />
            <Route path="/community" element={
              <ProtectedRoute>
                <CommunityComplaints />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/complaints" element={
              <ProtectedRoute>
                <Complaints />
              </ProtectedRoute>
            } />
            <Route path="/complaints/:id" element={
              <ProtectedRoute>
                <ComplaintDetails />
              </ProtectedRoute>
            } />
            <Route path="/new-complaint" element={
              <ProtectedRoute requiredRole="citizen">
                <NewComplaint />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/departments" element={
              <ProtectedRoute requiredRole="admin">
                <Departments />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <Navigate to={user ? "/dashboard" : "/login"} />
            } />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E40AF',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
