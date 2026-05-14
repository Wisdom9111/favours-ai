import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode, useEffect, useState } from "react";
import { HireMeModal } from "./HireMeModal";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const [config, setConfig] = useState({
    ownerName: "Ejindu Favour Blessing",
    contactEmail: "ejindufavour14@gmail.com",
    contactPhone: "+234 704 302 8109",
    location: "Lagos, Nigeria",
    tools: ["Google Workspace", "Microsoft Office", "Canva", "Zoom", "WhatsApp Business"]
  });

  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminPage) return;
    const homeDoc = doc(db, "pageContent", "home");
    const unsub = onSnapshot(homeDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setConfig({
          ownerName: data.ownerName || config.ownerName,
          contactEmail: data.contactEmail || config.contactEmail,
          contactPhone: data.contactPhone || config.contactPhone,
          location: data.location || config.location,
          tools: data.tools ? data.tools.split(",").map((s: string) => s.trim()) : config.tools
        });
      }
    });
    return () => unsub();
  }, [isAdminPage]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-light-gray text-navy selection:bg-navy/10">
      {/* Navigation */}
      {!isAdminPage && (
        <header className="bg-white border-b border-editorial-border px-[50px] py-[30px]">
          <div className="container mx-auto flex items-baseline justify-between">
            <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-navy uppercase">
              {config.ownerName}
            </Link>
            <nav className="hidden md:flex items-center gap-[30px]">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[13px] font-semibold uppercase tracking-[1px] transition-colors hover:text-navy/70 ${
                    location.pathname === link.path ? "text-navy" : "text-slate"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <HireMeModal>
                <button className="editorial-btn editorial-btn-primary ml-4">
                  Hire Me
                </button>
              </HireMeModal>
            </nav>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      {!isAdminPage && (
        <footer id="contact" className="bg-navy text-white px-[50px] py-[25px]">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[12px] leading-relaxed opacity-90 text-center md:text-left">
              <p className="font-bold mb-1">Contact:</p>
              <p>{config.contactEmail} | {config.contactPhone}</p>
              <p>📍 Location: {config.location} | Supporting Clients Globally</p>
            </div>
            <div className="flex flex-wrap justify-center gap-[20px] opacity-60 text-[11px] font-semibold uppercase tracking-wider">
              {config.tools.map((tool, i) => (
                <span key={i}>{tool}</span>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
