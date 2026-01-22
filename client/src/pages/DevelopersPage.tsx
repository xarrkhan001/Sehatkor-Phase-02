import { useState, useEffect } from "react";
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
    MapPin
} from "lucide-react";

const DevelopersPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

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
                        "jobTitle": ["Software Engineer", "Full Stack Developer", "CEO"],
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
                        "image": "https://sehatkor.pk/abuzar-ceo.jpg",
                        "sameAs": [
                            "https://www.linkedin.com/company/ashcloudofficial/",
                            "https://ash-cloud-official-bpmr.vercel.app/",
                            "https://abuzar-portfolio-lat.vercel.app/"
                        ],
                        "telephone": "+923429752032",
                        "email": "abuzarktk123@gmail.com",
                        "knowsAbout": [
                            "React.js", "Node.js", "MongoDB", "Express.js", "MERN Stack",
                            "React Native", "Python Django", "JavaScript Expert", "Nuxt.js", "Vue.js",
                            "Desktop Application (Offline/Online)", "Firebase", "Healthcare Software Development",
                            "Web Applications", "Mobile Development", "AI Solutions", "Cloud Computing", "Database Design"
                        ],
                        "alumniOf": "Software Engineering",
                        "hasCredential": "Full Stack Development Certification",
                        "description": "Abuzar - CEO of ASH Cloud and lead developer of Sehatkor.pk. Expert full stack developer with comprehensive experience across all technology platforms including web applications, mobile apps, desktop software, AI solutions, cloud computing, and database systems. Specializing in MERN stack, React Native, Python Django, and delivering innovative digital solutions for healthcare, e-commerce, enterprise, and custom business applications in Peshawar, Pakistan.",
                        "seeks": "Software Development Projects"
                    },
                    {
                        "@type": "Person",
                        "@id": "https://sehatkor.pk/developers#haris",
                        "name": "Syed Haris Shah",
                        "jobTitle": ["Software Engineer", "Full Stack Developer"],
                        "worksFor": {
                            "@type": "Organization",
                            "@id": "https://ash-cloud-official-bpmr.vercel.app/#organization",
                            "name": "ASH Cloud",
                            "url": "https://ash-cloud-official-bpmr.vercel.app/"
                        },
                        "url": "https://portfolio22-lilac.vercel.app/",
                        "image": "https://sehatkor.pk/haris-photo.jpg",
                        "sameAs": [
                            "https://www.linkedin.com/company/ashcloudofficial/",
                            "https://ash-cloud-official-bpmr.vercel.app/",
                            "https://portfolio22-lilac.vercel.app/"
                        ],
                        "email": "syedharryshah1@gmail.com",
                        "knowsAbout": [
                            "React.js", "Node.js", "MongoDB", "Express.js", "MERN Stack",
                            "React Native", "Python Django", "JavaScript Expert", "Nuxt.js", "Vue.js",
                            "Desktop Application (Offline/Online)", "Firebase", "Frontend Development", "Backend Development",
                            "Healthcare Software", "Web Applications", "UI/UX Design", "Database Management"
                        ],
                        "alumniOf": "Software Engineering",
                        "hasCredential": "Full Stack Development Certification",
                        "description": "Syed Haris Shah - Full stack developer at ASH Cloud and key developer of Sehatkor.pk. Versatile developer with expertise across multiple technology platforms including web development, mobile applications, desktop software, frontend/backend systems, UI/UX design, and database management. Specializing in React.js, Node.js, MERN stack, and modern web technologies for healthcare, e-commerce, enterprise solutions, and custom business applications in Peshawar, Pakistan.",
                        "seeks": "Full Stack Development Opportunities"
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
                title="Top Software Developers Pakistan | Abuzar CEO ASH Cloud & Syed Haris Shah | Sehatkor.pk Team 2025"
                description="Looking for expert software developers in Pakistan? Meet Abuzar (CEO of ASH Cloud) and Syed Haris Shah - versatile full stack developers who built Sehatkor.pk. Expertise across all technology platforms including web applications, mobile apps, desktop software, AI solutions, cloud computing, and database systems. Specializing in MERN stack, React Native, Python Django, and delivering innovative digital solutions for healthcare, e-commerce, enterprise, and custom business applications. Contact Peshawar's best developers for comprehensive software development services."
                keywords="Abuzar CEO ASH Cloud Pakistan, Syed Haris Shah full stack developer Peshawar, ASH Cloud software development company Pakistan, Sehatkor.pk developers team, best software developers Pakistan 2025, top web developers Pakistan, MERN stack experts Pakistan, React Native app developers Pakistan, Python Django developers Peshawar, JavaScript expert developers Pakistan, Vue.js Nuxt.js developers Pakistan, Firebase backend developers Pakistan, healthcare software development Pakistan, medical app developers Pakistan, custom website developers Pakistan, enterprise software solutions Pakistan, e-commerce developers Pakistan, mobile app development Pakistan, desktop application developers Pakistan, AI solutions developers Pakistan, cloud computing experts Pakistan, database design specialists Pakistan, UI UX designers Pakistan, frontend backend developers Pakistan, full stack web development Pakistan, software house Peshawar, IT solutions Pakistan, digital transformation Pakistan, healthcare IT specialists Pakistan, medical platform developers Pakistan, clinic management software Pakistan, hospital management systems Pakistan, lab management software Pakistan, pharmacy management systems Pakistan, telemedicine app developers Pakistan, health tech startups Pakistan, Pakistani software engineers, Peshawar tech companies, KPK software developers, Pakistan IT industry, software development services Pakistan, web design development Pakistan, app development company Pakistan, custom software solutions Pakistan, business software development Pakistan, healthcare technology Pakistan, medical software solutions Pakistan, digital health platforms Pakistan, Pakistani development agencies, top coding experts Pakistan, software consultants Pakistan, tech entrepreneurs Pakistan, programming experts Pakistan, development services Pakistan, custom applications Pakistan, software outsourcing Pakistan, Pakistan software market, IT services Pakistan, technology solutions Pakistan, who developed Sehatkor.pk, Sehatkor.pk creator, Sehatkor.pk developer team, Abuzar Sehatkor developer, Syed Haris Shah Sehatkor developer, ASH Cloud Sehatkor developers, Sehatkor.pk programming team, Sehatkor.pk tech team, Sehatkor.pk software engineers, developer of Sehatkor.pk, Sehatkor.pk web developers, Sehatkor.pk app developers, Sehatkor.pk backend developers, Sehatkor.pk frontend developers, Abuzar Pakistan developer, Haris Shah Pakistan developer, ASH Cloud Peshawar, Pakistani software developers, Peshawar software house, best developers in Pakistan, healthcare platform developers Pakistan, medical app developers Pakistan, Peshawar developers, KPK software developers, search Abuzar CEO, search Syed Haris Shah, find Sehatkor developers, Abuzar software engineer Pakistan, Syed Haris Shah developer Pakistan, CEO ASH Cloud Pakistan"
                canonical="https://sehatkor.pk/developers"
                jsonLd={jsonLd}
                type="website"
                image="https://sehatkor.pk/developers-og-image.jpg"
            />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-white via-blue-50/50 to-white overflow-hidden py-20 lg:py-24">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0.03,transparent_50%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#8b5cf6_0.03,transparent_50%)]"></div>
                </div>

                <div className="relative container mx-auto px-6">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
                            <Users className="w-4 h-4" />
                            Meet Our Development Team
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            The <span className="text-blue-600">Brilliant Minds</span> Behind <span className="text-blue-600">Sehatkor.pk</span>
                        </h1>

                        <p className="text-lg lg:text-xl text-gray-600 font-medium mb-8 max-w-3xl mx-auto">
                            Expert full-stack developers from ASH Cloud who built Pakistan's innovative healthcare platform.
                            Comprehensive expertise across web applications, mobile apps, desktop software, AI solutions,
                            cloud computing, and database systems for healthcare, e-commerce, enterprise, and custom business applications.
                        </p>

                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {["Full Stack", "Web & Mobile", "AI & Cloud", "All Platforms"].map((keyword) => (
                                <span key={keyword} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {keyword}
                                </span>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {[
                                { label: "Projects Completed", value: "50+", icon: Code },
                                { label: "Technologies", value: "22+", icon: Brain },
                                { label: "Years Experience", value: "5+", icon: Award },
                                { label: "Happy Clients", value: "100+", icon: Users }
                            ].map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mb-3">
                                            <Icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                        <div className="text-xs text-gray-600">{stat.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ASH Cloud Company Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12 border border-blue-100">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">ASH Cloud</h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Leading software development company in Pakistan, specializing in healthcare solutions
                                    and innovative digital technologies.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Our Expertise</h3>
                                    <div className="space-y-4">
                                        {[
                                            { icon: Globe, title: "Web Applications", desc: "Modern, responsive web apps using latest technologies" },
                                            { icon: Smartphone, title: "Mobile Development", desc: "Native and cross-platform mobile solutions" },
                                            { icon: Database, title: "Backend Systems", desc: "Scalable server architecture and database design" },
                                            { icon: Brain, title: "AI Integration", desc: "Smart solutions with artificial intelligence" }
                                        ].map((service, i) => {
                                            const Icon = service.icon;
                                            return (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Icon className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{service.title}</h4>
                                                        <p className="text-sm text-gray-600">{service.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-100">
                                    <h4 className="text-lg font-bold text-gray-900 mb-4">Technology Stack</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "React.js", "Node.js", "MongoDB", "Express.js", "TypeScript",
                                            "Next.js", "Tailwind CSS", "PostgreSQL", "AWS", "Docker",
                                            "GraphQL", "Redux", "Socket.io", "JWT", "Git",
                                            "React Native", "Python Django", "JavaScript Expert", "Nuxt.js", "Vue.js",
                                            "Desktop Application (Offline/Online)", "Firebase"
                                        ].map((tech) => (
                                            <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developers Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Core Developers</h2>
                            <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
                            <p className="text-lg text-gray-600 mt-4">The talented individuals who built Sehatkor.pk</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Abuzar Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                                <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                                <div className="p-8">
                                    <div className="flex flex-col items-center text-center mb-6">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                                            <img
                                                src="/abuzar-ceo.jpg"
                                                alt="Abuzar - CEO of ASH Cloud"
                                                className="relative w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                                            />
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Abuzar</h3>
                                        <div className="flex flex-col gap-1 mb-4">
                                            <p className="text-blue-600 font-semibold">Software Engineer & Full Stack Developer</p>
                                            <p className="text-blue-500 font-medium text-sm">CEO of ASH Cloud</p>
                                        </div>

                                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4">
                                            ASH Cloud Founder
                                        </Badge>
                                    </div>

                                    <p className="text-gray-600 mb-6 text-center leading-relaxed">
                                        Passionate about creating innovative digital solutions across all technology platforms.
                                        Expert in web applications, mobile apps, desktop software, AI solutions, cloud computing,
                                        and database systems for healthcare, e-commerce, enterprise, and custom business applications.
                                        Leading ASH Cloud to deliver cutting-edge digital transformation solutions.
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Briefcase className="w-4 h-4 text-blue-500" />
                                            <span>5+ Years Experience</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-green-500" />
                                            <span>Peshawar, Pakistan</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Award className="w-4 h-4 text-purple-500" />
                                            <span>Full Stack Expert</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <a href="tel:+923429752032" className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium">
                                            <Phone className="w-4 h-4" />
                                            +923429752032
                                        </a>
                                        <a href="tel:+923178521144" className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium">
                                            <Phone className="w-4 h-4" />
                                            +923178521144
                                        </a>
                                        <a href="mailto:abuzarktk123@gmail.com" className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                            <Mail className="w-4 h-4" />
                                            abuzarktk123@gmail.com
                                        </a>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                                        <a href="https://abuzar-portfolio-lat.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm">
                                            <ExternalLink className="w-4 h-4" />
                                            Portfolio
                                        </a>
                                        <a href="https://ash-cloud-official-bpmr.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm">
                                            <Briefcase className="w-4 h-4" />
                                            ASH Cloud
                                        </a>
                                        <a href="https://www.linkedin.com/company/ashcloudofficial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm">
                                            <Linkedin className="w-4 h-4" />
                                            LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Syed Haris Shah Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                                <div className="h-2 bg-gradient-to-r from-green-600 to-blue-600"></div>
                                <div className="p-8">
                                    <div className="flex flex-col items-center text-center mb-6">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur-lg opacity-30"></div>
                                            <img
                                                src="/haris-photo.jpg"
                                                alt="Syed Haris Shah - Full Stack Developer"
                                                className="relative w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                                            />
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Syed Haris Shah</h3>
                                        <p className="text-green-600 font-semibold mb-4">Software Engineer & Full Stack Developer</p>

                                        <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white mb-4">
                                            ASH Cloud Team Member
                                        </Badge>
                                    </div>

                                    <p className="text-gray-600 mb-6 text-center leading-relaxed">
                                        A versatile full stack developer with expertise across multiple technology platforms.
                                        Specializing in web development, mobile applications, desktop software, frontend/backend systems,
                                        UI/UX design, and database management for healthcare, e-commerce, enterprise solutions,
                                        and custom business applications.
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Briefcase className="w-4 h-4 text-blue-500" />
                                            <span>3+ Years Experience</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-green-500" />
                                            <span>Peshawar, Pakistan</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Award className="w-4 h-4 text-purple-500" />
                                            <span>Full Stack Developer</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <a href="mailto:syedharryshah1@gmail.com" className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                            <Mail className="w-4 h-4" />
                                            syedharryshah1@gmail.com
                                        </a>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                                        <a href="https://portfolio22-lilac.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm">
                                            <ExternalLink className="w-4 h-4" />
                                            Portfolio
                                        </a>
                                        <a href="https://ash-cloud-official-bpmr.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm">
                                            <Briefcase className="w-4 h-4" />
                                            ASH Cloud
                                        </a>
                                        <a href="https://www.linkedin.com/company/ashcloudofficial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm">
                                            <Linkedin className="w-4 h-4" />
                                            LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
                            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Need Custom Development?</h2>
                            <p className="text-lg mb-6 opacity-90">
                                Partner with ASH Cloud for your next digital project. Healthcare, e-commerce,
                                or custom solutions - we've got you covered.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                    <a href="https://ash-cloud-official-bpmr.vercel.app/" target="_blank" rel="noopener noreferrer">
                                        Visit ASH Cloud
                                    </a>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                    <a href="tel:+923429752032">
                                        Call Now
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DevelopersPage;
