import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Share2, BookmarkPlus, AlertTriangle, Thermometer, Stethoscope, Home, Phone } from "lucide-react";

const DengueFeverPakistanPage = () => {
    const publishDate = "February 5, 2026";
    const readTime = "8 min read";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Dengue Fever in Pakistan: Complete Guide 2026 - Symptoms, Treatment & Prevention",
        "description": "Complete guide to dengue fever in Pakistan. Learn about symptoms, treatment options, prevention tips, and when to see a doctor. Updated for 2026 monsoon season.",
        "image": "https://sehatkor.pk/blog/dengue-fever-pakistan.jpg",
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
        "dateModified": "2026-02-05",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://sehatkor.pk/blog/dengue-fever-pakistan-complete-guide"
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <SEO
                title="Dengue Fever in Pakistan: Complete Guide 2026 - Symptoms, Treatment & Prevention"
                description="Complete guide to dengue fever in Pakistan. Learn about symptoms, treatment options, prevention tips, and when to see a doctor. Find dengue specialists near you on Sehatkor."
                keywords="dengue fever Pakistan, dengue symptoms, dengue treatment, dengue prevention, dengue test Pakistan, dengue doctor Karachi, dengue doctor Lahore, dengue fever Islamabad, monsoon diseases Pakistan, viral fever Pakistan, platelet count dengue, dengue hemorrhagic fever, dengue shock syndrome, mosquito borne diseases Pakistan"
                canonical="https://sehatkor.pk/blog/dengue-fever-pakistan-complete-guide"
                jsonLd={jsonLd}
                type="article"
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-12">
                <div className="container mx-auto px-6">
                    <Link to="/blog" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Health Alert
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Monsoon Season
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Dengue Fever in Pakistan: Complete Guide 2026
                        </h1>

                        <p className="text-xl text-white/90 mb-6">
                            Everything you need to know about dengue symptoms, treatment, and prevention in Pakistan
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
                    <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg mb-8">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-red-900 mb-2">⚠️ Dengue Alert - Monsoon Season 2026</h3>
                                <p className="text-red-800">
                                    Dengue cases are rising across Pakistan, especially in Karachi, Lahore, and Islamabad.
                                    If you experience high fever, severe headache, or body pain, consult a doctor immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="prose prose-lg max-w-none mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Dengue fever is one of the most common mosquito-borne diseases in Pakistan, affecting thousands of people every year,
                            especially during the monsoon season (July to October). With climate change and urbanization, dengue cases have been
                            increasing significantly in major cities like <strong>Karachi, Lahore, Islamabad, and Rawalpindi</strong>.
                        </p>

                        <p className="text-lg text-gray-700 leading-relaxed">
                            This comprehensive guide will help you understand dengue fever, recognize its symptoms early, know when to seek medical help,
                            and most importantly, how to prevent it. Early detection and proper treatment can save lives.
                        </p>
                    </div>

                    {/* Table of Contents */}
                    <div className="bg-blue-50 rounded-xl p-6 mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table of Contents</h2>
                        <ul className="space-y-2 text-gray-700">
                            <li>• <a href="#what-is-dengue" className="text-blue-600 hover:underline">What is Dengue Fever?</a></li>
                            <li>• <a href="#symptoms" className="text-blue-600 hover:underline">Dengue Symptoms in Pakistan</a></li>
                            <li>• <a href="#warning-signs" className="text-blue-600 hover:underline">Warning Signs of Severe Dengue</a></li>
                            <li>• <a href="#diagnosis" className="text-blue-600 hover:underline">Dengue Testing & Diagnosis</a></li>
                            <li>• <a href="#treatment" className="text-blue-600 hover:underline">Treatment Options</a></li>
                            <li>• <a href="#prevention" className="text-blue-600 hover:underline">Prevention Tips</a></li>
                            <li>• <a href="#when-to-see-doctor" className="text-blue-600 hover:underline">When to See a Doctor</a></li>
                            <li>• <a href="#faqs" className="text-blue-600 hover:underline">Frequently Asked Questions</a></li>
                        </ul>
                    </div>

                    {/* What is Dengue */}
                    <section id="what-is-dengue" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Thermometer className="w-8 h-8 text-red-600" />
                            What is Dengue Fever?
                        </h2>

                        <p className="text-gray-700 leading-relaxed mb-4">
                            Dengue fever is a viral infection transmitted by the <strong>Aedes aegypti mosquito</strong>. This mosquito is easily
                            recognizable by its black and white striped body and legs. Unlike malaria mosquitoes that bite at night, Aedes mosquitoes
                            are most active during early morning and before sunset.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">Key Facts About Dengue in Pakistan:</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>✓ <strong>Peak Season:</strong> July to October (monsoon season)</li>
                                <li>✓ <strong>Most Affected Cities:</strong> Karachi, Lahore, Islamabad, Rawalpindi, Peshawar</li>
                                <li>✓ <strong>Annual Cases:</strong> 10,000-50,000 reported cases (actual numbers may be higher)</li>
                                <li>✓ <strong>Mortality Rate:</strong> 1-2% if treated properly, up to 20% if untreated</li>
                                <li>✓ <strong>Recovery Time:</strong> 7-10 days for mild cases</li>
                            </ul>
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                            There are four types of dengue virus (DENV-1, DENV-2, DENV-3, DENV-4). Getting infected with one type provides lifelong
                            immunity to that type, but you can still get infected with the other three types. <strong>Second-time dengue infections
                                are usually more severe</strong> and can lead to dengue hemorrhagic fever or dengue shock syndrome.
                        </p>
                    </section>

                    {/* Symptoms */}
                    <section id="symptoms" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🌡️ Dengue Symptoms in Pakistan</h2>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            Dengue symptoms typically appear 4-10 days after being bitten by an infected mosquito. The illness usually lasts 2-7 days.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                                <h3 className="font-bold text-orange-900 mb-4">Early Symptoms (Days 1-3)</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>High Fever:</strong> 104°F (40°C) or higher</li>
                                    <li>• <strong>Severe Headache:</strong> Especially behind the eyes</li>
                                    <li>• <strong>Body Pain:</strong> Muscles, joints, and bones</li>
                                    <li>• <strong>Nausea & Vomiting:</strong> Loss of appetite</li>
                                    <li>• <strong>Fatigue:</strong> Extreme tiredness</li>
                                    <li>• <strong>Skin Rash:</strong> Red spots on skin</li>
                                </ul>
                            </div>

                            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                                <h3 className="font-bold text-red-900 mb-4">⚠️ Warning Signs (Days 3-7)</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Severe Abdominal Pain:</strong> Persistent stomach pain</li>
                                    <li>• <strong>Persistent Vomiting:</strong> Unable to keep fluids down</li>
                                    <li>• <strong>Bleeding:</strong> Nose, gums, or under skin</li>
                                    <li>• <strong>Blood in Urine/Stool:</strong> Dark or bloody discharge</li>
                                    <li>• <strong>Difficulty Breathing:</strong> Rapid or labored breathing</li>
                                    <li>• <strong>Extreme Weakness:</strong> Unable to stand or walk</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
                            <p className="text-gray-800">
                                <strong>Important:</strong> Dengue is often called "breakbone fever" (ہڈی توڑ بخار) in Urdu because of the severe
                                joint and muscle pain it causes. Many Pakistanis confuse dengue with regular flu or malaria, which can delay treatment.
                            </p>
                        </div>
                    </section>

                    {/* Warning Signs */}
                    <section id="warning-signs" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🚨 Warning Signs of Severe Dengue</h2>

                        <div className="bg-red-100 border-2 border-red-600 rounded-xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-red-900 mb-4">SEEK IMMEDIATE MEDICAL HELP IF YOU EXPERIENCE:</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <ul className="space-y-2 text-red-900">
                                    <li>⚠️ Severe abdominal pain or tenderness</li>
                                    <li>⚠️ Persistent vomiting (3+ times in 24 hours)</li>
                                    <li>⚠️ Bleeding from nose, gums, or skin</li>
                                    <li>⚠️ Blood in vomit, urine, or stool</li>
                                </ul>
                                <ul className="space-y-2 text-red-900">
                                    <li>⚠️ Difficulty breathing or rapid breathing</li>
                                    <li>⚠️ Cold or clammy skin</li>
                                    <li>⚠️ Extreme fatigue or restlessness</li>
                                    <li>⚠️ Sudden drop in platelet count</li>
                                </ul>
                            </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                            <strong>Critical Period:</strong> Days 3-7 after fever starts are the most dangerous. This is when severe dengue
                            (dengue hemorrhagic fever or dengue shock syndrome) can develop. During this time, even if fever decreases,
                            patients need close monitoring of platelet count and fluid intake.
                        </p>
                    </section>

                    {/* Diagnosis */}
                    <section id="diagnosis" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🔬 Dengue Testing & Diagnosis in Pakistan</h2>

                        <div className="bg-blue-50 rounded-lg p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4">Common Dengue Tests Available in Pakistan:</h3>

                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                    <h4 className="font-bold text-gray-900 mb-2">1. Dengue NS1 Antigen Test</h4>
                                    <p className="text-gray-700 mb-2">
                                        <strong>Best for:</strong> Early detection (Days 1-5 of fever)
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>Price in Pakistan:</strong> PKR 1,500 - 3,000
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Most accurate test in the first 5 days. Available at Chughtai Lab, Essa Lab, IDC, and most hospitals.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                    <h4 className="font-bold text-gray-900 mb-2">2. Dengue IgM/IgG Antibody Test</h4>
                                    <p className="text-gray-700 mb-2">
                                        <strong>Best for:</strong> Later detection (After Day 5)
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>Price in Pakistan:</strong> PKR 2,000 - 4,000
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Detects antibodies. IgM positive = recent infection, IgG positive = past infection.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                    <h4 className="font-bold text-gray-900 mb-2">3. Complete Blood Count (CBC)</h4>
                                    <p className="text-gray-700 mb-2">
                                        <strong>Best for:</strong> Monitoring platelet count
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>Price in Pakistan:</strong> PKR 500 - 1,500
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Essential for tracking platelet levels. Normal: 150,000-400,000. Dengue: Often drops below 100,000.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="font-bold text-green-900 mb-3">💡 Pro Tip for Pakistanis:</h3>
                            <p className="text-gray-700">
                                Many government hospitals in Pakistan offer <strong>FREE dengue testing</strong> during outbreak seasons.
                                Check with your nearest DHQ Hospital, THQ Hospital, or government diagnostic center. Private labs like
                                Chughtai, Essa, and IDC also offer home sample collection for dengue tests.
                            </p>
                        </div>
                    </section>

                    {/* Treatment */}
                    <section id="treatment" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">💊 Dengue Treatment in Pakistan</h2>

                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg mb-6">
                            <p className="text-gray-800 font-semibold">
                                ⚠️ IMPORTANT: There is NO specific antiviral medicine for dengue. Treatment focuses on managing symptoms
                                and preventing complications.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">✅ DO's - Recommended Treatment:</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <div>
                                            <strong>Rest:</strong> Complete bed rest is essential. Avoid physical exertion.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <div>
                                            <strong>Hydration:</strong> Drink plenty of fluids - water, ORS, coconut water, fresh juices.
                                            Aim for 3-4 liters per day.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <div>
                                            <strong>Paracetamol (Panadol):</strong> For fever and pain. Maximum 4 grams (8 tablets of 500mg) per day.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <div>
                                            <strong>Monitor Platelet Count:</strong> Get CBC test every 12-24 hours to track platelet levels.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <div>
                                            <strong>Light Diet:</strong> Eat easily digestible foods - porridge, soups, fruits, papaya.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-600">
                                <h3 className="font-bold text-red-900 mb-4">❌ DON'Ts - Avoid These:</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-600 font-bold">✗</span>
                                        <div>
                                            <strong>NO Aspirin or Ibuprofen (Brufen):</strong> These can increase bleeding risk. Only use Paracetamol.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-600 font-bold">✗</span>
                                        <div>
                                            <strong>NO Intramuscular Injections:</strong> Can cause bleeding. Prefer oral medications.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-600 font-bold">✗</span>
                                        <div>
                                            <strong>NO Self-Medication:</strong> Don't take antibiotics or steroids without doctor's advice.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-600 font-bold">✗</span>
                                        <div>
                                            <strong>NO Delay in Seeking Help:</strong> If platelets drop below 50,000, immediate hospitalization needed.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="font-bold text-gray-900 mb-4">🏥 When Hospitalization is Needed:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• Platelet count below 50,000</li>
                                    <li>• Severe abdominal pain or persistent vomiting</li>
                                    <li>• Signs of bleeding (nose, gums, skin)</li>
                                    <li>• Difficulty breathing or rapid breathing</li>
                                    <li>• Severe dehydration despite oral fluids</li>
                                    <li>• Pregnant women, elderly, or children with dengue</li>
                                    <li>• Patients with diabetes, heart disease, or other chronic conditions</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Prevention */}
                    <section id="prevention" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🛡️ Dengue Prevention Tips for Pakistan</h2>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            Prevention is better than cure. Since there's no vaccine widely available in Pakistan, protecting yourself from
                            mosquito bites is the best defense against dengue.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                                <h3 className="font-bold text-green-900 mb-4">🏠 At Home:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✓ Empty water containers weekly</li>
                                    <li>✓ Cover water storage tanks properly</li>
                                    <li>✓ Clean flower vases and change water daily</li>
                                    <li>✓ Remove stagnant water from coolers, pots</li>
                                    <li>✓ Use mosquito nets while sleeping</li>
                                    <li>✓ Install window screens</li>
                                    <li>✓ Use mosquito repellent coils/sprays</li>
                                    <li>✓ Keep surroundings clean and dry</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-4">👤 Personal Protection:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✓ Wear full-sleeve shirts and long pants</li>
                                    <li>✓ Use mosquito repellent creams/sprays</li>
                                    <li>✓ Avoid outdoor activities during dawn/dusk</li>
                                    <li>✓ Use mosquito nets for babies</li>
                                    <li>✓ Wear light-colored clothing (mosquitoes prefer dark colors)</li>
                                    <li>✓ Apply repellent on exposed skin</li>
                                    <li>✓ Keep windows/doors closed during peak hours</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-6">
                            <h3 className="font-bold text-purple-900 mb-4">🌿 Natural Dengue Prevention Methods:</h3>
                            <p className="text-gray-700 mb-3">
                                Many Pakistanis use these traditional methods alongside modern prevention:
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Plant tulsi (basil), neem, or lemongrass around your house</li>
                                <li>• Use neem oil as natural mosquito repellent</li>
                                <li>• Burn camphor or use camphor tablets in water</li>
                                <li>• Keep garlic cloves in water containers (mosquitoes avoid the smell)</li>
                                <li>• Use citronella candles or essential oils</li>
                            </ul>
                        </div>
                    </section>

                    {/* When to See Doctor */}
                    <section id="when-to-see-doctor" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Stethoscope className="w-8 h-8 text-blue-600" />
                            When to See a Doctor
                        </h2>

                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-300 mb-6">
                            <h3 className="text-xl font-bold text-red-900 mb-4">🚨 Seek Immediate Medical Attention If:</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <ul className="space-y-2 text-gray-800">
                                    <li>• Fever above 104°F (40°C) for more than 2 days</li>
                                    <li>• Severe headache with eye pain</li>
                                    <li>• Persistent vomiting (can't keep fluids down)</li>
                                    <li>• Severe abdominal pain</li>
                                </ul>
                                <ul className="space-y-2 text-gray-800">
                                    <li>• Any signs of bleeding</li>
                                    <li>• Extreme weakness or dizziness</li>
                                    <li>• Difficulty breathing</li>
                                    <li>• Cold, clammy skin</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4">🏥 Best Hospitals for Dengue Treatment in Pakistan:</h3>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Karachi:</h4>
                                    <p className="text-gray-700">
                                        Aga Khan University Hospital, Liaquat National Hospital, Ziauddin Hospital, Jinnah Hospital
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Lahore:</h4>
                                    <p className="text-gray-700">
                                        Shaukat Khanum Hospital, Services Hospital, Mayo Hospital, Jinnah Hospital Lahore
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Islamabad/Rawalpindi:</h4>
                                    <p className="text-gray-700">
                                        PIMS Hospital, Shifa International, Holy Family Hospital, Benazir Bhutto Hospital
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Find Dengue Specialists on Sehatkor
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Book verified doctors, get dengue tests at home, and find the nearest hospital on Sehatkor - Pakistan's #1 healthcare platform.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/search?type=doctor&specialty=infectious-disease">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Find Dengue Specialists
                                    </Button>
                                </Link>
                                <Link to="/labs">
                                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                        Book Dengue Test at Home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* FAQs */}
                    <section id="faqs" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">❓ Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Q1: Can dengue spread from person to person?</h3>
                                <p className="text-gray-700">
                                    <strong>No.</strong> Dengue does NOT spread directly from person to person. It only spreads through the bite of
                                    an infected Aedes mosquito. However, if a mosquito bites an infected person and then bites a healthy person,
                                    it can transmit the virus.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Q2: What is the normal platelet count, and when is it dangerous?</h3>
                                <p className="text-gray-700">
                                    <strong>Normal platelet count:</strong> 150,000 to 400,000 per microliter of blood.<br />
                                    <strong>Dengue concern:</strong> Below 100,000 (mild), below 50,000 (moderate), below 20,000 (severe - needs immediate hospitalization and possible platelet transfusion).
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Q3: Does papaya leaf juice really help increase platelets?</h3>
                                <p className="text-gray-700">
                                    <strong>Partially true.</strong> Some studies suggest papaya leaf extract may help increase platelet count,
                                    and many Pakistani doctors recommend it as a complementary treatment. However, it should NOT replace medical
                                    treatment. Always consult your doctor before using any home remedies.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Q4: Can I get dengue twice?</h3>
                                <p className="text-gray-700">
                                    <strong>Yes.</strong> There are 4 types of dengue virus. Getting infected with one type gives you lifelong immunity
                                    to that type only. You can still get infected with the other 3 types. Second-time dengue infections are usually
                                    more severe and can lead to dengue hemorrhagic fever.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Q5: Is there a dengue vaccine available in Pakistan?</h3>
                                <p className="text-gray-700">
                                    <strong>Limited availability.</strong> Dengvaxia vaccine is available in some private hospitals in Pakistan,
                                    but it's only recommended for people who have already had dengue once. It's not recommended for first-time prevention.
                                    Consult your doctor for more information.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Q6: How long does dengue immunity last?</h3>
                                <p className="text-gray-700">
                                    <strong>Lifelong for that specific type.</strong> If you get infected with DENV-1, you'll have lifelong immunity
                                    to DENV-1, but you can still get infected with DENV-2, DENV-3, or DENV-4.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Q7: What foods should I eat during dengue?</h3>
                                <p className="text-gray-700">
                                    <strong>Recommended foods:</strong> Papaya, pomegranate, kiwi, oranges, coconut water, fresh juices, porridge,
                                    soups, dal (lentils), boiled vegetables. Avoid oily, spicy, and heavy foods. Focus on easy-to-digest, nutritious meals.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Q8: How much does dengue treatment cost in Pakistan?</h3>
                                <p className="text-gray-700">
                                    <strong>Varies widely:</strong><br />
                                    • Government hospitals: Free to PKR 5,000-10,000<br />
                                    • Private hospitals (mild case): PKR 20,000-50,000<br />
                                    • Private hospitals (severe case with ICU): PKR 100,000-500,000+<br />
                                    • Dengue tests: PKR 1,500-4,000<br />
                                    • CBC test: PKR 500-1,500
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Conclusion */}
                    <section className="mb-12">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                            <h2 className="text-2xl font-bold mb-4">🎯 Key Takeaways</h2>
                            <ul className="space-y-2 mb-6">
                                <li>✓ Dengue is serious but treatable if detected early</li>
                                <li>✓ Watch for warning signs on days 3-7 after fever starts</li>
                                <li>✓ Only use Paracetamol for fever - NO Aspirin or Ibuprofen</li>
                                <li>✓ Stay hydrated - drink 3-4 liters of fluids daily</li>
                                <li>✓ Monitor platelet count every 12-24 hours</li>
                                <li>✓ Seek immediate help if platelets drop below 50,000</li>
                                <li>✓ Prevention is key - eliminate mosquito breeding sites</li>
                            </ul>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-white/90 mb-4">
                                    <strong>Remember:</strong> Early detection and proper medical care can prevent severe complications.
                                    Don't ignore symptoms or delay seeking medical help.
                                </p>
                                <Link to="/search">
                                    <Button className="bg-white text-blue-600 hover:bg-gray-100">
                                        Find Dengue Specialists Near You
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Share Section */}
                    <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 font-medium">Share this article:</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </Button>
                                <Button size="sm" variant="outline" className="gap-2">
                                    <BookmarkPlus className="w-4 h-4" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </article>

            {/* Related Articles */}
            <section className="bg-gray-50 py-12">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Related Articles</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Link to="/blog/malaria-pakistan-guide" className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                                <h3 className="font-bold text-gray-900 mb-2">Malaria in Pakistan: Complete Guide</h3>
                                <p className="text-gray-600 text-sm">Symptoms, treatment, and prevention tips</p>
                            </Link>
                            <Link to="/blog/typhoid-fever-pakistan" className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                                <h3 className="font-bold text-gray-900 mb-2">Typhoid Fever: What You Need to Know</h3>
                                <p className="text-gray-600 text-sm">Causes, symptoms, and treatment options</p>
                            </Link>
                            <Link to="/blog/monsoon-diseases-pakistan" className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                                <h3 className="font-bold text-gray-900 mb-2">Monsoon Diseases in Pakistan</h3>
                                <p className="text-gray-600 text-sm">Stay healthy during rainy season</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DengueFeverPakistanPage;
