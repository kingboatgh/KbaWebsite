import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function About() {
  const team = [
    {
      name: "Kingsley Boateng",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      bio: "Passionate about technology and innovation, leading KBA Innovations to deliver exceptional digital solutions."
    },
    {
      name: "Sarah Mensah",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      bio: "Bringing creative excellence to every project, ensuring our designs stand out in the digital landscape."
    },
    {
      name: "Michael Addo",
      role: "Technical Lead",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      bio: "Leading our technical team to build robust and scalable solutions that drive business growth."
    }
  ];

  const values = [
    {
      icon: "lightbulb",
      title: "Innovation",
      description: "We constantly push boundaries to deliver cutting-edge solutions."
    },
    {
      icon: "handshake",
      title: "Integrity",
      description: "We maintain the highest standards of professional ethics."
    },
    {
      icon: "star",
      title: "Excellence",
      description: "We strive for excellence in every project we undertake."
    },
    {
      icon: "users",
      title: "Collaboration",
      description: "We believe in the power of teamwork and partnership."
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-6 md:px-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 bg-[#0F4C81]/10 text-[#0F4C81] rounded-full font-medium text-sm mb-4">
            About Us
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
            Ghana's Leading Innovation Partner
          </h1>
          <p className="text-neutral-700 text-lg">
            Based in Accra, we combine local expertise with global standards to deliver exceptional digital solutions for businesses across Africa and beyond.
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl mb-6">Our Story</h2>
            <p className="text-neutral-700 mb-4">
              Founded in 2019, KBA Innovations emerged from a vision to bridge the technological gap in Africa. We started as a small team of passionate developers and designers, driven by the belief that African businesses deserve world-class digital solutions.
            </p>
            <p className="text-neutral-700 mb-6">
              Today, we've grown into a full-service digital agency, serving clients across multiple industries. Our journey has been marked by continuous learning, innovation, and an unwavering commitment to excellence.
            </p>
            <Button
              variant="default"
              className="bg-[#0F4C81] hover:bg-[#0D3B6B] text-white"
              asChild
            >
              <a href="#contact">Get in Touch</a>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-video rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="text-center p-6 bg-gray-50 rounded-xl"
              >
                <div className="w-14 h-14 bg-[#0F4C81]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className={`fas fa-${value.icon} text-2xl text-[#0F4C81]`}></i>
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">{value.title}</h3>
                <p className="text-neutral-700">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="font-heading font-bold text-3xl text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-heading font-bold text-xl mb-1">{member.name}</h3>
                <p className="text-[#0F4C81] mb-2">{member.role}</p>
                <p className="text-neutral-700">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 