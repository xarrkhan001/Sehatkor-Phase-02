import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, ArrowRight, Clock, MapPin, Star, Shield, TestTube } from "lucide-react";

const BlogPost = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">
                        Lab Test Guide
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Best Lab Tests for Routine Health Checkup in Pakistan 2025
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Essential blood tests every Pakistani should consider. Complete guide with prices and how to book online.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Dec 29, 2025
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            6 min read
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            850 views
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Routine Health Checkups Matter</h2>
                        <p className="text-gray-700 mb-4">
                            Preventive healthcare is crucial in Pakistan where lifestyle diseases are rising. Regular blood tests
                            can detect issues early, saving both money and lives. Most Pakistanis above 30 should get comprehensive
                            checkups annually.
                        </p>
                        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg my-6">
                            <p className="text-green-900 font-medium">
                                <strong>Health Fact:</strong> Early detection through routine checkups reduces treatment costs by up to 70%
                                and improves survival rates significantly.
                            </p>
                        </div>
                    </section>

                    {/* Essential Tests */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Top 10 Essential Lab Tests for Pakistanis</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    name: "Complete Blood Count (CBC)",
                                    price: "Rs. 800-1,500",
                                    description: "Checks overall health, detects anemia, infection, and blood disorders.",
                                    why: "Most common test; essential baseline"
                                },
                                {
                                    name: "Lipid Profile",
                                    price: "Rs. 1,200-2,000",
                                    description: "Measures cholesterol and triglycerides for heart disease risk.",
                                    why: "Heart disease is #1 killer in Pakistan"
                                },
                                {
                                    name: "Fasting Blood Sugar",
                                    price: "Rs. 300-600",
                                    description: "Screens for diabetes and prediabetes.",
                                    why: "26% Pakistani adults are diabetic"
                                },
                                {
                                    name: "HbA1c",
                                    price: "Rs. 800-1,200",
                                    description: "3-month average blood sugar level.",
                                    why: "Better diabetes management"
                                },
                                {
                                    name: "Liver Function Tests (LFT)",
                                    price: "Rs. 1,000-1,800",
                                    description: "Checks liver health, crucial for hepatitis screening.",
                                    why: "High hepatitis prevalence in Pakistan"
                                },
                                {
                                    name: "Kidney Function Tests (KFT)",
                                    price: "Rs. 800-1,500",
                                    description: "Assesses kidney performance and detects early damage.",
                                    why: "Kidney disease common in diabetics"
                                },
                                {
                                    name: "Thyroid Panel (T3, T4, TSH)",
                                    price: "Rs. 1,200-2,000",
                                    description: "Detects thyroid disorders affecting metabolism.",
                                    why: "Thyroid issues often undiagnosed"
                                },
                                {
                                    name: "Vitamin D Test",
                                    price: "Rs. 1,500-2,500",
                                    description: "Checks vitamin D deficiency, common in Pakistan.",
                                    why: "80% Pakistanis are vitamin D deficient"
                                },
                                {
                                    name: "Vitamin B12",
                                    price: "Rs. 1,000-1,800",
                                    description: "Essential for nerve function and blood formation.",
                                    why: "Vegetarians especially at risk"
                                },
                                {
                                    name: "Uric Acid",
                                    price: "Rs. 400-800",
                                    description: "Screens for gout and kidney stone risk.",
                                    why: "Gout increasing due to diet changes"
                                }
                            ].map((test, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <TestTube className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.name}</h3>
                                            <p className="text-gray-700 mb-2">{test.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-green-600 font-semibold">{test.price}</span>
                                                <span className="text-sm text-gray-500">{test.why}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How to Book */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Book Lab Tests Online on Sehatkor</h2>

                        <div className="space-y-6">
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Lab Tests</h3>
                                    <p className="text-gray-700">
                                        Visit Sehatkor's lab section and search for specific tests or choose from health packages.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Compare Labs</h3>
                                    <p className="text-gray-700">
                                        Compare prices, locations, and sample collection options across verified laboratories.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Home Sample</h3>
                                    <p className="text-gray-700">
                                        Schedule home sample collection or visit the lab. Most labs offer free home collection for orders above Rs. 2,000.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Reports Online</h3>
                                    <p className="text-gray-700">
                                        Receive digital reports within 24-48 hours. Access them anytime through your Sehatkor dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Popular Packages */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Health Checkup Packages</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Package</h3>
                                <p className="text-2xl font-bold text-green-600 mb-2">Rs. 3,500</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>CBC</li>
                                    <li>Fasting Blood Sugar</li>
                                    <li>Lipid Profile</li>
                                    <li>LFT</li>
                                    <li>KFT</li>
                                </ul>
                            </div>
                            <div className="border-2 border-green-500 rounded-lg p-6 relative">
                                <Badge className="absolute -top-3 left-4 bg-green-600 text-white">Most Popular</Badge>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Package</h3>
                                <p className="text-2xl font-bold text-green-600 mb-2">Rs. 6,500</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>All Basic Tests</li>
                                    <li>HbA1c</li>
                                    <li>Thyroid Panel</li>
                                    <li>Vitamin D</li>
                                    <li>Vitamin B12</li>
                                    <li>Uric Acid</li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Executive Package</h3>
                                <p className="text-2xl font-bold text-green-600 mb-2">Rs. 12,000</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>All Comprehensive Tests</li>
                                    <li>Tumor Markers</li>
                                    <li>Hormone Panel</li>
                                    <li>Allergy Screening</li>
                                    <li>Doctor Consultation</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Preparation Tips */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Prepare for Your Tests</h2>
                        <div className="bg-blue-50 rounded-lg p-6">
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Fast for 10-12 hours before sugar and lipid tests</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Drink plenty of water (helps with blood draw)</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Avoid alcohol 24 hours before tests</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Inform about medications you're taking</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Wear loose clothing for easy blood draw</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
                        <h2 className="text-3xl font-bold mb-4">Book Your Health Checkup Today</h2>
                        <p className="text-xl mb-6">Get tested at verified labs across Pakistan. Home sample collection available.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                                <Link to="/register">Book Lab Test</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                                <Link to="/labs">View Labs</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
