import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, X, Shield, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const steps = [
    { id: 1, title: "Identity", icon: Shield },
    { id: 2, title: "Vision", icon: Globe },
    { id: 3, title: "Verify", icon: Activity }
];

const CreateClub = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({ name: "", slug: "", description: "" });
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        setFormData({ ...formData, name, slug });

        // Simulate check
        if (name.length > 2) {
            setIsChecking(true);
            setTimeout(() => {
                setIsAvailable(slug !== "demo"); // Mock check
                setIsChecking(false);
            }, 800);
        } else {
            setIsAvailable(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_60%)] pointer-events-none" />
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div className="w-full max-w-2xl relative z-10">

                {/* Step Indicator */}
                <div className="flex justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
                    {steps.map((step) => (
                        <div key={step.id} className={`flex flex-col items-center gap-2 bg-black px-4 transition-colors duration-500 ${currentStep >= step.id ? "text-cyan-400" : "text-white/30"}`}>
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${currentStep >= step.id ? "border-cyan-400 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "border-white/10 bg-black"
                                }`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs uppercase tracking-widest">{step.title}</span>
                        </div>
                    ))}
                </div>

                {/* Wizard Content */}
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-display">Initialize Protocol</h2>
                                <p className="text-white/50">Establish your collective's unique digital signature.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-cyan-400">Designation (Name)</label>
                                    <div className="relative">
                                        <Input
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            className="bg-black/50 border-white/10 text-xl h-14 pl-4 focus:ring-cyan-500/50 transition-all font-display"
                                            placeholder="e.g. Quantum Pioneers"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {isChecking ? (
                                                <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
                                            ) : isAvailable === true ? (
                                                <Check className="w-5 h-5 text-green-400" />
                                            ) : isAvailable === false ? (
                                                <X className="w-5 h-5 text-red-400" />
                                            ) : null}
                                        </div>
                                    </div>
                                    {isAvailable !== null && (
                                        <p className={`text-xs font-mono font-bold ${isAvailable ? "text-green-500" : "text-red-500"}`}>
                                            {isAvailable ? `>> HASH AVAILABLE: ${formData.slug}` : ">> ERROR: DESIGNATION TAKEN"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!isAvailable}
                                    className="rounded-full px-8 bg-white text-black hover:bg-cyan-400 hover:text-black transition-all"
                                >
                                    Confirm Sequence <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-display">Mission Parameters</h2>
                                <p className="text-white/50">Define the core objective of your collective.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-cyan-400">Manifesto</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-black/50 border-white/10 min-h-[150px] resize-none focus:ring-cyan-500/50"
                                    placeholder="We exist to explore the boundaries of..."
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={() => setCurrentStep(1)} className="text-white/50 hover:text-white">
                                    Back
                                </Button>
                                <Button
                                    onClick={() => { console.log(formData); alert("Club Initialized!"); }}
                                    className="rounded-full px-8 bg-cyan-500 text-black hover:bg-cyan-400 transition-all font-bold tracking-wide"
                                >
                                    Launch Protocol
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default CreateClub;
