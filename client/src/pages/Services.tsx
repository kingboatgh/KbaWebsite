import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Services() {
  const services = [
    {
      icon: "paint-brush",
      title: "Design Services",
      description: "Transform your brand with our comprehensive design solutions.",
      features: [
        "Brand Identity & Logo Design",
        "UI/UX Design & Prototyping",
        "Print & Digital Marketing Materials",
        "Motion Graphics & Illustration"
      ]
    },
    {
      icon: "laptop-code",
      title: "Web Development",
      description: "Build powerful and scalable web applications that drive business growth.",
      features: [
        "Responsive Website Development",
        "E-commerce Solutions",
        "Content Management Systems",
        "Web Applications & Portals"
      ]
    },
    {
      icon: "server",
      title: "IT Consulting",
      description: "Expert guidance to optimize your technology infrastructure and strategy.",
      features: [
        "Digital Transformation Strategy",
        "IT Infrastructure Planning",
        "Cybersecurity Assessment",
        "Cloud Migration Services"
      ]
    },
    {
      icon: "mobile-alt",
      title: "Mobile Development",
      description: "Create engaging mobile experiences that connect with your users.",
      features: [
        "Native iOS & Android Apps",
        "Cross-Platform Solutions",
        "Mobile UI/UX Design",
        "App Store Optimization"
      ]
    },
    {
      icon: "chart-line",
      title: "Digital Marketing",
      description: "Drive growth and engagement through strategic digital marketing.",
      features: [
        "Search Engine Optimization",
        "Social Media Marketing",
        "Content Marketing Strategy",
        "Analytics & Performance Reporting"
      ]
    },
    {
      icon: "shield-alt",
      title: "IT Support",
      description: "Reliable technical support to keep your systems running smoothly.",
      features: [
        "24/7 Technical Support",
        "System Maintenance & Updates",
        "Data Backup & Recovery",
        "Network Configuration & Security"
      ]
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 bg-[#0F4C81]/10 text-[#0F4C81] rounded-full font-medium text-sm mb-4">
            Our Services
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
            Comprehensive Digital Solutions
          </h1>
          <p className="text-neutral-700 text-lg">
            From concept to execution, we offer end-to-end services to bring your digital vision to life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <div className="w-14 h-14 bg-[#F5A623]/10 rounded-lg flex items-center justify-center mb-6">
                <i className={`fas fa-${service.icon} text-2xl text-[#F5A623]`}></i>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">{service.title}</h3>
              <p className="text-neutral-700 mb-6">{service.description}</p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <i className="fas fa-check text-[#1CAF65] mt-1 mr-2"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full text-[#0F4C81] hover:text-white hover:bg-[#0F4C81]"
                asChild
              >
                <a href="#contact">Get Started</a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 