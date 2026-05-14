import { useEffect, useState } from "react";
import React from "react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Plus, Save, LogOut, LayoutDashboard, Briefcase, Settings, Menu, X, FileText, Package, Copy, Tag, MessageSquare, Sun, Moon } from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Content States
  const [homeContent, setHomeContent] = useState({
    heroTitle: "",
    heroDescription: "",
    professionalSummary: "",
    ownerName: "Ejindu Favour Blessing",
    contactEmail: "ejindufavour14@gmail.com",
    contactPhone: "+234 704 302 8109",
    location: "Lagos, Nigeria",
    skills: "Customer Support, Problem Solving, Virtual Assistance, Data Entry, Time Management, CRM Proficiency, Communication",
    tools: "Google Workspace, Microsoft Office, Canva, Zoom, WhatsApp Business",
    badgeTitle: "Top-Rated Virtual Assistant",
    badgeSubtitle: "100% Remote Efficiency | Multi-Channel Support Expert",
    badgeVerifiedText: "Verified Excellence",
    aboutQuote: "With a solid foundation in Computer Science and a passion for exceptional service, I bridge the gap between technical efficiency and human-centric support."
  });
  const [services, setServices] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("adminActiveTab") || "home";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentThemeSetting, setCurrentThemeSetting] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "theme"), (docSnap) => {
      if (docSnap.exists()) {
        setCurrentThemeSetting(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/admin/login");
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // Initial Fetch for Home Content (snapshot can flicker during edits)
    const homeDoc = doc(db, "pageContent", "home");
    getDoc(homeDoc).then((snap) => {
      if (snap.exists()) {
        setHomeContent(snap.data() as any);
      }
    });

    // Fetch Services - Keep snapshot for real-time list updates (add/delete)
    const qServices = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubServices = onSnapshot(qServices, (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "services"));

    // Fetch Experiences
    const qExp = query(collection(db, "experiences"), orderBy("order", "desc"));
    const unsubExp = onSnapshot(qExp, (snap) => {
      setExperiences(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "experiences"));

    // Fetch Products
    const qProducts = query(collection(db, "products"), orderBy("order", "asc"));
    const unsubProducts = onSnapshot(qProducts, (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "products"));

    // Fetch Promos
    const qPromos = query(collection(db, "promos"), orderBy("order", "asc"));
    const unsubPromos = onSnapshot(qPromos, (snap) => {
      setPromos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "promos"));

    // Fetch Testimonials
    const qTesti = query(collection(db, "testimonials"), orderBy("order", "asc"));
    const unsubTesti = onSnapshot(qTesti, (snap) => {
      setTestimonials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "testimonials"));

    return () => {
      unsubServices();
      unsubExp();
      unsubProducts();
      unsubPromos();
      unsubTesti();
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const saveHomeContent = async () => {
    try {
      await setDoc(doc(db, "pageContent", "home"), {
        ...homeContent,
        updatedAt: new Date().toISOString()
      });
      alert("Page content saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "pageContent/home");
    }
  };

  const addService = async () => {
    try {
      const newDocRef = doc(collection(db, "services"));
      const newService = {
        title: "New Service",
        description: "Describe your expertise here.",
        order: services.length,
        icon: "Settings"
      };
      // For immediate feedback we could update local state, but onSnapshot will handle it.
      await setDoc(newDocRef, newService);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "services");
    }
  };

  const deleteService = async (id: string) => {
    if (confirm("Delete this service?")) {
      await deleteDoc(doc(db, "services", id));
    }
  };

  const updateServiceLocal = (id: string, field: string, value: any) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveService = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    try {
      await setDoc(doc(db, "services", id), service);
      alert("Service saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `services/${id}`);
    }
  };

  const addExperience = async () => {
    try {
      const newDocRef = doc(collection(db, "experiences"));
      const newExp = {
        date: "2025 – Present",
        title: "New Role",
        location: "Location here",
        description: "",
        order: experiences.length,
        type: "work"
      };
      await setDoc(newDocRef, newExp);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "experiences");
    }
  };

  const deleteExperience = async (id: string) => {
    if (confirm("Delete this experience?")) {
      await deleteDoc(doc(db, "experiences", id));
    }
  };

  const updateExperienceLocal = (id: string, field: string, value: any) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const saveExperience = async (id: string) => {
    const exp = experiences.find(e => e.id === id);
    if (!exp) return;
    try {
      await setDoc(doc(db, "experiences", id), exp);
      alert("Experience saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `experiences/${id}`);
    }
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) { // 1MB limit for base64 in Firestore doc approx
        alert("File is too large! Please select an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProductLocal(id, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = async () => {
    try {
      const newDocRef = doc(collection(db, "products"));
      const newProduct = {
        title: "New Product",
        description: "Product description...",
        price: "$0.00",
        image: "",
        order: products.length
      };
      await setDoc(newDocRef, newProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "products");
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Delete this product?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const updateProductLocal = (id: string, field: string, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const saveProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    try {
      await setDoc(doc(db, "products", id), product);
      alert("Product saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    }
  };

  const addPromo = async () => {
    try {
      const newDocRef = doc(collection(db, "promos"));
      const newPromo = {
        title: "New Promo",
        description: "Promo description...",
        image: "",
        productId: "",
        promoPrice: "$0.00",
        endDate: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 16), // tomorrow
        order: promos.length
      };
      await setDoc(newDocRef, newPromo);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "promos");
    }
  };

  const deletePromo = async (id: string) => {
    if (confirm("Delete this promo?")) {
      await deleteDoc(doc(db, "promos", id));
    }
  };

  const updatePromoLocal = (id: string, field: string, value: any) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const savePromo = async (id: string) => {
    const promo = promos.find(p => p.id === id);
    if (!promo) return;
    try {
      await setDoc(doc(db, "promos", id), promo);
      alert("Promo saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `promos/${id}`);
    }
  };

  const handlePromoImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) {
        alert("File is too large! Please select an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePromoLocal(id, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTestimonial = async () => {
    try {
      const newDocRef = doc(collection(db, "testimonials"));
      const newTesti = {
        title: "Client Testimonial",
        description: "Excellent service!",
        image: "",
        rating: 5,
        order: testimonials.length
      };
      await setDoc(newDocRef, newTesti);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "testimonials");
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (confirm("Delete this testimonial?")) {
      await deleteDoc(doc(db, "testimonials", id));
    }
  };

  const updateTestimonialLocal = (id: string, field: string, value: any) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveTestimonial = async (id: string) => {
    const testi = testimonials.find(t => t.id === id);
    if (!testi) return;
    try {
      await setDoc(doc(db, "testimonials", id), testi);
      alert("Testimonial saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `testimonials/${id}`);
    }
  };

  const handleTestimonialImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) {
        alert("File is too large! Please select an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTestimonialLocal(id, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const overrideTheme = async (mode: 'light' | 'dark' | 'auto') => {
    try {
      if (mode === 'auto') {
        // Just delete the explicit setting or set it to auto, setting it to auto gives visual feedback in DB.
        await setDoc(doc(db, "settings", "theme"), {
          mode: "auto",
          timestamp: new Date().getTime()
        });
        alert(`Theme set back to Auto (based on time).`);
        return;
      }

      await setDoc(doc(db, "settings", "theme"), {
        mode,
        timestamp: new Date().getTime()
      });
      alert(`Theme explicitly set to ${mode} mode until the next scheduled transition.`);
    } catch(err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/theme");
    }
  };

  const seedInitialData = async () => {
    if (!confirm("This will overwrite/create default content in the database. Continue?")) return;

    try {
      // Seed Home Content
      await setDoc(doc(db, "pageContent", "home"), homeContent);

      // Seed Services
      const defaultServices = [
        { title: "Customer Support", description: "Expert handling of inquiries and complaints via Phone, Email, Chat, and WhatsApp.", order: 0, icon: "Headphones" },
        { title: "Administrative Management", description: "Seamless scheduling, inventory tracking, documentation, and workflow optimization.", order: 1, icon: "Settings" },
        { title: "Virtual Assistance", description: "Remote support utilizing top digital tools to keep your business organized and efficient.", order: 2, icon: "UserCheck" }
      ];
      for (const [idx, s] of defaultServices.entries()) {
        await setDoc(doc(db, "services", `service-${idx}`), s);
      }

      // Seed experiences
      const defaultExp = [
        { date: "2025 – Present", title: "Customer Support / VA", location: "Self-Employed", order: 3, type: "work", description: "" },
        { date: "2023 – 2025", title: "Administrative Manager", location: "Melissa Black Boutique", order: 2, type: "work", description: "" },
        { date: "2024 – 2024", title: "Front Desk Representative", location: "12 Basket Food Ltd", order: 1, type: "work", description: "" },
        { date: "2024 – 2024", title: "Secretary", location: "Norland Nigeria Ltd", order: 0, type: "work", description: "" }
      ];
      for (const [idx, e] of defaultExp.entries()) {
        await setDoc(doc(db, "experiences", `exp-${idx}`), e);
      }

      alert("Database initialized successfully!");
    } catch (err) {
      alert("Initialization failed: " + (err as Error).message);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen font-serif">Authenticating...</div>;

  const NavLinks = () => {
    const navItems = [
      { id: "home", label: "Landing Page", icon: Settings },
      { id: "global", label: "Site Identity", icon: LayoutDashboard },
      { id: "services", label: "My Expertise", icon: Briefcase },
      { id: "experiences", label: "Professional Timeline", icon: FileText },
      { id: "products", label: "Products", icon: Package },
      { id: "promos", label: "Promos", icon: Tag },
      { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    ];

    return (
      <nav className="flex-grow flex flex-col gap-1 mt-8">
        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Primary Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <Icon size={18} className={isActive ? "text-blue-400" : "text-slate-400"} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="mt-8 px-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Global Theme Settings</p>
          <div className="flex bg-navy rounded-lg p-1 gap-1 border border-white/10 overflow-hidden">
            <button 
              onClick={() => overrideTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs transition-all ${currentThemeSetting?.mode === 'light' ? 'bg-white text-navy font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Sun size={14} /> Light
            </button>
            <button 
              onClick={() => overrideTheme('auto')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs transition-all ${!currentThemeSetting || currentThemeSetting?.mode === 'auto' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Auto
            </button>
            <button 
              onClick={() => overrideTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs transition-all ${currentThemeSetting?.mode === 'dark' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Moon size={14} /> Dark
            </button>
          </div>
          <p className="text-[9px] text-white/30 mt-2 text-center">Auto switches at 4PM/7AM</p>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-navy text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-white focus:outline-none">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-serif font-bold">Dashboard</h1>
        </div>
        <p className="text-[10px] text-white/60">{user?.email}</p>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-navy text-white p-6 flex flex-col z-50 md:hidden shadow-xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-xl font-serif font-bold">Admin</h1>
                  <p className="text-xs text-white/60 mt-1 truncate">{user?.email}</p>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <NavLinks />
              <button 
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 p-3 text-red-300 hover:text-red-100 transition-colors w-full rounded-lg hover:bg-white/5"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-navy text-white p-6 hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-xl font-serif font-bold whitespace-nowrap overflow-hidden text-ellipsis">Admin Dashboard</h1>
          <p className="text-xs text-white/60 mt-1 break-all">{user?.email}</p>
        </div>
        
        <NavLinks />

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-3 text-red-300 hover:text-red-100 transition-colors w-full rounded-lg hover:bg-white/5"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      <main className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full overflow-x-hidden min-h-screen">
        <Tabs value={activeTab} className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
            <h2 className="text-2xl font-serif text-navy dark:text-white capitalize hidden md:block">
              {activeTab === 'home' && 'Landing Page'}
              {activeTab === 'global' && 'Site Identity'}
              {activeTab === 'services' && 'My Expertise'}
              {activeTab === 'experiences' && 'Professional Timeline'}
              {activeTab === 'products' && 'Products'}
              {activeTab === 'promos' && 'Promos'}
              {activeTab === 'testimonials' && 'Testimonials'}
            </h2>
            <div className="flex items-center gap-2">
              {(services.length === 0 && experiences.length === 0) && (
                <Button onClick={seedInitialData} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 text-xs w-full lg:w-auto">
                  Initialize Database
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="home">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Page Text & Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate">Hero Title</label>
                  <Input 
                    value={homeContent.heroTitle} 
                    onChange={e => setHomeContent({...homeContent, heroTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate">Hero Description</label>
                  <Textarea 
                    rows={3}
                    value={homeContent.heroDescription} 
                    onChange={e => setHomeContent({...homeContent, heroDescription: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate">Professional Summary</label>
                  <Textarea 
                    rows={3}
                    value={homeContent.professionalSummary} 
                    onChange={e => setHomeContent({...homeContent, professionalSummary: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate">Skills (Comma separated)</label>
                  <Textarea 
                    rows={2}
                    value={homeContent.skills} 
                    onChange={e => setHomeContent({...homeContent, skills: e.target.value})}
                    placeholder="Skill 1, Skill 2, Skill 3..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate">Badge Title</label>
                    <Input 
                      value={homeContent.badgeTitle} 
                      onChange={e => setHomeContent({...homeContent, badgeTitle: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate">Badge Verified Text</label>
                    <Input 
                      value={homeContent.badgeVerifiedText} 
                      onChange={e => setHomeContent({...homeContent, badgeVerifiedText: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate">Badge Subtitle</label>
                  <Input 
                    value={homeContent.badgeSubtitle} 
                    onChange={e => setHomeContent({...homeContent, badgeSubtitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate">Professional Quote (About Page)</label>
                  <Textarea 
                    rows={2}
                    value={homeContent.aboutQuote || ""} 
                    onChange={e => setHomeContent({...homeContent, aboutQuote: e.target.value})}
                  />
                </div>
                <Button onClick={saveHomeContent} className="bg-navy hover:bg-slate gap-2">
                  <Save size={16} /> Save Page Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Site Identity & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate">Owner Name</label>
                    <Input 
                      value={homeContent.ownerName} 
                      onChange={e => setHomeContent({...homeContent, ownerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate">Location</label>
                    <Input 
                      value={homeContent.location} 
                      onChange={e => setHomeContent({...homeContent, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate">Contact Email</label>
                    <Input 
                      value={homeContent.contactEmail} 
                      onChange={e => setHomeContent({...homeContent, contactEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate">Contact Phone</label>
                    <Input 
                      value={homeContent.contactPhone} 
                      onChange={e => setHomeContent({...homeContent, contactPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate">Footer Tools (Comma separated)</label>
                  <Textarea 
                    rows={2}
                    value={homeContent.tools} 
                    onChange={e => setHomeContent({...homeContent, tools: e.target.value})}
                    placeholder="Tool 1, Tool 2, Tool 3..."
                  />
                </div>
                <Button onClick={saveHomeContent} className="bg-navy hover:bg-slate gap-2">
                  <Save size={16} /> Save Identity Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="font-serif">Global Theme Override</CardTitle>
                <p className="text-sm text-slate">
                  By default, the website automatically switches to Dark Mode between 4 PM and 7 AM everyday. 
                  Selecting a theme below will force that mode indefinitely until the next automatic 4 PM or 7 AM transition occurs.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    variant={currentThemeSetting?.mode === "light" ? "default" : "outline"}
                    onClick={() => overrideTheme("light")}
                    className="w-full"
                  >
                    Force Light Mode
                  </Button>
                  <Button 
                    variant={!currentThemeSetting || currentThemeSetting?.mode === "auto" ? "default" : "outline"}
                    onClick={() => overrideTheme("auto")}
                    className={`w-full ${(!currentThemeSetting || currentThemeSetting?.mode === 'auto') ? 'bg-slate-700 hover:bg-slate-800 text-white' : ''}`}
                  >
                    Auto (Time-based)
                  </Button>
                  <Button 
                    variant={currentThemeSetting?.mode === "dark" ? "default" : "outline"}
                    onClick={() => overrideTheme("dark")}
                    className={`w-full ${currentThemeSetting?.mode === 'dark' ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800' : ''}`}
                  >
                    Force Dark Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Manage Services</h2>
              <Button onClick={addService} className="bg-green-600 hover:bg-green-700 gap-2">
                <Plus size={16} /> Add service
              </Button>
            </div>
            <div className="grid gap-4">
              {services.map(service => (
                <Card key={service.id} className="border-editorial-border">
                  <CardContent className="p-6 grid gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate">Service Title</label>
                      <Input 
                        placeholder="Service Title" 
                        value={service.title} 
                        onChange={e => updateServiceLocal(service.id, "title", e.target.value)}
                        className="text-lg font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate">Description</label>
                      <Textarea 
                        placeholder="Description" 
                        value={service.description} 
                        onChange={e => updateServiceLocal(service.id, "description", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate">Icon (Lucide name: Headphones, Settings, UserCheck, MessageSquare, Briefcase)</label>
                      <Input 
                        placeholder="Icon Name" 
                        value={service.icon || "Briefcase"} 
                        onChange={e => updateServiceLocal(service.id, "icon", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate">Order</label>
                        <Input 
                          type="number" 
                          className="w-20" 
                          value={service.order} 
                          onChange={e => updateServiceLocal(service.id, "order", parseInt(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button 
                          onClick={() => saveService(service.id)} 
                          className="bg-navy hover:bg-slate gap-2 flex-grow sm:flex-grow-0"
                        >
                          <Save size={16} /> Save Changes
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteService(service.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experiences">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Work History</h2>
              <Button onClick={addExperience} className="bg-green-600 hover:bg-green-700 gap-2">
                <Plus size={16} /> Add entry
              </Button>
            </div>
            <div className="grid gap-4">
              {experiences.map(exp => (
                <Card key={exp.id} className="border-editorial-border">
                  <CardContent className="p-6 grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate">Period</label>
                        <Input 
                          placeholder="Year (e.g. 2025 - Present)" 
                          value={exp.date} 
                          onChange={e => updateExperienceLocal(exp.id, "date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate">Entry Type</label>
                        <select 
                          className="w-full h-10 px-3 border border-editorial-border rounded-md text-sm"
                          value={exp.type || "work"}
                          onChange={e => updateExperienceLocal(exp.id, "type", e.target.value)}
                        >
                          <option value="work">Work Experience</option>
                          <option value="education">Education</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate">Job/Degree Title</label>
                        <Input 
                          placeholder="Title" 
                          value={exp.title} 
                          onChange={e => updateExperienceLocal(exp.id, "title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate">Organization / School</label>
                        <Input 
                          placeholder="Company/Location" 
                          value={exp.location} 
                          onChange={e => updateExperienceLocal(exp.id, "location", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate">Description (Optional)</label>
                      <Textarea 
                        placeholder="Key responsibilities..." 
                        value={exp.description || ""} 
                        onChange={e => updateExperienceLocal(exp.id, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate">Order</label>
                        <Input 
                          type="number" 
                          className="w-20" 
                          value={exp.order} 
                          onChange={e => updateExperienceLocal(exp.id, "order", parseInt(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button 
                          onClick={() => saveExperience(exp.id)} 
                          className="bg-navy hover:bg-slate gap-2 flex-grow sm:flex-grow-0"
                        >
                          <Save size={16} /> Save Changes
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteExperience(exp.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Manage Products</h2>
              <Button onClick={addProduct} className="bg-green-600 hover:bg-green-700 gap-2">
                <Plus size={16} /> Add Product
              </Button>
            </div>
            <div className="grid gap-4">
              {products.map(product => (
                <Card key={product.id} className="border-editorial-border">
                  <CardContent className="p-6 grid gap-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image section */}
                      <div className="flex-shrink-0 w-full md:w-48 space-y-2">
                        <div className="flex items-center justify-between bg-slate-100/50 border border-slate-200 rounded px-2 py-1 mb-2">
                          <span className="text-[10px] uppercase font-bold text-slate truncate flex-grow mr-2" title={product.id}>
                            ID: {product.id}
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(product.id);
                              alert("Copied Product ID: " + product.id);
                            }} 
                            className="text-navy/60 hover:text-navy shrink-0 transition-colors bg-white border border-slate-200 p-1 rounded-sm shadow-sm"
                            title="Copy ID"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <label className="text-[10px] uppercase font-bold text-slate">Product Image (Optional)</label>
                        {product.image ? (
                          <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-2 relative group">
                            <img src={product.image} alt="Product" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => updateProductLocal(product.id, "image", "")}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 mb-2">
                            <Package className="text-slate-400" size={32} />
                          </div>
                        )}
                        <Input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(product.id, e)}
                          className="text-xs cursor-pointer"
                        />
                        <div className="text-[10px] text-slate/60 px-1">Or enter image URL:</div>
                        <Input 
                          placeholder="https://..." 
                          value={product.image || ""} 
                          onChange={e => updateProductLocal(product.id, "image", e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      
                      {/* Content section */}
                      <div className="flex-grow space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate">Product Name</label>
                            <Input 
                              placeholder="Product Title" 
                              value={product.title} 
                              onChange={e => updateProductLocal(product.id, "title", e.target.value)}
                              className="text-lg font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate">Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-[50%] -translate-y-1/2 text-slate font-medium text-sm">$</span>
                              <Input 
                                placeholder="0.00" 
                                value={product.price?.replace(/^\$/, '') || ''} 
                                onChange={e => updateProductLocal(product.id, "price", '$' + e.target.value)}
                                className="pl-6"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate">Description</label>
                          <Textarea 
                            placeholder="Product description..." 
                            value={product.description} 
                            onChange={e => updateProductLocal(product.id, "description", e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] uppercase font-bold text-slate">Order</label>
                            <Input 
                              type="number" 
                              className="w-20" 
                              value={product.order} 
                              onChange={e => updateProductLocal(product.id, "order", parseInt(e.target.value))}
                            />
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button 
                              onClick={() => saveProduct(product.id)} 
                              className="bg-navy hover:bg-slate gap-2 flex-grow sm:flex-grow-0"
                            >
                              <Save size={16} /> Save Changes
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="promos">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Manage Promos</h2>
              <Button onClick={addPromo} className="bg-green-600 hover:bg-green-700 gap-2">
                <Plus size={16} /> Add Promo
              </Button>
            </div>
            <div className="grid gap-4">
              {promos.map(promo => (
                <Card key={promo.id} className="border-editorial-border">
                  <CardContent className="p-6 grid gap-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image section */}
                      <div className="flex-shrink-0 w-full md:w-48 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate">Promo Image (Optional)</label>
                        {promo.image ? (
                          <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-2 relative group">
                            <img src={promo.image} alt="Promo" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => updatePromoLocal(promo.id, "image", "")}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 mb-2">
                            <Tag className="text-slate-400" size={32} />
                          </div>
                        )}
                        <Input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePromoImageUpload(promo.id, e)}
                          className="text-xs cursor-pointer"
                        />
                        <div className="text-[10px] text-slate/60 px-1">Or enter image URL:</div>
                        <Input 
                          placeholder="https://..." 
                          value={promo.image || ""} 
                          onChange={e => updatePromoLocal(promo.id, "image", e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      
                      {/* Content section */}
                      <div className="flex-grow space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate">Promo Name</label>
                            <Input 
                              placeholder="Promo Title" 
                              value={promo.title} 
                              onChange={e => updatePromoLocal(promo.id, "title", e.target.value)}
                              className="text-lg font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate">Product ID (Copy from Products)</label>
                            <Input 
                              placeholder="Enter Product ID..." 
                              value={promo.productId} 
                              onChange={e => updatePromoLocal(promo.id, "productId", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate">Promo Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-[50%] -translate-y-1/2 text-slate font-medium text-sm">$</span>
                              <Input 
                                placeholder="0.00" 
                                value={promo.promoPrice?.replace(/^\$/, '') || ''} 
                                onChange={e => updatePromoLocal(promo.id, "promoPrice", '$' + e.target.value)}
                                className="pl-6"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate">End Date & Time</label>
                            <Input 
                              type="datetime-local"
                              value={promo.endDate} 
                              onChange={e => updatePromoLocal(promo.id, "endDate", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate">Description</label>
                          <Textarea 
                            placeholder="Promo description..." 
                            value={promo.description} 
                            onChange={e => updatePromoLocal(promo.id, "description", e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] uppercase font-bold text-slate">Order</label>
                            <Input 
                              type="number" 
                              className="w-20" 
                              value={promo.order} 
                              onChange={e => updatePromoLocal(promo.id, "order", parseInt(e.target.value))}
                            />
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button 
                              onClick={() => savePromo(promo.id)} 
                              className="bg-navy hover:bg-slate gap-2 flex-grow sm:flex-grow-0"
                            >
                              <Save size={16} /> Save Changes
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => deletePromo(promo.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="testimonials">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Manage Testimonials</h2>
              <Button onClick={addTestimonial} className="bg-green-600 hover:bg-green-700 gap-2">
                <Plus size={16} /> Add Testimonial
              </Button>
            </div>
            <div className="grid gap-4">
              {testimonials.map(testi => (
                <Card key={testi.id} className="border-editorial-border">
                  <CardContent className="p-6 grid gap-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image section */}
                      <div className="flex-shrink-0 w-full md:w-48 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate">Client Photo (Optional)</label>
                        {testi.image ? (
                          <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-2 relative group">
                            <img src={testi.image} alt="Client" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => updateTestimonialLocal(testi.id, "image", "")}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 mb-2">
                            <MessageSquare className="text-slate-400" size={32} />
                          </div>
                        )}
                        <Input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleTestimonialImageUpload(testi.id, e)}
                          className="text-xs cursor-pointer"
                        />
                        <div className="text-[10px] text-slate/60 px-1">Or enter image URL:</div>
                        <Input 
                          placeholder="https://..." 
                          value={testi.image || ""} 
                          onChange={e => updateTestimonialLocal(testi.id, "image", e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      
                      {/* Content section */}
                      <div className="flex-grow space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate">What the testimony is for (Title)</label>
                          <Input 
                            placeholder="e.g. Excellent Customer Support" 
                            value={testi.title} 
                            onChange={e => updateTestimonialLocal(testi.id, "title", e.target.value)}
                            className="text-lg font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate">Description</label>
                          <Textarea 
                            placeholder="The client's story or review..." 
                            value={testi.description} 
                            onChange={e => updateTestimonialLocal(testi.id, "description", e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] uppercase font-bold text-slate">Order</label>
                              <Input 
                                type="number" 
                                className="w-20" 
                                value={testi.order} 
                                onChange={e => updateTestimonialLocal(testi.id, "order", parseInt(e.target.value))}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] uppercase font-bold text-slate">Rating (1-5)</label>
                              <Input 
                                type="number" 
                                className="w-20" 
                                min={1}
                                max={5}
                                value={testi.rating || 5} 
                                onChange={e => updateTestimonialLocal(testi.id, "rating", parseInt(e.target.value) || 5)}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button 
                              onClick={() => saveTestimonial(testi.id)} 
                              className="bg-navy hover:bg-slate gap-2 flex-grow sm:flex-grow-0"
                            >
                              <Save size={16} /> Save Changes
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => deleteTestimonial(testi.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
