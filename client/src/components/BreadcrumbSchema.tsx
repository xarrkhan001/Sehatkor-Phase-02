import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

/**
 * BreadcrumbSchema Component
 * 
 * Adds JSON-LD structured data for breadcrumb navigation to improve SEO.
 * Also renders visible breadcrumb navigation for better UX.
 * 
 * @param items - Array of breadcrumb items with name and URL
 */
const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
    // Create JSON-LD schema for breadcrumbs
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };

    return (
        <>
            {/* Add JSON-LD schema to head */}
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            {/* Visible breadcrumb navigation */}
            <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
                <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                            {index > 0 && (
                                <span className="text-muted-foreground/50" aria-hidden="true">
                                    /
                                </span>
                            )}
                            {index === items.length - 1 ? (
                                <span className="font-medium text-foreground" aria-current="page">
                                    {item.name}
                                </span>
                            ) : (
                                <a
                                    href={item.url}
                                    className="hover:text-foreground transition-colors hover:underline"
                                >
                                    {item.name}
                                </a>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
};

export default BreadcrumbSchema;
