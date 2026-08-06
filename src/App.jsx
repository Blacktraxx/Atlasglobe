import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import VisitTracker from './components/VisitTracker';
// Add page imports here
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Exchange from './pages/Exchange';
import Transactions from './pages/Transactions';
import Cards from './pages/Cards';
import Contact from './pages/Contact';
import Loans from './pages/Loans';
import CreditCardApply from './pages/CreditCardApply';
import TaxFiling from './pages/TaxFiling';
import Deposit from './pages/Deposit';
import Receive from './pages/Receive';
import Withdraw from './pages/Withdraw';
import Admin from './pages/Admin';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  // Show loading spinner while checking the Supabase session
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/credit-cards" element={<CreditCardApply />} />
          <Route path="/taxes" element={<TaxFiling />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <VisitTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
