import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Briefcase, Award } from "lucide-react";

export default function About() {
  const experiences = [
    {
      role: "Customer Support Specialist / Virtual Assistant",
      company: "Self-Employed",
      period: "2025 – Present",
      description: "Responded to inquiries, assisted with order processing/complaints, managed scheduling, and resolved issues to improve retention.",
    },
    {
      role: "Administrative Manager",
      company: "Melissa Black Boutique",
      period: "Jan 2023 – Dec 2025",
      description: "Oversaw daily operations, managed inventory/restocking, handled sales records, managed social media, and coordinated photo/video shoots.",
    },
    {
      role: "Front Desk / Customer Care Representative",
      company: "12 Basket Food Ltd",
      period: "Jan 2024 – Aug 2024",
      description: "Processed pickup/delivery orders, answered WhatsApp/phone inquiries, resolved complaints, and coordinated with kitchen teams.",
    },
    {
      role: "Secretary",
      company: "Hovland Nigeria Ltd",
      period: "Aug 2024 – Dec 2024",
      description: "Managed correspondence, scheduled meetings, maintained confidential filing systems, and prepared official reports.",
    },
  ];

  const skills = [
    "Customer Support",
    "Virtual Assistance",
    "Professional Communication",
    "Data Entry & Record Keeping",
    "Scheduling",
    "Problem Solving",
    "Time Management",
    "Remote Work Efficiency",
  ];

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-[1px] bg-editorial-border min-h-[calc(100vh-100px)]">
      {/* Sidebar Info */}
      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-[50px] flex flex-col justify-between"
      >
        <div>
          <span className="section-title">Detailed Profile</span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[42px] leading-[1.1] mb-5 text-navy font-serif"
          >
            Ejindu Favour Blessing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[16px] leading-relaxed text-slate italic mb-8"
          >
            "A detail-oriented and reliable Remote Customer Care Representative and Virtual Assistant with hands-on experience supporting customers and business operations."
          </motion.p>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <span className="section-title">Education</span>
              <p className="text-[14px] font-bold">B.Sc. Education (Computer Science)</p>
              <p className="text-[13px] text-slate">Lagos State University (LASU)</p>
              <p className="text-[12px] text-slate/60">2018 – 2023</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <span className="section-title">Location</span>
              <p className="text-[14px] font-bold">Lagos, Nigeria</p>
              <p className="text-[12px] text-slate/60 italic">Supporting Clients Globally</p>
            </motion.div>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <span className="section-title">Core Skills</span>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="inline-block px-[10px] py-[4px] border border-editorial-border text-[11px] uppercase tracking-wider">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Experience Grid */}
      <section className="bg-white p-[50px]">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-title"
        >
          Professional Timeline
        </motion.span>
        <div className="grid md:grid-cols-2 gap-8">
          {experiences.map((exp, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="editorial-card flex flex-col justify-between"
            >
              <div>
                <div className="font-serif italic text-[13px] text-slate mb-2">{exp.period}</div>
                <h3 className="text-[16px] font-bold mb-1">{exp.role}</h3>
                <p className="text-[12px] text-navy/60 mb-4">{exp.company}</p>
                <p className="text-[13px] leading-relaxed text-slate">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Professional Summary
          </motion.span>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Tech Stack Visual Grid */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="shrink-0 w-full md:w-48 grid grid-cols-2 gap-3"
            >
              {[
                { name: "Google Workspace", icon: "GW" },
                { name: "MS Office", icon: "MS" },
                { name: "WhatsApp Business", icon: "WA" },
                { name: "Zoom", icon: "ZM" }
              ].map((tech, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.1, backgroundColor: "#1a2a40", color: "#ffffff" }}
                  className="aspect-square border border-editorial-border bg-light-gray flex flex-col items-center justify-center p-2 text-center group transition-all duration-300"
                >
                  <span className="text-lg font-serif font-bold mb-1">{tech.icon}</span>
                  <span className="text-[9px] uppercase tracking-tighter font-bold opacity-60 group-hover:opacity-100">{tech.name}</span>
                </motion.div>
              ))}
              <div className="col-span-2 py-4 border-t border-editorial-border mt-2">
                <p className="text-[10px] uppercase tracking-[2px] font-bold text-navy/40 text-center">Core Tech Stack</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="prose prose-slate max-w-none text-slate leading-relaxed"
            >
              <p className="mb-4 text-lg md:text-xl font-serif italic text-navy/80 leading-relaxed">
                "With a solid foundation in Computer Science and a passion for exceptional service, I bridge the gap between technical efficiency and human-centric support."
              </p>
              <p className="mb-4">
                My career has been defined by a commitment to streamlining operations and ensuring that every customer interaction is handled with professionalism and care. I thrive in remote environments, leveraging digital tools to maintain high levels of organization and productivity. 
              </p>
              <p>
                Whether it's managing complex schedules, resolving customer complaints, or optimizing administrative workflows, I bring a detail-oriented approach to every task.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
