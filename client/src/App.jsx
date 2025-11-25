import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';
import LoginModal from './components/LoginModal';
import { verifyToken } from './utils/api';

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        await verifyToken();
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    navigate('/admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={<CustomerView onAdminClick={() => setShowLogin(true)} />}
        />
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <AdminView onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      {showLogin && !isAuthenticated && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
