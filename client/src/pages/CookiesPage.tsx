
import SEO from "@/components/SEO";
import { Cookie, Shield, Settings, Info, Lock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const CookiesPage = () => {
    const sections = [
        {
            title: "What Are Cookies",
            icon: Cookie,
            content: "As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies.",
            color: "text-amber-600",
            bgColor: "bg-amber-50"
        },
        {
            title: "How We Use Cookies",
            icon: Settings,
            content: "We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "The Cookies We Set",
            icon: CheckCircle2,
            content: (
                <ul className="space-y-4">
                    <li className="flex gap-3">
                        <div className="min-w-[4px] h-full bg-emerald-500 rounded-full"></div>
                        <div>
                            <strong className="block text-slate-800">Login related cookies</strong>
                            <span className="text-slate-600 text-sm">We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <div className="min-w-[4px] h-full bg-emerald-500 rounded-full"></div>
                        <div>
                            <strong className="block text-slate-800">Site preferences cookies</strong>
                            <span className="text-slate-600 text-sm">In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it.</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <div className="min-w-[4px] h-full bg-emerald-500 rounded-full"></div>
                        <div>
                            <strong className="block text-slate-800">Analytics cookies</strong>
                            <span className="text-slate-600 text-sm">This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web to help us understand how you use the site and ways that we can improve your experience.</span>
                        </div>
                    </li>
                </ul>
            ),
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            title: "Disabling Cookies",
            icon: Lock,
            content: "You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore, it is recommended that you do not disable cookies.",
            color: "text-rose-600",
            bgColor: "bg-rose-50"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <SEO
                title="Cookie Policy - Sehatkor | Data Privacy & Usage"
                description="Understand how Sehatkor uses cookies to enhance your healthcare experience. Read our detailed cookie policy for transparency and trust."
                canonical="https://sehatkor.pk/cookies"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Cookie Policy",
                    "description": "Details about how Sehatkor uses cookies.",
                    "url": "https://sehatkor.pk/cookies"
                }}
            />

            {/* Header */}
            <div className="bg-slate-900 pt-24 pb-16 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500 rounded-full blur-[100px]"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto px-4 relative z-10"
                >
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/20">
                        <Cookie className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Cookie Policy</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Transparency about how we use your data to improve your healthcare experience.
                    </p>
                    <p className="text-xs text-slate-500 mt-4 font-mono uppercase tracking-widest">
                        Last updated: February 2026
                    </p>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="grid gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    <div className={`p-6 md:w-64 ${section.bgColor} flex flex-col items-center justify-center text-center md:border-r border-slate-100`}>
                                        <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 ${section.color}`}>
                                            <section.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className={`font-bold text-lg ${section.color}`}>{section.title}</h3>
                                    </div>
                                    <div className="p-8 flex-1 bg-white">
                                        {typeof section.content === 'string' ? (
                                            <p className="text-slate-600 leading-relaxed text-lg">
                                                {section.content}
                                            </p>
                                        ) : (
                                            section.content
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-8 text-center"
                    >
                        <div className="bg-slate-200 rounded-2xl p-8 inline-block max-w-3xl">
                            <div className="flex flex-col items-center gap-4">
                                <Info className="w-8 h-8 text-slate-600" />
                                <h3 className="text-xl font-bold text-slate-800">More Information</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Hopefully, that has clarified things for you. If there is something that you aren't sure whether you need or not, it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
                                </p>
                                <p className="text-slate-500 text-sm mt-4">
                                    Questions? Contact us at <a href="mailto:privacy@sehatkor.pk" className="text-blue-600 hover:underline">privacy@sehatkor.pk</a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CookiesPage;
