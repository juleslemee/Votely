'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Build breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const items = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://votelyquiz.juleslemee.com"
      }
    ];
    
    if (pathname.startsWith('/quiz')) {
      items.push({
        "@type": "ListItem",
        "position": 2,
        "name": "Political Quiz",
        "item": "https://votelyquiz.juleslemee.com/quiz"
      });
      
      if (pathname.includes('/results')) {
        items.push({
          "@type": "ListItem",
          "position": 3,
          "name": "Your Results",
          "item": "https://votelyquiz.juleslemee.com/quiz/results"
        });
      }
    }
    
    return items;
  };
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": getBreadcrumbItems()
  };
  
  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema)
      }}
    />
  );
}