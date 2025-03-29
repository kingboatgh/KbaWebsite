import { motion } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function PortfolioSection() {
  const projects = [
    {
      image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Artisan Marketplace",
      description: "E-commerce platform for local artisans"
    },
    {
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "FinTech App",
      description: "Mobile banking for the digital age"
    },
    {
      image: "https://images.unsplash.com/photo-1564540583246-934409427776?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Health Portal",
      description: "Digital healthcare management system"
    }
  ];

  return (
    <section id="portfolio" className="py-20">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 bg-[#0F4C81]/10 text-[#0F4C81] rounded-full font-medium text-sm mb-4">
            Our Portfolio
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
            Showcasing Our Best Work
          </h2>
          <p className="text-neutral-700 text-lg">
            Explore some of our recent projects delivered to clients across various industries.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard 
              key={index}
              index={index}
              image={project.image}
              title={project.title}
              description={project.description}
            />
          ))}
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <a 
            href="#contact" 
            className="inline-block bg-[#0F4C81] hover:bg-[#1A5D93] text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Start Your Project
          </a>
        </motion.div>
      </div>
    </section>
  );
}

interface ProjectCardProps {
  index: number;
  image: string;
  title: string;
  description: string;
}

function ProjectCard({ index, image, title, description }: ProjectCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * index,
        duration: 0.5,
      }
    }
  };

  return (
    <motion.div 
      className="group overflow-hidden rounded-xl shadow-sm"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={cardVariants}
    >
      <div className="relative overflow-hidden w-full">
        <AspectRatio ratio={16 / 12}>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#0F4C81]/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center p-6">
              <h3 className="font-heading font-bold text-xl mb-2">{title}</h3>
              <p className="text-white/80 mb-4">{description}</p>
              <a 
                href="#contact" 
                className="inline-block px-4 py-2 border border-white text-white hover:bg-white hover:text-[#0F4C81] transition-colors rounded-lg"
              >
                View Project
              </a>
            </div>
          </div>
        </AspectRatio>
      </div>
    </motion.div>
  );
}
