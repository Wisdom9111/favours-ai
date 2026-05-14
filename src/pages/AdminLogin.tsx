import React, { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      // Special handling for the initial admin account
      if (
        (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") &&
        email === "wisdomezekiel28@gmail.com" &&
        password === "Adminsonly."
      ) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          navigate("/admin/dashboard");
          return;
        } catch (createErr: any) {
          setError("Account setup failed: " + createErr.message);
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-editorial-border shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-serif text-navy">Admin Portal</CardTitle>
            <p className="text-slate text-sm">Secure access for site management</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-slate">Email Address</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-editorial-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-slate">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-editorial-border"
                />
              </div>
              {error && <p className="text-red-500 text-xs italic">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-navy hover:bg-slate text-white py-6"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
