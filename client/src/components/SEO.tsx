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
    additionalMeta?: Record<string, string | undefined>;
    lang?: string;
    dir?: 'ltr' | 'rtl';
}

const SEO = ({
    title,
    description,
    keywords,
    image,
    type = 'website',
    canonical,
    jsonLd,
    noindex = false,
    additionalMeta,
    lang = 'en',
    dir = 'ltr'
}: SEOProps) => {
    const location = useLocation();
    const siteUrl = 'https://sehatkor.pk';

    // Default Values - Comprehensive SEO Keywords (Everyday + Professional)
    const defaultTitle = 'Sehatkor - آنلائن ڈاکٹر اپائنٹمنٹ پاکستان | Book Best Doctors Online';
    const defaultDescription = "Pakistan's #1 healthcare platform. Book PMDC verified doctors, hospitals, labs & pharmacies online in Karachi, Lahore, Islamabad, Peshawar, Mardan. آنلائن ڈاکٹر بک کریں۔ 24/7 support, instant appointments, home services, lowest fees guaranteed.";
    const defaultKeywords = "sehatkor, sehat kor, sehatkor.pk, online doctor Pakistan, book doctor online, doctor appointment Pakistan, PMDC verified doctors, best doctors in Pakistan, find doctor Karachi, best doctor Lahore, online pharmacy Pakistan, medicine delivery, lab tests at home, health platform, health services online, doctor consultation, medical help Pakistan, صحت کور، آنلائن ڈاکٹر، میڈیکل سروس، پاکستان ہیلتھ کیر، ڈاکٹر دکھاؤ";
    const defaultImage = `${siteUrl}/og-image.jpg`;

    const finalTitle = title ? `${title} | Sehatkor` : defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalKeywords = keywords || defaultKeywords;
    const finalImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
    const finalUrl = (canonical || `${siteUrl}${location.pathname}`).replace(/\/$/, "");

    return (
        <Helmet
            htmlAttributes={{
                lang,
                dir
            }}
        >
            {/* Standard Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={finalKeywords} />
            <link rel="canonical" href={finalUrl} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Additional Meta Tags */}
            {additionalMeta && Object.entries(additionalMeta).map(([key, value]) =>
                value ? <meta key={key} name={key} content={value} /> : null
            )}

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
