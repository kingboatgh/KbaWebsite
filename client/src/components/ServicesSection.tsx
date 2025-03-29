import { motion } from "framer-motion";

export default function ServicesSection() {
  const services = [
    {
      icon: "paint-brush",
      title: "Design Services",
      items: [
        "Brand Identity & Logo Design",
        "UI/UX Design & Prototyping",
        "Print & Digital Marketing Materials",
        "Motion Graphics & Illustration"
      ]
    },
    {
      icon: "laptop-code",
      title: "Web Development",
      items: [
        "Responsive Website Development",
        "E-commerce Solutions",
        "Content Management Systems",
        "Web Applications & Portals"
      ]
    },
    {
      icon: "server",
      title: "IT Consulting",
      items: [
        "Digital Transformation Strategy",
        "IT Infrastructure Planning",
        "Cybersecurity Assessment",
        "Cloud Migration Services"
      ]
    },
    {
      icon: "mobile-alt",
      title: "Mobile Development",
      items: [
        "Native iOS & Android Apps",
        "Cross-Platform Solutions",
        "Mobile UI/UX Design",
        "App Store Optimization"
      ]
    },
    {
      icon: "chart-line",
      title: "Digital Marketing",
      items: [
        "Search Engine Optimization",
        "Social Media Marketing",
        "Content Marketing Strategy",
        "Analytics & Performance Reporting"
      ]
    },
    {
      icon: "shield-alt",
      title: "IT Support",
      items: [
        "24/7 Technical Support",
        "System Maintenance & Updates",
        "Data Backup & Recovery",
        "Network Configuration & Security"
      ]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 bg-[#0F4C81]/10 text-[#0F4C81] rounded-full font-medium text-sm mb-4">
            Our Services
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
            Comprehensive Digital Solutions
          </h2>
          <p className="text-neutral-700 text-lg">
            From concept to execution, we offer end-to-end services to bring your digital vision to life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              index={index}
              icon={service.icon}
              title={service.title}
              items={service.items}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  index: number;
  icon: string;
  title: string;
  items: string[];
}

function ServiceCard({ index, icon, title, items }: ServiceCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * (index % 3),
        duration: 0.5,
      }
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={cardVariants}
    >
      <div className="w-14 h-14 bg-[#F5A623]/10 rounded-lg flex items-center justify-center mb-6">
        <i className={`fas fa-${icon} text-2xl text-[#F5A623]`}></i>
      </div>
      <h3 className="font-heading font-bold text-xl mb-3">{title}</h3>
      <ul className="text-neutral-700 space-y-2 mb-6">
        {items.map((item, i) => (
          <li key={i} className="flex items-start">
            <i className="fas fa-check text-[#1CAF65] mt-1 mr-2"></i>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <a href="#contact" className="inline-flex items-center text-[#0F4C81] font-medium">
        Learn More <i className="fas fa-arrow-right ml-2"></i>
      </a>
    </motion.div>
  );
}
