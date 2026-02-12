import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

import Login from './pages/Login';

import AdminDashboard from './pages/admin/Dashboard';
import AdminBooks from './pages/admin/Books';
import IssueBook from './pages/admin/IssueBook';
import ReturnBook from './pages/admin/ReturnBook';
import Students from './pages/admin/Students';
import AuditLogs from './pages/admin/AuditLogs';

import StudentDashboard from './pages/student/Dashboard';
import MyBooks from './pages/student/MyBooks';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" />} />

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
    </Router>
  );
}

export default App;