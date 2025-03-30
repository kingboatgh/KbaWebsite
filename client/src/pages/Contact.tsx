import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  const contactInfo = [
    {
      icon: "map-marker-alt",
      title: "Our Location",
      content: (
        <>
          75 Independence Avenue<br />
          Accra, Ghana
        </>
      )
    },
    {
      icon: "envelope",
      title: "Email Us",
      content: (
        <a href="mailto:info@kbainnovations.com" className="hover:text-[#0F4C81] transition-colors">
          info@kbainnovations.com
        </a>
      )
    },
    {
      icon: "phone-alt",
      title: "Call Us",
      content: (
        <a href="tel:+233200123456" className="hover:text-[#0F4C81] transition-colors">
          +233 (0) 20 012 3456
        </a>
      )
    },
    {
      icon: "clock",
      title: "Working Hours",
      content: (
        <>
          Monday - Friday: 8:00 AM - 5:00 PM<br />
          Saturday: 9:00 AM - 1:00 PM
        </>
      )
    }
  ];

  const socialLinks = [
    { icon: "facebook-f", link: "#" },
    { icon: "twitter", link: "#" },
    { icon: "linkedin-in", link: "#" },
    { icon: "instagram", link: "#" }
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
            Get In Touch
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
            Ready to Start Your Project?
          </h1>
          <p className="text-neutral-700 text-lg">
            Connect with our team to discuss your requirements and how we can help transform your digital presence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div 
            className="bg-gray-50 p-8 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-2xl mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-12 h-12 bg-[#0F4C81]/10 rounded-lg flex items-center justify-center mr-4">
                    <i className={`fas fa-${item.icon} text-xl text-[#0F4C81]`}></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                    <p className="text-neutral-700">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <h3 className="font-heading font-medium text-lg mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.link} 
                    className="w-10 h-10 rounded-full bg-[#0F4C81] flex items-center justify-center text-white hover:bg-[#1A5D93] transition-colors"
                  >
                    <i className={`fab fa-${social.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ContactForm />
          </motion.div>
        </div>

        {/* Map Section */}
        <div className="mt-20">
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.0!2d-0.1874!3d5.5556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzMnMjAuMiJOIDDCsDExJzE0LjYiVw!5e0!3m2!1sen!2sgh!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
} 