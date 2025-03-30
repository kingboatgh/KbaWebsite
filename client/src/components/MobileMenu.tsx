import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-[250px] bg-white shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-4 text-gray-500 hover:text-gray-700 self-end"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Navigation Links */}
              <nav className="flex flex-col px-4 py-2">
                <Link
                  to="/"
                  onClick={onClose}
                  className="py-3 text-gray-700 hover:text-[#0F4C81] transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  onClick={onClose}
                  className="py-3 text-gray-700 hover:text-[#0F4C81] transition-colors"
                >
                  Services
                </Link>
                <Link
                  to="/portfolio"
                  onClick={onClose}
                  className="py-3 text-gray-700 hover:text-[#0F4C81] transition-colors"
                >
                  Portfolio
                </Link>
                <Link
                  to="/blog"
                  onClick={onClose}
                  className="py-3 text-gray-700 hover:text-[#0F4C81] transition-colors"
                >
                  Blog
                </Link>
                <Link
                  to="/about"
                  onClick={onClose}
                  className="py-3 text-gray-700 hover:text-[#0F4C81] transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="py-3 text-gray-700 hover:text-[#0F4C81] transition-colors"
                >
                  Contact
                </Link>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
