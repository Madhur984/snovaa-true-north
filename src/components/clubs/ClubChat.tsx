import { useState, useEffect, useRef } from "react";
import { Send, Lock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

// Mock data for development
const mockMessages = [
    { id: 1, user: "Alice", content: "Did you catch that constellation event?", time: "10:42 AM", isMe: false },
    { id: 2, user: "Bob", content: "Yeah, the visual effects were insane!", time: "10:44 AM", isMe: false },
    { id: 3, user: "Me", content: "I'm planning the next meetup for Friday.", time: "10:45 AM", isMe: true },
];

const ClubChat = () => {
    const [isLocked, setIsLocked] = useState(true); // Default to locked for demo
    const [attendanceCount, setAttendanceCount] = useState(1);
    const [messages, setMessages] = useState(mockMessages);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setMessages([...messages, {
            id: Date.now(),
            user: "Me",
            content: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        }]);
        setNewMessage("");
    };

    // Check for valid attendance on mount
    useEffect(() => {
        const checkAccess = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user's profile id first since participations links to profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                // Count verified attendances
                // Note: We need to filter by status='attended' but for now we count all participations
                // until the status column is fully standardized. 
                // Using head: true, count: 'exact' to get just the count.
                const { count } = await supabase
                    .from('participation_ledger')
                    .select('*', { count: 'exact', head: true })
                    .eq('participant_id', profile.id)
                // .eq('status', 'attended') // TODO: Uncomment when ready

                if (count !== null) {
                    setAttendanceCount(count);
                    setIsLocked(count < 3);
                }
            }
        };

        checkAccess();
    }, []);

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col relative overflow-hidden bg-black/50 rounded-2xl border border-white/10 m-4">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h2 className="font-display tracking-wide text-lg">SECURE CHANNEL</h2>
                </div>

            </div>

            {/* Locked Overlay */}
            <AnimatePresence>
                {isLocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
                    >
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                            <Lock className="w-10 h-10 text-white/50" />
                        </div>

                        <h3 className="text-3xl font-display mb-2">ACCESS RESTRICTED</h3>
                        <p className="text-white/60 font-mono mb-8 max-w-md">
                            Secure communication channels are reserved for active personnel.
                            Complete field missions to unlock.
                        </p>

                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-xs font-mono text-cyan-400">
                                <span>PROGRESS</span>
                                <span>{attendanceCount}/3 EVENTS</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(attendanceCount / 3) * 100}%` }}
                                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isMe
                            ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-50 rounded-br-none"
                            : "bg-white/5 border border-white/10 text-white/80 rounded-bl-none"
                            }`}>
                            {!msg.isMe && <p className="text-xs text-white/40 mb-1 font-mono">{msg.user}</p>}
                            <p className="leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] mt-2 font-mono text-right ${msg.isMe ? "text-cyan-500/50" : "text-white/20"}`}>
                                {msg.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Transmit secure message..."
                        className="bg-white/5 border-white/10 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono"
                        disabled={isLocked}
                    />
                    <Button type="submit" disabled={isLocked || !newMessage.trim()} className="bg-cyan-500 text-black hover:bg-cyan-400">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ClubChat;
