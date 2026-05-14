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
import { Trash2, Plus, Save, LogOut, LayoutDashboard, Briefcase, Settings, Menu, X, FileText, Package, Copy, Tag } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    return () => {
      unsubServices();
      unsubExp();
      unsubProducts();
      unsubPromos();
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

  const NavLinks = () => (
    <nav className="flex-grow space-y-2 mt-6">
      <button 
        onClick={() => { setActiveTab("home"); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
      >
        <Settings size={20} />
        <span>Landing Page</span>
      </button>
      <button 
        onClick={() => { setActiveTab("global"); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'global' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
      >
        <LayoutDashboard size={20} />
        <span>Site Identity</span>
      </button>
      <button 
        onClick={() => { setActiveTab("services"); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'services' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
      >
        <Briefcase size={20} />
        <span>My Expertise</span>
      </button>
      <button 
        onClick={() => { setActiveTab("experiences"); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'experiences' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
      >
        <FileText size={20} />
        <span>Professional Timeline</span>
      </button>
      <button 
        onClick={() => { setActiveTab("products"); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
      >
        <Package size={20} />
        <span>Products</span>
      </button>
      <button 
        onClick={() => { setActiveTab("promos"); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'promos' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
      >
        <Tag size={20} />
        <span>Promos</span>
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
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
            <h2 className="text-2xl font-serif text-navy capitalize hidden md:block">
              {activeTab === 'home' && 'Landing Page'}
              {activeTab === 'global' && 'Site Identity'}
              {activeTab === 'services' && 'My Expertise'}
              {activeTab === 'experiences' && 'Professional Timeline'}
              {activeTab === 'products' && 'Products'}
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
        </Tabs>
      </main>
    </div>
  );
}
