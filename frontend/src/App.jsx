import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Policies from './pages/Policies';
import Claims from './pages/Claims';
import Premiums from './pages/Premiums';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<ProtectedRoute roles={['ADMIN', 'AGENT']}><Customers /></ProtectedRoute>} />
        <Route path="/customers/:id" element={<ProtectedRoute roles={['ADMIN', 'AGENT']}><CustomerDetail /></ProtectedRoute>} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/premiums" element={<Premiums />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<ProtectedRoute roles={['ADMIN']}><Reports /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute roles={['ADMIN']}><Employees /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute roles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={['ADMIN']}><Settings /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}