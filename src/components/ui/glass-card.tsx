import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    className?: string;
    children: React.ReactNode;
    variant?: 'default' | 'highlight' | 'interactive';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    className,
    children,
    variant = 'default',
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30
            }}
            className={cn(
                // Base Glass Styles
                "relative overflow-hidden rounded-[24px]",
                "backdrop-blur-xl backdrop-saturate-150",
                "border border-white/20 dark:border-white/10",
                "shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]",

                // Variants
                variant === 'default' && "bg-white/60 dark:bg-black/40",
                variant === 'highlight' && "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20",
                variant === 'interactive' && "cursor-pointer hover:bg-white/70 dark:hover:bg-white/5 transition-colors active:scale-[0.99]",

                className
            )}
            {...props}
        >
            {/* Glossy Reflection Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
