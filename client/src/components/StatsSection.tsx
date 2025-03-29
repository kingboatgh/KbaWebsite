import { motion } from "framer-motion";

export default function StatsSection() {
  const stats = [
    { number: "250+", label: "Projects Completed" },
    { number: "120+", label: "Happy Clients" },
    { number: "15+", label: "Countries Served" },
    { number: "5+", label: "Years Experience" }
  ];

  return (
    <section className="py-16 bg-[#0F4C81] text-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem 
              key={index}
              index={index}
              number={stat.number}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface StatItemProps {
  index: number;
  number: string;
  label: string;
}

function StatItem({ index, number, label }: StatItemProps) {
  const itemVariants = {
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
      className="text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={itemVariants}
    >
      <div className="text-4xl md:text-5xl font-heading font-bold mb-2">{number}</div>
      <div className="text-white/80">{label}</div>
    </motion.div>
  );
}
