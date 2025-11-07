import { Helmet } from 'react-helmet';

const SEOHead = ({ 
  title, 
  description, 
  image, 
  product = null,
  canonicalUrl 
}) => {
  const siteName = import.meta.env.VITE_SITE_NAME || "YourEase";
  const siteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:5173";
  const defaultImage = "/logo.png";
  
  const metaTitle = title ? `${title} - ${siteName}` : siteName;
  const metaDescription = description || "Your one-stop shop for amazing products";
  const metaImage = image || product?.images?.[0]?.url || defaultImage;
  const metaUrl = canonicalUrl || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Product Schema.org Structured Data */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title,
            "description": product.description || product.shortDescription,
            "image": product.images?.map(img => img.url) || [],
            "sku": product._id,
            "brand": {
              "@type": "Brand",
              "name": siteName
            },
            "offers": {
              "@type": "Offer",
              "url": `${siteUrl}/product/${product._id}`,
              "priceCurrency": "INR",
              "price": product.currentPrice,
              "availability": product.countInStock > 0 ? 
                "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": siteName
              }
            }
          })}
        </script>
      )}

      {/* Website Schema.org */}
      {!product && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": siteUrl,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${siteUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;