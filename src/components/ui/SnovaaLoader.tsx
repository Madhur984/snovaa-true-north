import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const SnovaaLoader = ({ onComplete }: { onComplete?: () => void }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Slow, cinematic reveal (Sileent style)
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 3500); // 3.5s calm introduction

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <div className="relative flex flex-col items-center">
                        {/* Logo Pulse */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: [0, 1, 0.8, 1],
                                scale: [0.8, 1, 0.98, 1],
                                filter: ["brightness(0.5)", "brightness(1)"]
                            }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="relative z-10"
                        >
                            <img
                                src="/snovaa-logo.png"
                                alt="Snovaa"
                                className="w-32 h-auto md:w-48 invert dark:invert-0 drop-shadow-2xl"
                            /* Note: Invert logic assumes logo color needs flipping for BW theme. 
                               If logo is black text on transp, invert makes it white on black bg. */
                            />
                        </motion.div>

                        {/* Loading Bar / Shine */}
                        <motion.div
                            className="mt-8 h-1 w-32 bg-border overflow-hidden rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <motion.div
                                className="h-full bg-foreground"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
