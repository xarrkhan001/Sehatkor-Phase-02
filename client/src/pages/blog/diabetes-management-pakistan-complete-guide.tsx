import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Share2, BookmarkPlus, Heart, Activity, Apple, Droplet, Pill, Stethoscope } from "lucide-react";

const DiabetesManagementPakistanPage = () => {
    const publishDate = "February 5, 2026";
    const readTime = "10 min read";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Diabetes Management in Pakistan: Complete Guide 2026 - Control Blood Sugar Naturally",
        "description": "Complete guide to diabetes management in Pakistan. Learn about symptoms, treatment, diet plans, and how to control blood sugar naturally. Find diabetes specialists near you.",
        "image": "https://sehatkor.pk/blog/diabetes-pakistan.jpg",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
            <SEO
                title="Diabetes Management in Pakistan: Complete Guide 2026 - Control Blood Sugar"
                description="Complete guide to diabetes management in Pakistan. Learn symptoms, treatment options, diet plans, and natural remedies. Find diabetes specialists (diabetologists) near you on Sehatkor."
                keywords="diabetes Pakistan, diabetes treatment, blood sugar control, diabetes diet Pakistan, diabetologist Pakistan, diabetes doctor Karachi, diabetes doctor Lahore, diabetes symptoms, type 2 diabetes, HbA1c test Pakistan, diabetes medicine Pakistan, sugar ka ilaj, شوگر کا علاج, diabetes management, insulin Pakistan, metformin Pakistan, diabetes complications, diabetic foot care, diabetes prevention Pakistan"
                canonical="https://sehatkor.pk/blog/diabetes-management-pakistan-complete-guide"
                jsonLd={jsonLd}
                type="article"
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-12">
                <div className="container mx-auto px-6">
                    <Link to="/blog" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Chronic Disease
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                Lifestyle Management
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Diabetes Management in Pakistan: Complete Guide 2026
                        </h1>

                        <p className="text-xl text-white/90 mb-6">
                            Everything you need to know about controlling blood sugar, preventing complications, and living a healthy life with diabetes
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
                            <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-red-900 mb-2">⚠️ Diabetes in Pakistan - Growing Health Crisis</h3>
                                <p className="text-red-800">
                                    Pakistan has over <strong>33 million diabetics</strong> (2nd highest in Middle East). 1 in 4 adults over 40 has diabetes.
                                    Early detection and proper management can prevent serious complications like heart disease, kidney failure, and blindness.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="prose prose-lg max-w-none mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Diabetes (شوگر کی بیماری) is one of the fastest-growing health problems in Pakistan. With changing lifestyles,
                            increased consumption of sugary foods, and lack of physical activity, diabetes rates have skyrocketed in recent years.
                            The good news? <strong>Diabetes can be managed effectively</strong> with the right knowledge, treatment, and lifestyle changes.
                        </p>

                        <p className="text-lg text-gray-700 leading-relaxed">
                            This comprehensive guide will help you understand diabetes, recognize early symptoms, learn about treatment options available
                            in Pakistan, and most importantly, how to control your blood sugar naturally through diet and lifestyle modifications.
                        </p>
                    </div>

                    {/* Statistics Box */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-12 border border-blue-200">
                        <h3 className="font-bold text-gray-900 mb-4">📊 Diabetes in Pakistan - Key Statistics 2026:</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <ul className="space-y-2 text-gray-700">
                                <li>• <strong>33 million</strong> people with diabetes</li>
                                <li>• <strong>26.7%</strong> of adults over 40 affected</li>
                                <li>• <strong>90%</strong> have Type 2 diabetes</li>
                                <li>• <strong>50%</strong> are undiagnosed</li>
                            </ul>
                            <ul className="space-y-2 text-gray-700">
                                <li>• <strong>2nd highest</strong> in Middle East</li>
                                <li>• <strong>Urban areas</strong> more affected than rural</li>
                                <li>• <strong>Karachi, Lahore, Islamabad</strong> - highest rates</li>
                                <li>• <strong>Cost:</strong> PKR 10,000-30,000/month treatment</li>
                            </ul>
                        </div>
                    </div>

                    {/* Table of Contents */}
                    <div className="bg-blue-50 rounded-xl p-6 mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table of Contents</h2>
                        <ul className="space-y-2 text-gray-700">
                            <li>• <a href="#what-is-diabetes" className="text-blue-600 hover:underline">What is Diabetes?</a></li>
                            <li>• <a href="#types" className="text-blue-600 hover:underline">Types of Diabetes</a></li>
                            <li>• <a href="#symptoms" className="text-blue-600 hover:underline">Early Warning Signs</a></li>
                            <li>• <a href="#diagnosis" className="text-blue-600 hover:underline">Diabetes Testing in Pakistan</a></li>
                            <li>• <a href="#treatment" className="text-blue-600 hover:underline">Treatment Options</a></li>
                            <li>• <a href="#diet" className="text-blue-600 hover:underline">Diabetes Diet Plan for Pakistanis</a></li>
                            <li>• <a href="#exercise" className="text-blue-600 hover:underline">Exercise & Lifestyle</a></li>
                            <li>• <a href="#complications" className="text-blue-600 hover:underline">Preventing Complications</a></li>
                            <li>• <a href="#faqs" className="text-blue-600 hover:underline">FAQs</a></li>
                        </ul>
                    </div>

                    {/* What is Diabetes */}
                    <section id="what-is-diabetes" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Droplet className="w-8 h-8 text-blue-600" />
                            What is Diabetes? (شوگر کی بیماری کیا ہے؟)
                        </h2>

                        <p className="text-gray-700 leading-relaxed mb-4">
                            Diabetes is a chronic condition where your body either doesn't produce enough insulin or can't use insulin properly.
                            Insulin is a hormone that helps glucose (sugar) from food enter your cells to be used for energy. When this process
                            doesn't work correctly, glucose builds up in your blood, leading to high blood sugar levels.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">Normal vs Diabetic Blood Sugar Levels:</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                    <span className="font-semibold text-gray-900">Normal (Fasting):</span>
                                    <span className="text-green-700 font-bold">70-100 mg/dL</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <span className="font-semibold text-gray-900">Pre-Diabetes:</span>
                                    <span className="text-yellow-700 font-bold">100-125 mg/dL</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                    <span className="font-semibold text-gray-900">Diabetes:</span>
                                    <span className="text-red-700 font-bold">126+ mg/dL</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <span className="font-semibold text-gray-900">HbA1c (3-month average):</span>
                                    <span className="text-purple-700 font-bold">Normal: \u003c5.7% | Diabetes: ≥6.5%</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Types */}
                    <section id="types" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">📌 Types of Diabetes</h2>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                <h3 className="text-xl font-bold text-blue-900 mb-3">Type 1 Diabetes (5-10% of cases)</h3>
                                <p className="text-gray-700 mb-3">
                                    <strong>What it is:</strong> Body's immune system attacks insulin-producing cells in pancreas. Usually starts in childhood/young adults.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Treatment:</strong> Requires daily insulin injections for life. Cannot be prevented.
                                </p>
                                <p className="text-gray-700">
                                    <strong>Common in Pakistan:</strong> Rare. Most Pakistani diabetics have Type 2.
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                                <h3 className="text-xl font-bold text-green-900 mb-3">Type 2 Diabetes (90-95% of cases)</h3>
                                <p className="text-gray-700 mb-3">
                                    <strong>What it is:</strong> Body becomes resistant to insulin or doesn't produce enough. Usually develops in adults over 40.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Treatment:</strong> Can be managed with diet, exercise, and oral medications. Some may need insulin later.
                                </p>
                                <p className="text-gray-700">
                                    <strong>Common in Pakistan:</strong> Very common. Main type affecting Pakistanis. <strong>Can be prevented and reversed</strong> with lifestyle changes.
                                </p>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                                <h3 className="text-xl font-bold text-purple-900 mb-3">Gestational Diabetes (During Pregnancy)</h3>
                                <p className="text-gray-700 mb-3">
                                    <strong>What it is:</strong> High blood sugar during pregnancy. Usually goes away after delivery.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>Risk:</strong> Increases risk of Type 2 diabetes later in life for both mother and child.
                                </p>
                                <p className="text-gray-700">
                                    <strong>Common in Pakistan:</strong> Affects 10-15% of pregnant women. Requires careful monitoring.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Symptoms */}
                    <section id="symptoms" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🚨 Early Warning Signs of Diabetes</h2>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            Many Pakistanis ignore early diabetes symptoms, thinking they're just signs of aging or stress.
                            <strong>Early detection is crucial</strong> to prevent complications. Watch for these signs:
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                                <h3 className="font-bold text-red-900 mb-4">Common Symptoms (شوگر کی علامات):</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• <strong>Excessive thirst</strong> (بہت پیاس لگنا)</li>
                                    <li>• <strong>Frequent urination</strong> (بار بار پیشاب آنا)</li>
                                    <li>• <strong>Extreme hunger</strong> (بہت بھوک لگنا)</li>
                                    <li>• <strong>Unexplained weight loss</strong> (وزن کم ہونا)</li>
                                    <li>• <strong>Fatigue</strong> (تھکاوٹ)</li>
                                    <li>• <strong>Blurred vision</strong> (دھندلا نظر آنا)</li>
                                    <li>• <strong>Slow healing wounds</strong> (زخم دیر سے بھرنا)</li>
                                    <li>• <strong>Frequent infections</strong> (بار بار انفیکشن)</li>
                                </ul>
                            </div>

                            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                                <h3 className="font-bold text-orange-900 mb-4">Advanced Symptoms:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• Tingling/numbness in hands/feet</li>
                                    <li>• Dark patches on skin (neck, armpits)</li>
                                    <li>• Recurrent skin infections</li>
                                    <li>• Gum disease</li>
                                    <li>• Sexual dysfunction</li>
                                    <li>• Fruity breath odor</li>
                                    <li>• Nausea and vomiting</li>
                                    <li>• Confusion or irritability</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
                            <p className="text-gray-800">
                                <strong>⚠️ Important:</strong> Type 2 diabetes develops slowly. You may have it for years without knowing.
                                If you're over 40, overweight, or have family history of diabetes, <strong>get tested annually</strong>.
                            </p>
                        </div>
                    </section>

                    {/* Diagnosis */}
                    <section id="diagnosis" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🔬 Diabetes Testing in Pakistan</h2>

                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">1. Fasting Blood Sugar (FBS) Test</h3>
                                <p className="text-gray-700 mb-2">
                                    <strong>How it works:</strong> Blood sample taken after 8-12 hours of fasting (no food/drink except water)
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Price in Pakistan:</strong> PKR 200-500
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Results:</strong> Normal: \u003c100 | Pre-diabetes: 100-125 | Diabetes: ≥126 mg/dL
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Available at all labs: Chughtai, Essa, IDC, Shaukat Khanum, government hospitals
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">2. HbA1c Test (Glycated Hemoglobin)</h3>
                                <p className="text-gray-700 mb-2">
                                    <strong>How it works:</strong> Shows average blood sugar over past 2-3 months. No fasting required.
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Price in Pakistan:</strong> PKR 800-2,000
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Results:</strong> Normal: \u003c5.7% | Pre-diabetes: 5.7-6.4% | Diabetes: ≥6.5%
                                </p>
                                <p className="text-gray-600 text-sm">
                                    <strong>Gold standard test.</strong> Recommended for diagnosis and monitoring diabetes control.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">3. Random Blood Sugar Test</h3>
                                <p className="text-gray-700 mb-2">
                                    <strong>How it works:</strong> Blood sample taken at any time, regardless of when you last ate
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Price in Pakistan:</strong> PKR 150-400
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Results:</strong> Diabetes if ≥200 mg/dL (with symptoms)
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Quick screening test. Needs confirmation with FBS or HbA1c.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">4. Oral Glucose Tolerance Test (OGTT)</h3>
                                <p className="text-gray-700 mb-2">
                                    <strong>How it works:</strong> Fasting blood test, then drink glucose solution, test again after 2 hours
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Price in Pakistan:</strong> PKR 500-1,200
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Results:</strong> Normal: \u003c140 | Pre-diabetes: 140-199 | Diabetes: ≥200 mg/dL (2-hour)
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Used for gestational diabetes screening and borderline cases.
                                </p>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6 mt-6">
                            <h3 className="font-bold text-green-900 mb-3">💡 Free Diabetes Screening in Pakistan:</h3>
                            <p className="text-gray-700">
                                Many government hospitals and NGOs offer <strong>free diabetes screening</strong> on World Diabetes Day (November 14)
                                and during health camps. Check with your local DHQ Hospital, Baqai Diabetic Center, or Indus Hospital for free testing.
                            </p>
                        </div>
                    </section>

                    {/* Treatment */}
                    <section id="treatment" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Pill className="w-8 h-8 text-green-600" />
                            Diabetes Treatment Options in Pakistan
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-4">Oral Medications (گولیاں)</h3>

                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">1. Metformin (Most Common)</h4>
                                        <p className="text-gray-700 mb-2">
                                            <strong>Brand names in Pakistan:</strong> Glucophage, Diabex, Metphage, Gluformin
                                        </p>
                                        <p className="text-gray-700 mb-2">
                                            <strong>Price:</strong> PKR 50-300/month
                                        </p>
                                        <p className="text-gray-700 text-sm">
                                            First-line treatment for Type 2 diabetes. Reduces glucose production in liver. Take with meals to avoid stomach upset.
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">2. Sulfonylureas</h4>
                                        <p className="text-gray-700 mb-2">
                                            <strong>Brand names:</strong> Amaryl (Glimepiride), Diamicron (Gliclazide)
                                        </p>
                                        <p className="text-gray-700 mb-2">
                                            <strong>Price:</strong> PKR 200-800/month
                                        </p>
                                        <p className="text-gray-700 text-sm">
                                            Stimulates pancreas to produce more insulin. Risk of hypoglycemia (low blood sugar).
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">3. DPP-4 Inhibitors</h4>
                                        <p className="text-gray-700 mb-2">
                                            <strong>Brand names:</strong> Januvia (Sitagliptin), Galvus (Vildagliptin)
                                        </p>
                                        <p className="text-gray-700 mb-2">
                                            <strong>Price:</strong> PKR 2,000-5,000/month
                                        </p>
                                        <p className="text-gray-700 text-sm">
                                            Newer, more expensive. Lower risk of hypoglycemia. Often combined with Metformin.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                                <h3 className="font-bold text-purple-900 mb-4">Insulin Therapy (انسولین)</h3>
                                <p className="text-gray-700 mb-4">
                                    Required for Type 1 diabetes and some Type 2 cases when oral medications aren't enough.
                                </p>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Types of Insulin Available in Pakistan:</h4>
                                        <ul className="space-y-2 text-gray-700">
                                            <li>• <strong>Rapid-acting:</strong> Novorapid, Humalog (PKR 1,500-2,500/vial)</li>
                                            <li>• <strong>Long-acting:</strong> Lantus, Levemir, Tresiba (PKR 2,000-4,000/vial)</li>
                                            <li>• <strong>Mixed insulin:</strong> Mixtard, Novomix (PKR 800-1,500/vial)</li>
                                            <li>• <strong>Regular insulin:</strong> Actrapid, Humulin R (PKR 400-800/vial)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <p className="text-gray-800">
                                            <strong>💡 Tip:</strong> Insulin is available at subsidized rates at government hospitals and through
                                            Sehat Sahulat Card. Private pharmacies also offer installment plans.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Diet Section */}
                    <section id="diet" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Apple className="w-8 h-8 text-red-600" />
                            Diabetes Diet Plan for Pakistanis
                        </h2>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            Diet is the <strong>most important factor</strong> in managing diabetes. The good news? You don't need expensive
                            imported foods. Traditional Pakistani foods can be diabetes-friendly with smart choices.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                                <h3 className="font-bold text-green-900 mb-4">✅ FOODS TO EAT (کھانے کی چیزیں)</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Vegetables (سبزیاں):</h4>
                                        <p className="text-gray-700 text-sm">
                                            Karela (bitter gourd), palak (spinach), methi (fenugreek), bhindi (okra), torai, tinda,
                                            cabbage, cauliflower, broccoli, cucumber, tomatoes
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Proteins (پروٹین):</h4>
                                        <p className="text-gray-700 text-sm">
                                            Chicken (skinless), fish (especially rohu, pomfret), eggs, daal (lentils), chickpeas,
                                            kidney beans, low-fat yogurt
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Grains (اناج):</h4>
                                        <p className="text-gray-700 text-sm">
                                            Brown rice, whole wheat roti, oats, barley (jau), quinoa, multigrain atta
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Fruits (پھل):</h4>
                                        <p className="text-gray-700 text-sm">
                                            Guava (amrood), apple, pear, papaya, berries, orange (small portions)
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Nuts & Seeds:</h4>
                                        <p className="text-gray-700 text-sm">
                                            Almonds (badam), walnuts (akhrot), flax seeds (alsi), chia seeds (small portions)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                                <h3 className="font-bold text-red-900 mb-4">❌ FOODS TO AVOID (پرہیز کریں)</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Sugary Foods:</h4>
                                        <p className="text-gray-700 text-sm">
                                            White sugar, mithai (gulab jamun, jalebi, barfi), cakes, pastries, ice cream,
                                            sweetened drinks, fruit juices
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Refined Carbs:</h4>
                                        <p className="text-gray-700 text-sm">
                                            White rice, white bread, maida (all-purpose flour), naan, paratha, samosa, pakora
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Fried Foods:</h4>
                                        <p className="text-gray-700 text-sm">
                                            Deep-fried items, chips, french fries, fried chicken, puri, bhature
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">High-Fat Foods:</h4>
                                        <p className="text-gray-700 text-sm">
                                            Ghee, butter, cream, full-fat milk, fatty meat, organ meats
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Processed Foods:</h4>
                                        <p className="text-gray-700 text-sm">
                                            Biscuits, cookies, instant noodles, processed meats (sausages, salami)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                            <h3 className="font-bold text-gray-900 mb-4">🍽️ Sample Pakistani Diabetes-Friendly Meal Plan:</h3>

                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Breakfast (ناشتہ):</h4>
                                    <p className="text-gray-700">
                                        • 1 whole wheat roti + scrambled eggs (2) + cucumber/tomato<br />
                                        • OR: Oatmeal with milk (low-fat) + almonds<br />
                                        • OR: Daal chilla + green chutney
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Mid-Morning Snack:</h4>
                                    <p className="text-gray-700">
                                        • 1 small apple or guava<br />
                                        • OR: Handful of almonds (8-10)
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Lunch (دوپہر کا کھانا):</h4>
                                    <p className="text-gray-700">
                                        • 1-2 whole wheat roti + grilled chicken/fish<br />
                                        • Mixed vegetable curry (karela, bhindi, palak)<br />
                                        • Salad (cucumber, tomato, onion, lemon)<br />
                                        • Raita (low-fat yogurt)
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Evening Snack:</h4>
                                    <p className="text-gray-700">
                                        • Green tea + roasted chana<br />
                                        • OR: Vegetable soup
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Dinner (رات کا کھانا):</h4>
                                    <p className="text-gray-700">
                                        • 1 roti + daal (lentils)<br />
                                        • Grilled/baked chicken or fish<br />
                                        • Vegetable curry<br />
                                        • Salad
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Exercise */}
                    <section id="exercise" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Activity className="w-8 h-8 text-orange-600" />
                            Exercise & Lifestyle for Diabetes Control
                        </h2>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            Regular physical activity is as important as medication for diabetes management. Exercise helps lower blood sugar,
                            improves insulin sensitivity, and reduces complications.
                        </p>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6 border border-orange-200">
                            <h3 className="font-bold text-gray-900 mb-4">🎯 Exercise Goals for Diabetics:</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>✓ <strong>Minimum:</strong> 150 minutes per week (30 minutes × 5 days)</li>
                                <li>✓ <strong>Type:</strong> Mix of aerobic (walking, cycling) and strength training</li>
                                <li>✓ <strong>Intensity:</strong> Moderate (you can talk but not sing)</li>
                                <li>✓ <strong>Best time:</strong> After meals (helps lower post-meal blood sugar spike)</li>
                            </ul>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Best Exercises for Pakistanis:</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li>
                                        <strong>1. Walking (چہل قدمی):</strong><br />
                                        <span className="text-sm">Most accessible. Walk in parks, around neighborhood. Aim for 10,000 steps/day.</span>
                                    </li>
                                    <li>
                                        <strong>2. Cycling:</strong><br />
                                        <span className="text-sm">Low-impact. Good for joints. 20-30 minutes daily.</span>
                                    </li>
                                    <li>
                                        <strong>3. Swimming:</strong><br />
                                        <span className="text-sm">Full-body workout. Excellent for overweight diabetics.</span>
                                    </li>
                                    <li>
                                        <strong>4. Yoga:</strong><br />
                                        <span className="text-sm">Reduces stress, improves flexibility. Many free classes in parks.</span>
                                    </li>
                                    <li>
                                        <strong>5. Home Exercises:</strong><br />
                                        <span className="text-sm">Squats, lunges, push-ups, planks. No equipment needed.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Lifestyle Tips:</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li>
                                        <strong>Sleep:</strong><br />
                                        <span className="text-sm">Get 7-8 hours. Poor sleep increases blood sugar.</span>
                                    </li>
                                    <li>
                                        <strong>Stress Management:</strong><br />
                                        <span className="text-sm">Practice meditation, deep breathing. Stress hormones raise blood sugar.</span>
                                    </li>
                                    <li>
                                        <strong>Quit Smoking:</strong><br />
                                        <span className="text-sm">Smoking doubles risk of heart disease in diabetics.</span>
                                    </li>
                                    <li>
                                        <strong>Limit Alcohol:</strong><br />
                                        <span className="text-sm">Can cause dangerous blood sugar fluctuations.</span>
                                    </li>
                                    <li>
                                        <strong>Regular Monitoring:</strong><br />
                                        <span className="text-sm">Check blood sugar as advised. Keep a log.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Find Specialists CTA */}
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Stethoscope className="w-8 h-8" />
                            Find Diabetes Specialists on Sehatkor
                        </h2>
                        <p className="text-white/90 mb-6">
                            Book verified diabetologists (endocrinologists), get HbA1c test at home, and find diabetes care centers near you.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/search?type=doctor&specialty=endocrinology">
                                <Button className="bg-white text-green-600 hover:bg-gray-100">
                                    Find Diabetologists
                                </Button>
                            </Link>
                            <Link to="/labs">
                                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                                    Book HbA1c Test at Home
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* FAQs */}
                    <section id="faqs" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">❓ Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "Can diabetes be cured permanently?",
                                    a: "Type 1 diabetes cannot be cured. Type 2 diabetes can be reversed through significant weight loss, diet changes, and exercise. However, it requires lifelong lifestyle management. Many Pakistanis have successfully reversed Type 2 diabetes through proper diet and exercise."
                                },
                                {
                                    q: "What is the best time to check blood sugar?",
                                    a: "Fasting (before breakfast), 2 hours after meals, and before bed. Your doctor will advise specific times based on your treatment plan."
                                },
                                {
                                    q: "Can I eat rice if I have diabetes?",
                                    a: "Yes, but in moderation. Choose brown rice over white rice. Limit portion to 1/2 cup cooked rice. Pair with vegetables and protein to slow sugar absorption."
                                },
                                {
                                    q: "Is diabetes hereditary?",
                                    a: "Yes, genetics play a role. If parents have Type 2 diabetes, children have 40-50% risk. However, lifestyle factors are equally important. You can prevent it with healthy habits even with family history."
                                },
                                {
                                    q: "What are the complications of uncontrolled diabetes?",
                                    a: "Heart disease, stroke, kidney failure (dialysis), blindness (retinopathy), nerve damage (neuropathy), foot problems (amputation), infections, dental problems, sexual dysfunction."
                                },
                                {
                                    q: "Can I fast during Ramadan if I have diabetes?",
                                    a: "Consult your doctor first. Many diabetics can fast safely with medication adjustments. Monitor blood sugar frequently. Break fast immediately if sugar drops below 70 or rises above 300 mg/dL."
                                },
                                {
                                    q: "What is the cost of diabetes treatment in Pakistan per month?",
                                    a: "Varies widely: Basic oral medications: PKR 500-2,000/month. Insulin therapy: PKR 2,000-8,000/month. Monitoring supplies: PKR 1,000-3,000/month. Total: PKR 3,500-15,000/month depending on severity and treatment type."
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
                            <li>✓ Diabetes is manageable with proper treatment and lifestyle</li>
                            <li>✓ Diet and exercise are as important as medication</li>
                            <li>✓ Regular monitoring prevents complications</li>
                            <li>✓ Type 2 diabetes can be reversed with weight loss</li>
                            <li>✓ Get tested annually if you're over 40 or have risk factors</li>
                            <li>✓ Don't ignore symptoms - early detection saves lives</li>
                        </ul>

                        <Link to="/search">
                            <Button className="bg-white text-blue-600 hover:bg-gray-100">
                                Find Diabetes Specialists Near You
                            </Button>
                        </Link>
                    </div>

                </div>
            </article>
        </div>
    );
};

export default DiabetesManagementPakistanPage;
