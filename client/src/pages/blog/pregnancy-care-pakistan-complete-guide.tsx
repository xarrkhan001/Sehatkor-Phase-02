import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Baby, Heart, AlertTriangle, Stethoscope } from "lucide-react";

const PregnancyCarePakistanPage = () => {
    const publishDate = "February 5, 2026";
    const readTime = "10 min read";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Pregnancy Care in Pakistan: Complete Guide 2026 - Prenatal Care & Delivery",
        "description": "Complete pregnancy care guide for Pakistani women. Learn about prenatal checkups, diet, tests, complications, delivery options, and finding the best gynecologists in Pakistan.",
        "image": "https://sehatkor.pk/blog/pregnancy-care-pakistan.jpg",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
            <SEO
                title="Pregnancy Care in Pakistan: Complete Guide 2026 - Prenatal Care & Delivery"
                description="Complete pregnancy care guide for Pakistani women. Learn about prenatal checkups, essential tests, diet plans, complications, delivery options (normal vs C-section), and find the best gynecologists and maternity hospitals in Pakistan."
                keywords="pregnancy care Pakistan, gynecologist Pakistan, pregnancy doctor Karachi, pregnancy doctor Lahore, prenatal care Pakistan, pregnancy test Pakistan, pregnancy diet Pakistan, pregnancy complications, C-section Pakistan, normal delivery Pakistan, maternity hospital Pakistan, pregnancy checkup, ultrasound Pakistan, حمل کی دیکھ بھال, حاملہ خواتین, pregnancy symptoms, pregnancy week by week, antenatal care, obstetrics Pakistan, best gynecologist Karachi, best gynecologist Lahore, pregnancy cost Pakistan"
                canonical="https://sehatkor.pk/blog/pregnancy-care-pakistan-complete-guide"
                jsonLd={jsonLd}
                type="article"
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-12">
                <div className="container mx-auto px-6">
                    <Link to="/blog" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Women's Health
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Maternity Care
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Pregnancy Care in Pakistan: Complete Guide 2026
                        </h1>

                        <p className="text-xl text-white/90 mb-6">
                            Everything you need to know about prenatal care, diet, tests, delivery options, and finding the best gynecologists in Pakistan
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
                    <div className="bg-pink-50 border-l-4 border-pink-600 p-6 rounded-lg mb-8">
                        <div className="flex items-start gap-3">
                            <Baby className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-pink-900 mb-2">🤰 Pregnancy in Pakistan - Important Facts</h3>
                                <p className="text-pink-800">
                                    Pakistan has a <strong>maternal mortality rate of 186 per 100,000 live births</strong>. Many complications are preventable with
                                    proper prenatal care. <strong>Regular checkups, proper nutrition, and choosing the right hospital</strong> can ensure a safe pregnancy
                                    and healthy baby.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="prose prose-lg max-w-none mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Pregnancy (حمل) is a beautiful journey that requires proper care and attention. In Pakistan, many women face challenges due to lack of
                            awareness, limited access to quality healthcare, and cultural barriers. This comprehensive guide will help you understand pregnancy stages,
                            essential prenatal care, diet recommendations for Pakistani women, common complications, and how to choose between normal delivery and C-section.
                        </p>

                        <p className="text-lg text-gray-700 leading-relaxed">
                            Whether you're planning pregnancy, newly pregnant, or in your third trimester, this guide provides practical advice tailored to Pakistani
                            women's needs and local healthcare system.
                        </p>
                    </div>

                    {/* Pregnancy Stages */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Baby className="w-8 h-8 text-pink-600" />
                            Pregnancy Stages - Week by Week (حمل کے مراحل)
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-pink-200">
                                <h3 className="text-xl font-bold text-pink-900 mb-4">First Trimester (Week 1-12)</h3>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">What's Happening:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>• Baby's major organs forming (heart, brain, spinal cord)</li>
                                            <li>• Baby size: From poppy seed to lime (0.5-2.5 inches)</li>
                                            <li>• Heartbeat detectable by week 6</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Common Symptoms:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>• Morning sickness (متلی) - nausea, vomiting</li>
                                            <li>• Extreme fatigue (تھکاوٹ)</li>
                                            <li>• Breast tenderness</li>
                                            <li>• Frequent urination</li>
                                            <li>• Food cravings or aversions</li>
                                            <li>• Mood swings</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Essential Care:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>✓ First prenatal visit (confirm pregnancy, dating ultrasound)</li>
                                            <li>✓ Start prenatal vitamins (folic acid 400-800 mcg)</li>
                                            <li>✓ Avoid alcohol, smoking, raw foods</li>
                                            <li>✓ Eat small, frequent meals for nausea</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                                <h3 className="text-xl font-bold text-blue-900 mb-4">Second Trimester (Week 13-26)</h3>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">What's Happening:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>• Baby's organs maturing, bones hardening</li>
                                            <li>• Baby can hear sounds, suck thumb</li>
                                            <li>• Baby size: From lemon to cauliflower (3-14 inches)</li>
                                            <li>• You'll feel baby's movements (quickening)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Common Symptoms:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>• Morning sickness improves</li>
                                            <li>• Energy returns (best trimester!)</li>
                                            <li>• Baby bump visible</li>
                                            <li>• Back pain, leg cramps</li>
                                            <li>• Skin changes (dark patches, stretch marks)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Essential Care:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>✓ Anatomy scan ultrasound (18-20 weeks)</li>
                                            <li>✓ Glucose tolerance test (24-28 weeks)</li>
                                            <li>✓ Start prenatal exercises (walking, yoga)</li>
                                            <li>✓ Moisturize skin to prevent stretch marks</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                                <h3 className="text-xl font-bold text-purple-900 mb-4">Third Trimester (Week 27-40)</h3>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">What's Happening:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>• Baby gaining weight rapidly</li>
                                            <li>• Lungs maturing, preparing for birth</li>
                                            <li>• Baby size: From cabbage to watermelon (14-20 inches)</li>
                                            <li>• Baby moving into head-down position</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Common Symptoms:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>• Shortness of breath (baby pressing on lungs)</li>
                                            <li>• Frequent urination (baby pressing on bladder)</li>
                                            <li>• Heartburn, indigestion</li>
                                            <li>• Swelling in feet/ankles</li>
                                            <li>• Braxton Hicks contractions (practice contractions)</li>
                                            <li>• Difficulty sleeping</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Essential Care:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>✓ Weekly checkups (after 36 weeks)</li>
                                            <li>✓ Monitor baby's movements daily</li>
                                            <li>✓ Prepare hospital bag</li>
                                            <li>✓ Learn labor signs</li>
                                            <li>✓ Discuss birth plan with doctor</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Prenatal Checkups */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">📅 Prenatal Checkup Schedule</h2>

                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4">Recommended Visit Schedule:</h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
                                    <div className="w-24 flex-shrink-0 font-semibold text-pink-900">Weeks 4-28:</div>
                                    <div className="text-gray-700">Once a month (monthly checkups)</div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-24 flex-shrink-0 font-semibold text-blue-900">Weeks 28-36:</div>
                                    <div className="text-gray-700">Every 2 weeks (bi-weekly checkups)</div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                                    <div className="w-24 flex-shrink-0 font-semibold text-purple-900">Weeks 36-40:</div>
                                    <div className="text-gray-700">Every week (weekly checkups)</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                            <h3 className="font-bold text-gray-900 mb-4">What Happens at Each Visit:</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>✓ Weight and blood pressure check</li>
                                <li>✓ Urine test (protein, sugar, infection)</li>
                                <li>✓ Baby's heartbeat check</li>
                                <li>✓ Fundal height measurement (uterus size)</li>
                                <li>✓ Discussion of symptoms and concerns</li>
                                <li>✓ Ultrasound (at specific weeks)</li>
                            </ul>
                        </div>
                    </section>

                    {/* Essential Tests */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🔬 Essential Pregnancy Tests in Pakistan</h2>

                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">First Trimester Tests:</h3>

                                <div className="space-y-3">
                                    <div className="border-l-4 border-pink-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">1. Pregnancy Confirmation Test (Urine/Blood)</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>When:</strong> As soon as period is missed</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Confirm pregnancy</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 100-500</p>
                                    </div>

                                    <div className="border-l-4 border-blue-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">2. Dating Ultrasound</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>When:</strong> 6-9 weeks</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Confirm due date, check heartbeat, rule out ectopic pregnancy</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 1,500-3,000</p>
                                    </div>

                                    <div className="border-l-4 border-green-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">3. Complete Blood Count (CBC)</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>When:</strong> First visit</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Check for anemia, infections</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 500-1,000</p>
                                    </div>

                                    <div className="border-l-4 border-purple-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">4. Blood Group & Rh Factor</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>When:</strong> First visit</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Check Rh incompatibility risk</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 300-800</p>
                                    </div>

                                    <div className="border-l-4 border-red-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">5. Infectious Disease Screening</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Tests:</strong> Hepatitis B, Hepatitis C, HIV, Syphilis</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Prevent transmission to baby</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 2,000-5,000 (complete panel)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Second Trimester Tests:</h3>

                                <div className="space-y-3">
                                    <div className="border-l-4 border-blue-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">6. Anatomy Scan (Level 2 Ultrasound)</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>When:</strong> 18-20 weeks</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Check baby's organs, detect abnormalities, determine gender</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 3,000-6,000</p>
                                    </div>

                                    <div className="border-l-4 border-orange-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">7. Glucose Tolerance Test (GTT)</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>When:</strong> 24-28 weeks</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Screen for gestational diabetes</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 800-1,500</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Third Trimester Tests:</h3>

                                <div className="space-y-3">
                                    <div className="border-l-4 border-purple-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">8. Growth Scan Ultrasound</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>When:</strong> 32-36 weeks</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Check baby's growth, position, amniotic fluid</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 2,000-4,000</p>
                                    </div>

                                    <div className="border-l-4 border-green-600 pl-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">9. Group B Strep Test</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>When:</strong> 35-37 weeks</p>
                                        <p className="text-gray-700 text-sm mb-1"><strong>Purpose:</strong> Prevent infection during delivery</p>
                                        <p className="text-gray-600 text-sm"><strong>Price:</strong> PKR 1,000-2,000</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg mt-6">
                            <h3 className="font-bold text-gray-900 mb-2">💰 Total Estimated Cost of Pregnancy Tests:</h3>
                            <p className="text-gray-700">
                                <strong>Basic Package:</strong> PKR 15,000-30,000 (government hospitals)<br />
                                <strong>Premium Package:</strong> PKR 40,000-80,000 (private hospitals with all tests)
                            </p>
                        </div>
                    </section>

                    {/* Pregnancy Diet */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🍽️ Pregnancy Diet Plan for Pakistani Women</h2>

                        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 mb-6 border border-green-200">
                            <h3 className="font-bold text-green-900 mb-4">Essential Nutrients During Pregnancy:</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Folic Acid (فولک ایسڈ)</h4>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Why:</strong> Prevents neural tube defects</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Amount:</strong> 400-800 mcg daily</p>
                                    <p className="text-gray-700 text-sm"><strong>Sources:</strong> Spinach (palak), lentils (daal), fortified flour</p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Iron (آئرن)</h4>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Why:</strong> Prevents anemia, supports baby's growth</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Amount:</strong> 27 mg daily</p>
                                    <p className="text-gray-700 text-sm"><strong>Sources:</strong> Red meat, liver, eggs, dates (khajoor)</p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Calcium (کیلشیم)</h4>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Why:</strong> Baby's bone development</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Amount:</strong> 1,000 mg daily</p>
                                    <p className="text-gray-700 text-sm"><strong>Sources:</strong> Milk, yogurt (dahi), cheese, almonds (badam)</p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Protein (پروٹین)</h4>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Why:</strong> Baby's tissue and organ development</p>
                                    <p className="text-gray-700 text-sm mb-2"><strong>Amount:</strong> 70-100g daily</p>
                                    <p className="text-gray-700 text-sm"><strong>Sources:</strong> Chicken, fish, eggs, lentils, beans</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4">Sample Pakistani Meal Plan:</h3>

                            <div className="space-y-4">
                                <div className="border-l-4 border-orange-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Breakfast (ناشتہ):</h4>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• 2 whole wheat parathas with egg omelet</li>
                                        <li>• 1 glass milk or lassi</li>
                                        <li>• 1 banana or apple</li>
                                        <li>• Handful of almonds/walnuts</li>
                                    </ul>
                                </div>

                                <div className="border-l-4 border-green-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Mid-Morning Snack:</h4>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• Fresh fruit (orange, apple, pomegranate)</li>
                                        <li>• OR yogurt with honey</li>
                                        <li>• OR dates (3-4 khajoor)</li>
                                    </ul>
                                </div>

                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Lunch (دوپہر کا کھانا):</h4>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• 2 chapatis (whole wheat)</li>
                                        <li>• Chicken curry or daal (lentils)</li>
                                        <li>• Vegetable curry (palak, bhindi, karela)</li>
                                        <li>• Salad (cucumber, tomato, carrot)</li>
                                        <li>• 1 glass buttermilk or water</li>
                                    </ul>
                                </div>

                                <div className="border-l-4 border-purple-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Evening Snack:</h4>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• Fruit chaat</li>
                                        <li>• OR boiled chickpeas (chana)</li>
                                        <li>• OR whole grain biscuits with tea</li>
                                    </ul>
                                </div>

                                <div className="border-l-4 border-red-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Dinner (رات کا کھانا):</h4>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• 2 chapatis or brown rice</li>
                                        <li>• Fish curry or grilled chicken</li>
                                        <li>• Vegetable curry</li>
                                        <li>• Raita (yogurt with cucumber)</li>
                                        <li>• 1 glass warm milk before bed</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                                <h3 className="font-bold text-green-900 mb-4">✅ Foods to Eat:</h3>
                                <ul className="space-y-2 text-gray-700 text-sm">
                                    <li>✓ Fresh fruits (especially citrus, pomegranate)</li>
                                    <li>✓ Green vegetables (palak, methi, broccoli)</li>
                                    <li>✓ Whole grains (brown rice, whole wheat)</li>
                                    <li>✓ Lean proteins (chicken, fish, eggs)</li>
                                    <li>✓ Dairy products (milk, yogurt, cheese)</li>
                                    <li>✓ Nuts & seeds (almonds, walnuts)</li>
                                    <li>✓ Lentils & beans (all types of daal)</li>
                                    <li>✓ Dates (khajoor) - excellent for iron</li>
                                </ul>
                            </div>

                            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                                <h3 className="font-bold text-red-900 mb-4">❌ Foods to Avoid:</h3>
                                <ul className="space-y-2 text-gray-700 text-sm">
                                    <li>✗ Raw/undercooked meat, eggs, fish</li>
                                    <li>✗ Unpasteurized milk & cheese</li>
                                    <li>✗ Raw papaya (can cause contractions)</li>
                                    <li>✗ Pineapple (in large amounts)</li>
                                    <li>✗ High-mercury fish (swordfish, king mackerel)</li>
                                    <li>✗ Alcohol (completely avoid)</li>
                                    <li>✗ Excessive caffeine (limit to 200mg/day)</li>
                                    <li>✗ Street food (risk of infection)</li>
                                    <li>✗ Junk food, excessive sweets</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Complications */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">⚠️ Common Pregnancy Complications in Pakistan</h2>

                        <div className="space-y-4">
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                                <h3 className="font-bold text-red-900 mb-4">1. Gestational Diabetes (حمل کی ذیابیطس)</h3>
                                <p className="text-gray-700 mb-3">
                                    <strong>What it is:</strong> High blood sugar during pregnancy. Common in Pakistani women due to genetics and diet.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Symptoms:</strong> Excessive thirst, frequent urination, fatigue
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Management:</strong> Diet control, exercise, blood sugar monitoring. Insulin if needed.
                                </p>
                                <p className="text-gray-700">
                                    <strong>Risk:</strong> Large baby, C-section need, baby's low blood sugar at birth
                                </p>
                            </div>

                            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                                <h3 className="font-bold text-orange-900 mb-4">2. Preeclampsia (High Blood Pressure)</h3>
                                <p className="text-gray-700 mb-3">
                                    <strong>What it is:</strong> High BP + protein in urine after 20 weeks
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Warning Signs:</strong> Severe headache, vision changes, upper abdominal pain, sudden swelling
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Management:</strong> Close monitoring, medications, early delivery if severe
                                </p>
                                <p className="text-gray-700">
                                    <strong>Risk:</strong> Can be life-threatening if untreated. Leading cause of maternal death in Pakistan.
                                </p>
                            </div>

                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                                <h3 className="font-bold text-yellow-900 mb-4">3. Anemia (خون کی کمی)</h3>
                                <p className="text-gray-700 mb-3">
                                    <strong>What it is:</strong> Low hemoglobin. Very common in Pakistani pregnant women (50-60%).
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Symptoms:</strong> Extreme fatigue, pale skin, dizziness, shortness of breath
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Management:</strong> Iron supplements, iron-rich diet (red meat, liver, dates, spinach)
                                </p>
                                <p className="text-gray-700">
                                    <strong>Risk:</strong> Premature birth, low birth weight, postpartum hemorrhage
                                </p>
                            </div>

                            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                                <h3 className="font-bold text-purple-900 mb-4">4. Miscarriage (اسقاط حمل)</h3>
                                <p className="text-gray-700 mb-3">
                                    <strong>What it is:</strong> Loss of pregnancy before 20 weeks. Occurs in 10-20% of pregnancies.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Warning Signs:</strong> Vaginal bleeding, severe cramping, tissue passing
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Action:</strong> Call doctor immediately if bleeding occurs
                                </p>
                                <p className="text-gray-700">
                                    <strong>Note:</strong> Most miscarriages are due to chromosomal abnormalities, not mother's fault.
                                </p>
                            </div>
                        </div>

                        <div className="bg-red-100 border-2 border-red-600 rounded-xl p-6 mt-6">
                            <h3 className="text-xl font-bold text-red-900 mb-4">🚨 EMERGENCY SIGNS - Go to Hospital Immediately:</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                <ul className="space-y-2 text-red-900">
                                    <li>⚠️ Heavy vaginal bleeding</li>
                                    <li>⚠️ Severe abdominal pain</li>
                                    <li>⚠️ Severe headache with vision changes</li>
                                    <li>⚠️ High fever (above 101°F)</li>
                                </ul>
                                <ul className="space-y-2 text-red-900">
                                    <li>⚠️ Baby's movements decreased/stopped</li>
                                    <li>⚠️ Water breaking before 37 weeks</li>
                                    <li>⚠️ Severe swelling (face, hands)</li>
                                    <li>⚠️ Difficulty breathing</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Delivery Options */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🏥 Delivery Options: Normal vs C-Section</h2>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                                <h3 className="text-xl font-bold text-green-900 mb-4">Normal Delivery (قدرتی ولادت)</h3>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Advantages:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>✓ Faster recovery (1-2 days hospital)</li>
                                            <li>✓ Lower infection risk</li>
                                            <li>✓ Baby gets beneficial bacteria</li>
                                            <li>✓ Immediate breastfeeding</li>
                                            <li>✓ Lower cost</li>
                                            <li>✓ Easier future pregnancies</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Disadvantages:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>• Labor pain (can be managed with epidural)</li>
                                            <li>• Possible tearing/episiotomy</li>
                                            <li>• Unpredictable timing</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-gray-700 text-sm">
                                            <strong>Cost in Pakistan:</strong> PKR 30,000-100,000 (private hospitals)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                                <h3 className="text-xl font-bold text-blue-900 mb-4">C-Section (سیزیرین)</h3>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Advantages:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>✓ Scheduled (can plan)</li>
                                            <li>✓ No labor pain</li>
                                            <li>✓ Necessary for certain complications</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Disadvantages:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            <li>• Major surgery with risks</li>
                                            <li>• Longer recovery (4-6 weeks)</li>
                                            <li>• Higher infection risk</li>
                                            <li>• Delayed breastfeeding</li>
                                            <li>• Higher cost</li>
                                            <li>• Complications in future pregnancies</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-gray-700 text-sm">
                                            <strong>Cost in Pakistan:</strong> PKR 80,000-250,000 (private hospitals)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
                            <h3 className="font-bold text-gray-900 mb-3">When is C-Section Necessary?</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Baby in breech position (feet first)</li>
                                <li>• Placenta previa (placenta blocking cervix)</li>
                                <li>• Multiple babies (twins, triplets)</li>
                                <li>• Previous C-section (in some cases)</li>
                                <li>• Baby's head too large for pelvis</li>
                                <li>• Fetal distress during labor</li>
                                <li>• Prolonged labor not progressing</li>
                                <li>• Maternal health conditions (severe preeclampsia, heart disease)</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                <strong>Note:</strong> In Pakistan, C-section rate is 20-30% (higher in private hospitals). WHO recommends 10-15%.
                                Discuss with your doctor - don't choose C-section for convenience alone.
                            </p>
                        </div>
                    </section>

                    {/* Best Hospitals */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🏥 Best Maternity Hospitals in Pakistan</h2>

                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Karachi:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Aga Khan University Hospital</strong> - World-class maternity care, NICU</li>
                                    <li>• <strong>Liaquat National Hospital</strong> - Excellent obstetrics department</li>
                                    <li>• <strong>South City Hospital</strong> - Modern facilities, experienced gynecologists</li>
                                    <li>• <strong>Ziauddin Hospital</strong> - Multiple branches, good maternity services</li>
                                    <li>• <strong>Jinnah Hospital</strong> - Government, affordable</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Lahore:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Shaukat Khanum Hospital</strong> - Excellent care, subsidized rates</li>
                                    <li>• <strong>Hameed Latif Hospital</strong> - Specialized maternity wing</li>
                                    <li>• <strong>Fatima Memorial Hospital</strong> - Good reputation</li>
                                    <li>• <strong>Services Hospital</strong> - Government, affordable</li>
                                    <li>• <strong>Ganga Ram Hospital</strong> - Established maternity services</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Islamabad/Rawalpindi:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Shifa International Hospital</strong> - Top-tier maternity care</li>
                                    <li>• <strong>Maroof International Hospital</strong> - Modern facilities</li>
                                    <li>• <strong>Fauji Foundation Hospital</strong> - Good services</li>
                                    <li>• <strong>PIMS Hospital</strong> - Government teaching hospital</li>
                                    <li>• <strong>Holy Family Hospital</strong> - Established maternity ward</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Find Gynecologist CTA */}
                    <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-8 text-white mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Stethoscope className="w-8 h-8" />
                            Find Best Gynecologists on Sehatkor
                        </h2>
                        <p className="text-white/90 mb-6">
                            Book verified gynecologists, get prenatal tests at home, and find the best maternity hospitals near you.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/search?type=doctor&specialty=gynecology">
                                <Button className="bg-white text-pink-600 hover:bg-gray-100">
                                    Find Gynecologists
                                </Button>
                            </Link>
                            <Link to="/labs">
                                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                                    Book Pregnancy Tests
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
                                    q: "How much does pregnancy cost in Pakistan?",
                                    a: "Government hospitals: PKR 10,000-30,000 (total). Private hospitals: PKR 150,000-400,000 (including all checkups, tests, and delivery). C-section costs 2-3x more than normal delivery."
                                },
                                {
                                    q: "Can I work during pregnancy?",
                                    a: "Yes, most women can work until 8th month if pregnancy is normal. Pakistan labor law provides 12 weeks maternity leave (6 weeks before, 6 weeks after delivery). Avoid heavy lifting, prolonged standing, and stressful work."
                                },
                                {
                                    q: "Is it safe to travel during pregnancy?",
                                    a: "Second trimester (14-28 weeks) is safest for travel. Avoid travel in first trimester (miscarriage risk) and third trimester (early labor risk). Always consult your doctor before traveling. Carry medical records."
                                },
                                {
                                    q: "Can I have a normal delivery after previous C-section?",
                                    a: "Yes, VBAC (Vaginal Birth After Cesarean) is possible in 60-80% of cases if: 1) Previous C-section was low transverse incision, 2) No uterine rupture history, 3) Hospital has emergency C-section facility. Discuss with your gynecologist."
                                },
                                {
                                    q: "What vaccines do I need during pregnancy?",
                                    a: "Recommended: Tetanus toxoid (TT) - 2 doses during pregnancy. Flu vaccine (if flu season). Avoid: MMR, chickenpox, HPV (live vaccines). Get vaccinated before pregnancy if possible."
                                },
                                {
                                    q: "How can I reduce C-section risk?",
                                    a: "1) Choose a doctor with low C-section rate, 2) Stay active during pregnancy, 3) Attend childbirth classes, 4) Avoid unnecessary induction, 5) Have a birth plan, 6) Consider hiring a doula, 7) Stay patient during labor."
                                },
                                {
                                    q: "Is ultrasound safe? How many should I have?",
                                    a: "Yes, ultrasound is safe. Recommended: 3-4 scans (dating scan at 6-9 weeks, anatomy scan at 18-20 weeks, growth scan at 32-36 weeks). Avoid unnecessary 3D/4D scans for entertainment."
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
                    <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">🎯 Key Takeaways</h2>
                        <ul className="space-y-2 mb-6">
                            <li>✓ Start prenatal care as soon as you know you're pregnant</li>
                            <li>✓ Attend all scheduled checkups and get recommended tests</li>
                            <li>✓ Eat a balanced diet with folic acid, iron, and calcium</li>
                            <li>✓ Stay active with safe exercises (walking, prenatal yoga)</li>
                            <li>✓ Know emergency warning signs and when to call doctor</li>
                            <li>✓ Choose a hospital with NICU and 24/7 emergency services</li>
                            <li>✓ Discuss delivery options with your gynecologist</li>
                            <li>✓ Prepare mentally and physically for motherhood</li>
                        </ul>

                        <Link to="/search?type=doctor&specialty=gynecology">
                            <Button className="bg-white text-pink-600 hover:bg-gray-100">
                                Find Gynecologists Near You
                            </Button>
                        </Link>
                    </div>

                </div>
            </article>
        </div>
    );
};

export default PregnancyCarePakistanPage;
