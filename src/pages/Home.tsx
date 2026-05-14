import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Headphones, Settings, UserCheck, CheckCircle2, User, MessageSquare, Briefcase, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { HireMeModal } from "../components/HireMeModal";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";

const iconMap: Record<string, any> = {
  Headphones,
  Settings,
  UserCheck,
  MessageSquare,
  Briefcase
};

const Countdown = ({ endDate }: { endDate: string }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endDate).getTime() - new Date().getTime();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  if (isNaN(new Date(endDate).getTime()) || new Date(endDate).getTime() - new Date().getTime() <= 0) {
    return null; // Don't show if expired or invalid date
  }

  return (
    <div className="flex gap-2 text-xs font-mono font-bold mt-2">
      <div className="bg-navy text-white px-2 py-1 rounded">{timeLeft.days}d</div>
      <div className="bg-navy text-white px-2 py-1 rounded">{timeLeft.hours}h</div>
      <div className="bg-navy text-white px-2 py-1 rounded">{timeLeft.minutes}m</div>
      <div className="bg-navy text-white px-2 py-1 rounded">{timeLeft.seconds}s</div>
    </div>
  );
};

export default function Home() {
  const [services, setServices] = useState([
    {
      title: "Customer Support",
      description: "Expert handling of inquiries and complaints via Phone, Email, Chat, and WhatsApp.",
      icon: "Headphones",
    },
    {
      title: "Administrative Management",
      description: "Seamless scheduling, inventory tracking, documentation, and workflow optimization.",
      icon: "Settings",
    },
    {
      title: "Virtual Assistance",
      description: "Remote support utilizing top digital tools to keep your business organized and efficient.",
      icon: "UserCheck",
    },
  ]);

  const [experiences, setExperiences] = useState([
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
  ]);

  const [dynamicContent, setDynamicContent] = useState({
    heroTitle: "Reliable Remote Support for Growing Businesses",
    heroDescription: "I provide expert Virtual Assistance and Customer Care to help you streamline operations, handle administrative tasks, and deliver exceptional customer experiences.",
    professionalSummary: "Detail-oriented and reliable Remote Representative with hands-on experience supporting customers across retail, food service, and admin sectors.",
    skills: ["Problem Solving", "Data Entry", "Scheduling", "Communication", "Remote Ops"],
    badgeTitle: "Top-Rated Virtual Assistant",
    badgeSubtitle: "100% Remote Efficiency | Multi-Channel Support Expert",
    badgeVerifiedText: "Verified Excellence"
  });

  const [products, setProducts] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<any>(null);

  useEffect(() => {
    const activePromos = promos.filter(p => 
      new Date(p.endDate).getTime() > new Date().getTime() &&
      products.some(prod => prod.id === p.productId)
    );
    
    if (activePromos.length > 0) {
      const promoId = activePromos[0].id;
      const seen = sessionStorage.getItem(`seen_promo_${promoId}`);
      if (!seen) {
        setCurrentPromo(activePromos[0]);
        const timer = setTimeout(() => {
          setShowPromoPopup(true);
          sessionStorage.setItem(`seen_promo_${promoId}`, "true");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [promos, products]);

  useEffect(() => {
    // Fetch home content
    const homeDoc = doc(db, "pageContent", "home");
    onSnapshot(homeDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setDynamicContent({
          heroTitle: data.heroTitle || dynamicContent.heroTitle,
          heroDescription: data.heroDescription || dynamicContent.heroDescription,
          professionalSummary: data.professionalSummary || dynamicContent.professionalSummary,
          skills: data.skills ? data.skills.split(",").map((s: string) => s.trim()) : dynamicContent.skills,
          badgeTitle: data.badgeTitle || dynamicContent.badgeTitle,
          badgeSubtitle: data.badgeSubtitle || dynamicContent.badgeSubtitle,
          badgeVerifiedText: data.badgeVerifiedText || dynamicContent.badgeVerifiedText
        });
      }
    });

    // Fetch services
    const qServices = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubServices = onSnapshot(qServices, (snap) => {
      const dbServices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      if (dbServices.length > 0) {
        setServices(dbServices);
      }
    });

    // Fetch experiences
    const qExp = query(collection(db, "experiences"), orderBy("order", "desc"));
    const unsubExp = onSnapshot(qExp, (snap) => {
      const dbExp = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const filteredExp = dbExp.filter(e => e.type !== "education");
      if (filteredExp.length > 0) {
        setExperiences(filteredExp);
      }
    });

    // Fetch Products
    const qProducts = query(collection(db, "products"), orderBy("order", "asc"));
    const unsubProducts = onSnapshot(qProducts, (snap) => {
      const dbProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setProducts(dbProducts);
    }, (error) => {
      console.error("Products error", error);
    });

    // Fetch Promos
    const qPromos = query(collection(db, "promos"), orderBy("order", "asc"));
    const unsubPromos = onSnapshot(qPromos, (snap) => {
      const dbPromos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setPromos(dbPromos);
    }, (error) => {
      console.error("Promos error", error);
    });

    // Fetch Testimonials
    const qTesti = query(collection(db, "testimonials"), orderBy("order", "asc"));
    const unsubTesti = onSnapshot(qTesti, (snap) => {
      const dbTesti = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setTestimonials(dbTesti);
    }, (error) => {
      console.error("Testimonials error", error);
    });

    return () => {
      unsubServices();
      unsubExp();
      unsubProducts();
      unsubPromos();
      unsubTesti();
    };
  }, []);

  const skills = dynamicContent.skills;

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
            {dynamicContent.heroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[16px] leading-relaxed text-slate mb-[30px]"
          >
            {dynamicContent.heroDescription}
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
            {dynamicContent.professionalSummary}
          </p>
        </motion.div>

        {/* Products Section */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12"
          >
            <span className="section-title">What I Offer</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {products.map((product) => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-editorial-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {product.image && (
                    <div className="aspect-square md:aspect-auto md:h-72 w-full overflow-hidden bg-slate-50 relative border-b border-editorial-border">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <h3 className="text-lg font-serif text-navy leading-tight">{product.title}</h3>
                      <span className="text-xs font-bold text-navy whitespace-nowrap bg-slate-100 px-2 py-1 rounded-full">{product.price}</span>
                    </div>
                    <p className="text-[13px] text-slate leading-relaxed mb-5 flex-grow">{product.description}</p>
                    <HireMeModal>
                      <Button className="w-full bg-navy hover:bg-slate text-white mt-auto rounded-lg text-sm h-9">
                        Inquire Now
                      </Button>
                    </HireMeModal>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Promos Section */}
        {(() => {
          const activePromos = promos.filter(p => 
            new Date(p.endDate).getTime() > new Date().getTime() &&
            products.some(prod => prod.id === p.productId)
          );

          if (activePromos.length === 0) return null;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-12"
            >
              <span className="section-title text-red-600">Active Promos</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                {activePromos.map((promo) => {
                  const product = products.find(prod => prod.id === promo.productId);
                  const originalPriceStr = product ? product.price : null;
                  const originalPriceNum = originalPriceStr ? parseFloat(originalPriceStr.replace(/[^0-9.]/g, '')) : 0;
                  const promoPriceNum = parseFloat(promo.promoPrice?.replace(/[^0-9.]/g, '') || '0');
                  const percentOff = originalPriceNum > 0 ? Math.round(((originalPriceNum - promoPriceNum) / originalPriceNum) * 100) : 0;
                  
                  return (
                    <motion.div 
                      key={promo.id}
                      whileHover={{ y: -5 }}
                      className="bg-red-50 border border-red-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                    >
                      {promo.image && (
                        <div className="aspect-square md:aspect-auto md:h-72 w-full overflow-hidden bg-slate-50 relative border-b border-red-200">
                          <img 
                            src={promo.image} 
                            alt={promo.title}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 opacity-90"
                          />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2 gap-3">
                          <h3 className="text-lg font-serif text-red-900 leading-tight">{promo.title}</h3>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                              {percentOff > 0 && (
                                <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">{percentOff}% OFF</span>
                              )}
                              <span className="text-xs font-bold text-red-600 whitespace-nowrap bg-red-100 px-2 py-1 rounded-full">{promo.promoPrice}</span>
                            </div>
                            {originalPriceStr && (
                              <span className="text-[10px] text-slate-400 line-through mt-1">{originalPriceStr}</span>
                            )}
                          </div>
                        </div>
                        <p className="text-[13px] text-red-800/80 leading-relaxed mb-4 flex-grow">{promo.description}</p>
                        
                        <div className="mb-4">
                          <div className="text-[10px] uppercase font-bold text-red-800/60 mb-1">Ends In:</div>
                          <Countdown endDate={promo.endDate} />
                        </div>
                        
                        <HireMeModal>
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-auto rounded-lg text-sm h-9">
                            Claim Offer
                          </Button>
                        </HireMeModal>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* Testimonials Section */}
        {testimonials.length > 0 && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12"
          >
            <span className="section-title text-blue-600">Client Success Stories</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {testimonials.map((testi) => (
                <motion.div 
                  key={testi.id}
                  whileHover={{ y: -5 }}
                  className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                >
                  <MessageSquare className="absolute top-4 right-4 text-blue-200/50" size={48} strokeWidth={1} />
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    {testi.image ? (
                      <img src={testi.image} alt={testi.title} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {testi.title.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-navy text-sm leading-tight">{testi.title}</h4>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < (testi.rating || 5) ? "text-yellow-500" : "text-slate-300"} 
                            fill="currentColor" 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 italic relative z-10 leading-relaxed overflow-y-auto w-full">
                    "{testi.description}"
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-12"
        >
          <span className="section-title">Core Skills</span>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="text-[11px] uppercase tracking-wider font-bold bg-navy/5 text-navy px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Content Grid & Hero Badge Area */}
      <section className="bg-white flex flex-col">
        {/* Hero Badge Area */}
        <div 
          className="relative h-[600px] w-full overflow-hidden border-b border-editorial-border p-10 flex items-center justify-center bg-center bg-cover bg-no-repeat bg-navy"
          style={{ backgroundImage: 'url("/Logo2.png")' }}
        >
          <div className="absolute inset-0 bg-black/30 z-0" /> {/* Light overlay to ensure text is readable over the image */}
          
          {/* Professional Excellence Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-xl p-12 bg-navy/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex flex-col items-center text-center group"
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
              {dynamicContent.badgeTitle}
            </h2>
            
            <div className="w-16 h-px bg-white/20 mb-8" />

            <div className="text-white/90 text-xl md:text-2xl font-sans font-light leading-relaxed tracking-wide whitespace-pre-line">
              {dynamicContent.badgeSubtitle}
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white p-6 border border-editorial-border rounded-xl shadow-2xl hidden sm:block">
              <p className="text-navy font-bold text-2xl">Verified</p>
              <p className="text-slate text-sm uppercase tracking-widest">{dynamicContent.badgeVerifiedText}</p>
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
              {services.map((service, i) => {
                const Icon = iconMap[service.icon] || Settings;
                return (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02 }}
                    className="editorial-card"
                  >
                    <div className="flex items-center gap-3 mb-2">
                       <Icon className="w-5 h-5 text-navy opacity-70" />
                       <h3 className="text-[16px] font-serif">{service.title}</h3>
                    </div>
                    <p className="text-[13px] leading-relaxed text-slate">{service.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {showPromoPopup && currentPromo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowPromoPopup(false)}
                className="absolute top-3 right-3 bg-white/50 hover:bg-slate-200 text-navy p-1.5 rounded-full backdrop-blur-sm transition-colors z-10"
              >
                <X size={18} />
              </button>
              
              {currentPromo.image && (
                <div className="aspect-square w-full bg-slate-50 relative">
                  <img src={currentPromo.image} alt={currentPromo.title} className="w-full h-full object-contain p-4" />
                </div>
              )}
              
              <div className="p-6 text-center">
                <div className="inline-block bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs mb-3">
                  LIMITED TIME OFFER
                </div>
                <h3 className="text-2xl font-serif text-navy mb-2">{currentPromo.title}</h3>
                
                <div className="flex justify-center items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-red-600">{currentPromo.promoPrice}</span>
                  {(() => {
                    const product = products.find(prod => prod.id === currentPromo.productId);
                    return product && product.price ? (
                      <span className="text-sm text-slate-400 line-through">{product.price}</span>
                    ) : null;
                  })()}
                </div>
                
                <p className="text-slate text-sm mb-6 max-h-24 overflow-y-auto">{currentPromo.description}</p>
                
                <div className="mb-4 text-left border-t border-slate-100 pt-3">
                  <div className="text-[10px] uppercase font-bold text-red-800/60 mb-1 text-center">Ends In:</div>
                  <div className="flex justify-center">
                    <Countdown endDate={currentPromo.endDate} />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <HireMeModal>
                    <Button 
                      onClick={() => setShowPromoPopup(false)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 text-base font-medium shadow-lg shadow-red-600/20"
                    >
                      Claim Offer Now
                    </Button>
                  </HireMeModal>
                  <button 
                    onClick={() => setShowPromoPopup(false)}
                    className="text-xs text-slate-400 mt-2 hover:text-slate-600 font-medium pb-2"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
