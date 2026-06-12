import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import NotificationDetailPage from './pages/NotificationDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
// Phase 5: admin
// import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-vh-100 d-flex flex-column">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/notifications/:id" element={<NotificationDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Phase 5 routes */}
              {/* <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} /> */}
              <Route path="*" element={
                <div className="container py-5 text-center">
                  <h2>404 — Page Not Found</h2>
                  <a href="/" className="btn btn-primary mt-3">Go Home</a>
                </div>
              } />
            </Routes>
          </main>
          <footer className="bg-light border-top py-3 text-center text-muted small">
            © 2024 GovInfo Search — Government Notification Portal
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
