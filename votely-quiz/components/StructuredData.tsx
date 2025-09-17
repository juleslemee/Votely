import Script from 'next/script';

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Votely Political Quiz",
    "alternateName": "The Votely Quiz",
    "url": "https://votelyquiz.com",
    "logo": "https://votelyquiz.com/logo.svg",
    "description": "The most accurate political quiz with 39 axes, 81 ideologies, and 3D visualization.",
    "founder": {
      "@type": "Person",
      "name": "Jules Lemee",
      "url": "https://juleslemee.com"
    },
    "sameAs": [
      "https://juleslemee.com"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Votely Political Quiz",
    "alternateName": ["Votely Quiz", "Votely Political Compass"],
    "url": "https://votelyquiz.com",
    "description": "Take the most accurate political quiz with 39 total axes, 81 ideologies, and 3D cube visualization. Better than Political Compass, 8values, or 12axes.",
    "potentialAction": {
      "@type": "Action",
      "name": "Take Political Quiz",
      "target": "https://votelyquiz.com/quiz"
    }
  };

  const quizSchema = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": "The Votely Political Quiz",
    "description": "Comprehensive political ideology assessment across 39 dimensions",
    "educationalLevel": "All levels",
    "assesses": "Political ideology and beliefs",
    "hasPart": [
      {
        "@type": "Question",
        "name": "10-Question Quick Assessment",
        "description": "Quick political compass test for casual users"
      },
      {
        "@type": "Question", 
        "name": "50-Question Detailed Analysis",
        "description": "Comprehensive political ideology test for detailed results"
      }
    ],
    "provider": {
      "@type": "Organization",
      "name": "Votely Political Quiz",
      "url": "https://votelyquiz.com"
    }
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <Script
        id="quiz-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(quizSchema)
        }}
      />
    </>
  );
}