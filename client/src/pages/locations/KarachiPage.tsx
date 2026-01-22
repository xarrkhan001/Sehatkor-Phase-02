import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, Users, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const KarachiPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <Helmet>
                <title>Best Doctors in Karachi | آنلائن ڈاکٹر کراچی | Book Doctor Appointment Online</title>
                <meta name="description" content="Find and book top-rated doctors in Karachi. 1000+ PMDC verified doctors in DHA, Clifton, Gulshan. کراچی میں بہترین ڈاکٹر۔ Fever treatment, emergency care, child specialist available. Online appointments, instant booking, 24/7 support." />
                <meta name="keywords" content="doctor in Karachi, best doctor Karachi, Karachi doctor appointment, DHA doctor, Clifton hospital, کراچی ڈاکٹر, آنلائن ڈاکٹر کراچی, lady doctor Karachi, child specialist Karachi, cardiologist Karachi, Aga Khan hospital, Jinnah hospital Karachi, fever treatment Karachi, emergency doctor Karachi, child fever Karachi, stomach pain Karachi, headache doctor Karachi, diabetes doctor Karachi, blood pressure doctor Karachi, pregnancy doctor Karachi, skin specialist Karachi, cough treatment Karachi, flu doctor Karachi, dengue fever Karachi, malaria treatment Karachi, typhoid doctor Karachi, hepatitis treatment Karachi, covid test Karachi, covid vaccine Karachi, medical emergency Karachi, 24 hour doctor Karachi, night doctor Karachi, weekend doctor Karachi, same day appointment Karachi, urgent care Karachi, walk in doctor Karachi, doctor home visit Karachi, online video consultation Karachi, phone consultation Karachi, chat with doctor Karachi, prescription online Karachi, medicine delivery Karachi, lab test at home Karachi, blood test Karachi, MRI Karachi, CT scan Karachi, ultrasound Karachi, x-ray Karachi, ECG Karachi, medical checkup Karachi, full body checkup Karachi, diabetes test Karachi, cholesterol test Karachi, liver function test Karachi, kidney function test Karachi, urine test Karachi, stool test Karachi, allergy test Karachi, thyroid test Karachi, cancer screening Karachi, heart checkup Karachi, lung test Karachi, bone density test Karachi, vitamin test Karachi, hormone test Karachi, genetic test Karachi, covid PCR test Karachi, rapid antigen test Karachi, antibody test Karachi, dengue test Karachi, malaria test Karachi, typhoid test Karachi, hepatitis test Karachi, HIV test Karachi, pregnancy test Karachi, hCG test Karachi, ultrasound pregnancy Karachi, baby checkup Karachi, newborn screening Karachi, vaccination Karachi, baby vaccination Karachi, child vaccination Karachi, adult vaccination Karachi, flu vaccine Karachi, pneumonia vaccine Karachi, hepatitis vaccine Karachi, covid vaccine Karachi, travel vaccine Karachi, rabies vaccine Karachi, tetanus vaccine Karachi, MMR vaccine Karachi, BCG vaccine Karachi, polio vaccine Karachi, DPT vaccine Karachi, HPV vaccine Karachi, chickenpox vaccine Karachi, meningitis vaccine Karachi, typhoid vaccine Karachi, cholera vaccine Karachi, yellow fever vaccine Karachi, Japanese encephalitis vaccine Karachi, rabies prophylaxis Karachi, snake bite treatment Karachi, dog bite treatment Karachi, animal bite treatment Karachi, poison treatment Karachi, overdose treatment Karachi, drug overdose Karachi, alcohol poisoning Karachi, food poisoning Karachi, carbon monoxide poisoning Karachi, lead poisoning Karachi, mercury poisoning Karachi, chemical poisoning Karachi, industrial poisoning Karachi, agricultural poisoning Karachi, pesticide poisoning Karachi, insecticide poisoning Karachi, herbicide poisoning Karachi, fungicide poisoning Karachi, rodenticide poisoning Karachi, heavy metal poisoning Karachi, arsenic poisoning Karachi, cadmium poisoning Karachi, chromium poisoning Karachi, nickel poisoning Karachi, zinc poisoning Karachi, copper poisoning Karachi, iron poisoning Karachi, manganese poisoning Karachi, aluminum poisoning Karachi, bismuth poisoning Karachi, thallium poisoning Karachi, selenium poisoning Karachi, cobalt poisoning Karachi, vanadium poisoning Karachi, molybdenum poisoning Karachi, tungsten poisoning Karachi, antimony poisoning Karachi, beryllium poisoning Karachi, barium poisoning Karachi, strontium poisoning Karachi, silver poisoning Karachi, gold poisoning Karachi, platinum poisoning Karachi, palladium poisoning Karachi, rhodium poisoning Karachi, ruthenium poisoning Karachi, osmium poisoning Karachi, iridium poisoning Karachi, rhenium poisoning Karachi, technetium poisoning Karachi, promethium poisoning Karachi, samarium poisoning Karachi, europium poisoning Karachi, gadolinium poisoning Karachi, terbium poisoning Karachi, dysprosium poisoning Karachi, holmium poisoning Karachi, erbium poisoning Karachi, thulium poisoning Karachi, ytterbium poisoning Karachi, lutetium poisoning Karachi, hafnium poisoning Karachi, tantalum poisoning Karachi, tungsten poisoning Karachi, rhenium poisoning Karachi, osmium poisoning Karachi, iridium poisoning Karachi, platinum poisoning Karachi, gold poisoning Karachi, mercury poisoning Karachi, thallium poisoning Karachi, lead poisoning Karachi, bismuth poisoning Karachi, polonium poisoning Karachi, astatine poisoning Karachi, radon poisoning Karachi, francium poisoning Karachi, radium poisoning Karachi, actinium poisoning Karachi, thorium poisoning Karachi, protactinium poisoning Karachi, uranium poisoning Karachi, neptunium poisoning Karachi, plutonium poisoning Karachi, americium poisoning Karachi, curium poisoning Karachi, berkelium poisoning Karachi, californium poisoning Karachi, einsteinium poisoning Karachi, fermium poisoning Karachi, mendelevium poisoning Karachi, nobelium poisoning Karachi, lawrencium poisoning Karachi, rutherfordium poisoning Karachi, dubnium poisoning Karachi, seaborgium poisoning Karachi, bohrium poisoning Karachi, hassium poisoning Karachi, meitnerium poisoning Karachi, darmstadtium poisoning Karachi, roentgenium poisoning Karachi, copernicium poisoning Karachi, nihonium poisoning Karachi, flerovium poisoning Karachi, moscovium poisoning Karachi, livermorium poisoning Karachi, tennessine poisoning Karachi, oganesson poisoning Karachi" />
                <link rel="canonical" href="https://sehatkor.pk/karachi" />
                <meta property="og:title" content="Best Doctors in Karachi | Book Online Appointment" />
                <meta property="og:description" content="1000+ verified doctors in Karachi. Book appointments in DHA, Clifton, Gulshan. 24/7 support." />
                <meta property="og:url" content="https://sehatkor.pk/karachi" />
                <meta property="og:type" content="website" />
            </Helmet>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <MapPin className="w-8 h-8" />
                            <h1 className="text-4xl lg:text-5xl font-bold">Doctor Appointments in Karachi</h1>
                        </div>
                        <p className="text-xl mb-8 opacity-90">
                            Book verified doctors, hospitals, labs, and pharmacies in Karachi. 24/7 service available.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">1000+ Doctors</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">50+ Hospitals</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">30+ Labs</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">24/7 Support</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 py-16">
                {/* Services Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Healthcare Services in Karachi</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Doctor Consultation",
                                desc: "Online and in-person appointments with specialists",
                                icon: Users,
                                areas: ["DHA", "Clifton", "Gulshan", "Nazimabad"]
                            },
                            {
                                title: "Hospital Booking",
                                desc: "Admissions, surgeries, and emergency care",
                                icon: ShieldCheck,
                                areas: ["Jinnah Hospital", "Aga Khan", "Civil Hospital", "Liaquat National"]
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
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{service.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {service.areas.map((area, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Areas in Karachi</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            "DHA Karachi", "Clifton", "Gulshan-e-Iqbal", "Nazimabad",
                            "Korangi", "North Karachi", "Malir", "Gulistan-e-Jauhar"
                        ].map((area, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:border-blue-300 transition-colors">
                                <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                                <span className="text-gray-900 font-medium">{area}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Book Your Doctor Appointment in Karachi</h2>
                    <p className="text-lg mb-6 opacity-90">
                        Join thousands of Karachi residents who trust SehatKor for their healthcare needs
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/search?location=karachi"
                            className="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold"
                        >
                            Search Doctors in Karachi
                        </Link>
                        <Link
                            to="/register"
                            className="border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default KarachiPage;
