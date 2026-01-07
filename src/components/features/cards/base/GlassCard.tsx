import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    icon?: ReactNode;
}

export function GlassCard({ children, className, title, icon }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "glass-card p-6 w-full max-w-sm mx-auto overflow-hidden relative",
                className
            )}
        >
            {/* Decorative gradient blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {(title || icon) && (
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {icon && <span className="text-blue-500">{icon}</span>}
                    {title}
                </div>
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
