import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Route-level code splitting with React.lazy
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })))
const MarketPage = lazy(() => import('./pages/MarketPage').then((m) => ({ default: m.MarketPage })))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const FindWhatINeedPage = lazy(() => import('./pages/FindWhatINeedPage').then((m) => ({ default: m.FindWhatINeedPage })))
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const CropPlannerPage = lazy(() => import('./pages/CropPlannerPage').then((m) => ({ default: m.CropPlannerPage })))
const CropDetailPage = lazy(() => import('./pages/CropDetailPage').then((m) => ({ default: m.CropDetailPage })))
const CropCarePage = lazy(() => import('./pages/CropCarePage').then((m) => ({ default: m.CropCarePage })))
const RentPage = lazy(() => import('./pages/RentPage').then((m) => ({ default: m.RentPage })))
const LabourPage = lazy(() => import('./pages/LabourPage').then((m) => ({ default: m.LabourPage })))
const FinancePage = lazy(() => import('./pages/FinancePage').then((m) => ({ default: m.FinancePage })))
const SellPage = lazy(() => import('./pages/SellPage').then((m) => ({ default: m.SellPage })))
const StoragePage = lazy(() => import('./pages/StoragePage').then((m) => ({ default: m.StoragePage })))
const LedgerPage = lazy(() => import('./pages/LedgerPage').then((m) => ({ default: m.LedgerPage })))
const SupportPage = lazy(() => import('./pages/SupportPage').then((m) => ({ default: m.SupportPage })))
const ModulePlaceholderPage = lazy(() => import('./pages/ModulePlaceholderPage').then((m) => ({ default: m.ModulePlaceholderPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center space-y-3">
    <div className="w-10 h-10 border-3 border-[var(--line)] border-t-[var(--forest)] rounded-full animate-spin" />
    <span className="text-xs font-bold text-[var(--forest)] tracking-wider uppercase">
      Loading Kisan OS...
    </span>
  </div>
)

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/find" element={<FindWhatINeedPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/design-system" element={<DesignSystemPage />} />

            {/* Marketplace Routes (Phase 4) */}
            <Route path="/market" element={<MarketPage />} />
            <Route path="/market/:category" element={<MarketPage />} />
            <Route path="/marketplace" element={<Navigate to="/market" replace />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Phase 6: Cart, Checkout & Orders Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Onboarding Wizard (requires authentication, but not completed onboarding) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Profile Page (requires authentication AND completed onboarding) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireOnboarding={true}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Crop Planner Routes (Phase 8) */}
            <Route path="/plan" element={<CropPlannerPage />} />
            <Route path="/crop-planner" element={<Navigate to="/plan" replace />} />
            <Route path="/plan/crop/:id" element={<CropDetailPage />} />

            {/* Phase 9: Crop Care & AI Plant Doctor */}
            <Route path="/crop-care" element={<CropCarePage />} />

            {/* Phase 10: Equipment Rentals & Labour Bookings */}
            <Route path="/rent" element={<RentPage />} />
            <Route path="/labour" element={<LabourPage />} />
            <Route path="/rent-labour" element={<Navigate to="/rent" replace />} />

            {/* Phase 11: Finance, Schemes, Insurance & Credit */}
            <Route path="/finance" element={<FinancePage />} />

            {/* Phase 12: Sell Produce & Mandi Prices, Warehouse Storage */}
            <Route path="/sell" element={<SellPage />} />
            <Route path="/storage" element={<StoragePage />} />

            {/* Phase 13: Financial Ledger, Cost Tracking & P&L */}
            <Route path="/ledger" element={<LedgerPage />} />

            {/* Phase 14: Support, Expert Help, FAQs & Community */}
            <Route path="/support" element={<SupportPage />} />

            <Route
              path="/more"
              element={
                <ModulePlaceholderPage
                  moduleKey="more"
                  titleKey="nav.more"
                  descKey="home.modulesSubtitle"
                  metaKey="placeholder.badge"
                />
              }
            />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
