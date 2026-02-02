
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import { Search, HelpCircle, User, Calendar, Pill, MessageCircle, ChevronRight, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const FAQPage = () => {
    const categories = [
        { id: "general", label: "General", icon: HelpCircle },
        { id: "doctors", label: "For Doctors", icon: User },
        { id: "patients", label: "Appointments", icon: Calendar },
        { id: "services", label: "Services", icon: Pill }
    ];

    const faqs = {
        general: [
            { q: "Is Sehatkor free to use?", a: "Registration on Sehatkor is completely free for patients. You can search for doctors, view profiles, and access basic health information without any cost. However, doctors and other service providers (labs, pharmacies) charge their own consultation or service fees." },
            { q: "How do I verify a doctor?", a: "All doctors on Sehatkor are manually verified against their PMDC (Pakistan Medical & Dental Council) registration numbers to ensure authenticity. Look for the 'Verified' badge on doctor profiles for added peace of mind." },
            { q: "Is my data secure?", a: "Yes, we take data privacy very seriously. All your personal health information is encrypted and stored securely. We do not share your sensitive data with third parties without your explicit consent." },
        ],
        doctors: [
            { q: "How can I join as a doctor?", a: "To join as a doctor, click on the 'Register' button and select 'Doctor' as your role. You will need to provide your PMDC number and other professional details for verification." },
            { q: "How do I manage my appointments?", a: "Once registered, you get access to a comprehensive Doctor Dashboard where you can view upcoming appointments, set your availability schedule, and manage patient records." },
        ],
        patients: [
            { q: "How do I book an appointment?", a: "Search for a doctor by specialization, city, or name. Visit their profile, select an available time slot that suits you, and click 'Book Appointment'. You will receive a confirmation SMS and email." },
            { q: "What if I need to cancel?", a: "You can cancel or reschedule your appointment from your Patient Dashboard under the 'Appointments' tab. Please try to cancel at least 2 hours in advance." },
            { q: "Do you offer video consultations?", a: "Yes! Many of our doctors offer online video consultations. Look for the video icon or filter by 'Online Consultation' when searching for a doctor." }
        ],
        services: [
            { q: "Can I order medicines online?", a: "Yes, you can browse nearby pharmacies and order medicines for home delivery through our Pharmacy section. Simply upload your prescription or select the medicines you need." },
            { q: "How do lab tests work?", a: "You can book lab tests from our partner laboratories. You can either choose to visit the lab collection center or opt for a home sample collection service if available." }
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            ...faqs.general,
            ...faqs.doctors,
            ...faqs.patients,
            ...faqs.services
        ].map(item => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
            }
        }))
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-16">
            <SEO
                title="Frequently Asked Questions - Sehatkor"
                description="Find answers to common questions about booking appointments, doctors, labs, and pharmacies on Sehatkor."
                jsonLd={faqSchema}
            />

            {/* Hero Header */}
            <section className="bg-slate-900 pt-28 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                {/* Abstract shapes */}
                <div className="absolute top-20 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-0 left-10 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>

                <div className="container mx-auto relative z-10 text-center max-w-2xl">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        How can we help you?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-300 text-lg mb-8"
                    >
                        Everything you need to know about Sehatkor services.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative max-w-lg mx-auto"
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search for answers..."
                            className="pl-10 h-12 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:bg-white/20 backdrop-blur-md transition-all"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-10 relative z-20 max-w-4xl">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-slate-100">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full h-auto gap-2 p-1 bg-slate-50 rounded-xl mb-8">
                            {categories.map(cat => (
                                <TabsTrigger
                                    key={cat.id}
                                    value={cat.id}
                                    className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm py-3 rounded-lg flex flex-col md:flex-row items-center gap-2 transition-all"
                                >
                                    <cat.icon className="w-4 h-4" />
                                    <span>{cat.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.entries(faqs).map(([key, items]) => (
                            <TabsContent key={key} value={key} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                <Accordion type="single" collapsible className="w-full space-y-4">
                                    {items.map((item, idx) => (
                                        <AccordionItem key={idx} value={`item-${idx}`} className="border border-slate-200 rounded-xl px-4 bg-white hover:bg-slate-50 hover:border-emerald-200 transition-colors">
                                            <AccordionTrigger className="text-left font-semibold text-slate-800 py-4 hover:no-underline hover:text-emerald-700 text-lg">
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-slate-600 text-base leading-relaxed pb-4">
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                {/* Contact CTA */}
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Still have questions?</h3>
                    <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                        Can't find the answer you're looking for? Please chat to our friendly team.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-14 px-8" asChild>
                            <Link to="/contact">
                                <Mail className="mr-2 w-5 h-5" />
                                Contact Support
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
