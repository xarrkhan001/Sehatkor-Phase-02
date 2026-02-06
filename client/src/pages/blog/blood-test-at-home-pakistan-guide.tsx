import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Home, TestTube, CheckCircle, Stethoscope } from "lucide-react";

const BloodTestAtHomePakistanPage = () => {
    const publishDate = "February 5, 2026";
    const readTime = "7 min read";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Blood Test at Home in Pakistan: Complete Guide 2026 - Home Sample Collection",
        "description": "Complete guide to blood test home service in Pakistan. Learn about home sample collection, prices, best labs, how it works, and book lab tests from home in Karachi, Lahore, Islamabad.",
        "image": "https://sehatkor.pk/blog/blood-test-home-pakistan.jpg",
        "author": {
            "@type": "Organization",
            "name": "Sehatkor Healthcare Platform"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Sehatkor",
            "logo": {
                "@type": "ImageObject",
                "url": "https://sehatkor.pk/logo.png"
            }
        },
        "datePublished": "2026-02-05",
        "dateModified": "2026-02-05"
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <SEO
                title="Blood Test at Home in Pakistan: Complete Guide 2026 - Home Sample Collection"
                description="Complete guide to blood test home service in Pakistan. Learn about home sample collection, available tests, prices, best labs (Chughtai, Essa, IDC), how to book, preparation tips, and get lab tests done at home in Karachi, Lahore, Islamabad."
                keywords="blood test at home Pakistan, home sample collection Pakistan, lab test home service Karachi, lab test home service Lahore, lab test home service Islamabad, Chughtai lab home service, Essa lab home collection, IDC lab home service, blood test home collection, CBC test home, home blood test Pakistan, lab test prices Pakistan, online lab booking Pakistan, گھر پر خون کا ٹیسٹ, home pathology service"
                canonical="https://sehatkor.pk/blog/blood-test-at-home-pakistan-guide"
                jsonLd={jsonLd}
                type="article"
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
                <div className="container mx-auto px-6">
                    <Link to="/blog" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Lab Services
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Home Healthcare
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Blood Test at Home in Pakistan: Complete Guide 2026
                        </h1>

                        <p className="text-xl text-white/90 mb-6">
                            Everything you need to know about home sample collection - prices, best labs, how to book, and get accurate lab tests done at your doorstep
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{publishDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{readTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Sehatkor Medical Team</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <article className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">

                    {/* Alert Box */}
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
                        <div className="flex items-start gap-3">
                            <Home className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-900 mb-2">🏠 Home Sample Collection - The New Normal</h3>
                                <p className="text-blue-800">
                                    In Pakistan, <strong>home sample collection</strong> has become increasingly popular, especially after COVID-19. Now you can get <strong>accurate lab tests done at home</strong> without visiting crowded labs. Save time, avoid traffic, and get tested in the comfort of your home!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="prose prose-lg max-w-none mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Gone are the days when you had to wake up early, fast overnight, and rush to a lab for blood tests. With <strong>home sample collection services</strong> (گھر پر خون کا ٹیسٹ), a trained phlebotomist comes to your home, collects your blood sample, and delivers it to the lab. You get results online within 24-48 hours - all without leaving your house!
                        </p>

                        <p className="text-lg text-gray-700 leading-relaxed">
                            This comprehensive guide covers everything about blood test at home in Pakistan - which labs offer this service, how much it costs, how to book, what tests are available, and tips to ensure accurate results.
                        </p>
                    </div>

                    {/* Benefits */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            Why Choose Home Sample Collection?
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                                <h3 className="font-bold text-green-900 mb-4">✅ Advantages:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✓ <strong>Convenience:</strong> No need to visit lab, save time</li>
                                    <li>✓ <strong>Comfort:</strong> Get tested in your own home</li>
                                    <li>✓ <strong>Safety:</strong> Avoid crowded waiting rooms</li>
                                    <li>✓ <strong>Flexible timing:</strong> Choose your preferred time slot</li>
                                    <li>✓ <strong>Elderly & sick-friendly:</strong> No travel needed</li>
                                    <li>✓ <strong>Family packages:</strong> Test whole family at once</li>
                                    <li>✓ <strong>Privacy:</strong> Confidential testing at home</li>
                                    <li>✓ <strong>Same accuracy:</strong> Results as accurate as lab visit</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-4">👥 Perfect For:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Elderly patients:</strong> Difficult to travel</li>
                                    <li>• <strong>Bedridden patients:</strong> Cannot visit lab</li>
                                    <li>• <strong>Busy professionals:</strong> No time for lab visits</li>
                                    <li>• <strong>Pregnant women:</strong> Avoid travel hassle</li>
                                    <li>• <strong>Children:</strong> More comfortable at home</li>
                                    <li>• <strong>Chronic disease patients:</strong> Regular monitoring needed</li>
                                    <li>• <strong>Post-surgery patients:</strong> Recovery at home</li>
                                    <li>• <strong>Families:</strong> Test everyone together</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How It Works */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">📱 How Home Sample Collection Works</h2>

                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-6">Simple 5-Step Process:</h3>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-2">Book Online or Call</h4>
                                            <p className="text-gray-700 text-sm">
                                                Visit lab website/app or call their helpline. Select tests you need. Choose date and time slot (usually 6 AM - 10 PM).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-2">Provide Details</h4>
                                            <p className="text-gray-700 text-sm">
                                                Enter your name, age, gender, address, phone number. Upload prescription if required. Confirm booking.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-2">Phlebotomist Arrives</h4>
                                            <p className="text-gray-700 text-sm">
                                                Trained phlebotomist (sample collector) comes to your home at scheduled time. They bring all equipment (needles, tubes, etc.).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                            4
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-2">Sample Collection</h4>
                                            <p className="text-gray-700 text-sm">
                                                Phlebotomist collects blood sample (takes 2-5 minutes). Sample is labeled and stored properly. You pay (cash or card).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                            5
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-2">Get Results</h4>
                                            <p className="text-gray-700 text-sm">
                                                Sample sent to lab for testing. Results available in 24-48 hours (some tests take longer). Download report online or get hard copy delivered.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Available Tests */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🔬 Tests Available for Home Collection</h2>

                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4">Most Common Tests (90% of bookings):</h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="border-l-4 border-blue-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">1. Complete Blood Count (CBC)</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>What it checks:</strong> Red cells, white cells, platelets, hemoglobin</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Used for:</strong> Anemia, infections, dengue, general health</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 500-1,200</p>
                                    </div>

                                    <div className="border-l-4 border-green-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">2. Lipid Profile</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>What it checks:</strong> Cholesterol, LDL, HDL, triglycerides</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Used for:</strong> Heart disease risk, cholesterol monitoring</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 800-2,000</p>
                                    </div>

                                    <div className="border-l-4 border-purple-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">3. Blood Sugar Tests</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Types:</strong> Fasting, Random, HbA1c</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Used for:</strong> Diabetes screening, monitoring</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 200-2,000 (depending on type)</p>
                                    </div>

                                    <div className="border-l-4 border-red-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">4. Liver Function Test (LFT)</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>What it checks:</strong> ALT, AST, bilirubin, albumin</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Used for:</strong> Liver health, hepatitis monitoring</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 1,000-2,500</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="border-l-4 border-orange-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">5. Kidney Function Test (KFT)</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>What it checks:</strong> Creatinine, urea, uric acid</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Used for:</strong> Kidney health monitoring</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 1,000-2,500</p>
                                    </div>

                                    <div className="border-l-4 border-pink-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">6. Thyroid Profile</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>What it checks:</strong> TSH, T3, T4</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Used for:</strong> Thyroid disorders, weight issues</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 1,500-3,500</p>
                                    </div>

                                    <div className="border-l-4 border-yellow-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">7. Vitamin D Test</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>What it checks:</strong> Vitamin D levels</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Used for:</strong> Bone health, fatigue, immunity</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 2,000-4,000</p>
                                    </div>

                                    <div className="border-l-4 border-teal-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">8. Hepatitis Screening</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Tests:</strong> HBsAg, Anti-HCV</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Used for:</strong> Hepatitis B & C detection</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 800-2,500 (per test)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                            <h3 className="font-bold text-gray-900 mb-4">Health Packages (Best Value):</h3>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Basic Health Package</h4>
                                    <p className="text-gray-700 text-sm mb-2">
                                        <strong>Includes:</strong> CBC, Blood Sugar, Lipid Profile, LFT, KFT, Urine R/E
                                    </p>
                                    <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 3,000-6,000 (saves 30-40%)</p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Diabetes Package</h4>
                                    <p className="text-gray-700 text-sm mb-2">
                                        <strong>Includes:</strong> Fasting Sugar, HbA1c, Lipid Profile, KFT, Urine Microalbumin
                                    </p>
                                    <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 4,000-7,000</p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Heart Health Package</h4>
                                    <p className="text-gray-700 text-sm mb-2">
                                        <strong>Includes:</strong> Lipid Profile, Cardiac Enzymes, ECG, Blood Sugar, CBC
                                    </p>
                                    <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 5,000-10,000</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Best Labs */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🏥 Best Labs Offering Home Sample Collection in Pakistan</h2>

                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-blue-900">1. Chughtai Lab</h3>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">Most Popular</span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-gray-700"><strong>Coverage:</strong> All major cities (Karachi, Lahore, Islamabad, Faisalabad, Multan, etc.)</p>
                                    <p className="text-gray-700"><strong>Home Service Charges:</strong> PKR 300-500 (free for orders above PKR 3,000)</p>
                                    <p className="text-gray-700"><strong>Booking:</strong> Website, app, helpline 042-111-456-789</p>
                                    <p className="text-gray-700"><strong>Report Time:</strong> 24-48 hours (most tests)</p>
                                    <p className="text-gray-700"><strong>Pros:</strong> Largest network, reliable, online reports, good customer service</p>
                                </div>

                                <Link to="/labs">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        Book Chughtai Lab
                                    </Button>
                                </Link>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-green-900">2. Essa Laboratory</h3>
                                    <span className="px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-semibold">Karachi</span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-gray-700"><strong>Coverage:</strong> Karachi (all areas)</p>
                                    <p className="text-gray-700"><strong>Home Service Charges:</strong> PKR 300-400 (free for orders above PKR 2,500)</p>
                                    <p className="text-gray-700"><strong>Booking:</strong> Website, app, helpline 021-111-372-372</p>
                                    <p className="text-gray-700"><strong>Report Time:</strong> Same day for urgent tests, 24 hours for routine</p>
                                    <p className="text-gray-700"><strong>Pros:</strong> Fast service, competitive prices, good in Karachi</p>
                                </div>

                                <Link to="/labs">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                                        Book Essa Lab
                                    </Button>
                                </Link>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-purple-900">3. IDC (Islamabad Diagnostic Centre)</h3>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-sm font-semibold">Islamabad/Rawalpindi</span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-gray-700"><strong>Coverage:</strong> Islamabad, Rawalpindi, Lahore</p>
                                    <p className="text-gray-700"><strong>Home Service Charges:</strong> PKR 400-600 (free for orders above PKR 4,000)</p>
                                    <p className="text-gray-700"><strong>Booking:</strong> Website, app, helpline 051-111-111-432</p>
                                    <p className="text-gray-700"><strong>Report Time:</strong> 24-48 hours</p>
                                    <p className="text-gray-700"><strong>Pros:</strong> High accuracy, modern equipment, good reputation</p>
                                </div>

                                <Link to="/labs">
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                        Book IDC Lab
                                    </Button>
                                </Link>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-orange-200">
                                <h3 className="text-xl font-bold text-orange-900 mb-4">4. Other Reliable Labs:</h3>

                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Aga Khan Laboratory:</strong> Karachi - Premium service, high accuracy</li>
                                    <li>• <strong>Shaukat Khanum Lab:</strong> Lahore, Karachi - Excellent quality, subsidized rates</li>
                                    <li>• <strong>Excel Lab:</strong> Karachi - Good service, competitive prices</li>
                                    <li>• <strong>Hashmanis Hospital Lab:</strong> Karachi - Reliable, home service available</li>
                                    <li>• <strong>Shifa Lab:</strong> Islamabad - Part of Shifa Hospital, good quality</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">💰 Home Sample Collection Charges</h2>

                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                            <h3 className="font-bold text-gray-900 mb-4">Typical Charges:</h3>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">Home Visit Fee:</h4>
                                        <span className="text-orange-700 font-bold">PKR 300-600</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">One-time charge for phlebotomist visit (regardless of number of tests)</p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4 border border-green-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-green-900">FREE Home Service If:</h4>
                                        <span className="text-green-700 font-bold">PKR 0</span>
                                    </div>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• Test bill is above PKR 2,500-4,000 (varies by lab)</li>
                                        <li>• You book a health package</li>
                                        <li>• Special promotions/discounts</li>
                                    </ul>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">💡 Money-Saving Tips:</h4>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>✓ Book multiple tests together to cross free home service threshold</li>
                                        <li>✓ Choose health packages (save 30-40% vs individual tests)</li>
                                        <li>✓ Test whole family together (one home visit fee for all)</li>
                                        <li>✓ Look for seasonal discounts (Ramadan, New Year, etc.)</li>
                                        <li>✓ Use Sehatkor to compare prices across labs</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Preparation Tips */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">📋 Preparation Tips for Accurate Results</h2>

                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-4">For Fasting Tests (Lipid Profile, Fasting Sugar, etc.):</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✓ <strong>Fast for 8-12 hours</strong> before sample collection</li>
                                    <li>✓ <strong>Last meal:</strong> Light dinner by 9 PM, sample collection at 7-8 AM</li>
                                    <li>✓ <strong>Water is allowed:</strong> You can drink plain water</li>
                                    <li>✓ <strong>No tea/coffee:</strong> Even without sugar, avoid</li>
                                    <li>✓ <strong>No smoking:</strong> Can affect results</li>
                                    <li>✓ <strong>Regular medications:</strong> Ask doctor if you should take them</li>
                                </ul>
                            </div>

                            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                                <h3 className="font-bold text-green-900 mb-4">For Non-Fasting Tests (CBC, Thyroid, etc.):</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✓ <strong>No fasting needed:</strong> Eat normally</li>
                                    <li>✓ <strong>Any time of day:</strong> Morning or evening, doesn't matter</li>
                                    <li>✓ <strong>Stay hydrated:</strong> Drink water, makes blood draw easier</li>
                                </ul>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                                <h3 className="font-bold text-purple-900 mb-4">General Tips:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✓ <strong>Wear loose sleeves:</strong> Easy to roll up for blood draw</li>
                                    <li>✓ <strong>Stay calm:</strong> Anxiety can affect some test results</li>
                                    <li>✓ <strong>Inform about medications:</strong> Tell phlebotomist what medicines you're taking</li>
                                    <li>✓ <strong>Keep prescription ready:</strong> Some tests require doctor's prescription</li>
                                    <li>✓ <strong>Payment ready:</strong> Keep cash or card ready</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Book Lab Test CTA */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <TestTube className="w-8 h-8" />
                            Book Blood Test at Home on Sehatkor
                        </h2>
                        <p className="text-white/90 mb-6">
                            Compare prices across top labs in Pakistan. Book home sample collection with verified labs. Get reports online within 24-48 hours.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/labs">
                                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                                    Book Lab Tests Now
                                </Button>
                            </Link>
                            <Link to="/search?type=lab">
                                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                                    Compare Lab Prices
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* FAQs */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">❓ Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "Is home sample collection as accurate as lab visit?",
                                    a: "Yes! Accuracy is the same. Labs use the same equipment, trained phlebotomists, and proper sample handling. The only difference is WHERE the sample is collected, not HOW it's tested."
                                },
                                {
                                    q: "How long does sample collection take?",
                                    a: "Usually 2-5 minutes for blood draw. Total visit (greeting, paperwork, collection, payment) takes 10-15 minutes."
                                },
                                {
                                    q: "Can I book for same day?",
                                    a: "Yes, most labs offer same-day service if you book early (before 10 AM). However, booking 1 day in advance is recommended for preferred time slots."
                                },
                                {
                                    q: "What if I need to cancel or reschedule?",
                                    a: "Call lab helpline at least 2 hours before scheduled time. Most labs allow free rescheduling. Last-minute cancellations may incur charges."
                                },
                                {
                                    q: "Do I need a doctor's prescription?",
                                    a: "For most routine tests (CBC, sugar, cholesterol), no prescription needed. For specialized tests (hormones, tumor markers), prescription may be required. Check with lab when booking."
                                },
                                {
                                    q: "How do I get my reports?",
                                    a: "Reports are uploaded to lab's website/app. You'll receive SMS/email when ready. You can download PDF or request hard copy delivery (may have extra charges)."
                                },
                                {
                                    q: "Can multiple family members get tested together?",
                                    a: "Yes! This is actually recommended. You pay only ONE home visit fee for the whole family. Great way to save money on annual health checkups."
                                },
                                {
                                    q: "Is it safe during COVID-19?",
                                    a: "Yes. Phlebotomists wear masks, gloves, and follow safety protocols. They sanitize before and after. You can request them to sanitize hands in front of you."
                                }
                            ].map((faq, index) => (
                                <div key={index} className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-2">Q{index + 1}: {faq.q}</h3>
                                    <p className="text-gray-700">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Conclusion */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">🎯 Key Takeaways</h2>
                        <ul className="space-y-2 mb-6">
                            <li>✓ Home sample collection is convenient, safe, and as accurate as lab visits</li>
                            <li>✓ Major labs (Chughtai, Essa, IDC) offer home service in all major cities</li>
                            <li>✓ Home visit charges: PKR 300-600 (FREE for orders above PKR 2,500-4,000)</li>
                            <li>✓ Most common tests available: CBC, Sugar, Cholesterol, Thyroid, Liver, Kidney</li>
                            <li>✓ Health packages save 30-40% vs individual tests</li>
                            <li>✓ Fast 8-12 hours for fasting tests, no fasting for CBC/Thyroid</li>
                            <li>✓ Reports available online in 24-48 hours</li>
                            <li>✓ Book whole family together to save on home visit charges</li>
                        </ul>

                        <Link to="/labs">
                            <Button className="bg-white text-blue-600 hover:bg-gray-100">
                                Book Lab Tests at Home Now
                            </Button>
                        </Link>
                    </div>

                </div>
            </article>
        </div>
    );
};

export default BloodTestAtHomePakistanPage;
