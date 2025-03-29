import { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="bg-white shadow-lg rounded-b-lg md:hidden absolute w-full z-50"
          initial="closed"
          animate="open"
          exit="closed"
          variants={menuVariants}
        >
          <div className="container mx-auto px-6 py-3">
            <nav className="flex flex-col space-y-4 pb-3">
              <a 
                href="#about" 
                className="font-medium text-neutral-700 hover:text-[#0F4C81] transition-colors"
                onClick={handleLinkClick}
              >
                About Us
              </a>
              <a 
                href="#services" 
                className="font-medium text-neutral-700 hover:text-[#0F4C81] transition-colors"
                onClick={handleLinkClick}
              >
                Services
              </a>
              <a 
                href="#portfolio" 
                className="font-medium text-neutral-700 hover:text-[#0F4C81] transition-colors"
                onClick={handleLinkClick}
              >
                Portfolio
              </a>
              <Link 
                href="/blog" 
                className="font-medium text-neutral-700 hover:text-[#0F4C81] transition-colors"
                onClick={handleLinkClick}
              >
                Blog
              </Link>
              <a 
                href="#contact" 
                className="font-medium text-neutral-700 hover:text-[#0F4C81] transition-colors"
                onClick={handleLinkClick}
              >
                Contact
              </a>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
