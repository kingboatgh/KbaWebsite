import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import StatsSection from "@/components/StatsSection";
import ContactSection from "@/components/ContactSection";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Add FontAwesome script
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js";
    script.defer = true;
    document.head.appendChild(script);

    // Add smooth scrolling behavior
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', function(e: Event) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });

    return () => {
      // Clean up FontAwesome script on unmount
      document.head.removeChild(script);
    };
  }, []);

  return (
    <>
      <Hero />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <StatsSection />
      <ContactSection />
    </>
  );
}
