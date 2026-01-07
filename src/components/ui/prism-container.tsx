import React, { useMemo } from 'react';
import { motion, HTMLMotionProps, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PrismContainerProps extends HTMLMotionProps<"div"> {
    className?: string;
    children: React.ReactNode;
    glowColor?: string; // e.g. 'indigo', 'emerald', 'amber'
}

export const PrismContainer: React.FC<PrismContainerProps> = ({
    className,
    children,
    glowColor = 'indigo',
    ...props
}) => {
    // Mouse tracking for light reflection
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    const colorMap = {
        indigo: 'from-indigo-500/20 to-purple-500/20',
        emerald: 'from-emerald-500/20 to-teal-500/20',
        amber: 'from-amber-500/20 to-orange-500/20',
        rose: 'from-rose-500/20 to-pink-500/20',
    };

    const selectedGlow = colorMap[glowColor as keyof typeof colorMap] || colorMap.indigo;

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] // Custom Apple-like ease
            }}
            className={cn(
                "group relative overflow-hidden rounded-[32px] p-px",
                "bg-gradient-to-b from-white/30 to-white/5 dark:from-white/10 dark:to-transparent",
                "shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
                "backdrop-blur-2xl",
                className
            )}
            {...props}
        >
            {/* Inner Content Surface */}
            <div className="relative z-10 h-full w-full rounded-[31px] bg-white/40 dark:bg-black/40 p-6">
                {children}
            </div>

            {/* Dynamic Light Reflection (Mouse Follow) */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 40%)`
                    )
                }}
            />

            {/* Background Glow Orbital */}
            <div className={cn(
                "absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[80px] opacity-30 transition-all duration-1000 group-hover:opacity-50",
                selectedGlow.split(' ')[0]
            )} />
            <div className={cn(
                "absolute -left-20 -bottom-20 h-64 w-64 rounded-full blur-[80px] opacity-20 transition-all duration-1000 group-hover:opacity-40",
                selectedGlow.split(' ')[1]
            )} />
        </motion.div>
    );
};
