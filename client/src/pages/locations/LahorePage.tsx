import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, Users, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const LahorePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
            <Helmet>
                <title>Best Doctors in Lahore | لاہور میں ڈاکٹر | Book Doctor Appointment Online</title>
                <meta name="description" content="Find and book top-rated doctors in Lahore. 800+ PMDC verified doctors in Gulberg, DHA, Model Town. لاہور میں بہترین ڈاکٹر۔ Fever treatment, emergency care, child specialist available. Online appointments, instant booking, 24/7 support." />
                <meta name="keywords" content="doctor in Lahore, best doctor Lahore, Lahore doctor appointment, Gulberg doctor, DHA Lahore, لاہور ڈاکٹر, آنلائن ڈاکٹر لاہور, lady doctor Lahore, child specialist Lahore, cardiologist Lahore, Shaukat Khanum, Mayo Hospital Lahore, fever treatment Lahore, emergency doctor Lahore, child fever Lahore, stomach pain Lahore, headache doctor Lahore, diabetes doctor Lahore, blood pressure doctor Lahore, pregnancy doctor Lahore, skin specialist Lahore, cough treatment Lahore, flu doctor Lahore, dengue fever Lahore, malaria treatment Lahore, typhoid doctor Lahore, hepatitis treatment Lahore, covid test Lahore, covid vaccine Lahore, medical emergency Lahore, 24 hour doctor Lahore, night doctor Lahore, weekend doctor Lahore, same day appointment Lahore, urgent care Lahore, walk in doctor Lahore, doctor home visit Lahore, online video consultation Lahore, phone consultation Lahore, chat with doctor Lahore, prescription online Lahore, medicine delivery Lahore, lab test at home Lahore, blood test Lahore, MRI Lahore, CT scan Lahore, ultrasound Lahore, x-ray Lahore, ECG Lahore, medical checkup Lahore, full body checkup Lahore, diabetes test Lahore, cholesterol test Lahore, liver function test Lahore, kidney function test Lahore, urine test Lahore, stool test Lahore, allergy test Lahore, thyroid test Lahore, cancer screening Lahore, heart checkup Lahore, lung test Lahore, bone density test Lahore, vitamin test Lahore, hormone test Lahore, genetic test Lahore, covid PCR test Lahore, rapid antigen test Lahore, antibody test Lahore, dengue test Lahore, malaria test Lahore, typhoid test Lahore, hepatitis test Lahore, HIV test Lahore, pregnancy test Lahore, hCG test Lahore, ultrasound pregnancy Lahore, baby checkup Lahore, newborn screening Lahore, vaccination Lahore, baby vaccination Lahore, child vaccination Lahore, adult vaccination Lahore, flu vaccine Lahore, pneumonia vaccine Lahore, hepatitis vaccine Lahore, covid vaccine Lahore, travel vaccine Lahore, rabies vaccine Lahore, tetanus vaccine Lahore, MMR vaccine Lahore, BCG vaccine Lahore, polio vaccine Lahore, DPT vaccine Lahore, HPV vaccine Lahore, chickenpox vaccine Lahore, meningitis vaccine Lahore, typhoid vaccine Lahore, cholera vaccine Lahore, yellow fever vaccine Lahore, Japanese encephalitis vaccine Lahore, rabies prophylaxis Lahore, snake bite treatment Lahore, dog bite treatment Lahore, animal bite treatment Lahore, poison treatment Lahore, overdose treatment Lahore, drug overdose Lahore, alcohol poisoning Lahore, food poisoning Lahore, carbon monoxide poisoning Lahore, lead poisoning Lahore, mercury poisoning Lahore, chemical poisoning Lahore, industrial poisoning Lahore, agricultural poisoning Lahore, pesticide poisoning Lahore, insecticide poisoning Lahore, herbicide poisoning Lahore, fungicide poisoning Lahore, rodenticide poisoning Lahore, heavy metal poisoning Lahore, arsenic poisoning Lahore, cadmium poisoning Lahore, chromium poisoning Lahore, nickel poisoning Lahore, zinc poisoning Lahore, copper poisoning Lahore, iron poisoning Lahore, manganese poisoning Lahore, aluminum poisoning Lahore, bismuth poisoning Lahore, thallium poisoning Lahore, selenium poisoning Lahore, cobalt poisoning Lahore, vanadium poisoning Lahore, molybdenum poisoning Lahore, tungsten poisoning Lahore, antimony poisoning Lahore, beryllium poisoning Lahore, barium poisoning Lahore, strontium poisoning Lahore, silver poisoning Lahore, gold poisoning Lahore, platinum poisoning Lahore, palladium poisoning Lahore, rhodium poisoning Lahore, ruthenium poisoning Lahore, osmium poisoning Lahore, iridium poisoning Lahore, rhenium poisoning Lahore, technetium poisoning Lahore, promethium poisoning Lahore, samarium poisoning Lahore, europium poisoning Lahore, gadolinium poisoning Lahore, terbium poisoning Lahore, dysprosium poisoning Lahore, holmium poisoning Lahore, erbium poisoning Lahore, thulium poisoning Lahore, ytterbium poisoning Lahore, lutetium poisoning Lahore, hafnium poisoning Lahore, tantalum poisoning Lahore, tungsten poisoning Lahore, rhenium poisoning Lahore, osmium poisoning Lahore, iridium poisoning Lahore, platinum poisoning Lahore, gold poisoning Lahore, mercury poisoning Lahore, thallium poisoning Lahore, lead poisoning Lahore, bismuth poisoning Lahore, polonium poisoning Lahore, astatine poisoning Lahore, radon poisoning Lahore, francium poisoning Lahore, radium poisoning Lahore, actinium poisoning Lahore, thorium poisoning Lahore, protactinium poisoning Lahore, uranium poisoning Lahore, neptunium poisoning Lahore, plutonium poisoning Lahore, americium poisoning Lahore, curium poisoning Lahore, berkelium poisoning Lahore, californium poisoning Lahore, einsteinium poisoning Lahore, fermium poisoning Lahore, mendelevium poisoning Lahore, nobelium poisoning Lahore, lawrencium poisoning Lahore, rutherfordium poisoning Lahore, dubnium poisoning Lahore, seaborgium poisoning Lahore, bohrium poisoning Lahore, hassium poisoning Lahore, meitnerium poisoning Lahore, darmstadtium poisoning Lahore, roentgenium poisoning Lahore, copernicium poisoning Lahore, nihonium poisoning Lahore, flerovium poisoning Lahore, moscovium poisoning Lahore, livermorium poisoning Lahore, tennessine poisoning Lahore, oganesson poisoning Lahore" />
                <link rel="canonical" href="https://sehatkor.pk/lahore" />
                <meta property="og:title" content="Best Doctors in Lahore | Book Online Appointment" />
                <meta property="og:description" content="800+ verified doctors in Lahore. Book appointments in Gulberg, DHA, Model Town. 24/7 support." />
                <meta property="og:url" content="https://sehatkor.pk/lahore" />
                <meta property="og:type" content="website" />
            </Helmet>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <MapPin className="w-8 h-8" />
                            <h1 className="text-4xl lg:text-5xl font-bold">Doctor Appointments in Lahore</h1>
                        </div>
                        <p className="text-xl mb-8 opacity-90">
                            Book verified doctors, hospitals, labs, and pharmacies in Lahore. 24/7 service available.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">800+ Doctors</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">40+ Hospitals</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">25+ Labs</span>
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">24/7 Support</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 py-16">
                {/* Services Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Healthcare Services in Lahore</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Doctor Consultation",
                                desc: "Online and in-person appointments with specialists",
                                icon: Users,
                                areas: ["Gulberg", "DHA", "Model Town", "Johar Town"]
                            },
                            {
                                title: "Hospital Booking",
                                desc: "Admissions, surgeries, and emergency care",
                                icon: ShieldCheck,
                                areas: ["Mayo Hospital", "Services Hospital", "Jinnah Hospital", "Shaukat Khanum"]
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
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{service.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {service.areas.map((area, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-md">
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Areas in Lahore</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            "Gulberg", "DHA Lahore", "Model Town", "Johar Town",
                            "Cantt", "Iqbal Town", "Wapda Town", "Valencia"
                        ].map((area, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:border-green-300 transition-colors">
                                <MapPin className="w-5 h-5 text-green-600 mx-auto mb-2" />
                                <span className="text-gray-900 font-medium">{area}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Book Your Doctor Appointment in Lahore</h2>
                    <p className="text-lg mb-6 opacity-90">
                        Join thousands of Lahore residents who trust SehatKor for their healthcare needs
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/search?location=lahore"
                            className="bg-white text-green-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold"
                        >
                            Search Doctors in Lahore
                        </Link>
                        <Link
                            to="/register"
                            className="border border-white text-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-lg font-semibold"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LahorePage;
