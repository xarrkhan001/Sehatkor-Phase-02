import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Heart, Activity, AlertTriangle, Stethoscope } from "lucide-react";

const HeartDiseasePakistanPage = () => {
    const publishDate = "February 5, 2026";
    const readTime = "9 min read";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Heart Disease in Pakistan: Complete Guide 2026 - Prevention & Treatment",
        "description": "Complete guide to heart disease in Pakistan. Learn about symptoms, risk factors, treatment options, and how to prevent heart attacks. Find cardiologists near you.",
        "image": "https://sehatkor.pk/blog/heart-disease-pakistan.jpg",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
            <SEO
                title="Heart Disease in Pakistan: Complete Guide 2026 - Prevention & Treatment"
                description="Complete guide to heart disease in Pakistan. Learn about symptoms, risk factors, prevention tips, and treatment options. Find the best cardiologists and cardiac hospitals near you on Sehatkor."
                keywords="heart disease Pakistan, heart attack symptoms, cardiologist Pakistan, heart specialist Karachi, heart specialist Lahore, cardiac hospital Pakistan, heart disease prevention, cholesterol Pakistan, blood pressure, angioplasty Pakistan, bypass surgery Pakistan, heart failure, دل کی بیماری, کارڈیالوجسٹ, دل کا دورہ, chest pain, heart health Pakistan, cardiovascular disease, coronary artery disease"
                canonical="https://sehatkor.pk/blog/heart-disease-pakistan-complete-guide"
                jsonLd={jsonLd}
                type="article"
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-12">
                <div className="container mx-auto px-6">
                    <Link to="/blog" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Critical Health
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Prevention Guide
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Heart Disease in Pakistan: Complete Guide 2026
                        </h1>

                        <p className="text-xl text-white/90 mb-6">
                            Everything you need to know about preventing heart attacks, recognizing symptoms, and getting the best cardiac care in Pakistan
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
                                <h3 className="font-bold text-red-900 mb-2">⚠️ Heart Disease - Pakistan's #1 Killer</h3>
                                <p className="text-red-800">
                                    Heart disease causes <strong>30% of all deaths</strong> in Pakistan. Every year, over <strong>200,000 Pakistanis</strong> die from heart attacks and strokes.
                                    The good news? <strong>80% of heart disease is preventable</strong> with lifestyle changes and early detection.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="prose prose-lg max-w-none mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Heart disease (دل کی بیماری) has become an epidemic in Pakistan. Pakistanis develop heart disease <strong>10 years earlier</strong> than
                            people in Western countries. A 40-year-old Pakistani has the same heart disease risk as a 50-year-old American. This alarming trend is
                            driven by unhealthy diets, lack of exercise, smoking, stress, and uncontrolled diabetes and hypertension.
                        </p>

                        <p className="text-lg text-gray-700 leading-relaxed">
                            This comprehensive guide will help you understand heart disease, recognize warning signs early, learn about treatment options available
                            in Pakistan, and most importantly, how to prevent heart attacks through simple lifestyle changes.
                        </p>
                    </div>

                    {/* Statistics */}
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 mb-12 border border-red-200">
                        <h3 className="font-bold text-gray-900 mb-4">📊 Heart Disease in Pakistan - Alarming Statistics:</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <ul className="space-y-2 text-gray-700">
                                <li>• <strong>200,000+</strong> deaths per year from heart disease</li>
                                <li>• <strong>30%</strong> of all deaths are cardiac-related</li>
                                <li>• <strong>1 in 4</strong> adults has high blood pressure</li>
                                <li>• <strong>1 in 3</strong> adults has high cholesterol</li>
                            </ul>
                            <ul className="space-y-2 text-gray-700">
                                <li>• <strong>40-50 years</strong> - Average age of first heart attack</li>
                                <li>• <strong>60%</strong> of heart attacks occur in people under 50</li>
                                <li>• <strong>Karachi, Lahore, Islamabad</strong> - Highest rates</li>
                                <li>• <strong>PKR 500,000-2M</strong> - Average treatment cost</li>
                            </ul>
                        </div>
                    </div>

                    {/* What is Heart Disease */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Heart className="w-8 h-8 text-red-600" />
                            What is Heart Disease? (دل کی بیماری کیا ہے؟)
                        </h2>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            Heart disease refers to several conditions affecting the heart and blood vessels. The most common type in Pakistan is
                            <strong> Coronary Artery Disease (CAD)</strong>, where arteries supplying blood to the heart become narrow or blocked due to plaque buildup.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Common Types in Pakistan:</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li>
                                        <strong>1. Coronary Artery Disease (CAD):</strong><br />
                                        <span className="text-sm">Blocked arteries → Heart attack risk</span>
                                    </li>
                                    <li>
                                        <strong>2. Heart Attack (Myocardial Infarction):</strong><br />
                                        <span className="text-sm">Complete blockage → Heart muscle damage</span>
                                    </li>
                                    <li>
                                        <strong>3. Heart Failure:</strong><br />
                                        <span className="text-sm">Heart can't pump blood effectively</span>
                                    </li>
                                    <li>
                                        <strong>4. Arrhythmia:</strong><br />
                                        <span className="text-sm">Irregular heartbeat</span>
                                    </li>
                                    <li>
                                        <strong>5. Valvular Heart Disease:</strong><br />
                                        <span className="text-sm">Heart valve problems</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                                <h3 className="font-bold text-red-900 mb-4">Risk Factors in Pakistan:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✗ <strong>High blood pressure</strong> (1 in 4 adults)</li>
                                    <li>✗ <strong>High cholesterol</strong> (1 in 3 adults)</li>
                                    <li>✗ <strong>Diabetes</strong> (33 million diabetics)</li>
                                    <li>✗ <strong>Smoking</strong> (very common in men)</li>
                                    <li>✗ <strong>Obesity</strong> (increasing rapidly)</li>
                                    <li>✗ <strong>Lack of exercise</strong> (sedentary lifestyle)</li>
                                    <li>✗ <strong>Unhealthy diet</strong> (oily, fried foods)</li>
                                    <li>✗ <strong>Stress</strong> (work, family pressures)</li>
                                    <li>✗ <strong>Family history</strong> (genetic factors)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Symptoms */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🚨 Heart Attack Symptoms - Know the Warning Signs</h2>

                        <div className="bg-red-100 border-2 border-red-600 rounded-xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-red-900 mb-4">CALL 1122 IMMEDIATELY IF YOU EXPERIENCE:</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <ul className="space-y-2 text-red-900">
                                    <li>⚠️ <strong>Chest pain/pressure</strong> (feels like elephant sitting on chest)</li>
                                    <li>⚠️ <strong>Pain radiating to arm</strong> (especially left arm)</li>
                                    <li>⚠️ <strong>Jaw or neck pain</strong></li>
                                    <li>⚠️ <strong>Shortness of breath</strong></li>
                                </ul>
                                <ul className="space-y-2 text-red-900">
                                    <li>⚠️ <strong>Nausea or vomiting</strong></li>
                                    <li>⚠️ <strong>Cold sweat</strong></li>
                                    <li>⚠️ <strong>Dizziness or lightheadedness</strong></li>
                                    <li>⚠️ <strong>Extreme fatigue</strong></li>
                                </ul>
                            </div>
                            <div className="mt-4 p-4 bg-white rounded-lg">
                                <p className="text-red-900 font-bold">
                                    ⏰ TIME IS CRITICAL: Every minute counts! Get to hospital within 1 hour for best survival chances.
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">⚠️ Women's Symptoms (Different from Men):</h3>
                            <p className="text-gray-700 mb-3">
                                Women often have <strong>different symptoms</strong> than men. They may NOT have chest pain but instead experience:
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Unusual fatigue (extreme tiredness for no reason)</li>
                                <li>• Sleep disturbances</li>
                                <li>• Shortness of breath without chest pain</li>
                                <li>• Indigestion or stomach pain</li>
                                <li>• Back or shoulder pain</li>
                                <li>• Anxiety or sense of impending doom</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Early Warning Signs (Days/Weeks Before Heart Attack):</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Chest discomfort with physical activity (goes away with rest)</li>
                                <li>• Unusual fatigue</li>
                                <li>• Shortness of breath during normal activities</li>
                                <li>• Swelling in feet/ankles</li>
                                <li>• Irregular heartbeat</li>
                                <li>• Difficulty sleeping</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                <strong>Don't ignore these signs!</strong> See a cardiologist immediately for evaluation.
                            </p>
                        </div>
                    </section>

                    {/* Diagnosis */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🔬 Heart Disease Testing in Pakistan</h2>

                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Basic Tests (Screening):</h3>

                                <div className="space-y-4">
                                    <div className="border-l-4 border-blue-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">1. Blood Pressure Check</h4>
                                        <p className="text-gray-700 mb-1"><strong>Normal:</strong> Less than 120/80 mmHg</p>
                                        <p className="text-gray-700 mb-1"><strong>High:</strong> 140/90 or above</p>
                                        <p className="text-gray-700"><strong>Price:</strong> Free at most clinics, PKR 100-300</p>
                                    </div>

                                    <div className="border-l-4 border-green-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">2. Lipid Profile (Cholesterol Test)</h4>
                                        <p className="text-gray-700 mb-1"><strong>Tests:</strong> Total cholesterol, LDL, HDL, Triglycerides</p>
                                        <p className="text-gray-700 mb-1"><strong>Fasting:</strong> 12 hours required</p>
                                        <p className="text-gray-700"><strong>Price:</strong> PKR 800-2,000</p>
                                    </div>

                                    <div className="border-l-4 border-purple-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">3. Blood Sugar (Fasting & HbA1c)</h4>
                                        <p className="text-gray-700 mb-1"><strong>Why:</strong> Diabetes increases heart disease risk 2-4x</p>
                                        <p className="text-gray-700"><strong>Price:</strong> PKR 200-500 (fasting), PKR 800-2,000 (HbA1c)</p>
                                    </div>

                                    <div className="border-l-4 border-red-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">4. ECG (Electrocardiogram)</h4>
                                        <p className="text-gray-700 mb-1"><strong>What it shows:</strong> Heart rhythm, previous heart attacks, heart enlargement</p>
                                        <p className="text-gray-700"><strong>Price:</strong> PKR 500-1,500</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Advanced Tests (If Needed):</h3>

                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">5. Echocardiogram (Echo)</h4>
                                        <p className="text-gray-700 text-sm mb-1">Ultrasound of heart. Shows heart function, valve problems.</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 3,000-8,000</p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">6. Stress Test (TMT - Treadmill Test)</h4>
                                        <p className="text-gray-700 text-sm mb-1">ECG while exercising. Detects blockages.</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 3,000-6,000</p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">7. Cardiac CT Scan / Calcium Score</h4>
                                        <p className="text-gray-700 text-sm mb-1">Measures calcium in arteries. Predicts heart attack risk.</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 15,000-30,000</p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">8. Angiography (Cardiac Catheterization)</h4>
                                        <p className="text-gray-700 text-sm mb-1">Gold standard. Shows exact blockage location and severity.</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 50,000-150,000</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Treatment */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">💊 Heart Disease Treatment in Pakistan</h2>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-4">Medications (دوائیں):</h3>

                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">1. Blood Pressure Medications</h4>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Types:</strong> ACE inhibitors, Beta blockers, Calcium channel blockers, Diuretics
                                        </p>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Common brands:</strong> Concor, Norvasc, Covance, Lasix
                                        </p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 200-1,500/month</p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">2. Cholesterol Medications (Statins)</h4>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Purpose:</strong> Lower LDL cholesterol, prevent plaque buildup
                                        </p>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Common brands:</strong> Atorva (Atorvastatin), Crestor (Rosuvastatin)
                                        </p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 300-2,000/month</p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">3. Blood Thinners (Antiplatelet)</h4>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Purpose:</strong> Prevent blood clots, reduce heart attack risk
                                        </p>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Common brands:</strong> Aspirin, Plavix (Clopidogrel), Brilinta
                                        </p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 100-3,000/month</p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">4. Nitrates (for Angina)</h4>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Purpose:</strong> Relieve chest pain, improve blood flow
                                        </p>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Common brands:</strong> Isordil, Nitrostat (under tongue)
                                        </p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 200-800/month</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                                <h3 className="font-bold text-red-900 mb-4">Procedures & Surgery:</h3>

                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">1. Angioplasty + Stent</h4>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>What it is:</strong> Balloon opens blocked artery, stent keeps it open
                                        </p>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Recovery:</strong> 1-2 days hospital, 1 week rest
                                        </p>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Success rate:</strong> 90-95%
                                        </p>
                                        <p className="text-gray-600 text-sm"><strong>Cost:</strong> PKR 300,000-800,000 (per stent)</p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">2. Bypass Surgery (CABG)</h4>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>What it is:</strong> Create new route for blood flow around blockages
                                        </p>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Recovery:</strong> 7-10 days hospital, 6-8 weeks full recovery
                                        </p>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>Success rate:</strong> 85-90%
                                        </p>
                                        <p className="text-gray-600 text-sm"><strong>Cost:</strong> PKR 500,000-2,000,000</p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">3. Pacemaker Implantation</h4>
                                        <p className="text-gray-700 text-sm mb-2">
                                            <strong>For:</strong> Irregular heartbeat (arrhythmia)
                                        </p>
                                        <p className="text-gray-600 text-sm"><strong>Cost:</strong> PKR 400,000-1,200,000</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Prevention */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🛡️ Heart Disease Prevention - Pakistani Lifestyle Guide</h2>

                        <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                            <h3 className="font-bold text-green-900 mb-4">✅ 10 Steps to a Healthy Heart:</h3>

                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">1. Quit Smoking (سگریٹ چھوڑیں)</h4>
                                    <p className="text-gray-700 text-sm">
                                        Smoking doubles heart attack risk. Within 1 year of quitting, risk drops by 50%. Get help from smoking cessation clinics.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">2. Exercise Daily (روزانہ ورزش)</h4>
                                    <p className="text-gray-700 text-sm mb-2">
                                        <strong>Minimum:</strong> 30 minutes walking, 5 days/week
                                    </p>
                                    <p className="text-gray-700 text-sm">
                                        <strong>Best:</strong> Brisk walking, cycling, swimming, jogging. Avoid sitting for long hours.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">3. Eat Heart-Healthy Diet</h4>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Eat More:</strong></p>
                                    <ul className="text-gray-700 text-sm space-y-1 mb-2">
                                        <li>• Vegetables, fruits (5 servings/day)</li>
                                        <li>• Whole grains (brown rice, whole wheat roti)</li>
                                        <li>• Fish (especially oily fish like salmon, mackerel)</li>
                                        <li>• Nuts, seeds (almonds, walnuts)</li>
                                        <li>• Olive oil, canola oil</li>
                                    </ul>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Eat Less:</strong></p>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• Red meat, organ meats</li>
                                        <li>• Fried foods (samosa, pakora, paratha)</li>
                                        <li>• Ghee, butter, cream</li>
                                        <li>• Salt (limit to 1 teaspoon/day)</li>
                                        <li>• Sugar, sweets, mithai</li>
                                    </ul>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">4. Maintain Healthy Weight</h4>
                                    <p className="text-gray-700 text-sm">
                                        <strong>BMI:</strong> Keep between 18.5-24.9. Lose weight if overweight. Even 5-10% weight loss helps significantly.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">5. Control Blood Pressure</h4>
                                    <p className="text-gray-700 text-sm">
                                        <strong>Target:</strong> Below 130/80. Check monthly. Take medications as prescribed. Reduce salt intake.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">6. Manage Diabetes</h4>
                                    <p className="text-gray-700 text-sm">
                                        <strong>Target HbA1c:</strong> Below 7%. Uncontrolled diabetes damages blood vessels and increases heart attack risk 2-4x.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">7. Lower Cholesterol</h4>
                                    <p className="text-gray-700 text-sm">
                                        <strong>Target LDL:</strong> Below 100 mg/dL (below 70 if high risk). Take statins if prescribed. Avoid trans fats.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">8. Manage Stress (تناؤ کم کریں)</h4>
                                    <p className="text-gray-700 text-sm">
                                        Practice meditation, deep breathing, yoga. Get 7-8 hours sleep. Spend time with family. Avoid overwork.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">9. Limit Alcohol</h4>
                                    <p className="text-gray-700 text-sm">
                                        Excessive alcohol damages heart. If you drink, limit to moderate amounts.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">10. Regular Check-ups</h4>
                                    <p className="text-gray-700 text-sm">
                                        <strong>After 40:</strong> Annual cardiac screening (BP, cholesterol, blood sugar, ECG). Earlier if family history.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Best Hospitals */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🏥 Best Cardiac Hospitals in Pakistan</h2>

                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Karachi:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>National Institute of Cardiovascular Diseases (NICVD)</strong> - Free/subsidized treatment</li>
                                    <li>• <strong>Aga Khan University Hospital</strong> - World-class cardiac care</li>
                                    <li>• <strong>Tabba Heart Institute</strong> - Specialized cardiac center</li>
                                    <li>• <strong>Liaquat National Hospital</strong> - 24/7 cardiac emergency</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Lahore:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Punjab Institute of Cardiology (PIC)</strong> - Largest cardiac center</li>
                                    <li>• <strong>Shaukat Khanum Hospital</strong> - Excellent facilities</li>
                                    <li>• <strong>Gulab Devi Hospital</strong> - Affordable cardiac care</li>
                                    <li>• <strong>Chaudhry Pervaiz Elahi Institute of Cardiology</strong> - Government facility</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Islamabad/Rawalpindi:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Armed Forces Institute of Cardiology (AFIC)</strong> - Military hospital, excellent care</li>
                                    <li>• <strong>Rawalpindi Institute of Cardiology</strong> - Government facility</li>
                                    <li>• <strong>Shifa International Hospital</strong> - Private, world-class</li>
                                    <li>• <strong>PIMS Hospital</strong> - Government teaching hospital</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Find Cardiologist CTA */}
                    <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-8 text-white mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Stethoscope className="w-8 h-8" />
                            Find Best Cardiologists on Sehatkor
                        </h2>
                        <p className="text-white/90 mb-6">
                            Book verified cardiologists, get cardiac tests at home, and find the best heart hospitals near you.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/search?type=doctor&specialty=cardiology">
                                <Button className="bg-white text-red-600 hover:bg-gray-100">
                                    Find Cardiologists
                                </Button>
                            </Link>
                            <Link to="/labs">
                                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                                    Book Cardiac Tests
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
                                    q: "At what age should I start cardiac screening?",
                                    a: "Men should start at 40, women at 50. However, if you have risk factors (family history, diabetes, high BP, smoking, obesity), start screening at 30."
                                },
                                {
                                    q: "Can heart disease be reversed?",
                                    a: "Early-stage coronary artery disease can be partially reversed with aggressive lifestyle changes and medications. However, severe blockages may require procedures. Prevention is always better than cure."
                                },
                                {
                                    q: "Is angioplasty better than bypass surgery?",
                                    a: "Depends on blockage severity and location. Angioplasty is less invasive, faster recovery (for 1-2 blockages). Bypass is better for multiple blockages or complex cases. Your cardiologist will recommend based on angiography results."
                                },
                                {
                                    q: "How much does heart treatment cost in Pakistan?",
                                    a: "Varies widely: Medications: PKR 2,000-10,000/month. Angioplasty: PKR 300,000-800,000. Bypass surgery: PKR 500,000-2,000,000. Government hospitals offer free/subsidized treatment (NICVD, PIC, etc.)."
                                },
                                {
                                    q: "Can I prevent heart disease if it runs in my family?",
                                    a: "Yes! While you can't change genetics, you can control other risk factors. With healthy lifestyle (diet, exercise, no smoking), regular screening, and medications if needed, you can significantly reduce your risk even with family history."
                                },
                                {
                                    q: "What should I do if I have chest pain?",
                                    a: "Call 1122 immediately. Don't wait. Chew 1 aspirin (300mg) if available. Sit down, stay calm. Don't drive yourself. Every minute counts - get to hospital within 1 hour."
                                },
                                {
                                    q: "Is walking enough exercise for heart health?",
                                    a: "Yes! Brisk walking 30 minutes daily, 5 days/week is excellent for heart health. It reduces heart attack risk by 30-40%. No need for gym or expensive equipment."
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
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">🎯 Key Takeaways</h2>
                        <ul className="space-y-2 mb-6">
                            <li>✓ Heart disease is Pakistan's #1 killer but 80% is preventable</li>
                            <li>✓ Know heart attack symptoms - call 1122 immediately</li>
                            <li>✓ Start cardiac screening at 40 (earlier if risk factors)</li>
                            <li>✓ Quit smoking, exercise daily, eat healthy</li>
                            <li>✓ Control BP, cholesterol, and blood sugar</li>
                            <li>✓ Don't ignore chest pain or unusual fatigue</li>
                            <li>✓ Government hospitals offer free/subsidized cardiac care</li>
                        </ul>

                        <Link to="/search?type=doctor&specialty=cardiology">
                            <Button className="bg-white text-blue-600 hover:bg-gray-100">
                                Find Cardiologists Near You
                            </Button>
                        </Link>
                    </div>

                </div>
            </article>
        </div>
    );
};

export default HeartDiseasePakistanPage;
