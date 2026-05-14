import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";

function getMostRecentTransition(now: Date) {
  const t1 = new Date(now);
  t1.setHours(7, 0, 0, 0); // 7 AM today
  
  const t2 = new Date(now);
  t2.setHours(16, 0, 0, 0); // 4 PM today

  if (now.getTime() >= t2.getTime()) {
    return t2.getTime(); // Past 4 PM, so 4 PM today is the most recent
  } else if (now.getTime() >= t1.getTime()) {
    return t1.getTime(); // Between 7 AM and 4 PM, so 7 AM today is the most recent
  } else {
    // Before 7 AM today. Most recent is 4 PM yesterday.
    const t3 = new Date(now);
    t3.setDate(t3.getDate() - 1);
    t3.setHours(16, 0, 0, 0);
    return t3.getTime();
  }
}

export default function App() {
  useEffect(() => {
    let currentData: any = null;

    const applyTheme = () => {
      let isDark = false;
      const now = new Date();
      const mostRecentTransition = getMostRecentTransition(now);
      
      if (currentData && currentData.mode !== 'auto' && currentData.timestamp > mostRecentTransition) {
        // Admin override applies
        isDark = currentData.mode === "dark";
      } else {
        // Default time-based: Dark between 16:00 and 07:00
        const currentHour = now.getHours();
        isDark = currentHour >= 16 || currentHour < 7;
      }
      
      const root = window.document.documentElement;
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    const unsub = onSnapshot(doc(db, "settings", "theme"), (docSnap) => {
      currentData = docSnap.data();
      applyTheme();
    });

    const interval = setInterval(applyTheme, 60000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}
