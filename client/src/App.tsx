import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import BlogAdmin from "@/pages/admin/BlogAdmin";
import CreateBlogPost from "@/pages/CreateBlogPost";
import NotFound from "@/pages/NotFound";
import ForgotPassword from "@/pages/admin/ForgotPassword";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="blog" element={<BlogAdmin />} />
          <Route path="blog/new" element={<CreateBlogPost />} />
          <Route path="blog/:id" element={<BlogAdmin />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
