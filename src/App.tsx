import React, { Suspense, lazy } from 'react';
import { HashRouter, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Router = import.meta.env.DEV ? BrowserRouter : HashRouter;
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './features/auth/AuthLayout';
import LoadingFallback from './components/ui/LoadingFallback';

// Lazy Loaded Screens
const Splash = lazy(() => import('./features/public/Splash'));
const Onboarding = lazy(() => import('./features/public/Onboarding'));
const RoleSelect = lazy(() => import('./features/public/RoleSelect'));
const Login = lazy(() => import('./features/auth/Login'));
const Register = lazy(() => import('./features/auth/Register'));
const ForgotPassword = lazy(() => import('./features/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/auth/ResetPassword'));

const Settings = lazy(() => import('./features/utility/Settings'));
const ThemeCustomization = lazy(() => import('./features/utility/ThemeCustomization'));
const PrivacySettings = lazy(() => import('./features/utility/PrivacySettings'));
const NotificationSettings = lazy(() => import('./features/utility/NotificationSettings'));
const HelpSupport = lazy(() => import('./features/utility/HelpSupport'));
const TermsConditions = lazy(() => import('./features/utility/TermsConditions'));
const AboutApplication = lazy(() => import('./features/utility/AboutApplication'));

const MainDashboard = lazy(() => import('./features/dashboard/MainDashboard'));
const CreateProject = lazy(() => import('./features/projects/CreateProject'));
const ProjectList = lazy(() => import('./features/projects/ProjectList'));
const ProjectDetails = lazy(() => import('./features/projects/ProjectDetails'));
const ProjectKanban = lazy(() => import('./features/projects/ProjectKanban'));
const Messages = lazy(() => import('./features/communication/Messages'));
const WalletDashboard = lazy(() => import('./features/billing/WalletDashboard'));
const Profile = lazy(() => import('./features/profile/Profile'));
const SearchResults = lazy(() => import('./features/search/SearchResults'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Initial Flow */}
                <Route path="/" element={<Splash />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/role-select" element={<RoleSelect />} />
                
                {/* Auth Flow */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>
                
                {/* Protected Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<MainDashboard />} />
                  <Route path="/projects" element={<ProjectList />} />
                  <Route path="/projects/create" element={<CreateProject />} />
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                  <Route path="/projects/:id/tracker" element={<ProjectKanban />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/wallet" element={<WalletDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/search" element={<SearchResults />} />
                  
                  {/* Utility Routes */}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/appearance" element={<ThemeCustomization />} />
                  <Route path="/settings/privacy" element={<PrivacySettings />} />
                  <Route path="/settings/notifications" element={<NotificationSettings />} />
                  <Route path="/support" element={<HelpSupport />} />
                  <Route path="/terms" element={<TermsConditions />} />
                  <Route path="/about" element={<AboutApplication />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
