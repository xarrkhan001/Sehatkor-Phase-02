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

    // Default Values
    const defaultTitle = 'Sehatkor - آنلائن ڈاکٹر اپائنٹمنٹ پاکستان | Book Best Doctors Online';
    const defaultDescription = "Pakistan's #1 healthcare platform. Book verified doctors online in Karachi, Lahore, Islamabad. آنلائن ڈاکٹر بک کریں۔ 24/7 support, instant appointments, lowest fees.";
    const defaultKeywords = "online doctor Pakistan, doctor appointment, آنلائن ڈاکٹر, book doctor online, doctor near me, best doctor Karachi, best doctor Mardan, best doctor Peshawar, Lahore doctor, Islamabad hospital, lady doctor, child specialist, skin doctor, heart specialist, online consultation, lab test home, pharmacy delivery, sehatkor, marham alternative, oladoc alternative, PMDC verified doctors, 24/7 doctor helpline, video consultation, emergency doctor, prescription online, affordable healthcare Pakistan";
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
