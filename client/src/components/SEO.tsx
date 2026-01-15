import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'article' | 'profile';
    canonical?: string;
    jsonLd?: Record<string, any> | Record<string, any>[];
    noindex?: boolean;
}

const SEO = ({
    title,
    description,
    keywords,
    image,
    type = 'website',
    canonical,
    jsonLd,
    noindex = false
}: SEOProps) => {
    const location = useLocation();
    const siteUrl = 'https://sehatkor.pk';

    // Default Values - Comprehensive SEO Keywords (Everyday + Professional)
    const defaultTitle = 'Sehatkor - آنلائن ڈاکٹر اپائنٹمنٹ پاکستان | Book Best Doctors Online';
    const defaultDescription = "Pakistan's #1 healthcare platform. Book PMDC verified doctors, hospitals, labs & pharmacies online in Karachi, Lahore, Islamabad, Peshawar, Mardan. آنلائن ڈاکٹر بک کریں۔ 24/7 support, instant appointments, home services, lowest fees guaranteed.";
    const defaultKeywords = "online doctor Pakistan, book doctor online Pakistan, آنلائن ڈاکٹر پاکستان, PMDC verified doctors, best doctors in Pakistan, doctor appointment online, ڈاکٹر بک کریں, find doctor near me Pakistan, best doctor Karachi, best doctor Lahore, best doctor Islamabad, best doctor Peshawar, best doctor Mardan, کراچی میں ڈاکٹر, لاہور میں ڈاکٹر, اسلام آباد میں ڈاکٹر, cardiologist Pakistan, pediatrician Pakistan, gynecologist Pakistan, dermatologist Pakistan, dentist Pakistan, lady doctor Pakistan, child specialist Pakistan, ماہر امراض قلب, بچوں کا ڈاکٹر, خواتین کا ڈاکٹر, best hospitals in Pakistan, hospital near me, ہسپتال تلاش کریں, lab test Pakistan, diagnostic lab near me, لیب ٹیسٹ, blood test at home, online pharmacy Pakistan, medicine delivery Pakistan, آنلائن فارمیسی, دوائی ڈیلیوری, healthcare services Pakistan, online consultation, 24/7 doctor helpline, emergency doctor Pakistan, sehatkor, marham alternative, oladoc alternative, affordable healthcare Pakistan, home sample collection, prescription medicine delivery, doctor ki fees, ڈاکٹر کی فیس, sasta doctor, سستا ڈاکٹر, free checkup, مفت چیک اپ, bukhar ka ilaj, بخار کا علاج, pet dard ka doctor, پیٹ درد کا ڈاکٹر, sir dard ka ilaj, سر درد کا علاج, zukam ka ilaj, زکام کا علاج, khansi ka ilaj, کھانسی کا علاج, sugar ka doctor, شوگر کا ڈاکٹر, blood pressure doctor, بلڈ پریشر ڈاکٹر, dil ka doctor, دل کا ڈاکٹر, jigar ka doctor, جگر کا ڈاکٹر, kidney doctor, گردے کا ڈاکٹر, haddi ka doctor, ہڈی کا ڈاکٹر, jild ka doctor, جلد کا ڈاکٹر, ankh ka doctor, آنکھ کا ڈاکٹر, kan ka doctor, کان کا ڈاکٹر, dant ka doctor, دانت کا ڈاکٹر, bacho ka doctor, بچوں کا ڈاکٹر, pregnancy doctor, حمل کا ڈاکٹر, delivery doctor, ڈیلیوری ڈاکٹر, operation doctor, آپریشن ڈاکٹر, emergency hospital, ایمرجنسی ہسپتال, raat ko doctor, رات کو ڈاکٹر, Sunday doctor, اتوار کو ڈاکٹر, cheap hospital, سستا ہسپتال, government hospital, سرکاری ہسپتال, private hospital, پرائیویٹ ہسپتال, ghar par doctor, گھر پر ڈاکٹر, online doctor consultation, آنلائن ڈاکٹر مشورہ, video call doctor, ویڈیو کال ڈاکٹر, phone par doctor, فون پر ڈاکٹر, medicine ghar mangwao, دوائی گھر منگواؤ, dawai online, دوائی آنلائن, test ghar par, ٹیسٹ گھر پر, blood test ghar par, بلڈ ٹیسٹ گھر پر, x-ray kahan ho, ایکسرے کہاں ہو, ultrasound near me, الٹراساؤنڈ میرے قریب, COVID test kahan, کووڈ ٹیسٹ کہاں, vaccine kahan milegi, ویکسین کہاں ملے گی, injection ghar par, انجیکشن گھر پر, drip ghar par, ڈرپ گھر پر, nurse ghar par, نرس گھر پر, physiotherapy home, فزیوتھراپی گھر پر, health checkup package, ہیلتھ چیک اپ پیکیج, full body checkup, مکمل جسم کا چیک اپ, routine checkup, معمول کا چیک اپ, medical certificate, میڈیکل سرٹیفکیٹ, fitness certificate, فٹنس سرٹیفکیٹ, prescription online, نسخہ آنلائن, report online dekho, رپورٹ آنلائن دیکھو, doctor rating, ڈاکٹر کی ریٹنگ, best reviewed doctor, بہترین ریویو والا ڈاکٹر, experienced doctor, تجربہ کار ڈاکٹر, senior doctor, سینئر ڈاکٹر, specialist doctor, ماہر ڈاکٹر, MBBS doctor, ایم بی بی ایس ڈاکٹر, FCPS doctor, ایف سی پی ایس ڈاکٹر, verified doctor, تصدیق شدہ ڈاکٹر, licensed doctor, لائسنس یافتہ ڈاکٹر, qualified doctor, قابل ڈاکٹر, trustworthy doctor, قابل اعتماد ڈاکٹر, family doctor, فیملی ڈاکٹر, home doctor, گھریلو ڈاکٹر, urgent care, فوری علاج, instant appointment, فوری اپائنٹمنٹ, same day appointment, اسی دن اپائنٹمنٹ, walk-in clinic, واک ان کلینک, no waiting doctor, بغیر انتظار ڈاکٹر, quick consultation, فوری مشورہ, telemedicine Pakistan, ٹیلی میڈیسن پاکستان, digital health Pakistan, ڈیجیٹل صحت پاکستان, health app Pakistan, صحت ایپ پاکستان, medical app, میڈیکل ایپ, doctor booking app, ڈاکٹر بکنگ ایپ, hospital app, ہسپتال ایپ, lab booking app, لیب بکنگ ایپ, pharmacy app, فارمیسی ایپ, gastroenterologist Pakistan, pulmonologist Pakistan, nephrologist Pakistan, urologist Pakistan, neurologist Pakistan, psychiatrist Pakistan, psychologist Pakistan, endocrinologist Pakistan, rheumatologist Pakistan, oncologist Pakistan, hematologist Pakistan, ophthalmologist Pakistan, otolaryngologist Pakistan, general surgeon Pakistan, cardiac surgeon Pakistan, neurosurgeon Pakistan, orthopedic surgeon Pakistan, plastic surgeon Pakistan, vascular surgeon Pakistan, interventional cardiologist, electrophysiologist, neonatologist Pakistan, obstetrician Pakistan, radiologist Pakistan, pathologist Pakistan, anesthesiologist Pakistan, intensivist Pakistan, emergency medicine specialist, internal medicine specialist, infectious disease specialist, allergy specialist Pakistan, immunologist Pakistan, sports medicine specialist, pain management specialist, palliative care specialist, geriatrician Pakistan, adolescent medicine, preventive medicine, occupational medicine, medical imaging Pakistan, diagnostic radiology, interventional radiology, nuclear medicine Pakistan, PET scan Pakistan, bone density scan, mammography Pakistan, echocardiography, stress test Pakistan, holter monitoring, endoscopy Pakistan, colonoscopy Pakistan, bronchoscopy, cystoscopy, laparoscopy Pakistan, arthroscopy, biopsy services Pakistan, genetic testing Pakistan, molecular diagnostics, clinical pathology, histopathology Pakistan, cytology services, microbiology lab, serology testing, immunology testing, hormone testing, tumor markers, cardiac biomarkers, therapeutic drug monitoring, toxicology screening, prenatal testing, newborn screening, fertility testing, STD testing Pakistan, allergy testing Pakistan, sleep study Pakistan, pulmonary function test, spirometry Pakistan, audiometry hearing test, vision screening, bone marrow test, dialysis services Pakistan, chemotherapy Pakistan, radiation therapy, physical therapy Pakistan, occupational therapy, speech therapy Pakistan, cardiac rehabilitation, pulmonary rehabilitation, pain management clinic, wound care clinic, diabetes management, hypertension clinic, asthma clinic, COPD management, chronic disease management, preventive healthcare Pakistan, wellness programs Pakistan, health screening programs, corporate health packages, executive health checkup, pre-employment medical, insurance medical examination, visa medical Pakistan, travel medicine clinic, vaccination services Pakistan, immunization schedule, pediatric vaccination, adult vaccination, travel vaccines, flu shot Pakistan, COVID vaccination, medical tourism Pakistan, second opinion services, medical records management, electronic health records, patient portal Pakistan, health information system, hospital management system, clinic management software, laboratory information system, pharmacy management system, medical billing services, health insurance Pakistan, medical insurance claims, cashless treatment Pakistan, panel hospitals, network hospitals, healthcare financing, medical loans Pakistan, treatment packages, surgery packages Pakistan, maternity packages, diagnostic packages, wellness packages";
    const defaultImage = `${siteUrl}/og-image.jpg`;

    const finalTitle = title ? `${title} | Sehatkor` : defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalKeywords = keywords || defaultKeywords;
    const finalImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
    const finalUrl = canonical || `${siteUrl}${location.pathname}`;

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={finalKeywords} />
            <link rel="canonical" href={finalUrl} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:site_name" content="Sehatkor" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={finalUrl} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={finalImage} />

            {/* Structured Data (JSON-LD) */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
