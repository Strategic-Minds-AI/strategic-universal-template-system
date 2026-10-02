import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Projects from '@/pages/Projects';
import Builder from '@/pages/Builder';
import Library from '@/pages/Library';
import Consulting from '@/pages/Consulting';
import FactoryLayout from '@/components/factory/FactoryLayout';
import Dashboard from '@/pages/Dashboard';
import GeneratorLibrary from '@/pages/GeneratorLibrary';
import GeneratorStudio from '@/pages/GeneratorStudio';
import TemplateLibrary from '@/pages/TemplateLibrary';
import RunConsole from '@/pages/RunConsole';
import ArtifactExplorer from '@/pages/ArtifactExplorer';
import ValidationCenter from '@/pages/ValidationCenter';
import RepairCenter from '@/pages/RepairCenter';
import ProvisioningCenter from '@/pages/ProvisioningCenter';
import Approvals from '@/pages/Approvals';
import AdapterLibrary from '@/pages/AdapterLibrary';
import IndustryPacks from '@/pages/IndustryPacks';
import UsageBudgets from '@/pages/UsageBudgets';
import AuditReceipts from '@/pages/AuditReceipts';
import Settings from '@/pages/Settings';
import CapabilityRegistry from '@/pages/CapabilityRegistry';
import ProfileRegistry from '@/pages/ProfileRegistry';
import SuperAgents from '@/pages/SuperAgents';
import BootstrapWizard from '@/pages/BootstrapWizard';
import AgentOperate from '@/pages/AgentOperate';
import LeadScraper from '@/pages/LeadScraper';
import DigitalDominance from '@/pages/DigitalDominance';
import UniversalProvisioning from '@/pages/UniversalProvisioning';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<FactoryLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/generators" element={<GeneratorLibrary />} />
          <Route path="/studio" element={<GeneratorStudio />} />
          <Route path="/templates" element={<TemplateLibrary />} />
          <Route path="/runs" element={<RunConsole />} />
          <Route path="/artifacts" element={<ArtifactExplorer />} />
          <Route path="/validation" element={<ValidationCenter />} />
          <Route path="/repair" element={<RepairCenter />} />
          <Route path="/provisioning" element={<ProvisioningCenter />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/adapters" element={<AdapterLibrary />} />
          <Route path="/industries" element={<IndustryPacks />} />
          <Route path="/usage" element={<UsageBudgets />} />
          <Route path="/audit" element={<AuditReceipts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/capabilities" element={<CapabilityRegistry />} />
          <Route path="/registry/:entity" element={<ProfileRegistry />} />
          <Route path="/agents" element={<SuperAgents />} />
          <Route path="/bootstrap" element={<BootstrapWizard />} />
          <Route path="/agents/chat" element={<AgentOperate />} />
          <Route path="/lead-scraper" element={<LeadScraper />} />
          <Route path="/digital-dominance" element={<DigitalDominance />} />
          <Route path="/provisioning-system" element={<UniversalProvisioning />} />
        </Route>
        <Route path="/builder" element={<Builder />} />
        <Route path="/library/:family" element={<Library />} />
        <Route path="/consulting" element={<Consulting />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App