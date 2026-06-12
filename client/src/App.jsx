import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PatientDisplayPage from './pages/PatientDisplayPage';
import TrackPage from './pages/TrackPage';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const target =
    user.role === 'ADMIN'
      ? '/admin'
      : user.role === 'DOCTOR'
        ? '/doctor'
        : '/receptionist';

  return <Navigate to={target} replace />;
}

function App({ queryClient }) {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/display" element={<PatientDisplayPage queryClient={queryClient} />} />
      <Route path="/track/:token?" element={<TrackPage queryClient={queryClient} />} />
      <Route
        path="/receptionist"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
            <ReceptionistDashboard queryClient={queryClient} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <DoctorDashboard queryClient={queryClient} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard queryClient={queryClient} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;