import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, Users, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const IslamabadPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
            <Helmet>
                <title>Best Doctors in Islamabad | اسلام آباد میں ڈاکٹر | Book Doctor Appointment</title>
                <meta name="description" content="Find and book top-rated doctors in Islamabad. 600+ PMDC verified doctors in F-6, F-7, F-8. اسلام آباد میں بہترین ڈاکٹر۔ Online appointments, 24/7 support." />
                <meta name="keywords" content="doctor in Islamabad, best doctor Islamabad, Islamabad doctor appointment, F-6 doctor, F-7 hospital, اسلام آباد ڈاکٹر, آنلائن ڈاکٹر اسلام آباد, lady doctor Islamabad, child specialist Islamabad, Shifa International, PIMS hospital" />
                <link rel="canonical" href="https://sehatkor.pk/islamabad" />
                <meta property="og:title" content="Best Doctors in Islamabad | Book Online" />
                <meta property="og:description" content="600+ verified doctors in Islamabad. Book appointments in F-6, F-7, F-8. 24/7 support." />
                <meta property="og:url" content="https://sehatkor.pk/islamabad" />
            </Helmet>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <MapPin className="w-8 h-8" />
                            <h1 className="text-4xl lg:text-5xl font-bold">Doctor Appointments in Islamabad</h1>
                        </div>
                        <p className="text-xl mb-8 opacity-90">
                            Book verified doctors, hospitals, labs, and pharmacies in Islamabad. 24/7 service available.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">600+ Doctors</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">30+ Hospitals</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">20+ Labs</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">24/7 Support</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 py-16">
                {/* Services Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Healthcare Services in Islamabad</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Doctor Consultation",
                                desc: "Online and in-person appointments with specialists",
                                icon: Users,
                                areas: ["F-6", "F-7", "F-8", "F-10", "F-11"]
                            },
                            {
                                title: "Hospital Booking",
                                desc: "Admissions, surgeries, and emergency care",
                                icon: ShieldCheck,
                                areas: ["Pakistan Institute", "Shifa International", "Komal Hospital", "Maroof Hospital"]
                            },
                            {
                                title: "Lab Tests",
                                desc: "Home sample collection and diagnostic tests",
                                icon: Star,
                                areas: ["Blood Tests", "MRI", "CT Scan", "X-Ray"]
                            },
                            {
                                title: "Pharmacy Delivery",
                                desc: "Order medicines with home delivery",
                                icon: Phone,
                                areas: ["Prescription", "OTC", "Medical Supplies", "Health Products"]
                            }
                        ].map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{service.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {service.areas.map((area, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Popular Areas */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Areas in Islamabad</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            "F-6 Markaz", "F-7", "F-8", "F-10",
                            "F-11", "G-10", "I-8", "E-11"
                        ].map((area, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:border-purple-300 transition-colors">
                                <MapPin className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                                <span className="text-gray-900 font-medium">{area}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Book Your Doctor Appointment in Islamabad</h2>
                    <p className="text-lg mb-6 opacity-90">
                        Join thousands of Islamabad residents who trust SehatKor for their healthcare needs
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/search?location=islamabad"
                            className="bg-white text-purple-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold"
                        >
                            Search Doctors in Islamabad
                        </Link>
                        <Link
                            to="/register"
                            className="border border-white text-white hover:bg-white hover:text-purple-600 px-6 py-3 rounded-lg font-semibold"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default IslamabadPage;
