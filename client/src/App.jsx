import { Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

// Public Pages
import StudentLogin from './pages/Login';               // student login at /login
import AdminLogin from './pages/admin/Login';           // admin login at /admin/login

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminBooks from './pages/admin/Books';
import IssueBook from './pages/admin/IssueBook';
import ReturnBook from './pages/admin/ReturnBook';
import Students from './pages/admin/Students';
import AuditLogs from './pages/admin/AuditLogs';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyBooks from './pages/student/MyBooks';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issue"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <IssueBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/return"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReturnBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/books"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyBooks />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;