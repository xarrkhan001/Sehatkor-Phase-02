import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, FileText, Scale, Info } from "lucide-react";

const DisclaimerPage = () => {
    const disclaimers = [
        {
            icon: Shield,
            title: "Medical Information Disclaimer",
            content: "The information provided on Sehatkor is for general informational and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this platform."
        },
        {
            icon: AlertTriangle,
            title: "No Doctor-Patient Relationship",
            content: "Use of this platform does not create a doctor-patient relationship between you and Sehatkor or any healthcare provider listed on the platform. The platform merely facilitates connections between patients and healthcare providers. Any medical advice, diagnosis, or treatment should be obtained directly from a qualified healthcare professional."
        },
        {
            icon: FileText,
            title: "Provider Information Accuracy",
            content: "While we strive to verify all healthcare providers on our platform, Sehatkor does not guarantee the accuracy, completeness, or reliability of any information provided by healthcare providers. Users are responsible for verifying the credentials and qualifications of healthcare providers before engaging their services."
        },
        {
            icon: Scale,
            title: "Limitation of Liability",
            content: "Sehatkor shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, or use of, the platform or any healthcare services obtained through the platform. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses."
        },
        {
            icon: Info,
            title: "Third-Party Services",
            content: "Our platform may contain links to third-party websites or services that are not owned or controlled by Sehatkor. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that Sehatkor shall not be responsible or liable for any damage or loss caused by your use of any such content or services."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <Helmet>
                <title>Disclaimer - Sehatkor | Medical Information & Legal Disclaimers</title>
                <meta
                    name="description"
                    content="Read Sehatkor's medical disclaimer, terms of use, and legal information. Understand the limitations and proper use of our healthcare platform. Important legal notices for users."
                />
                <meta
                    name="keywords"
                    content="sehatkor disclaimer, medical disclaimer, healthcare platform disclaimer, legal disclaimer, terms of use, liability disclaimer, medical information disclaimer"
                />
                <link rel="canonical" href="https://sehatkor.pk/disclaimer" />
                <meta name="robots" content="index, follow" />
            </Helmet>

            {/* Hero Section */}
            <section className="relative py-16 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                        Legal Information
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Disclaimer
                    </h1>
                    <p className="text-lg opacity-90">
                        Important legal information and disclaimers for Sehatkor users
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
                                <Info className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">Important Notice</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        Please read this disclaimer carefully before using Sehatkor's services. By accessing or using our platform,
                                        you acknowledge that you have read, understood, and agree to be bound by this disclaimer. If you do not agree
                                        with any part of this disclaimer, please do not use our services.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disclaimer Sections */}
                    <div className="space-y-6">
                        {disclaimers.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Card key={index} className="border shadow-sm hover:shadow-md transition-all">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <Icon className="w-6 h-6 text-gray-700" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                                <p className="text-gray-700 leading-relaxed">{item.content}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Additional Disclaimers */}
                    <div className="mt-12 space-y-8">
                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Emergency Situations</h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    <strong className="text-red-600">If you are experiencing a medical emergency, call your local emergency number (1122 in Pakistan)
                                        or go to the nearest emergency room immediately.</strong> Do not rely on information from this platform or attempt to contact
                                    healthcare providers through this platform in case of a medical emergency.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">User Responsibilities</h3>
                                <p className="text-gray-700 leading-relaxed mb-3">
                                    Users of Sehatkor are responsible for:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Verifying the credentials and qualifications of healthcare providers before engaging their services</li>
                                    <li>Providing accurate and complete information to healthcare providers</li>
                                    <li>Following medical advice and treatment plans as prescribed by qualified healthcare professionals</li>
                                    <li>Reporting any concerns or issues with healthcare providers to the appropriate authorities</li>
                                    <li>Maintaining the confidentiality of their account credentials</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Availability</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Sehatkor does not guarantee that the platform will be available at all times or that it will be free from errors,
                                    viruses, or other harmful components. We reserve the right to modify, suspend, or discontinue any aspect of the
                                    platform at any time without prior notice.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Governing Law</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    This disclaimer and your use of the platform shall be governed by and construed in accordance with the laws of
                                    the Islamic Republic of Pakistan. Any disputes arising out of or relating to this disclaimer or your use of the
                                    platform shall be subject to the exclusive jurisdiction of the courts of Pakistan.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Changes to This Disclaimer</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    We reserve the right to update or modify this disclaimer at any time without prior notice. Your continued use of
                                    the platform following any changes constitutes your acceptance of the updated disclaimer. We encourage you to
                                    review this page periodically for any changes.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    If you have any questions or concerns about this disclaimer, please contact us through our{" "}
                                    <a href="/contact" className="text-blue-600 hover:underline font-medium">Contact Page</a>.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Urdu Translation */}
                    <Card className="mt-12 border-2 border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">اردو میں اہم معلومات</h3>
                            <div className="text-gray-700 leading-loose" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl", textAlign: "right" }}>
                                <p className="mb-4">
                                    صحت کور پلیٹ فارم پر فراہم کردہ معلومات صرف عمومی معلومات کے لیے ہیں۔ یہ پیشہ ورانہ طبی مشورے، تشخیص یا علاج کا متبادل نہیں ہے۔
                                </p>
                                <p className="mb-4">
                                    کسی بھی طبی حالت کے بارے میں ہمیشہ اپنے ڈاکٹر یا دیگر قابل صحت فراہم کنندہ سے مشورہ کریں۔
                                </p>
                                <p className="font-bold text-red-600">
                                    ایمرجنسی کی صورت میں فوری طور پر 1122 پر کال کریں یا قریبی ہسپتال جائیں۔
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default DisclaimerPage;
