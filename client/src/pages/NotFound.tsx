import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-4"
      >
        <h1 className="text-6xl font-bold text-[#0F4C81] mb-4">404</h1>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          variant="default"
          className="bg-[#0F4C81] hover:bg-[#0D3B6B] text-white"
          asChild
        >
          <Link to="/">Return Home</Link>
        </Button>
      </motion.div>
    </div>
  );
} 