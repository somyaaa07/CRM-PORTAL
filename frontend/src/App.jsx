import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }    from './context/AuthContext';
import { AlertProvider }            from './context/AlertContext';
import { ToastProvider, useToast }  from './context/ToastContext';
import Navbar       from './components/Navbar';
import Login        from './pages/Login';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import MyLeads        from './pages/agent/MyLeads';
import CallHistory    from './pages/agent/CallHistory';
import Conversions    from './pages/agent/Conversion';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAgents   from './pages/admin/ManageAgents';
import ManageLeads    from './pages/admin/ManageLeads';
import Reports        from './pages/admin/Reports';
import BulkUpload     from './pages/admin/BulkUpload';

// Shared Pages
import LeadDetail from './pages/LeadDetail';

// ── Protected Route ────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;
  return children;
};

// ── Layout with Navbar ─────────────────────────────────────
const Layout = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-gray-50">
    <Navbar />
    <main className="flex-1 overflow-y-auto">{children}</main>
  </div>
);
// ── Alert + Toast Wire ─────────────────────────────────────
const AlertWrapper = ({ children }) => {
  const { addToast } = useToast();
  return (
    <AlertProvider onAlert={addToast}>
      {children}
    </AlertProvider>
  );
};

// ── All Routes ─────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ── Agent Routes ───────────────────────────────── */}
      <Route path="/agent/dashboard" element={
        <ProtectedRoute allowedRole="agent">
          <Layout><AgentDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/agent/my-leads" element={
        <ProtectedRoute allowedRole="agent">
          <Layout><MyLeads /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/agent/conversions" element={
        <ProtectedRoute allowedRole="agent">
          <Layout><Conversions /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/agent/call-history" element={
        <ProtectedRoute allowedRole="agent">
          <Layout><CallHistory /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Admin Routes ───────────────────────────────── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin">
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/agents" element={
        <ProtectedRoute allowedRole="admin">
          <Layout><ManageAgents /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/leads" element={
        <ProtectedRoute allowedRole="admin">
          <Layout><ManageLeads /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRole="admin">
          <Layout><Reports /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/bulk-upload" element={
        <ProtectedRoute allowedRole="admin">
          <Layout><BulkUpload /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Shared Routes (Admin + Agent dono) ─────────── */}
      <Route path="/leads/:leadId" element={
        <ProtectedRoute>
          <Layout><LeadDetail /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Default Redirect ───────────────────────────── */}
      <Route path="/" element={
        <Navigate to={
          user?.role === 'admin'
            ? '/admin/dashboard'
            : '/agent/dashboard'
        } />
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AlertWrapper>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AlertWrapper>
      </ToastProvider>
    </AuthProvider>
  );
}