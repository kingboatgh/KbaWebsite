import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

type ProjectCategory = "all" | "web" | "mobile" | "design" | "marketing";

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "web", label: "Web Development" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "design", label: "Design" },
    { id: "marketing", label: "Marketing" }
  ];

  const projects = [
    {
      id: 1,
      title: "Artisan Marketplace",
      description: "E-commerce platform for local artisans",
      image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "web",
      technologies: ["React", "Node.js", "MongoDB", "Express"]
    },
    {
      id: 2,
      title: "FinTech App",
      description: "Mobile banking for the digital age",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "mobile",
      technologies: ["React Native", "Firebase", "Redux"]
    },
    {
      id: 3,
      title: "Health Portal",
      description: "Digital healthcare management system",
      image: "https://images.unsplash.com/photo-1564540583246-934409427776?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "web",
      technologies: ["Vue.js", "Laravel", "MySQL"]
    },
    {
      id: 4,
      title: "Brand Identity",
      description: "Complete brand redesign for tech startup",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "design",
      technologies: ["Figma", "Adobe Creative Suite"]
    },
    {
      id: 5,
      title: "Social Media Campaign",
      description: "Viral marketing campaign for product launch",
      image: "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "marketing",
      technologies: ["Social Media", "Content Strategy"]
    }
  ];

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(project => project.category === activeCategory);

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
            Our Portfolio
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
            Showcasing Our Best Work
          </h1>
          <p className="text-neutral-700 text-lg">
            Explore our portfolio of successful projects across various industries and technologies.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={`${
                activeCategory === category.id
                  ? "bg-[#0F4C81] text-white"
                  : "text-[#0F4C81] hover:text-white hover:bg-[#0F4C81]"
              }`}
              onClick={() => setActiveCategory(category.id as ProjectCategory)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group overflow-hidden rounded-xl shadow-sm"
              >
                <div className="relative overflow-hidden w-full">
                  <AspectRatio ratio={16 / 12}>
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#0F4C81]/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-center p-6">
                        <h3 className="font-heading font-bold text-xl mb-2">{project.title}</h3>
                        <p className="text-white/80 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white/20 rounded-full text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          className="border-white text-white hover:bg-white hover:text-[#0F4C81]"
                          asChild
                        >
                          <a href="#contact">View Project</a>
                        </Button>
                      </div>
                    </div>
                  </AspectRatio>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 