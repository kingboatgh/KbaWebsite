import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0F4C81] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">KBA Innovations</h3>
            <p className="text-gray-300">
              Delivering innovative digital solutions to clients across Africa and worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-gray-300 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services/web-development" className="text-gray-300 hover:text-white transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/services/mobile-apps" className="text-gray-300 hover:text-white transition-colors">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link to="/services/ui-ux-design" className="text-gray-300 hover:text-white transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/services/consulting" className="text-gray-300 hover:text-white transition-colors">
                  IT Consulting
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt"></i>
                <span>Accra, Ghana</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-phone"></i>
                <span>+233 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-envelope"></i>
                <span>info@kbainnovations.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300">
              © {new Date().getFullYear()} KBA Innovations. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
