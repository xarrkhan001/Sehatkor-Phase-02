import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Shield,
    Lock,
    Eye,
    Database,
    Share2,
    Cookie,
    UserCheck,
    FileText,
    AlertCircle,
    Mail,
    Phone
} from "lucide-react";

const PrivacyPolicyPage = () => {
    const sections = [
        {
            icon: FileText,
            title: "Information We Collect",
            content: [
                {
                    subtitle: "Personal Information",
                    text: "When you register on Sehatkor, we collect personal information including your name, email address, phone number, date of birth, gender, and address. Healthcare providers may also provide professional credentials, licenses, and qualification documents."
                },
                {
                    subtitle: "Health Information",
                    text: "We may collect health-related information you provide when booking appointments, such as medical history, symptoms, and consultation notes. This information is encrypted and stored securely."
                },
                {
                    subtitle: "Usage Data",
                    text: "We automatically collect information about how you use our platform, including your IP address, browser type, device information, pages visited, and time spent on pages."
                },
                {
                    subtitle: "Payment Information",
                    text: "When you make payments through our platform, we collect payment information processed securely through third-party payment processors (EasyPaisa, JazzCash). We do not store complete credit card or bank account numbers."
                }
            ]
        },
        {
            icon: Database,
            title: "How We Use Your Information",
            content: [
                {
                    subtitle: "Service Delivery",
                    text: "We use your information to provide, maintain, and improve our services, including facilitating appointments, processing payments, and enabling communication between patients and healthcare providers."
                },
                {
                    subtitle: "Communication",
                    text: "We may use your contact information to send you appointment confirmations, reminders, service updates, and important notifications about your account."
                },
                {
                    subtitle: "Platform Improvement",
                    text: "We analyze usage data to understand how users interact with our platform, identify areas for improvement, and develop new features."
                },
                {
                    subtitle: "Legal Compliance",
                    text: "We may use your information to comply with legal obligations, respond to lawful requests from authorities, and protect our rights and the rights of our users."
                }
            ]
        },
        {
            icon: Share2,
            title: "Information Sharing",
            content: [
                {
                    subtitle: "Healthcare Providers",
                    text: "When you book an appointment, we share necessary information with the healthcare provider to facilitate your consultation. This includes your name, contact information, and any medical information you provide."
                },
                {
                    subtitle: "Service Providers",
                    text: "We may share information with trusted third-party service providers who assist us in operating our platform, such as payment processors, cloud storage providers, and analytics services. These providers are contractually obligated to protect your information."
                },
                {
                    subtitle: "Legal Requirements",
                    text: "We may disclose your information if required by law, court order, or government regulation, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others."
                },
                {
                    subtitle: "Business Transfers",
                    text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections."
                }
            ]
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                {
                    subtitle: "Encryption",
                    text: "We use industry-standard encryption (SSL/TLS) to protect data transmitted between your device and our servers. Sensitive health information is encrypted at rest using AES-256 encryption."
                },
                {
                    subtitle: "Access Controls",
                    text: "We implement strict access controls to ensure that only authorized personnel can access your personal information. All employees and contractors are bound by confidentiality agreements."
                },
                {
                    subtitle: "Regular Audits",
                    text: "We conduct regular security audits and vulnerability assessments to identify and address potential security risks."
                },
                {
                    subtitle: "Secure Infrastructure",
                    text: "Our platform is hosted on secure cloud infrastructure with multiple layers of protection, including firewalls, intrusion detection systems, and regular backups."
                }
            ]
        },
        {
            icon: UserCheck,
            title: "Your Rights",
            content: [
                {
                    subtitle: "Access and Correction",
                    text: "You have the right to access your personal information and request corrections if it is inaccurate or incomplete. You can update most information through your account settings."
                },
                {
                    subtitle: "Data Deletion",
                    text: "You can request deletion of your account and personal information at any time. We will delete your data within 30 days, except where we are required to retain it for legal or regulatory purposes."
                },
                {
                    subtitle: "Data Portability",
                    text: "You have the right to request a copy of your personal information in a structured, machine-readable format."
                },
                {
                    subtitle: "Opt-Out",
                    text: "You can opt out of marketing communications at any time by clicking the unsubscribe link in emails or adjusting your notification preferences in your account settings."
                }
            ]
        },
        {
            icon: Cookie,
            title: "Cookies and Tracking",
            content: [
                {
                    subtitle: "Essential Cookies",
                    text: "We use essential cookies to enable core functionality of our platform, such as maintaining your login session and remembering your preferences."
                },
                {
                    subtitle: "Analytics Cookies",
                    text: "We use analytics cookies to understand how users interact with our platform and improve user experience. You can disable these cookies in your browser settings."
                },
                {
                    subtitle: "Third-Party Cookies",
                    text: "Some third-party services we use (such as payment processors) may set their own cookies. We do not control these cookies and recommend reviewing their privacy policies."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Helmet>
                <title>Privacy Policy - Sehatkor | Data Protection & Privacy Information</title>
                <meta
                    name="description"
                    content="Read Sehatkor's privacy policy. Learn how we collect, use, protect, and share your personal and health information. Your privacy and data security are our top priorities."
                />
                <meta
                    name="keywords"
                    content="sehatkor privacy policy, data protection, privacy information, healthcare data privacy, GDPR compliance, data security, personal information protection, health information privacy"
                />
                <link rel="canonical" href="https://sehatkor.pk/privacy" />
                <meta name="robots" content="index, follow" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Privacy Policy - Sehatkor",
                        "description": "Sehatkor's privacy policy explaining how we collect, use, and protect user data",
                        "url": "https://sehatkor.pk/privacy",
                        "publisher": {
                            "@type": "Organization",
                            "name": "Sehatkor",
                            "url": "https://sehatkor.pk"
                        }
                    })}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="relative py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                        Your Privacy Matters
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg opacity-90">
                        How we collect, use, and protect your personal information
                    </p>
                    <p className="text-sm mt-2 opacity-75">
                        Last Updated: January 25, 2026
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Introduction */}
                    <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">Our Commitment to Your Privacy</h2>
                                    <p className="text-gray-700 leading-relaxed mb-3">
                                        At Sehatkor, we are committed to protecting your privacy and ensuring the security of your personal and
                                        health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                                        when you use our platform.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        By using Sehatkor, you agree to the collection and use of information in accordance with this policy.
                                        If you do not agree with our policies and practices, please do not use our services.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy Sections */}
                    <div className="space-y-8">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <Card key={index} className="border shadow-sm hover:shadow-md transition-all">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Icon className="w-6 h-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                                            </div>
                                        </div>

                                        <div className="space-y-6 ml-16">
                                            {section.content.map((item, idx) => (
                                                <div key={idx}>
                                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.subtitle}</h4>
                                                    <p className="text-gray-700 leading-relaxed">{item.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Additional Sections */}
                    <div className="mt-12 space-y-8">
                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <h3 className="text-xl font-bold text-gray-900">Data Retention</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed ml-10">
                                    We retain your personal information for as long as necessary to provide our services and comply with legal
                                    obligations. When you delete your account, we will delete or anonymize your personal information within 30 days,
                                    except where we are required to retain it for legal, regulatory, or security purposes. Health information may
                                    be retained for longer periods as required by medical record retention laws.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <h3 className="text-xl font-bold text-gray-900">Children's Privacy</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed ml-10">
                                    Our services are not intended for children under the age of 13. We do not knowingly collect personal information
                                    from children under 13. If you are a parent or guardian and believe your child has provided us with personal
                                    information, please contact us, and we will delete such information from our systems.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <Share2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <h3 className="text-xl font-bold text-gray-900">International Data Transfers</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed ml-10">
                                    Your information may be transferred to and maintained on servers located outside of Pakistan. By using our
                                    services, you consent to the transfer of your information to countries that may have different data protection
                                    laws than Pakistan. We ensure that appropriate safeguards are in place to protect your information in accordance
                                    with this Privacy Policy.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <h3 className="text-xl font-bold text-gray-900">Changes to This Privacy Policy</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed ml-10">
                                    We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory,
                                    or operational reasons. We will notify you of any material changes by posting the new Privacy Policy on this page
                                    and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-green-200 bg-green-50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <Mail className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                    <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
                                </div>
                                <div className="ml-10 space-y-3">
                                    <p className="text-gray-700 leading-relaxed">
                                        If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                                        please contact us:
                                    </p>
                                    <div className="space-y-2 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-green-600" />
                                            <span>Email: <a href="mailto:privacy@sehatkor.pk" className="text-blue-600 hover:underline">privacy@sehatkor.pk</a></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-600" />
                                            <span>Contact Page: <a href="/contact" className="text-blue-600 hover:underline">sehatkor.pk/contact</a></span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Urdu Translation */}
                    <Card className="mt-12 border-2 border-purple-200 bg-purple-50">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">رازداری کی پالیسی - اردو میں</h3>
                            <div className="text-gray-700 leading-loose" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl", textAlign: "right" }}>
                                <p className="mb-4">
                                    صحت کور میں، ہم آپ کی رازداری کی حفاظت اور آپ کی ذاتی اور صحت کی معلومات کی حفاظت کے لیے پرعزم ہیں۔
                                </p>
                                <p className="mb-4">
                                    ہم آپ کی معلومات کو محفوظ رکھنے کے لیے جدید ترین خفیہ کاری اور حفاظتی اقدامات استعمال کرتے ہیں۔
                                </p>
                                <p className="mb-4">
                                    آپ کی ذاتی معلومات صرف طبی خدمات فراہم کرنے کے لیے استعمال کی جاتی ہیں اور آپ کی اجازت کے بغیر کسی تیسرے فریق کے ساتھ شیئر نہیں کی جاتیں۔
                                </p>
                                <p>
                                    مزید معلومات کے لیے یا اپنی رازداری کے حقوق کے بارے میں سوالات کے لیے، براہ کرم ہم سے رابطہ کریں۔
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
