import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, ArrowRight, Clock, MapPin, Star, Shield } from "lucide-react";

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
            <SEO
                title="How to Book Doctor Appointments Online in Pakistan (2025 Guide)"
                description="Complete guide on how to book verified doctors online in Pakistan using Sehatkor. Save time and find specialists in Karachi, Lahore, Islamabad."
                keywords="book doctor online pakistan, online doctor appointment, sehatkor guide, digital healthcare pakistan, find doctor online"
                canonical="https://sehatkor.pk/blog/how-to-book-doctor-online-pakistan"
                type="article"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "How to Book Doctor Appointments Online in Pakistan: Complete 2025 Guide",
                    "datePublished": "2025-12-29",
                    "author": {
                        "@type": "Organization",
                        "name": "Sehatkor Team"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Sehatkor",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://sehatkor.pk/logo.png"
                        }
                    }
                }}
            />
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
                        Health Guide
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        How to Book Doctor Appointments Online in Pakistan: Complete 2025 Guide
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Save time, avoid queues, and consult verified doctors from home. Step-by-step process for Sehatkor users.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Dec 29, 2025
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            5 min read
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            1.2k views
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Online Doctor Booking is Growing in Pakistan</h2>
                        <p className="text-gray-700 mb-4">
                            Pakistan's healthcare landscape is rapidly digitizing. With over 50% urban internet penetration and busy lifestyles,
                            patients now prefer booking doctor appointments online instead of waiting in long queues. Platforms like Sehatkor
                            make this process seamless, secure, and affordable.
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg my-6">
                            <p className="text-blue-900 font-medium">
                                <strong>Quick Stat:</strong> Online doctor bookings in Pakistan increased by 180% in 2024, with average wait times
                                reduced from 2.5 hours to under 15 minutes.
                            </p>
                        </div>
                    </section>

                    {/* Step-by-Step Guide */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Step-by-Step: Book Your First Doctor Online</h2>

                        <div className="space-y-8">
                            {/* Step 1 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Register or Login to Sehatkor</h3>
                                    <p className="text-gray-700 mb-3">
                                        Visit <a href="https://sehatkor.pk" className="text-blue-600 underline">sehatkor.pk</a> and create your free account.
                                        Use your email or Google sign-in for instant access.
                                    </p>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            <strong>Pro Tip:</strong> Complete your profile with accurate contact details for faster appointment confirmations.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Search for Your Doctor</h3>
                                    <p className="text-gray-700 mb-3">
                                        Use the smart search bar to find doctors by specialty, name, hospital, or location.
                                        Filter by availability, fees, and ratings.
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        <li>Specialty: Cardiologist, Dermatologist, Pediatrician, etc.</li>
                                        <li>Location: Karachi, Lahore, Islamabad, or your city</li>
                                        <li>Availability: Today, tomorrow, or specific date</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Compare and Choose</h3>
                                    <p className="text-gray-700 mb-3">
                                        Review doctor profiles, patient ratings, experience, consultation fees, and clinic addresses.
                                        Sehatkor's comparison tool helps you make informed decisions.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            Verified Reviews
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            Verified Doctors
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            Location-Based
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Appointment</h3>
                                    <p className="text-gray-700 mb-3">
                                        Select your preferred time slot and choose between online video consultation or in-person visit.
                                        Pay securely online or choose cash on arrival.
                                    </p>
                                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                                        <p className="text-green-900 font-medium">
                                            <strong>Instant Confirmation:</strong> Receive appointment details via SMS and email immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    5
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Attend Consultation</h3>
                                    <p className="text-gray-700 mb-3">
                                        Join video call 10 minutes early or visit the clinic at your scheduled time.
                                        Your medical records are securely stored for future reference.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Benefits */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Using Sehatkor</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
                                    <p className="text-gray-700">No more waiting rooms. Book in under 2 minutes.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Verified Doctors</h3>
                                    <p className="text-gray-700">All doctors are verified and credentialed.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
                                    <p className="text-gray-700">Know consultation fees before booking.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                                    <p className="text-gray-700">Get help anytime via chat or phone.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div className="border-l-4 border-blue-500 pl-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is online doctor consultation effective?</h3>
                                <p className="text-gray-700">
                                    Yes, for non-emergency conditions like follow-ups, prescriptions, and initial consultations.
                                    Emergency cases should visit hospitals immediately.
                                </p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I pay for the consultation?</h3>
                                <p className="text-gray-700">
                                    Multiple payment options: credit/debit cards, mobile wallets, EasyPaisa, JazzCash, or cash at clinic.
                                </p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel or reschedule?</h3>
                                <p className="text-gray-700">
                                    Yes, free cancellation up to 2 hours before appointment. Reschedule anytime through your dashboard.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Book Your First Doctor?</h2>
                        <p className="text-xl mb-6">Join 50,000+ Pakistanis who trust Sehatkor for their healthcare needs.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                <Link to="/register">Register Free</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                <Link to="/search">Search Doctors</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
