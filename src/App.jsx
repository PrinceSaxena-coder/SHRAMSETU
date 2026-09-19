import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

// =========================
// NORMAL PAGES
// =========================
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import AIInsights from "./pages/AIInsights";

// =========================
// CUSTOMER PAGES
// =========================
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerMyBookings from "./pages/CustomerMybooking";
import CustomerProfile from "./pages/CustomerProfile";
import Settings from "./pages/Setting";
import SavedWorkers from "./pages/SavedWorker";

// =========================
// WORKER PAGES
// =========================
import WorkerHome from "./pages/Workerhome";
import WorkerProfile from "./pages/WorkerProfile";
import Gigs from "./pages/Gigs";
import Pocket from "./pages/Pocket";
import WorkerAIIInsights from "./pages/WorkerAIIInsights";
import ServiceHistory from "./pages/Workerservicehistory";
import Support from "./pages/Help";

// =========================
// ADMIN PAGES
// =========================
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/Adminlogin";
import AdminWorkers from "./pages/AdminWorkers";

// =========================
// AUTH / PROTECTION
// =========================
import ProtectedRoutes from "./components/ProtectedRoutes";
import { getCurrentUser } from "./data/mockauth";

function AIInsightsRoute() {
  const user = getCurrentUser();

  if (user?.role === "worker") {
    return <WorkerAIIInsights />;
  }

  return <AIInsights />;
}

export default function App() {
  const location = useLocation();

  // Hide normal navbar on:
  // 1. Login
  // 2. Signup
  // 3. Admin portal
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/admin");

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#f7f8fb]">

        {/* =====================================================
            NORMAL NAVBAR
        ===================================================== */}

        {!hideNavbar && <Navbar />}

        <main className="flex-1">
          <Routes>

          {/* =====================================================
              GENERAL ROUTES
          ===================================================== */}

          <Route path="/" element={<Home />} />

          <Route path="/services" element={<Services />} />

          <Route
            path="/service/:id"
            element={<ServiceDetails />}
          />

          {/* =====================================================
              AUTHENTICATION
          ===================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          {/* =====================================================
              CUSTOMER ROUTES
          ===================================================== */}

          <Route
            path="/booking"
            element={
              <ProtectedRoutes allowedRoles={["customer"]}>
                <Booking />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/dashboard/bookings"
            element={
              <ProtectedRoutes allowedRoles={["customer"]}>
                <CustomerMyBookings />
              </ProtectedRoutes>
            }
          />

          {/* Old customer dashboard URL */}
          <Route
            path="/CustomerDashboard"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* Customer Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoutes allowedRoles={["customer"]}>
                <CustomerProfile />
              </ProtectedRoutes>
            }
          />

          {/* Customer Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoutes allowedRoles={["customer"]}>
                <Settings />
              </ProtectedRoutes>
            }
          />

          {/* Saved Workers */}
          <Route
            path="/saved-workers"
            element={
              <ProtectedRoutes allowedRoles={["customer"]}>
                <SavedWorkers />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              AI DIAGNOSIS ROUTE
              
              Customers and workers both use the shared /ai-insights URL,
              but each role should see the page that matches their flow.
          ===================================================== */}

          <Route
            path="/ai-insights"
            element={
              <ProtectedRoutes allowedRoles={["customer", "worker"]}>
                <AIInsightsRoute />
              </ProtectedRoutes>
            }
          />

          {/* Alternate worker AI URL */}
          <Route
            path="/worker-ai-insights"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <WorkerAIIInsights />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              WORKER HOME
          ===================================================== */}

          <Route
            path="/worker-dashboard"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <WorkerHome />
              </ProtectedRoutes>
            }
          />

          {/* Old worker dashboard URL */}
          <Route
            path="/WorkerDashboard"
            element={
              <Navigate
                to="/worker-dashboard"
                replace
              />
            }
          />

          {/* =====================================================
              WORKER PROFILE
          ===================================================== */}

          <Route
            path="/worker-profile"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <WorkerProfile />
              </ProtectedRoutes>
            }
          />

          {/* Old worker profile URL */}
          <Route
            path="/WorkerProfile"
            element={
              <Navigate
                to="/worker-profile"
                replace
              />
            }
          />

          {/* =====================================================
              WORKER GIGS
          ===================================================== */}

          <Route
            path="/worker-gigs"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <Gigs />
              </ProtectedRoutes>
            }
          />

          {/* Gig details */}
          <Route
            path="/worker-gigs/:id"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <WorkerHome />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              WORKER ACTIVE JOB
          ===================================================== */}

          <Route
            path="/worker-jobs/active"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <WorkerHome />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              WORKER POCKET
          ===================================================== */}

          <Route
            path="/worker-pocket"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <Pocket />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              WORKER SERVICE HISTORY
          ===================================================== */}

          <Route
            path="/worker-service-history"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <ServiceHistory />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              WORKER KNOWLEDGE RESOURCE
          ===================================================== */}

          <Route
            path="/worker-knowledge"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <WorkerHome />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              WORKER BENEFITS
          ===================================================== */}

          <Route
            path="/worker-benefits"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <WorkerHome />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              WORKER SUPPORT
          ===================================================== */}

          <Route
            path="/worker-support"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <Support />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              WORKER NOTIFICATIONS
          ===================================================== */}

          <Route
            path="/notifications"
            element={
              <ProtectedRoutes allowedRoles={["worker"]}>
                <WorkerHome />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              ADMIN LOGIN
          ===================================================== */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* =====================================================
              ADMIN DASHBOARD
          ===================================================== */}

          <Route
            path="/admin"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              ADMIN WORKERS
          ===================================================== */}

          <Route
            path="/admin/workers"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminWorkers />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              ADMIN CUSTOMERS
          ===================================================== */}

          <Route
            path="/admin/customers"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <Navigate
                  to="/admin"
                  replace
                />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              ADMIN BOOKINGS
          ===================================================== */}

          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <Navigate
                  to="/admin"
                  replace
                />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              ADMIN REPORTS
          ===================================================== */}

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <Navigate
                  to="/admin"
                  replace
                />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              ADMIN ANALYTICS
          ===================================================== */}

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <Navigate
                  to="/admin"
                  replace
                />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              ADMIN SERVICES
          ===================================================== */}

          <Route
            path="/admin/services"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <Navigate
                  to="/admin"
                  replace
                />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              ADMIN SETTINGS
          ===================================================== */}

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <Navigate
                  to="/admin"
                  replace
                />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              UNKNOWN ADMIN ROUTES
          ===================================================== */}

          <Route
            path="/admin/*"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <Navigate
                  to="/admin"
                  replace
                />
              </ProtectedRoutes>
            }
          />

          {/* =====================================================
              FALLBACK
          ===================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
        </main>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        {!hideNavbar && (
          <footer className="mt-12 bg-navy-700 text-navy-100">
            {/* Keep your existing footer content here */}
          </footer>
        )}

      </div>
    </AuthProvider>
  );
}