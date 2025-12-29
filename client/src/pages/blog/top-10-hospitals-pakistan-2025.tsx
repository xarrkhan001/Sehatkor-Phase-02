import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, ArrowRight, Clock, MapPin, Star, Shield, Building } from "lucide-react";

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
            <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
                        Hospital Guide
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Top 10 Best Hospitals in Lahore, Karachi, Islamabad 2025
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Complete guide to Pakistan's top hospitals with specialties, facilities, and how to book appointments through Sehatkor.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Dec 29, 2025
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            8 min read
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            2.1k views
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Ranked These Hospitals</h2>
                        <p className="text-gray-700 mb-4">
                            Our ranking is based on patient reviews, medical expertise, technology adoption, success rates,
                            and accessibility across Pakistan's major cities. All hospitals listed are verified on Sehatkor
                            with real-time appointment booking.
                        </p>
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg my-6">
                            <p className="text-purple-900 font-medium">
                                <strong>Methodology:</strong> Analysis of 50+ hospitals across 15 parameters including patient satisfaction,
                                doctor qualifications, infrastructure, and emergency response time.
                            </p>
                        </div>
                    </section>

                    {/* Hospitals List */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Top 10 Hospitals in Pakistan 2025</h2>

                        <div className="space-y-8">
                            {[
                                {
                                    rank: 1,
                                    name: "Aga Khan University Hospital, Karachi",
                                    city: "Karachi",
                                    specialties: ["Cardiology", "Oncology", "Neurology", "Transplant"],
                                    rating: 4.8,
                                    beds: "700+",
                                    emergency: "24/7",
                                    price: "Premium",
                                    highlight: "Internationally accredited, best for complex surgeries"
                                },
                                {
                                    rank: 2,
                                    name: "Shaukat Khanum Memorial Cancer Hospital, Lahore",
                                    city: "Lahore",
                                    specialties: ["Cancer Treatment", "Radiology", "Surgery"],
                                    rating: 4.9,
                                    beds: "500+",
                                    emergency: "24/7",
                                    price: "Mid-Range",
                                    highlight: "Pakistan's leading cancer hospital with free treatment for 75% patients"
                                },
                                {
                                    rank: 3,
                                    name: "Shifa International Hospital, Islamabad",
                                    city: "Islamabad",
                                    specialties: ["Cardiology", "Orthopedics", "Pediatrics"],
                                    rating: 4.7,
                                    beds: "600+",
                                    emergency: "24/7",
                                    price: "Premium",
                                    highlight: "Best hospital in Islamabad with international standards"
                                },
                                {
                                    rank: 4,
                                    name: "Lahore General Hospital, Lahore",
                                    city: "Lahore",
                                    specialties: ["General Medicine", "Surgery", "Maternity"],
                                    rating: 4.5,
                                    beds: "1000+",
                                    emergency: "24/7",
                                    price: "Affordable",
                                    highlight: "Largest government hospital with quality care"
                                },
                                {
                                    rank: 5,
                                    name: "Indus Hospital, Karachi",
                                    city: "Karachi",
                                    specialties: ["Cardiology", "Nephrology", "General Surgery"],
                                    rating: 4.6,
                                    beds: "400+",
                                    emergency: "24/7",
                                    price: "Affordable",
                                    highlight: "Free healthcare for underprivileged patients"
                                },
                                {
                                    rank: 6,
                                    name: "Pakistan Institute of Medical Sciences (PIMS), Islamabad",
                                    city: "Islamabad",
                                    specialties: ["All Specialties", "Emergency Care", "Research"],
                                    rating: 4.4,
                                    beds: "1200+",
                                    emergency: "24/7",
                                    price: "Affordable",
                                    highlight: "Largest hospital in Islamabad with comprehensive care"
                                },
                                {
                                    rank: 7,
                                    name: "Civil Hospital, Karachi",
                                    city: "Karachi",
                                    specialties: ["Emergency", "Trauma", "Infectious Diseases"],
                                    rating: 4.3,
                                    beds: "1500+",
                                    emergency: "24/7",
                                    price: "Affordable",
                                    highlight: "Oldest hospital with excellent emergency services"
                                },
                                {
                                    rank: 8,
                                    name: "Doctors Hospital, Lahore",
                                    city: "Lahore",
                                    specialties: ["Cardiology", "Orthopedics", "IVF"],
                                    rating: 4.6,
                                    beds: "300+",
                                    emergency: "24/7",
                                    price: "Mid-Range",
                                    highlight: "Best private hospital for specialized treatments"
                                },
                                {
                                    rank: 9,
                                    name: "National Hospital, Lahore",
                                    city: "Lahore",
                                    specialties: ["Cardiology", "Neurology", "Gastroenterology"],
                                    rating: 4.5,
                                    beds: "250+",
                                    emergency: "24/7",
                                    price: "Mid-Range",
                                    highlight: "Advanced cardiac care center"
                                },
                                {
                                    rank: 10,
                                    name: "Kashmir Hospital, Rawalpindi",
                                    city: "Rawalpindi",
                                    specialties: ["General Medicine", "Surgery", "Maternity"],
                                    rating: 4.4,
                                    beds: "200+",
                                    emergency: "24/7",
                                    price: "Affordable",
                                    highlight: "Trusted healthcare in twin cities"
                                }
                            ].map((hospital, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                <span className="text-2xl font-bold text-purple-600">#{hospital.rank}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{hospital.name}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {hospital.city}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-500" />
                                                            {hospital.rating}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Building className="w-4 h-4" />
                                                            {hospital.beds} beds
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className={
                                                    hospital.price === "Premium" ? "bg-purple-100 text-purple-700" :
                                                        hospital.price === "Mid-Range" ? "bg-blue-100 text-blue-700" :
                                                            "bg-green-100 text-green-700"
                                                }>
                                                    {hospital.price}
                                                </Badge>
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">Key Specialties:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {hospital.specialties.map((spec, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {spec}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                                <p className="text-sm text-gray-700">
                                                    <strong>Why Choose:</strong> {hospital.highlight}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Shield className="w-4 h-4 text-green-500" />
                                                        Emergency: {hospital.emergency}
                                                    </div>
                                                </div>
                                                <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                                                    <Link to="/search">Book Appointment</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* City-wise Breakdown */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Hospitals by City</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Karachi</h3>
                                <ol className="space-y-2">
                                    <li className="flex justify-between">
                                        <span>1. Aga Khan University Hospital</span>
                                        <span className="text-purple-600 font-semibold">4.8★</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>2. Indus Hospital</span>
                                        <span className="text-purple-600 font-semibold">4.6★</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>3. Civil Hospital</span>
                                        <span className="text-purple-600 font-semibold">4.3★</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lahore</h3>
                                <ol className="space-y-2">
                                    <li className="flex justify-between">
                                        <span>1. Shaukat Khanum Hospital</span>
                                        <span className="text-purple-600 font-semibold">4.9★</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>2. Lahore General Hospital</span>
                                        <span className="text-purple-600 font-semibold">4.5★</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>3. Doctors Hospital</span>
                                        <span className="text-purple-600 font-semibold">4.6★</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Islamabad</h3>
                                <ol className="space-y-2">
                                    <li className="flex justify-between">
                                        <span>1. Shifa International Hospital</span>
                                        <span className="text-purple-600 font-semibold">4.7★</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>2. PIMS</span>
                                        <span className="text-purple-600 font-semibold">4.4★</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>3. Pakistan Institute of Medical Sciences</span>
                                        <span className="text-purple-600 font-semibold">4.4★</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* How to Book */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Book Hospital Appointments on Sehatkor</h2>
                        <div className="bg-blue-50 rounded-lg p-6">
                            <ol className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Search Hospitals</h4>
                                        <p className="text-gray-700">Filter by city, specialty, or hospital name</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Compare Options</h4>
                                        <p className="text-gray-700">Check ratings, fees, and doctor availability</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Book Instantly</h4>
                                        <p className="text-gray-700">Select time slot and confirm appointment</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Get Confirmation</h4>
                                        <p className="text-gray-700">Receive SMS/email with appointment details</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center">
                        <h2 className="text-3xl font-bold mb-4">Find the Best Hospital Near You</h2>
                        <p className="text-xl mb-6">Book appointments at top hospitals across Pakistan. No more waiting in queues.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                                <Link to="/register">Book Hospital Visit</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                                <Link to="/hospitals">Browse Hospitals</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
