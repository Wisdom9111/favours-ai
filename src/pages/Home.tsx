import { motion } from "motion/react";
import { ArrowRight, Headphones, Settings, UserCheck, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { HireMeModal } from "../components/HireMeModal";

export default function Home() {
  const services = [
    {
      title: "Customer Support",
      description: "Expert handling of inquiries and complaints via Phone, Email, Chat, and WhatsApp.",
      icon: Headphones,
    },
    {
      title: "Administrative Management",
      description: "Seamless scheduling, inventory tracking, documentation, and workflow optimization.",
      icon: Settings,
    },
    {
      title: "Virtual Assistance",
      description: "Remote support utilizing top digital tools to keep your business organized and efficient.",
      icon: UserCheck,
    },
  ];

  const experiences = [
    {
      date: "2025 – Present",
      title: "Customer Support / VA",
      location: "Self-Employed",
    },
    {
      date: "2023 – 2025",
      title: "Administrative Manager",
      location: "Melissa Black Boutique",
    },
    {
      date: "2024 – 2024",
      title: "Front Desk Representative",
      location: "12 Basket Food Ltd",
    },
    {
      date: "2024 – 2024",
      title: "Secretary",
      location: "Norland Nigeria Ltd",
    },
  ];

  const skills = [
    "Problem Solving",
    "Data Entry",
    "Scheduling",
    "Communication",
    "Remote Ops",
  ];

  return (
    <div className="grid lg:grid-cols-[450px_1fr] gap-[1px] bg-editorial-border min-h-[calc(100vh-100px)]">
      {/* Hero Sidebar */}
      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-[50px] flex flex-col justify-between"
      >
        <div className="hero-text pt-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-10"
          >
            <img 
              src="/Profile.png" 
              alt="Ejindu Favour Blessing" 
              style={{ 
                width: '250px', 
                height: '250px', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                objectPosition: 'center top',
                border: '3px solid #0a192f', 
                display: 'block' 
              }} 
            />
          </motion.div>
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Expert Virtual Assistance
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[42px] leading-[1.1] mb-5 text-navy font-serif"
          >
            Reliable Remote Support for Growing Businesses
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[16px] leading-relaxed text-slate mb-[30px]"
          >
            I provide expert Virtual Assistance and Customer Care to help you streamline operations, handle administrative tasks, and deliver exceptional customer experiences.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <HireMeModal>
              <button className="editorial-btn editorial-btn-primary">Hire Me</button>
            </HireMeModal>
            <a href="#services" className="editorial-btn editorial-btn-secondary">Services</a>
            <a 
              href="https://favourcreatives.my.canva.site/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="editorial-btn border border-navy text-navy hover:bg-navy hover:text-white text-center"
            >
              View Full Portfolio
            </a>
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <span className="section-title">Professional Summary</span>
          <p className="text-[14px] leading-relaxed italic text-slate">
            Detail-oriented and reliable Remote Representative with hands-on experience supporting customers across retail, food service, and admin sectors.
          </p>
        </motion.div>
      </motion.section>

      {/* Content Grid & Hero Badge Area */}
      <section className="bg-white flex flex-col">
        {/* Hero Badge Area */}
        <div 
          className="relative h-[600px] w-full bg-navy overflow-hidden border-b border-editorial-border p-10 flex items-center justify-center bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: 'url("/Logo2.png")' }}
        >
          <div className="absolute inset-0 bg-navy/50 z-0" /> {/* Added a fallback overlay for better text readability */}
          
          {/* Professional Excellence Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-xl p-12 bg-navy border-2 border-white/20 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.05)] flex flex-col items-center text-center group"
          >
            <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/30 transition-colors duration-500" />
            
            <div className="flex gap-1 mb-6">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                >
                  <motion.svg 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.3 
                    }}
                    className="w-8 h-8 text-yellow-500 fill-current" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </motion.svg>
                </motion.div>
              ))}
            </div>

            <h2 className="text-white text-2xl md:text-3xl font-serif font-bold mb-4 tracking-tight">
              Top-Rated Virtual Assistant
            </h2>
            
            <div className="w-16 h-px bg-white/20 mb-8" />

            <p className="text-white/90 text-xl md:text-2xl font-sans font-light leading-relaxed tracking-wide">
              100% Remote Efficiency <br />
              <span className="text-white/60 font-serif italic text-lg md:text-xl">|</span> <br />
              Multi-Channel Support Expert
            </p>

            <div className="absolute -bottom-6 -right-6 bg-white p-6 border border-editorial-border rounded-xl shadow-2xl hidden sm:block">
              <p className="text-navy font-bold text-2xl">Verified</p>
              <p className="text-slate text-sm uppercase tracking-widest">Excellence</p>
            </div>
          </motion.div>
        </div>

        <div className="p-[50px] grid md:grid-cols-2 gap-[40px]">
          {/* Experience Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-title">Professional Timeline</span>
            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <div key={i} className="experience-item">
                  <div className="font-serif italic text-[13px] text-slate">{exp.date}</div>
                  <div className="font-bold text-[15px] my-1">{exp.title}</div>
                  <div className="text-[12px] opacity-80">{exp.location}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Expertise Column */}
          <motion.div 
            id="services"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="section-title">My Expertise</span>
            <div className="space-y-4">
              {services.map((service, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.02 }}
                  className="editorial-card"
                >
                  <h3 className="text-[16px] font-serif mb-2">{service.title}</h3>
                  <p className="text-[13px] leading-relaxed text-slate">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
