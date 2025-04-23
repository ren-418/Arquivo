import React from "react";
import Sidebar from "./SideBar";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider>
        <div className="h-screen overflow-hidden bg-background text-foreground flex no-scrollbar">
          <Sidebar />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={cn("flex-1 overflow-y-auto p-8")}
          >
            {children}
          </motion.main>
        </div>
      </ThemeProvider>
    </>
  );
}
