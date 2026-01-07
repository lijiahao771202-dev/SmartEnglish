import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MapPin, User, Bot } from 'lucide-react';

interface GlassSceneCardProps {
    loc: string;
    role_ai: string;
    role_user: string;
}

export const GlassSceneCard: React.FC<GlassSceneCardProps> = ({
    loc,
    role_ai,
    role_user
}) => {
    return (
        <GlassCard className="w-full max-w-full md:max-w-md p-0 my-4 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 overflow-hidden">
            {/* Header / Location Banner */}
            <div className="relative px-6 py-4 bg-black/20 border-b border-white/10">
                <div className="flex items-center gap-2 text-indigo-300 font-bold tracking-wide uppercase text-xs">
                    <MapPin className="w-4 h-4" />
                    Current Scene
                </div>
                <h3 className="text-xl font-bold text-white mt-1 shadow-sm">
                    {loc}
                </h3>
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[40px] rounded-full pointer-events-none" />
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-2 divide-x divide-white/10">
                {/* AI Role */}
                <div className="p-4 flex flex-col items-center text-center bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2 border border-indigo-500/30">
                        <Bot className="w-5 h-5 text-indigo-300" />
                    </div>
                    <span className="text-xs text-indigo-200/60 uppercase font-bold tracking-wider mb-0.5">My Role</span>
                    <span className="text-sm font-medium text-white">{role_ai}</span>
                </div>

                {/* User Role */}
                <div className="p-4 flex flex-col items-center text-center bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 border border-emerald-500/30">
                        <User className="w-5 h-5 text-emerald-300" />
                    </div>
                    <span className="text-xs text-emerald-200/60 uppercase font-bold tracking-wider mb-0.5">Your Role</span>
                    <span className="text-sm font-medium text-white">{role_user}</span>
                </div>
            </div>

            {/* Footer Action Hint */}
            <div className="bg-black/40 px-4 py-2 text-xs text-center text-white/40 italic">
                (Start speaking to begin the roleplay)
            </div>
        </GlassCard>
    );
};
