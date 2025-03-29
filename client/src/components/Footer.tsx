export default function Footer() {
  return (
    <footer className="bg-[#0F4C81] text-white pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="font-heading font-bold text-2xl mb-6">
              KBA<span className="text-[#F5A623]">INNOVATIONS</span>
            </div>
            <p className="text-white/70 mb-6">
              Delivering innovative digital solutions from the heart of Accra, Ghana to clients across Africa and worldwide.
            </p>
            <div className="flex space-x-4">
              <SocialLink icon="facebook-f" />
              <SocialLink icon="twitter" />
              <SocialLink icon="linkedin-in" />
              <SocialLink icon="instagram" />
            </div>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-xl mb-6">Services</h3>
            <ul className="space-y-3">
              <FooterLink href="#services" label="Design Services" />
              <FooterLink href="#services" label="Web Development" />
              <FooterLink href="#services" label="IT Consulting" />
              <FooterLink href="#services" label="Mobile Development" />
              <FooterLink href="#services" label="Digital Marketing" />
              <FooterLink href="#services" label="IT Support" />
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-xl mb-6">Company</h3>
            <ul className="space-y-3">
              <FooterLink href="#about" label="About Us" />
              <FooterLink href="#portfolio" label="Portfolio" />
              <FooterLink href="#" label="Careers" />
              <FooterLink href="#" label="Partners" />
              <FooterLink href="#" label="Blog" />
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-xl mb-6">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <i className="fas fa-map-marker-alt mr-3 text-[#F5A623]"></i>
                <span className="text-white/70">75 Independence Avenue, Accra, Ghana</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-3 text-[#F5A623]"></i>
                <a href="tel:+233200123456" className="text-white/70 hover:text-white transition-colors">
                  +233 (0) 20 012 3456
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-[#F5A623]"></i>
                <a href="mailto:info@kbainnovations.com" className="text-white/70 hover:text-white transition-colors">
                  info@kbainnovations.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center">
          <div className="text-white/70 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} KBA Innovations. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon }: { icon: string }) {
  return (
    <a href="#" className="text-white/70 hover:text-white transition-colors">
      <i className={`fab fa-${icon}`}></i>
    </a>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a href={href} className="text-white/70 hover:text-white transition-colors">
        {label}
      </a>
    </li>
  );
}
