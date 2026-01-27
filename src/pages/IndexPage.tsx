
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { HeroScene } from "@/components/layout/HeroScene";
import { Check, ShieldCheck, Users } from "lucide-react";

export const IndexPage = () => {
    return (
        <div className="min-h-screen bg-transparent">
            {/* Global Nav is handled by Layout wrapper in AnimatedRoutes if needed, 
                BUT since we want the Hero to be full-screen-ish, check if Layout adds padding. 
                Yes, Layout adds pt-20. This is good for nav.
            */}

            <HeroScene />

            {/* Principles Grid */}
            <div className="container max-w-6xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-3 gap-12">
                    <PrincipleBlock
                        icon={<Check className="w-6 h-6 text-emerald-600" />}
                        title="Verified Presence"
                        desc="Attendance is checked via NFC or Geo-fencing. No estimates, no 'Interested' buttons."
                    />
                    <PrincipleBlock
                        icon={<ShieldCheck className="w-6 h-6 text-indigo-600" />}
                        title="Immutable Records"
                        desc="Participation history is permanently recorded on the ledger. Build a track record that matters."
                    />
                    <PrincipleBlock
                        icon={<Users className="w-6 h-6 text-gray-900" />}
                        title="Real Groups"
                        desc="Clubs are ranked by their activity, not their follower count. Join people who actually show up."
                    />
                </div>
            </div>

            {/* Live Activity Placeholder */}
            <div className="bg-gray-50 py-24 border-t border-gray-100">
                <div className="container max-w-4xl mx-auto text-center">
                    <h2 className="font-serif text-3xl mb-4">Happening Now</h2>
                    <p className="text-muted-foreground mb-8">Privacy-safe view of live events in your city.</p>
                    <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                        [Map Layer Placeholder]
                    </div>
                </div>
            </div>
        </div>
    );
};

const PrincipleBlock = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
    >
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
            {icon}
        </div>
        <h3 className="font-serif text-xl">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm">
            {desc}
        </p>
    </motion.div>
);
