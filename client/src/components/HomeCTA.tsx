import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, Heart, Compass } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";

const HomeCTA = () => {
    const { isAuthenticated } = useAuth();
    return (
        <section className="py-20 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        Ready to Take Control of Your <span className="text-emerald-600">Health?</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of users who trust SehatKor for their healthcare needs
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 text-white min-w-[180px] h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        >
                            {isAuthenticated ? (
                                <Link to="/about">
                                    <Compass className="mr-2 h-5 w-5" />
                                    Explore
                                </Link>
                            ) : (
                                <Link to="/register">
                                    <UserPlus className="mr-2 h-5 w-5" />
                                    Get Started
                                </Link>
                            )}
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="bg-gray-100 hover:bg-white border-2 border-gray-200 text-gray-700 min-w-[180px] h-14 text-lg hover:shadow-lg transition-all duration-300 rounded-xl"
                        >
                            <Link to="/search">
                                <Heart className="mr-2 h-5 w-5" />
                                Find Services
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HomeCTA;
