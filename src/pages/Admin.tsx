import { useState } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { usePortfolio } from '../hooks/usePortfolio';
import { doc, setDoc, deleteDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-error';
import { Plus, Trash, Edit, Check, Settings, LayoutDashboard, Eye, EyeOff } from 'lucide-react';

export default function Admin() {
  const { profile, services, experiences, skills, loading, user } = usePortfolio();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message || "Failed to sign in");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setAuthError('Please enter your email to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setAuthError('');
    } catch (error: any) {
      setAuthError(error.message || "Failed to send reset email");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="p-10">Loading Portfolio Data...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-10 bg-editorial-border">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-serif mb-2">Admin Dashboard</h1>
          <p className="text-slate mb-8">Sign in with your email and password to manage this portfolio.</p>
          
          {authError && <div className="text-red-500 text-sm mb-4">{authError}</div>}
          {resetSent && <div className="text-green-600 text-sm mb-4">Password reset email sent!</div>}

          <div className="space-y-4 mb-6 text-left">
            <div>
              <label className="block text-sm font-bold text-slate mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full border p-2 rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full border p-2 rounded pr-10" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-navy"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-navy text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-navy/90 transition-colors mb-4"
          >
            Sign In
          </button>
          
          <button 
            type="button"
            onClick={handleResetPassword}
            className="text-sm text-slate hover:text-navy underline"
          >
            Forgotten Password?
          </button>
        </form>
      </div>
    );
  }

  // --- Helpers for generic simple lists ---
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      heroTitle: formData.get('heroTitle') as string || '',
      heroSubtitle: formData.get('heroSubtitle') as string || '',
      heroDescription: formData.get('heroDescription') as string || '',
      professionalSummary: formData.get('professionalSummary') as string || '',
      detailedProfileSummary: formData.get('detailedProfileSummary') as string || '',
      updatedAt: serverTimestamp()
    };
    try {
      if (profile) {
        await updateDoc(doc(db, 'settings', 'profile'), data);
      } else {
        await setDoc(doc(db, 'settings', 'profile'), data);
      }
      alert('Profile updated');
    } catch (err) {
      handleFirestoreError(err, profile ? OperationType.UPDATE : OperationType.CREATE, 'settings/profile');
    }
  };

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = doc(collection(db, 'services')).id;
    try {
      await setDoc(doc(db, 'services', id), {
        title: formData.get('title') as string || '',
        description: formData.get('description') as string || '',
        icon: formData.get('icon') as string || 'CheckCircle2',
        updatedAt: serverTimestamp(),
      });
      e.currentTarget.reset();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'services');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
  };

  const handleAddExperience = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = doc(collection(db, 'experiences')).id;
    try {
      await setDoc(doc(db, 'experiences', id), {
        period: formData.get('period') as string || '',
        role: formData.get('role') as string || '',
        company: formData.get('company') as string || '',
        location: formData.get('location') as string || '',
        description: formData.get('description') as string || '',
        updatedAt: serverTimestamp()
      });
      e.currentTarget.reset();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'experiences');
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'experiences', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `experiences/${id}`);
    }
  };

  const handleAddSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = doc(collection(db, 'skills')).id;
    try {
      await setDoc(doc(db, 'skills', id), {
        name: formData.get('name') as string || '',
        updatedAt: serverTimestamp()
      });
      e.currentTarget.reset();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'skills');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'skills', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `skills/${id}`);
    }
  };

  return (
    <div className="bg-editorial-border min-h-screen">
      <div className="bg-white border-b border-editorial-border px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-serif text-navy flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" /> Admin Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate">{user.email}</span>
          <button 
            onClick={handleLogout}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <section className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-editorial-border col-span-1 lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-2"><Settings className="w-5 h-5"/> Profile Content</h2>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate mb-1">Hero Title</label>
                <input required name="heroTitle" defaultValue={profile?.heroTitle || 'Expert Virtual Assistance'} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate mb-1">Hero Subtitle</label>
                <textarea required name="heroSubtitle" rows={2} defaultValue={profile?.heroSubtitle || 'Reliable Remote Support for Growing Businesses'} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate mb-1">Hero Description</label>
                <textarea required name="heroDescription" rows={3} defaultValue={profile?.heroDescription || 'I provide expert Virtual Assistance and Customer Care...'} className="w-full border p-2 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate mb-1">Professional Summary (Hero Sidebar)</label>
                <textarea required name="professionalSummary" rows={3} defaultValue={profile?.professionalSummary || 'Detail-oriented and reliable...'} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate mb-1">Detailed Profile Summary (About Page)</label>
                <textarea required name="detailedProfileSummary" rows={5} defaultValue={profile?.detailedProfileSummary || 'My career has been defined...'} className="w-full border p-2 rounded" />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <button type="submit" className="bg-navy text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-navy/80 transition">
                <Check className="w-4 h-4"/> Save Profile
              </button>
            </div>
          </form>
        </section>

        {/* Services */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-editorial-border">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Services</h2>
          <div className="space-y-4 mb-6">
            {services.map(s => (
              <div key={s.id} className="border p-4 rounded bg-gray-50 flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{s.title}</h4>
                  <p className="text-sm text-slate">{s.description}</p>
                </div>
                <button onClick={() => handleDeleteService(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddService} className="border p-4 rounded bg-gray-50 space-y-3">
            <h4 className="font-bold text-sm">Add New Service</h4>
            <input required name="title" placeholder="Title" className="w-full border p-2 rounded text-sm" />
            <textarea required name="description" placeholder="Description" rows={2} className="w-full border p-2 rounded text-sm" />
            <input name="icon" placeholder="Icon name (e.g. Headphones)" defaultValue="CheckCircle2" className="w-full border p-2 rounded text-sm" />
            <button className="bg-slate text-white px-4 py-2 text-sm rounded flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
          </form>
        </section>

        {/* Experiences */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-editorial-border">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Experiences</h2>
          <div className="space-y-4 mb-6 overflow-y-auto max-h-[300px] border border-gray-100 p-2 rounded">
            {experiences.map(e => (
              <div key={e.id} className="border p-4 rounded bg-gray-50 flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate">{e.period}</p>
                  <h4 className="font-bold text-sm">{e.role}</h4>
                  <p className="text-xs">{e.company} ({e.location})</p>
                </div>
                <button onClick={() => handleDeleteExperience(e.id)} className="text-red-500 flex-shrink-0 hover:bg-red-50 p-2 rounded"><Trash className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddExperience} className="border p-4 rounded bg-gray-50 space-y-3">
            <h4 className="font-bold text-sm">Add New Experience</h4>
            <div className="grid grid-cols-2 gap-2">
               <input required name="period" placeholder="Period (e.g. 2023 - 2024)" className="border p-2 rounded text-sm" />
               <input required name="role" placeholder="Role" className="border p-2 rounded text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <input required name="company" placeholder="Company" className="border p-2 rounded text-sm" />
               <input required name="location" placeholder="Location" className="border p-2 rounded text-sm" />
            </div>
            <textarea required name="description" placeholder="Description" rows={2} className="w-full border p-2 rounded text-sm" />
            <button className="bg-slate text-white px-4 py-2 text-sm rounded flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
          </form>
        </section>

        {/* Skills */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-editorial-border col-span-1 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {skills.map(s => (
              <div key={s.id} className="border bg-gray-50 px-3 py-1 rounded-full flex gap-2 items-center text-sm">
                {s.name}
                <button onClick={() => handleDeleteSkill(s.id)} className="text-red-500 hover:text-red-700 ml-1"><Trash className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddSkill} className="border p-4 rounded bg-gray-50 flex gap-2 w-full max-w-sm">
            <input required name="name" placeholder="New Skill..." className="flex-1 border p-2 rounded text-sm" />
            <button className="bg-slate text-white px-4 py-2 text-sm rounded flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
          </form>
        </section>
      </div>
    </div>
  );
}
