import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-9xl font-serif text-navy/10 absolute -top-12 left-1/2 -translate-x-1/2 select-none">404</h1>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-4 relative z-10">Oops! Page Not Found</h2>
        <p className="text-slate mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="bg-navy hover:bg-slate min-w-[200px]">
          <Link to="/">Return Dashboard Home</Link>
        </Button>
      </motion.div>
    </div>
  );
}
