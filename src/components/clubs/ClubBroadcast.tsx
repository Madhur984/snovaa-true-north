import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Radio, Send, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ClubBroadcast = () => {
    const { id } = useParams<{ id: string }>();
    const { profile } = useAuth();
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"announcement" | "alert" | "update">("announcement");
    const [sending, setSending] = useState(false);
    const [memberCount, setMemberCount] = useState(0);

    useState(() => {
        fetchMemberCount();
    });

    const fetchMemberCount = async () => {
        const { count } = await supabase
            .from("club_members")
            .select("*", { count: "exact", head: true })
            .eq("club_id", id);
        setMemberCount(count || 0);
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            toast({
                title: "Validation Error",
                description: "Title and message are required",
                variant: "destructive",
            });
            return;
        }

        setSending(true);
        const { data, error } = await supabase.rpc("broadcast_to_members", {
            p_club_id: id,
            p_title: title,
            p_message: message,
            p_type: type,
        });

        setSending(false);

        if (error) {
            toast({
                title: "Broadcast Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Broadcast Sent",
                description: `Message delivered to ${memberCount} members`,
            });
            setTitle("");
            setMessage("");
        }
    };

    const getTypeColor = (t: string) => {
        switch (t) {
            case "announcement":
                return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
            case "alert":
                return "bg-amber-500/10 border-amber-500/30 text-amber-400";
            case "update":
                return "bg-green-500/10 border-green-500/30 text-green-400";
            default:
                return "bg-white/5 border-white/10 text-white/60";
        }
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-display mb-2">BROADCAST SYSTEM</h1>
                <p className="text-white/50 font-mono text-sm">
                    &gt;&gt; ADMIN ONLY // MASS COMMUNICATION
                </p>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-display text-lg text-amber-400 mb-2">ADMIN PRIVILEGE</h3>
                    <p className="text-white/60 text-sm font-mono leading-relaxed">
                        Broadcast messages are sent to all club members. Use this feature
                        responsibly for important announcements, event updates, or urgent alerts
                        only.
                    </p>
                </div>
            </div>

            {/* Broadcast Form */}
            <form onSubmit={handleBroadcast} className="space-y-6">
                {/* Type Selector */}
                <div>
                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-3 font-mono">
                        Message Type
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {(["announcement", "alert", "update"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`p-4 rounded-lg border transition-all duration-300 ${type === t
                                        ? getTypeColor(t)
                                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                    }`}
                            >
                                <span className="text-sm font-mono uppercase tracking-wider">
                                    {t}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title Input */}
                <div>
                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-3 font-mono">
                        Broadcast Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="URGENT // SYSTEM UPDATE"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                        maxLength={100}
                    />
                    <p className="text-xs text-white/30 font-mono mt-2">
                        {title.length}/100 characters
                    </p>
                </div>

                {/* Message Textarea */}
                <div>
                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-3 font-mono">
                        Message Content
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message to all club members..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 font-mono focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                        maxLength={500}
                    />
                    <p className="text-xs text-white/30 font-mono mt-2">
                        {message.length}/500 characters
                    </p>
                </div>

                {/* Recipient Count */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Radio className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm font-mono text-white/60">
                                Broadcast Recipients
                            </span>
                        </div>
                        <span className="text-2xl font-display text-cyan-400">
                            {memberCount}
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={sending || !title.trim() || !message.trim()}
                    className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg px-6 py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <div className="flex items-center justify-center gap-3">
                        {sending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-mono uppercase tracking-wider text-amber-400">
                                    Transmitting...
                                </span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                                <span className="text-sm font-mono uppercase tracking-wider text-amber-400">
                                    Send Broadcast
                                </span>
                            </>
                        )}
                    </div>
                </button>
            </form>

            {/* Info Footer */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm font-mono text-white/60 leading-relaxed">
                        <p className="mb-2">
                            <strong className="text-white">Delivery Confirmation:</strong> All
                            broadcasts are logged and tracked for verification purposes.
                        </p>
                        <p>
                            Members will receive notifications through their preferred channels.
                            Broadcast history is maintained for audit purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubBroadcast;
