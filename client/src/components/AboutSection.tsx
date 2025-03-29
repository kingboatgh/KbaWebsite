import { motion } from "framer-motion";

export default function AboutSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      }
    })
  };

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 bg-[#0F4C81]/10 text-[#0F4C81] rounded-full font-medium text-sm mb-4">
            About KBA Innovations
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
            Ghana's Leading Innovation Partner
          </h2>
          <p className="text-neutral-700 text-lg">
            Based in Accra, we combine local expertise with global standards to deliver exceptional digital solutions for businesses across Africa and beyond.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <AboutCard 
            index={0}
            icon="bullseye"
            title="Our Mission"
            description="To deliver innovative digital solutions that empower African businesses to compete globally while creating sustainable growth opportunities."
          />
          <AboutCard 
            index={1}
            icon="eye"
            title="Our Vision"
            description="To be the most trusted technology partner in Africa, known for excellence, innovation, and positive impact on businesses and communities."
          />
          <AboutCard 
            index={2}
            icon="gem"
            title="Our Values"
            description="Innovation, integrity, excellence, collaboration, and sustainable impact guide everything we do at KBA Innovations."
          />
        </div>
      </div>
    </section>
  );
}

interface AboutCardProps {
  index: number;
  icon: string;
  title: string;
  description: string;
}

function AboutCard({ index, icon, title, description }: AboutCardProps) {
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
      className="bg-gray-50 rounded-xl p-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={cardVariants}
      custom={index}
    >
      <div className="w-14 h-14 bg-[#0F4C81]/10 rounded-lg flex items-center justify-center mb-6">
        <i className={`fas fa-${icon} text-2xl text-[#0F4C81]`}></i>
      </div>
      <h3 className="font-heading font-bold text-xl mb-3">{title}</h3>
      <p className="text-neutral-700">
        {description}
      </p>
    </motion.div>
  );
}
