import { useEffect, useState } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Plus, Save, LogOut, LayoutDashboard, Briefcase, Settings } from "lucide-react";

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

    return () => {
      unsubServices();
      unsubExp();
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
      const id = "service-" + Date.now();
      const newService = {
        title: "New Service",
        description: "Describe your expertise here.",
        order: services.length,
        icon: "Settings"
      };
      // For immediate feedback we could update local state, but onSnapshot will handle it.
      await setDoc(doc(db, "services", id), newService);
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
      const id = "exp-" + Date.now();
      const newExp = {
        date: "2025 – Present",
        title: "New Role",
        location: "Location here",
        description: "",
        order: experiences.length,
        type: "work"
      };
      await setDoc(doc(db, "experiences", id), newExp);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-navy text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-serif font-bold">Admin Dashboard</h1>
          <p className="text-[10px] text-white/60">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="text-white/60 hover:text-white">
          <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-navy text-white p-6 hidden md:flex flex-col">
        <div className="mb-10">
          <h1 className="text-xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-xs text-white/60 mt-1">{user?.email}</p>
        </div>
        
        <nav className="flex-grow space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer">
            <LayoutDashboard size={20} />
            <span>Site Content</span>
          </div>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 text-white/60 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      <main className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full overflow-x-hidden">
        <Tabs defaultValue="home" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 lg:pb-0 lg:mx-0 lg:px-0">
              <TabsList className="bg-white border border-editorial-border w-max min-w-full justify-start lg:w-auto h-auto">
                <TabsTrigger value="home" className="gap-2 whitespace-nowrap py-2">
                  <Settings size={16} /> Landing Page
                </TabsTrigger>
                <TabsTrigger value="global" className="gap-2 whitespace-nowrap py-2">
                  <LayoutDashboard size={16} /> Site Identity
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2 whitespace-nowrap py-2">
                  <Briefcase size={16} /> My Expertise
                </TabsTrigger>
                <TabsTrigger value="experiences" className="gap-2 whitespace-nowrap py-2">
                   Professional Timeline
                </TabsTrigger>
              </TabsList>
            </div>
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
        </Tabs>
      </main>
    </div>
  );
}
