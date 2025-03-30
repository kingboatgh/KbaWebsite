import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#0F4C81]">KBA</span>
              <span className="text-lg font-medium">Innovations</span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-[#0F4C81] transition-colors">
                Home
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-[#0F4C81] transition-colors">
                Services
              </Link>
              <Link to="/portfolio" className="text-gray-700 hover:text-[#0F4C81] transition-colors">
                Portfolio
              </Link>
              <Link to="/blog" className="text-gray-700 hover:text-[#0F4C81] transition-colors">
                Blog
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-[#0F4C81] transition-colors">
                About
              </Link>
            </nav>

            {/* Contact Button */}
            <div className="hidden md:block">
              <Button
                variant="default"
                className="bg-[#0F4C81] hover:bg-[#0D3B6B] text-white"
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
} 