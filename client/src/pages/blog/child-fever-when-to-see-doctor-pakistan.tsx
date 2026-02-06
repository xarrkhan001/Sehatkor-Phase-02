import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Baby, Thermometer, AlertTriangle, Stethoscope } from "lucide-react";

const ChildFeverPakistanPage = () => {
    const publishDate = "February 5, 2026";
    const readTime = "8 min read";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Child Fever: When to See a Doctor in Pakistan - Complete Parent's Guide 2026",
        "description": "Complete guide for Pakistani parents about child fever. Learn when fever is dangerous, home remedies, medication dosage, and when to rush to the doctor.",
        "image": "https://sehatkor.pk/blog/child-fever-pakistan.jpg",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
            <SEO
                title="Child Fever: When to See a Doctor in Pakistan - Complete Parent's Guide 2026"
                description="Complete guide for Pakistani parents about child fever. Learn normal vs high fever, common causes, home remedies, paracetamol dosage for children, warning signs, and when to see a pediatrician in Pakistan."
                keywords="child fever Pakistan, pediatrician Pakistan, child doctor Karachi, child doctor Lahore, child specialist Pakistan, fever in children, baby fever, infant fever, when to see doctor, paracetamol dosage children, fever treatment children, high fever child, بچوں میں بخار, بچوں کا ڈاکٹر, fever home remedies, child fever medicine, pediatric emergency Pakistan, children's hospital Pakistan"
                canonical="https://sehatkor.pk/blog/child-fever-when-to-see-doctor-pakistan"
                jsonLd={jsonLd}
                type="article"
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12">
                <div className="container mx-auto px-6">
                    <Link to="/blog" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Child Health
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Parent's Guide
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Child Fever: When to See a Doctor in Pakistan
                        </h1>

                        <p className="text-xl text-white/90 mb-6">
                            Complete guide for Pakistani parents - Know when fever is dangerous, effective home remedies, and when to rush to the pediatrician
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
                    <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-lg mb-8">
                        <div className="flex items-start gap-3">
                            <Thermometer className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-orange-900 mb-2">🌡️ Important for Parents</h3>
                                <p className="text-orange-800">
                                    Fever is NOT a disease - it's a <strong>symptom</strong> that your child's body is fighting an infection. Most fevers are harmless and go away in 2-3 days. However, <strong>knowing when to see a doctor can save your child's life</strong>. This guide will help you make the right decision.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="prose prose-lg max-w-none mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            As a parent in Pakistan, seeing your child with fever (بخار) can be scary. You're not alone - fever is the <strong>#1 reason</strong> parents take children to doctors in Pakistan. But not every fever needs a doctor visit. Understanding when fever is normal and when it's dangerous will help you stay calm and make better decisions for your child's health.
                        </p>

                        <p className="text-lg text-gray-700 leading-relaxed">
                            This comprehensive guide covers everything Pakistani parents need to know about child fever - from measuring temperature correctly to knowing exact warning signs that require immediate medical attention.
                        </p>
                    </div>

                    {/* Temperature Guide */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Thermometer className="w-8 h-8 text-orange-600" />
                            Understanding Fever - Normal vs High Temperature
                        </h2>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
                            <h3 className="font-bold text-blue-900 mb-4">Normal Body Temperature Ranges:</h3>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">Normal Temperature:</h4>
                                        <span className="text-green-700 font-bold">36.5°C - 37.5°C (97.7°F - 99.5°F)</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">Child is healthy, no fever</p>
                                </div>

                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">Low-Grade Fever:</h4>
                                        <span className="text-yellow-700 font-bold">37.6°C - 38.5°C (99.6°F - 101.3°F)</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">Mild fever, usually not serious. Monitor at home.</p>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-4 border border-orange-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">Moderate Fever:</h4>
                                        <span className="text-orange-700 font-bold">38.6°C - 39.5°C (101.4°F - 103.1°F)</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">Moderate fever. Give medicine, watch for warning signs.</p>
                                </div>

                                <div className="bg-red-50 rounded-lg p-4 border border-red-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">High Fever:</h4>
                                        <span className="text-red-700 font-bold">39.6°C+ (103.2°F+)</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">High fever. Contact doctor, especially if child is under 3 months.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">How to Measure Temperature Correctly:</h3>

                            <div className="space-y-4">
                                <div className="border-l-4 border-blue-600 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">1. Digital Thermometer (Recommended)</h4>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Where:</strong> Under armpit (axillary) - most common in Pakistan</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>How:</strong> Place thermometer under dry armpit, hold arm close to body for 3-5 minutes</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Note:</strong> Add 0.5°C to reading for actual body temperature</p>
                                    <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 200-800</p>
                                </div>

                                <div className="border-l-4 border-green-600 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">2. Forehead Thermometer (Infrared)</h4>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Where:</strong> Forehead</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>How:</strong> Point at forehead, press button, instant reading</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Pros:</strong> Fast, no contact needed, good for sleeping child</p>
                                    <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 1,500-5,000</p>
                                </div>

                                <div className="border-l-4 border-purple-600 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">3. Ear Thermometer (Tympanic)</h4>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Where:</strong> Inside ear canal</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>How:</strong> Insert gently into ear, press button</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Note:</strong> Not accurate for babies under 6 months</p>
                                    <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 2,000-6,000</p>
                                </div>

                                <div className="bg-red-50 rounded-lg p-4">
                                    <p className="text-red-900 font-semibold">❌ Avoid: Mercury thermometers (dangerous if broken), hand-touch method (inaccurate)</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Common Causes */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🦠 Common Causes of Fever in Children</h2>

                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-3">1. Viral Infections (Most Common - 80%)</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Common Cold/Flu:</strong> Runny nose, cough, sore throat. Lasts 3-7 days.</li>
                                    <li>• <strong>Viral Gastroenteritis:</strong> Diarrhea, vomiting. Lasts 2-5 days.</li>
                                    <li>• <strong>Roseola:</strong> High fever 3-4 days, then rash appears. Common in babies 6-24 months.</li>
                                    <li>• <strong>Hand-Foot-Mouth Disease:</strong> Fever + blisters in mouth, hands, feet.</li>
                                </ul>
                                <p className="text-blue-900 mt-3 font-semibold">Treatment: No antibiotics needed. Rest, fluids, fever medicine.</p>
                            </div>

                            <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
                                <h3 className="font-bold text-orange-900 mb-3">2. Bacterial Infections (15-20%)</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Ear Infection:</strong> Ear pain, pulling ear, irritability.</li>
                                    <li>• <strong>Throat Infection (Strep Throat):</strong> Severe sore throat, difficulty swallowing.</li>
                                    <li>• <strong>Urinary Tract Infection (UTI):</strong> Painful urination, foul-smelling urine.</li>
                                    <li>• <strong>Pneumonia:</strong> Cough, rapid breathing, chest pain.</li>
                                </ul>
                                <p className="text-orange-900 mt-3 font-semibold">Treatment: Needs antibiotics. See doctor for diagnosis.</p>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                                <h3 className="font-bold text-purple-900 mb-3">3. Other Causes</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Teething:</strong> Low-grade fever (under 38.5°C) when teeth coming in.</li>
                                    <li>• <strong>Vaccination:</strong> Fever 1-2 days after vaccines (normal reaction).</li>
                                    <li>• <strong>Overdressing:</strong> Too many clothes in hot weather.</li>
                                    <li>• <strong>Dengue/Malaria:</strong> Common in Pakistan, especially during monsoon.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* When to See Doctor */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🚨 When to See a Doctor IMMEDIATELY</h2>

                        <div className="bg-red-100 border-2 border-red-600 rounded-xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-red-900 mb-4">EMERGENCY SIGNS - Go to Hospital NOW:</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-red-900 mb-3">Age-Specific Warnings:</h4>
                                    <ul className="space-y-2 text-red-900">
                                        <li>⚠️ <strong>Under 3 months:</strong> ANY fever (38°C+)</li>
                                        <li>⚠️ <strong>3-6 months:</strong> Fever 38.5°C+</li>
                                        <li>⚠️ <strong>Over 6 months:</strong> Fever 40°C+ (104°F+)</li>
                                        <li>⚠️ <strong>Any age:</strong> Fever lasting more than 3 days</li>
                                    </ul>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-red-900 mb-3">Dangerous Symptoms:</h4>
                                    <ul className="space-y-2 text-red-900">
                                        <li>⚠️ Seizures/convulsions (جھٹکے)</li>
                                        <li>⚠️ Difficulty breathing, rapid breathing</li>
                                        <li>⚠️ Severe headache, stiff neck</li>
                                        <li>⚠️ Rash with purple/red spots</li>
                                        <li>⚠️ Extreme drowsiness, won't wake up</li>
                                        <li>⚠️ Dehydration (no tears, dry mouth, no urine 8+ hours)</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-white rounded-lg">
                                <p className="text-red-900 font-bold text-center">
                                    ☎️ CALL 1122 or RUSH TO NEAREST HOSPITAL if you see any of these signs!
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">⚠️ See Doctor Within 24 Hours If:</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Child is 3-6 months old with fever 38.5°C+</li>
                                <li>• Fever with ear pain or pulling ear</li>
                                <li>• Fever with severe sore throat</li>
                                <li>• Fever with painful urination</li>
                                <li>• Fever with persistent vomiting or diarrhea</li>
                                <li>• Child is very irritable or crying inconsolably</li>
                                <li>• Fever returns after being gone for 24+ hours</li>
                                <li>• You're worried (trust your instinct!)</li>
                            </ul>
                        </div>

                        <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                            <h3 className="font-bold text-gray-900 mb-3">✅ Can Manage at Home If:</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Child is over 6 months old</li>
                                <li>• Fever is under 39°C (102.2°F)</li>
                                <li>• Child is drinking fluids well</li>
                                <li>• Child is playful and responsive</li>
                                <li>• No other concerning symptoms</li>
                                <li>• Fever has been less than 3 days</li>
                            </ul>
                        </div>
                    </section>

                    {/* Home Treatment */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🏠 Home Treatment for Fever</h2>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-4">💊 Fever Medicines (Antipyretics):</h3>

                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">1. Paracetamol (Acetaminophen) - FIRST CHOICE</h4>

                                        <div className="space-y-2 mb-3">
                                            <p className="text-gray-700 text-sm"><strong>Brand Names:</strong> Panadol, Calpol, Disprol, Tylenol</p>
                                            <p className="text-gray-700 text-sm"><strong>Safe for:</strong> All ages (even newborns with doctor's advice)</p>
                                            <p className="text-gray-700 text-sm"><strong>How often:</strong> Every 4-6 hours (maximum 4 doses in 24 hours)</p>
                                        </div>

                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="font-semibold text-gray-900 mb-2">Dosage by Weight (Most Accurate):</p>
                                            <ul className="space-y-1 text-gray-700 text-sm">
                                                <li>• <strong>Formula:</strong> 10-15 mg per kg of body weight</li>
                                                <li>• <strong>Example:</strong> 10 kg child = 100-150 mg per dose</li>
                                                <li>• <strong>5 kg baby:</strong> 50-75 mg (2.5 ml of 120mg/5ml syrup)</li>
                                                <li>• <strong>10 kg child:</strong> 100-150 mg (5 ml of 120mg/5ml syrup)</li>
                                                <li>• <strong>15 kg child:</strong> 150-225 mg (7.5 ml of 120mg/5ml syrup)</li>
                                                <li>• <strong>20 kg child:</strong> 200-300 mg (1 tablet of 250mg)</li>
                                            </ul>
                                        </div>

                                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                            <p className="text-sm text-gray-700">
                                                <strong>⚠️ Important:</strong> Always check medicine concentration (mg/ml). Use measuring syringe, not kitchen spoon. Don't exceed maximum daily dose (60 mg/kg/day).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">2. Ibuprofen (Brufen) - SECOND CHOICE</h4>

                                        <div className="space-y-2 mb-3">
                                            <p className="text-gray-700 text-sm"><strong>Brand Names:</strong> Brufen, Advil, Nurofen</p>
                                            <p className="text-gray-700 text-sm"><strong>Safe for:</strong> Children over 6 months</p>
                                            <p className="text-gray-700 text-sm"><strong>How often:</strong> Every 6-8 hours (maximum 3 doses in 24 hours)</p>
                                            <p className="text-gray-700 text-sm"><strong>Dosage:</strong> 5-10 mg per kg of body weight</p>
                                        </div>

                                        <div className="bg-red-50 rounded-lg p-3">
                                            <p className="text-sm text-red-900">
                                                <strong>⚠️ Don't use if:</strong> Child is dehydrated, has stomach pain, or under 6 months. Can cause stomach upset.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-red-100 rounded-lg p-4 border-2 border-red-600">
                                        <h4 className="font-semibold text-red-900 mb-2">❌ NEVER Give to Children:</h4>
                                        <ul className="space-y-1 text-red-900 text-sm">
                                            <li>• <strong>Aspirin:</strong> Can cause Reye's syndrome (life-threatening)</li>
                                            <li>• <strong>Adult medicines:</strong> Different dosages, can be dangerous</li>
                                            <li>• <strong>Multiple fever medicines together:</strong> Unless doctor advises</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                                <h3 className="font-bold text-green-900 mb-4">🌿 Home Remedies (Supportive Care):</h3>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">1. Keep Child Hydrated (بہت ضروری)</h4>
                                        <ul className="text-gray-700 text-sm space-y-1">
                                            <li>• Give plenty of fluids (water, ORS, soup, juice)</li>
                                            <li>• Breastfeed frequently if baby is nursing</li>
                                            <li>• Offer small amounts frequently if child refuses</li>
                                            <li>• Watch for dehydration signs (dry lips, no tears, less urine)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">2. Dress Lightly</h4>
                                        <ul className="text-gray-700 text-sm space-y-1">
                                            <li>• Remove extra layers of clothing</li>
                                            <li>• Use light cotton clothes</li>
                                            <li>• Don't bundle up (common mistake in Pakistan!)</li>
                                            <li>• Use light blanket if child feels cold</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">3. Room Temperature</h4>
                                        <ul className="text-gray-700 text-sm space-y-1">
                                            <li>• Keep room comfortably cool (not cold)</li>
                                            <li>• Use fan on low setting (not directly on child)</li>
                                            <li>• Avoid AC directly on child</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">4. Lukewarm Sponge Bath (Optional)</h4>
                                        <ul className="text-gray-700 text-sm space-y-1">
                                            <li>• Use lukewarm water (NOT cold water)</li>
                                            <li>• Sponge forehead, armpits, groin</li>
                                            <li>• Stop if child shivers</li>
                                            <li>• Do AFTER giving fever medicine, not instead of it</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">5. Rest</h4>
                                        <ul className="text-gray-700 text-sm space-y-1">
                                            <li>• Let child rest, don't force activities</li>
                                            <li>• It's okay if child doesn't eat much</li>
                                            <li>• Offer favorite foods when hungry</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-4 bg-red-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-red-900 mb-2">❌ Don't Do:</h4>
                                    <ul className="space-y-1 text-red-900 text-sm">
                                        <li>• Ice bath or very cold water (can cause shivering, raise temperature)</li>
                                        <li>• Alcohol rub (can be absorbed through skin, dangerous)</li>
                                        <li>• Force feeding</li>
                                        <li>• Overdress to "sweat out" fever</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Febrile Seizures */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">⚡ Febrile Seizures (بخار کے جھٹکے)</h2>

                        <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                            <h3 className="font-bold text-purple-900 mb-4">What are Febrile Seizures?</h3>
                            <p className="text-gray-700 mb-4">
                                Seizures (convulsions/fits) triggered by fever, usually when temperature rises rapidly. Occur in <strong>2-5% of children</strong> aged 6 months to 5 years. Look scary but usually harmless.
                            </p>

                            <div className="bg-white rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-gray-900 mb-2">What You'll See:</h4>
                                <ul className="space-y-1 text-gray-700 text-sm">
                                    <li>• Child becomes unconscious</li>
                                    <li>• Body stiffens, then jerking movements</li>
                                    <li>• Eyes roll back</li>
                                    <li>• May lose bladder/bowel control</li>
                                    <li>• Usually lasts 1-2 minutes (feels longer!)</li>
                                </ul>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-green-900 mb-2">✅ What to Do During Seizure:</h4>
                                <ol className="space-y-1 text-gray-700 text-sm list-decimal list-inside">
                                    <li><strong>Stay calm</strong> (hard but important)</li>
                                    <li><strong>Lay child on side</strong> on floor (prevent choking on saliva)</li>
                                    <li><strong>Clear area</strong> of hard objects</li>
                                    <li><strong>Loosen tight clothing</strong> around neck</li>
                                    <li><strong>Time the seizure</strong> (important for doctor)</li>
                                    <li><strong>Don't put anything in mouth</strong> (no spoon, no fingers!)</li>
                                    <li><strong>Don't try to stop movements</strong></li>
                                    <li><strong>After seizure:</strong> Let child rest, give fever medicine when awake</li>
                                </ol>
                            </div>

                            <div className="bg-red-100 rounded-lg p-4 border-2 border-red-600">
                                <h4 className="font-semibold text-red-900 mb-2">🚨 Call 1122 or Go to Hospital If:</h4>
                                <ul className="space-y-1 text-red-900 text-sm">
                                    <li>• First-time seizure (always get checked)</li>
                                    <li>• Seizure lasts more than 5 minutes</li>
                                    <li>• Multiple seizures in 24 hours</li>
                                    <li>• Child doesn't wake up after seizure</li>
                                    <li>• Difficulty breathing after seizure</li>
                                    <li>• Child is under 6 months or over 5 years</li>
                                </ul>
                            </div>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-gray-700 text-sm">
                                    <strong>Good News:</strong> Most children who have febrile seizures grow out of them by age 5. They don't cause brain damage or epilepsy. However, always see a doctor after first seizure to rule out other causes.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Best Pediatricians */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🏥 Best Children's Hospitals & Pediatricians in Pakistan</h2>

                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Karachi:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Aga Khan University Hospital</strong> - 24/7 pediatric emergency</li>
                                    <li>• <strong>National Institute of Child Health (NICH)</strong> - Government, specialized pediatric care</li>
                                    <li>• <strong>Liaquat National Hospital</strong> - Excellent pediatric department</li>
                                    <li>• <strong>South City Hospital</strong> - Modern pediatric facilities</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Lahore:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Children's Hospital Lahore</strong> - Largest pediatric hospital</li>
                                    <li>• <strong>Shaukat Khanum Hospital</strong> - Excellent pediatric care</li>
                                    <li>• <strong>Hameed Latif Hospital</strong> - 24/7 pediatric emergency</li>
                                    <li>• <strong>Fatima Memorial Hospital</strong> - Good pediatric services</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Islamabad/Rawalpindi:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Shifa International Hospital</strong> - Top pediatric care</li>
                                    <li>• <strong>PIMS Hospital</strong> - Government, good pediatric ward</li>
                                    <li>• <strong>Maroof International Hospital</strong> - Modern facilities</li>
                                    <li>• <strong>Children's Hospital PIMS</strong> - Specialized pediatric care</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Find Pediatrician CTA */}
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-white mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Stethoscope className="w-8 h-8" />
                            Find Best Pediatricians on Sehatkor
                        </h2>
                        <p className="text-white/90 mb-6">
                            Book verified child specialists, get home visits, and find the best children's hospitals near you.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/search?type=doctor&specialty=pediatrics">
                                <Button className="bg-white text-orange-600 hover:bg-gray-100">
                                    Find Pediatricians
                                </Button>
                            </Link>
                            <Link to="/hospitals">
                                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                                    Find Children's Hospitals
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
                                    q: "Should I wake my child to give fever medicine?",
                                    a: "No, let your child sleep. Sleep is healing. Give medicine when child wakes up naturally. Exception: If doctor specifically instructed to give medicine at certain times."
                                },
                                {
                                    q: "Can teething cause high fever?",
                                    a: "Teething can cause LOW-GRADE fever (under 38.5°C). If fever is higher than 38.5°C, there's likely another cause (infection). Don't blame everything on teething - get child checked."
                                },
                                {
                                    q: "How long does fever from vaccination last?",
                                    a: "Vaccine fever usually starts within 24 hours of vaccination and lasts 1-2 days. It's a normal immune response. Give paracetamol if needed. If fever lasts more than 2 days or is very high (40°C+), see doctor."
                                },
                                {
                                    q: "Is it safe to give paracetamol and ibuprofen together?",
                                    a: "Only if doctor advises. Generally, try one medicine first. If fever doesn't come down after 1 hour, you can give the other medicine (after consulting doctor). Don't make it a routine - there's a reason fever isn't coming down, which needs investigation."
                                },
                                {
                                    q: "My child has fever but is playing normally. Should I still see a doctor?",
                                    a: "If child is eating, drinking, playing, and responding normally, it's usually okay to monitor at home (if over 6 months and fever under 39°C). However, if fever persists more than 3 days or you notice any warning signs, see doctor."
                                },
                                {
                                    q: "Can I give my child cold water or ice cream when they have fever?",
                                    a: "Yes! Cold foods and drinks can help bring down temperature and keep child hydrated. Ice cream, popsicles, cold water are all fine. Old belief that cold foods worsen fever is a myth."
                                },
                                {
                                    q: "How often should I check my child's temperature?",
                                    a: "Every 4-6 hours is enough if child is stable. Check more frequently (every 2 hours) if: fever is very high, child is very young (under 3 months), or you're worried. Don't obsessively check every hour - it won't change management."
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
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">🎯 Key Takeaways for Parents</h2>
                        <ul className="space-y-2 mb-6">
                            <li>✓ Fever is a symptom, not a disease - it helps body fight infection</li>
                            <li>✓ ANY fever in baby under 3 months needs immediate doctor visit</li>
                            <li>✓ Know warning signs: seizures, difficulty breathing, severe headache, rash</li>
                            <li>✓ Paracetamol is safest fever medicine for children (10-15 mg/kg every 4-6 hours)</li>
                            <li>✓ Keep child hydrated - most important home treatment</li>
                            <li>✓ Don't overdress child or use ice baths</li>
                            <li>✓ See doctor if fever lasts more than 3 days</li>
                            <li>✓ Trust your instinct - if worried, see doctor</li>
                        </ul>

                        <Link to="/search?type=doctor&specialty=pediatrics">
                            <Button className="bg-white text-orange-600 hover:bg-gray-100">
                                Find Pediatricians Near You
                            </Button>
                        </Link>
                    </div>

                </div>
            </article>
        </div>
    );
};

export default ChildFeverPakistanPage;
