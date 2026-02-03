import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Activity, Apple, Scale, Dumbbell } from "lucide-react";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const WeightLossPage = () => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                title="Weight Loss Guide - Sehatkor"
                description="Your complete guide to healthy weight loss. Find nutritionists, diet plans, and fitness experts on Sehatkor."
                keywords="weight loss, diet plan, nutritionist, fitness, healthy living, lose weight pakistan"
            />

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-emerald-900">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/80 to-transparent" />

                <div className="container relative mx-auto px-4 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Start Your <span className="text-emerald-400">Weight Loss</span> Journey
                        </h1>
                        <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                            Achieve your ideal weight with expert guidance, personalized diet plans, and professional support.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold h-12 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                            <Link to="/search">
                                <Search className="w-5 h-5 mr-2" />
                                Find Weight Loss Experts
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Key Pillars Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">The Pillars of Healthy Weight Loss</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Sustainable weight loss isn't just about eating less. It's about a balanced approach to your lifestyle.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
                                <Apple className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Balanced Nutrition</h3>
                            <p className="text-gray-600">
                                Focus on whole foods, plenty of vegetables, and lean proteins. It's not about starving, it's about nourishing your body right.
                            </p>
                        </div>

                        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                <Activity className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Active Lifestyle</h3>
                            <p className="text-gray-600">
                                Regular physical activity is key. Find exercises you enjoy, whether it's walking, swimming, or gym workouts.
                            </p>
                        </div>

                        <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                                <Scale className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Consistent Habits</h3>
                            <p className="text-gray-600">
                                Small, consistent changes lead to big results over time. Build healthy habits that you can maintain for life.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tips Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
                        <div className="w-full md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800"
                                alt="Healthy Lifestyle"
                                className="rounded-2xl shadow-xl w-full object-cover h-[400px]"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Expert Tips for Success</h2>
                            <ul className="space-y-4">
                                {[
                                    "Drink plenty of water before meals to reduce appetite.",
                                    "Get enough sleep; lack of sleep can disrupt hunger hormones.",
                                    "Avoid sugary drinks and processed foods.",
                                    "Eat more protein to boost metabolism and reduce cravings.",
                                    "Consult a nutritionist for a personalized plan."
                                ].map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 min-w-[20px]">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">
                                                {idx + 1}
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{tip}</p>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-6">
                                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                                    <Link to="/search?q=Nutritionist">
                                        Find a Nutritionist Near You
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-emerald-700 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Life?</h2>
                    <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                        Don't wait for "someday". Start your healthy journey today with Sehatkor's network of health professionals.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button asChild size="lg" variant="secondary" className="font-bold">
                            <Link to="/search">
                                Browse All Services
                            </Link>
                        </Button>
                        {isAuthenticated ? (
                            <Button asChild size="lg" className="bg-emerald-900 text-white hover:bg-emerald-950 border border-emerald-800">
                                <Link to="/dashboard">
                                    Go to Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild size="lg" className="bg-emerald-900 text-white hover:bg-emerald-950 border border-emerald-800">
                                <Link to="/register">
                                    Join Sehatkor Today
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WeightLossPage;
