import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-error';
import { onAuthStateChanged, User } from 'firebase/auth';

export interface Profile {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  professionalSummary: string;
  detailedProfileSummary: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  updatedAt?: string;
}

export interface Experience {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  updatedAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  updatedAt?: string;
}

export function usePortfolio() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    return unsubAuth;
  }, []);

  useEffect(() => {
    setLoading(true);

    const unsubProfile = onSnapshot(doc(db, 'settings', 'profile'), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile);
      } else {
        setProfile(null);
      }
    }, (err) => {
      try { handleFirestoreError(err, OperationType.GET, 'settings/profile'); } catch (e) { console.error(e); }
    });

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    }, (err) => {
      try { handleFirestoreError(err, OperationType.LIST, 'services'); } catch (e) { console.error(e); }
    });

    const unsubExperiences = onSnapshot(collection(db, 'experiences'), (snapshot) => {
      setExperiences(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Experience)));
    }, (err) => {
      try { handleFirestoreError(err, OperationType.LIST, 'experiences'); } catch (e) { console.error(e); }
    });

    const unsubSkills = onSnapshot(collection(db, 'skills'), (snapshot) => {
      setSkills(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Skill)));
    }, (err) => {
      try { handleFirestoreError(err, OperationType.LIST, 'skills'); } catch (e) { console.error(e); }
    });

    // When all listeners are fired once, we set loading to false. This relies on React batching but roughly is ok.
    setLoading(false);

    return () => {
      unsubProfile();
      unsubServices();
      unsubExperiences();
      unsubSkills();
    };
  }, []);

  return { profile, services, experiences, skills, loading, user };
}
