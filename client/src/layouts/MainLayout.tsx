import { ReactNode } from "react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import MobileMenu from "@/components/MobileMenu";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className={`fixed top-0 w-full bg-white z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="container mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <motion.a 
              href="#" 
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-heading font-bold text-2xl">
                KBA<span className="text-[#F5A623]">INNOVATIONS</span>
              </span>
            </motion.a>
            
            <nav className="hidden md:flex space-x-8">
              <NavLink href="#about">About Us</NavLink>
              <NavLink href="#services">Services</NavLink>
              <NavLink href="#portfolio">Portfolio</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </nav>
            
            <button 
              className="md:hidden focus:outline-none" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      </header>

      <main className="pt-20 flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a 
      href={href} 
      className="font-medium text-neutral-700 hover:text-[#0F4C81] transition-colors"
    >
      {children}
    </a>
  );
}
