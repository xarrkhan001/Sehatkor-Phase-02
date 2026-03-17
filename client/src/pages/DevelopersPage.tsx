import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Code,
    Globe,
    Smartphone,
    Database,
    Brain,
    Mail,
    Phone,
    ExternalLink,
    Linkedin,
    Briefcase,
    Award,
    MapPin,
    ShieldCheck,
    Zap
} from "lucide-react";
import PageLoader from "@/components/PageLoader";

const DevelopersPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) return <PageLoader />;

    // Enhanced structured data for developers
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": "https://sehatkor.pk/developers#webpage",
                "url": "https://sehatkor.pk/developers",
                "name": "Top Software Developers Pakistan | ASH Cloud Team | Sehatkor.pk Developers 2025",
                "description": "Meet Pakistan's top software developers - Abuzar (CEO of ASH Cloud) and Syed Haris Shah. Expert full stack developers specializing in MERN stack, React Native, Python Django, healthcare software, and custom web & mobile app development solutions in Peshawar.",
                "isPartOf": {
                    "@id": "https://sehatkor.pk/#website"
                },
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": "https://sehatkor.pk"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Developers",
                            "item": "https://sehatkor.pk/developers"
                        }
                    ]
                },
                "mainEntity": [
                    {
                        "@type": "Person",
                        "@id": "https://sehatkor.pk/developers#abuzar",
                        "name": "Abuzar",
                        "alternateName": ["Abuzar Khan", "Abuzar CEO", "Abuzar ASH Cloud"],
                        "jobTitle": ["Software Engineer", "Full Stack Developer", "CEO and Co-Founder", "Lead Developer", "Tech Entrepreneur"],
                        "worksFor": {
                            "@type": "Organization",
                            "@id": "https://ash-cloud-official-bpmr.vercel.app/#organization",
                            "name": "ASH Cloud",
                            "url": "https://ash-cloud-official-bpmr.vercel.app/",
                            "description": "Full-stack development company providing comprehensive digital solutions",
                            "foundingDate": "2023",
                            "areaServed": "Pakistan"
                        },
                        "url": "https://abuzar-portfolio-lat.vercel.app/",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://sehatkor.pk/abuzar-ceo.jpg",
                            "contentUrl": "https://sehatkor.pk/abuzar-ceo.jpg",
                            "caption": "Abuzar - CEO and Co-Founder of ASH Cloud, Software Engineer, Full Stack Developer",
                            "description": "Professional photo of Abuzar, CEO of ASH Cloud and lead developer of Sehatkor.pk",
                            "name": "Abuzar CEO ASH Cloud"
                        },
                        "sameAs": [
                            "https://www.linkedin.com/company/ashcloudofficial/",
                            "https://ash-cloud-official-bpmr.vercel.app/",
                            "https://abuzar-portfolio-lat.vercel.app/"
                        ],
                        "telephone": "+923429752032",
                        "email": "abuzarktk123@gmail.com",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Peshawar",
                            "addressRegion": "Khyber Pakhtunkhwa",
                            "addressCountry": "Pakistan"
                        },
                        "knowsAbout": [
                            "React.js", "Node.js", "MongoDB", "Express.js", "MERN Stack",
                            "React Native", "Python Django", "JavaScript Expert", "Nuxt.js", "Vue.js",
                            "Desktop Application Development", "Firebase", "Healthcare Software Development",
                            "Web Applications", "Mobile Development", "AI Solutions", "Cloud Computing", "Database Design",
                            "Full Stack Development", "Software Architecture", "API Development", "E-commerce Solutions",
                            "Enterprise Software", "Custom Software Development", "Sehatkor Development"
                        ],
                        "alumniOf": "Software Engineering",
                        "hasCredential": ["Full Stack Development Certification", "MERN Stack Expert", "React Native Developer"],
                        "award": ["CEO of ASH Cloud", "Lead Developer of Sehatkor.pk", "Full Stack Expert"],
                        "description": "Abuzar - Software Engineer, Full Stack Developer, CEO and Co-Founder of ASH Cloud company. Lead developer of Sehatkor.pk with comprehensive experience across all technology platforms including web applications, mobile apps, desktop software, AI solutions, cloud computing, and database systems. Specializing in MERN stack, React Native, Python Django, and delivering innovative digital solutions for healthcare, e-commerce, enterprise, and custom business applications in Peshawar, Pakistan.",
                        "seeks": "Software Development Projects",
                        "keywords": "Abuzar, Abuzar software engineer, Abuzar full stack developer, Abuzar CEO, Abuzar ASH Cloud, CEO of ASH Cloud, co-founder ASH Cloud, Abuzar Sehatkor developer, Sehatkor.pk developer, Abuzar Pakistan developer, Abuzar Peshawar, MERN stack developer Pakistan, React Native developer Pakistan, full stack developer Peshawar, software engineer Pakistan, ASH Cloud CEO, healthcare software developer, Abuzar portfolio, Abuzar tech entrepreneur, Pakistan software developer, Peshawar tech CEO, Abuzar web developer, Abuzar mobile developer, Abuzar AI developer, best developer Pakistan, top developer Peshawar"
                    },
                    {
                        "@type": "Person",
                        "@id": "https://sehatkor.pk/developers#haris",
                        "name": "Syed Haris Shah",
                        "alternateName": ["Haris Shah", "Syed Haris", "Haris ASH Cloud", "Harry Shah"],
                        "jobTitle": ["Software Engineer", "Full Stack Developer", "Senior Developer Member", "Frontend Specialist", "Backend Developer"],
                        "worksFor": {
                            "@type": "Organization",
                            "@id": "https://ash-cloud-official-bpmr.vercel.app/#organization",
                            "name": "ASH Cloud",
                            "url": "https://ash-cloud-official-bpmr.vercel.app/"
                        },
                        "url": "https://portfolio22-lilac.vercel.app/",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://sehatkor.pk/haris-photo.jpg",
                            "contentUrl": "https://sehatkor.pk/haris-photo.jpg",
                            "caption": "Syed Haris Shah - Senior Developer Member of ASH Cloud, Software Engineer, Full Stack Developer",
                            "description": "Professional photo of Syed Haris Shah, Senior Developer at ASH Cloud and key developer of Sehatkor.pk",
                            "name": "Syed Haris Shah ASH Cloud Developer"
                        },
                        "sameAs": [
                            "https://www.linkedin.com/company/ashcloudofficial/",
                            "https://ash-cloud-official-bpmr.vercel.app/",
                            "https://portfolio22-lilac.vercel.app/"
                        ],
                        "email": "syedharryshah1@gmail.com",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Peshawar",
                            "addressRegion": "Khyber Pakhtunkhwa",
                            "addressCountry": "Pakistan"
                        },
                        "knowsAbout": [
                            "React.js", "Node.js", "MongoDB", "Express.js", "MERN Stack",
                            "React Native", "Python Django", "JavaScript Expert", "Nuxt.js", "Vue.js",
                            "Desktop Application Development", "Firebase", "Frontend Development", "Backend Development",
                            "Healthcare Software", "Web Applications", "UI/UX Design", "Database Management",
                            "Full Stack Development", "API Development", "Responsive Design", "Modern Web Technologies",
                            "E-commerce Development", "Custom Software Solutions", "Sehatkor Development"
                        ],
                        "alumniOf": "Software Engineering",
                        "hasCredential": ["Full Stack Development Certification", "MERN Stack Developer", "UI/UX Specialist"],
                        "award": ["Senior Developer ASH Cloud", "Key Developer of Sehatkor.pk", "Full Stack Specialist"],
                        "description": "Syed Haris Shah - Software Engineer, Full Stack Developer, and Senior Developer Member of ASH Cloud company. Key developer of Sehatkor.pk with versatile expertise across multiple technology platforms including web development, mobile applications, desktop software, frontend/backend systems, UI/UX design, and database management. Specializing in React.js, Node.js, MERN stack, and modern web technologies for healthcare, e-commerce, enterprise solutions, and custom business applications in Peshawar, Pakistan.",
                        "seeks": "Full Stack Development Opportunities",
                        "keywords": "Syed Haris Shah, Haris Shah, Syed Haris software engineer, Haris full stack developer, Haris ASH Cloud, Senior developer ASH Cloud, Syed Haris Shah Sehatkor, Sehatkor developer Haris, Haris Pakistan developer, Haris Peshawar, MERN stack developer Haris, React developer Pakistan, full stack developer Haris, software engineer Haris Shah, ASH Cloud senior developer, healthcare software Haris, Haris portfolio, UI UX developer Pakistan, frontend developer Peshawar, backend developer Pakistan, Haris web developer, Haris mobile developer, best developer Pakistan, top developer Peshawar, Syed Haris Shah portfolio"
                    }
                ]
            },
            {
                "@type": "Organization",
                "@id": "https://ash-cloud-official-bpmr.vercel.app/#organization",
                "name": "ASH Cloud",
                "url": "https://ash-cloud-official-bpmr.vercel.app/",
                "description": "Leading software development company in Pakistan specializing in healthcare solutions, web applications, mobile apps, and AI technologies.",
                "foundingDate": "2023",
                "areaServed": "Pakistan",
                "foundingLocation": {
                    "@type": "Place",
                    "address": {
                        "@type": "PostalAddress",
                        "addressCountry": "Pakistan",
                        "addressRegion": "Khyber Pakhtunkhwa",
                        "addressLocality": "Peshawar"
                    }
                },
                "serviceType": [
                    "Web Application Development",
                    "Mobile App Development",
                    "Healthcare Software Solutions",
                    "AI Integration",
                    "Cloud Computing",
                    "Database Design",
                    "UI/UX Development",
                    "E-commerce Development",
                    "Custom Software Solutions",
                    "Enterprise Software Development",
                    "Frontend Development",
                    "Backend Development",
                    "Full Stack Development",
                    "React Native Development",
                    "Python Django Development",
                    "Firebase Integration",
                    "Desktop Application Development"
                ],
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "ASH Cloud Development Services",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Healthcare Platform Development",
                                "description": "Custom healthcare management systems and patient platforms"
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Full-Stack Web Development",
                                "description": "Complete web application development using modern technologies"
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Mobile Application Development",
                                "description": "Native and cross-platform mobile app development"
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Custom Software Solutions",
                                "description": "Tailored software development for business needs"
                            }
                        }
                    ]
                }
            },
            {
                "@type": "Organization",
                "@id": "https://sehatkor.pk/#organization",
                "name": "Sehatkor.pk",
                "url": "https://sehatkor.pk",
                "description": "Pakistan's leading healthcare platform connecting patients with doctors, hospitals, labs, and pharmacies nationwide.",
                "foundingDate": "2023",
                "founder": {
                    "@type": "Person",
                    "name": "Abuzar",
                    "jobTitle": "CEO & Lead Developer"
                },
                "employee": [
                    {
                        "@type": "Person",
                        "name": "Abuzar",
                        "jobTitle": "CEO & Lead Developer"
                    },
                    {
                        "@type": "Person",
                        "name": "Syed Haris Shah",
                        "jobTitle": "Full Stack Developer"
                    }
                ],
                "areaServed": "Pakistan",
                "serviceType": [
                    "Healthcare Platform",
                    "Doctor Booking",
                    "Hospital Directory",
                    "Lab Test Booking",
                    "Pharmacy Services"
                ]
            }
        ]
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <SEO
                title="Sehatkor.pk Developers - Abuzar CEO & Syed Haris Shah | ASH Cloud Software Engineers Pakistan"
                description="Meet the developers of Sehatkor.pk - Abuzar (Software Engineer, Full Stack Developer, CEO and Co-Founder of ASH Cloud) and Syed Haris Shah (Software Engineer, Full Stack Developer, Senior Developer Member of ASH Cloud). Expert full stack developers who built Pakistan's leading healthcare platform. Expertise across all technology platforms including web applications, mobile apps, desktop software, AI solutions, cloud computing, and database systems. Specializing in MERN stack, React Native, Python Django, and delivering innovative digital solutions for healthcare, e-commerce, enterprise, and custom business applications in Peshawar, Pakistan. Contact the best software developers in Pakistan for comprehensive development services."
                keywords="sehatkor.pk developers, sehatkor developers, who developed sehatkor.pk, sehatkor.pk developer team, developers of sehatkor.pk, sehatkor.pk creators, Abuzar sehatkor developer, Syed Haris Shah sehatkor developer, Abuzar software engineer Pakistan, Abuzar full stack developer, Abuzar CEO ASH Cloud, Abuzar co-founder ASH Cloud, Abuzar CEO and co-founder ASH Cloud company, Syed Haris Shah software engineer, Syed Haris Shah full stack developer, Syed Haris Shah senior developer, Syed Haris Shah ASH Cloud, senior developer member ASH Cloud, ASH Cloud software development company Pakistan, ASH Cloud developers team, ASH Cloud Peshawar, best software developers Pakistan 2025, top web developers Pakistan, MERN stack experts Pakistan, React Native app developers Pakistan, Python Django developers Peshawar, JavaScript expert developers Pakistan, Vue.js Nuxt.js developers Pakistan, Firebase backend developers Pakistan, healthcare software development Pakistan, medical app developers Pakistan, custom website developers Pakistan, enterprise software solutions Pakistan, e-commerce developers Pakistan, mobile app development Pakistan, desktop application developers Pakistan, AI solutions developers Pakistan, cloud computing experts Pakistan, database design specialists Pakistan, UI UX designers Pakistan, frontend backend developers Pakistan, full stack web development Pakistan, software house Peshawar, IT solutions Pakistan, digital transformation Pakistan, healthcare IT specialists Pakistan, medical platform developers Pakistan, clinic management software Pakistan, hospital management systems Pakistan, lab management software Pakistan, pharmacy management systems Pakistan, telemedicine app developers Pakistan, health tech startups Pakistan, Pakistani software engineers, Peshawar tech companies, KPK software developers, Pakistan IT industry, software development services Pakistan, web design development Pakistan, app development company Pakistan, custom software solutions Pakistan, business software development Pakistan, healthcare technology Pakistan, medical software solutions Pakistan, digital health platforms Pakistan, Pakistani development agencies, top coding experts Pakistan, software consultants Pakistan, tech entrepreneurs Pakistan, programming experts Pakistan, development services Pakistan, custom applications Pakistan, software outsourcing Pakistan, Pakistan software market, IT services Pakistan, technology solutions Pakistan, Abuzar Pakistan developer, Haris Shah Pakistan developer, search Abuzar CEO, search Syed Haris Shah, find Sehatkor developers, Abuzar contact, Syed Haris Shah contact, ASH Cloud contact, hire Pakistani developers, hire Peshawar developers, best developers in Pakistan, Abuzar portfolio, Syed Haris Shah portfolio, ASH Cloud portfolio, sehatkor.pk programming team, sehatkor.pk tech team, sehatkor.pk software engineers, sehatkor.pk web developers, sehatkor.pk app developers, sehatkor.pk backend developers, sehatkor.pk frontend developers"
                canonical="https://sehatkor.pk/developers"
                jsonLd={jsonLd}
                type="website"
                image="https://sehatkor.pk/developers-og-image.jpg"
            />

            {/* Professional Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
                {/* Modern Fluid Background */}
                <div className="absolute inset-0 -z-10 bg-white">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-[120px] -mr-48 -mt-24"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-50/40 rounded-full blur-[130px] -ml-64 -mb-32"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                </div>

                <div className="container mx-auto px-6 relative">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Left Content - Text & Branding */}
                        <div className="flex-1 text-left">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 shadow-sm"
                            >
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                ASH Cloud Engineering Team
                            </motion.div>

                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-[1.1]"
                            >
                                Designing the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Future of Healthcare</span>
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-lg lg:text-xl text-slate-600 font-medium mb-10 max-w-2xl leading-relaxed"
                            >
                                Meet the architects behind <span className="text-emerald-600 font-bold">Sehatkor.pk</span>. We bridge the gap between complex medical systems and seamless user experiences through high-performance engineering.
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Button 
                                    size="lg" 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-6 text-md font-bold shadow-xl shadow-emerald-200/50 transition-all hover:-translate-y-1"
                                    onClick={() => document.getElementById('developers')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Meet the Developers
                                </Button>
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" className="w-full h-full object-cover grayscale" />
                                        </div>
                                    ))}
                                    <div className="w-12 h-12 rounded-full border-4 border-white bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                                        +50
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Content - Modern Stats Component */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex-1 w-full lg:max-w-md"
                        >
                            <div className="relative">
                                {/* Floating Background Shapes */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>

                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    {[
                                        { label: "High Performance", value: "99.9%", sub: "System Uptime", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                                        { label: "Secure Data", value: "100%", sub: "Encryption", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
                                        { label: "Projects Done", value: "50+", sub: "Successful Delivery", icon: Code, color: "text-emerald-500", bg: "bg-emerald-50" },
                                        { label: "Expert Support", value: "24/7", sub: "Member Access", icon: Users, color: "text-purple-500", bg: "bg-purple-50" }
                                    ].map((stat, i) => {
                                        const Icon = stat.icon;
                                        return (
                                            <motion.div 
                                                key={i}
                                                whileHover={{ y: -5 }}
                                                className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                                            >
                                                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                                </div>
                                                <div className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{stat.sub}</div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ASH Cloud Company Section */}
            <section className="py-20 lg:py-28 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 rounded-[3rem] p-8 lg:p-16 border border-emerald-100 shadow-sm relative overflow-hidden">
                            {/* Decorative Pattern Overlay */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            
                            <div className="text-center mb-16 relative z-10">
                                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">ASH Cloud</h2>
                                <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                                    A premier software engineering firm in Pakistan, driving digital excellence 
                                    through <span className="text-emerald-600 font-bold">healthcare innovation</span> and state-of-the-art technology solutions.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                                <div className="space-y-10">
                                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                        Core Expertise
                                    </h3>
                                    <div className="space-y-6">
                                        {[
                                            { icon: Globe, title: "Next-Gen Web Apps", desc: "Ultra-fast, SEO-optimized medical platforms using React & Next.js", color: "text-emerald-600", bg: "bg-emerald-100/50" },
                                            { icon: Smartphone, title: "Mobile Ecosystems", desc: "Patient-centric iOS and Android apps with React Native", color: "text-teal-600", bg: "bg-teal-100/50" },
                                            { icon: Database, title: "Secure Infrastructure", desc: "HIPAA-compliant backend architectures and cloud systems", color: "text-cyan-600", bg: "bg-cyan-100/50" },
                                            { icon: Brain, title: "AI-Driven Health", desc: "Intelligent diagnostic tools and automated healthcare logic", color: "text-emerald-700", bg: "bg-emerald-200/40" }
                                        ].map((service, i) => {
                                            const Icon = service.icon;
                                            return (
                                                <motion.div 
                                                    key={i} 
                                                    whileHover={{ x: 10 }}
                                                    className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white/60 transition-all cursor-default"
                                                >
                                                    <div className={`w-14 h-14 ${service.bg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                        <Icon className={`w-7 h-7 ${service.color}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{service.title}</h4>
                                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{service.desc}</p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 lg:p-10 border border-emerald-100 shadow-xl shadow-emerald-900/5">
                                    <h4 className="text-xl font-black text-slate-900 mb-8 border-b border-emerald-50 pb-4">Technology Arsenal</h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {[
                                            "React.js", "Node.js", "MongoDB", "TypeScript",
                                            "Next.js", "Tailwind CSS", "AWS Cloud", "Docker",
                                            "GraphQL", "Socket.io", "React Native", "Python Django",
                                            "Firebase", "Electron.js", "Vue.js", "SQLite", 
                                            "PostgreSQL", "MySQL", "AI-Based Solutions"
                                        ].map((tech, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-4 py-2 bg-white border border-emerald-50 text-emerald-800 rounded-xl text-xs font-bold shadow-sm hover:border-emerald-300 hover:text-emerald-600 transition-all cursor-default"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-10 p-5 bg-emerald-600 rounded-2xl text-white">
                                        <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Primary Stack</div>
                                        <div className="text-lg font-black italic">Enterprise Fullstack Stack</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developers Section */}
            <section id="developers" className="py-20 lg:py-32 scroll-mt-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <motion.h2 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="text-4xl lg:text-6xl font-black text-slate-900 mb-6"
                            >
                                Our Core <span className="text-emerald-600">Architects</span>
                            </motion.h2>
                            <div className="w-24 h-2 bg-gradient-to-r from-emerald-600 to-teal-400 mx-auto rounded-full mb-6"></div>
                            <p className="text-lg lg:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                                Meet the primary engineers who conceptualized and built the Sehatkor.pk ecosystem from the ground up.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                            {/* Abuzar Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="group relative bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(10,80,40,0.06)] border border-emerald-50 overflow-hidden hover:shadow-[0_40px_80px_rgba(10,80,40,0.1)] transition-all duration-500"
                            >
                                <div className="h-2.5 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
                                <div className="p-6 lg:p-8">
                                    <div className="flex flex-col items-center text-center mb-5">
                                        <div className="relative mb-5">
                                            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl group-hover:blur-xl transition-all"></div>
                                            <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full border-[5px] border-white shadow-xl overflow-hidden ring-4 ring-emerald-50/50 transition-transform duration-500 group-hover:scale-105">
                                                <img
                                                    src="/abuzar-ceo.jpg?v=3"
                                                    alt="Abuzar - CEO Sehatkor"
                                                    className="w-full h-full object-cover"
                                                    style={{ objectPosition: '45% 8%' }}
                                                />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-lg border border-emerald-50">
                                                <Award className="w-4 h-4 text-emerald-600" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mb-0.5">Abuzar</h3>
                                        <p className="text-emerald-700 font-bold text-[13px] mb-2.5 uppercase tracking-tighter">Chief Executive Officer</p>
                                        
                                        <Badge className="bg-slate-900 text-emerald-400 border-none px-4 py-1.5 text-[9px] font-black rounded-full shadow-md">
                                            Lead Full-Stack Engineer
                                        </Badge>
                                    </div>

                                    <div className="space-y-3.5 mb-6">
                                        <p className="text-slate-600 text-center leading-relaxed font-medium text-[13px] lg:text-[14px]">
                                            A visionary tech entrepreneur and elite full-stack engineer, specializing in scalable healthcare infrastructures and AI-driven diagnostics.
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-[9px] font-black text-slate-700 uppercase">5+ Years Exp</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                                <span className="text-[9px] font-black text-slate-700 uppercase">Peshawar</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <a href="tel:+923429752032" className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all group/link border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-3.5 h-3.5 text-emerald-600 group-hover/link:text-white" />
                                                <span className="font-bold text-[13px]">+92 342 9752032</span>
                                            </div>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all" />
                                        </a>
                                        <a href="mailto:abuzarktk123@gmail.com" className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all group/link border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-3.5 h-3.5 text-emerald-600 group-hover/link:text-white" />
                                                <span className="font-bold text-[13px]">abuzarktk123@gmail.com</span>
                                            </div>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all" />
                                        </a>
                                    </div>

                                    <div className="flex justify-center gap-3.5 mt-7">
                                        {[
                                            { icon: ExternalLink, href: "https://abuzar-portfolio-lat.vercel.app/", label: "Portfolio", color: "text-emerald-600" },
                                            { icon: Briefcase, href: "https://ash-cloud-official-bpmr.vercel.app/", label: "Company", color: "text-emerald-700" },
                                            { icon: Linkedin, href: "https://www.linkedin.com/company/ashcloudofficial/", label: "LinkedIn", color: "text-blue-600" }
                                        ].map((social, i) => (
                                            <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all hover:-translate-y-1">
                                                <social.icon className={`w-4.5 h-4.5 ${social.color}`} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Syed Haris Shah Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="group relative bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(10,80,40,0.06)] border border-emerald-50 overflow-hidden hover:shadow-[0_40px_80px_rgba(10,80,40,0.1)] transition-all duration-500"
                            >
                                <div className="h-2.5 bg-gradient-to-r from-teal-500 to-emerald-600"></div>
                                <div className="p-6 lg:p-8">
                                    <div className="flex flex-col items-center text-center mb-5">
                                        <div className="relative mb-5">
                                            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl group-hover:blur-xl transition-all"></div>
                                            <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full border-[5px] border-white shadow-xl overflow-hidden ring-4 ring-emerald-50/50 transition-transform duration-500 group-hover:scale-105">
                                                <img
                                                    src="/haris-photo.jpg"
                                                    alt="Syed Haris Shah - Senior Engineer Sehatkor"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-lg border border-emerald-50">
                                                <Code className="w-4 h-4 text-emerald-600" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mb-0.5">Syed Haris Shah</h3>
                                        <p className="text-emerald-700 font-bold text-[13px] mb-2.5 uppercase tracking-tighter">Senior Engineering Lead</p>
                                        
                                        <Badge className="bg-slate-900 text-emerald-400 border-none px-4 py-1.5 text-[9px] font-black rounded-full shadow-md">
                                            Full-Stack Specialist
                                        </Badge>
                                    </div>

                                    <div className="space-y-3.5 mb-6">
                                        <p className="text-slate-600 text-center leading-relaxed font-medium text-[13px] lg:text-[14px]">
                                            An expert in modern web architectures and UI/UX systems. Haris combines technical precision with creative problem-solving.
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-[9px] font-black text-slate-700 uppercase">3+ Years Exp</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                                <span className="text-[9px] font-black text-slate-700 uppercase">Peshawar</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <a href="mailto:syedharryshah1@gmail.com" className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all group/link border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-3.5 h-3.5 text-emerald-600 group-hover/link:text-white" />
                                                <span className="font-bold text-[13px]">syedharryshah1@gmail.com</span>
                                            </div>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all" />
                                        </a>
                                    </div>

                                    <div className="flex justify-center gap-3.5 mt-7">
                                        {[
                                            { icon: ExternalLink, href: "https://portfolio22-lilac.vercel.app/", label: "Portfolio", color: "text-emerald-600" },
                                            { icon: Briefcase, href: "https://ash-cloud-official-bpmr.vercel.app/", label: "Company", color: "text-emerald-700" },
                                            { icon: Linkedin, href: "https://www.linkedin.com/company/ashcloudofficial/", label: "LinkedIn", color: "text-blue-600" }
                                        ].map((social, i) => (
                                            <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all hover:-translate-y-1">
                                                <social.icon className={`w-4.5 h-4.5 ${social.color}`} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[3rem] p-10 lg:p-16 text-center text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mt-32"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -mr-32 -mb-32"></div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative z-10"
                            >
                                <h2 className="text-3xl lg:text-5xl font-black mb-6">Need Elite Development?</h2>
                                <p className="text-lg lg:text-xl mb-10 text-emerald-50/90 max-w-2xl mx-auto font-medium leading-relaxed">
                                    Whether it's a critical healthcare platform, complex e-commerce engine, 
                                    or a custom enterprise solution, ASH Cloud is your high-fidelity engineering partner.
                                </p>

                                <div className="flex flex-wrap justify-center gap-6">
                                    <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl px-10 py-7 text-lg font-bold shadow-xl transition-all hover:-translate-y-1">
                                        <a href="https://ash-cloud-official-bpmr.vercel.app/" target="_blank" rel="noopener noreferrer">
                                            Visit ASH Cloud
                                        </a>
                                    </Button>
                                    <Button asChild size="lg" className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 rounded-2xl px-10 py-7 text-lg font-bold backdrop-blur-sm transition-all hover:-translate-y-1">
                                        <a href="tel:+923178521144" className="flex items-center gap-3">
                                            <Phone className="w-5 h-5" />
                                            Call Engineering Team
                                        </a>
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DevelopersPage;
