import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative bg-[#0F4C81] text-white overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}>
      <div className="container mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Innovative Solutions for a Digital World
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              KBA Innovations delivers cutting-edge design, web development and IT consulting services from Accra, Ghana to clients worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-[#F5A623] hover:bg-[#FFB946] text-white transition-colors"
                asChild
              >
                <a href="#services">Our Services</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-[#0F4C81] hover:bg-gray-100 border-none"
                asChild
              >
                <a href="#contact">Get in Touch</a>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="hidden md:block relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[#1CAF65] opacity-20 rounded-lg"></div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <ServiceCard 
                icon="lightbulb" 
                title="Creative Design" 
                description="Turning visions into impactful visuals" 
              />
              <ServiceCard 
                icon="code" 
                title="Web Development" 
                description="Building powerful digital experiences" 
              />
              <ServiceCard 
                icon="cogs" 
                title="IT Consulting" 
                description="Expert guidance for your tech needs" 
              />
              <ServiceCard 
                icon="chart-line" 
                title="Digital Growth" 
                description="Strategies for sustainable success" 
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
}

function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
      <div className="text-3xl text-[#F5A623] mb-4">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <h3 className="font-heading font-bold text-xl mb-2">{title}</h3>
      <p className="opacity-80">{description}</p>
    </div>
  );
}
