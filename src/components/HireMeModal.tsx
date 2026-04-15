import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, MessageCircle } from "lucide-react";
import React from "react";

export function HireMeModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none bg-white rounded-2xl shadow-2xl">
        <DialogHeader className="bg-navy p-8 text-center">
          <DialogTitle className="text-white font-serif text-2xl tracking-tight">
            Let's Work Together
          </DialogTitle>
          <p className="text-white/60 text-sm font-sans mt-2">
            Choose your preferred way to reach out
          </p>
        </DialogHeader>
        <div className="p-8 space-y-4">
          <a
            href="mailto:favourengels899@gmail.com?subject=Inquiry for Virtual Assistant Services"
            className="flex items-center justify-center gap-3 w-full py-4 bg-navy text-white rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95"
          >
            <Mail className="w-5 h-5" />
            Contact via Email
          </a>
          <a
            href="https://wa.me/2347043022169"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-navy text-navy rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-300 hover:bg-navy/5 hover:scale-[1.02] hover:shadow-lg active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            Message on WhatsApp
          </a>
        </div>
        <div className="bg-light-gray p-4 text-center">
          <p className="text-[10px] uppercase tracking-[2px] text-slate font-bold">
            Available for Global Remote Support
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
