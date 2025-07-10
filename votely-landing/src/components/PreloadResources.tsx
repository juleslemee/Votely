import { useEffect } from 'react';

const PreloadResources = () => {
  useEffect(() => {
    // Create preload links
    const preloadLinks = [
      { href: '/Page 1 - Learn.svg', as: 'image', type: 'image/svg+xml' },
      { href: '/Page 2 - Act.svg', as: 'image', type: 'image/svg+xml' },
      { href: '/Page 3 - Map.svg', as: 'image', type: 'image/svg+xml' }
    ];

    // Add preload links to the document head
    preloadLinks.forEach(({ href, as, type }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      link.type = type;
      document.head.appendChild(link);
    });

    // Cleanup function to remove the links when component unmounts
    return () => {
      preloadLinks.forEach(({ href }) => {
        const link = document.querySelector(`link[href="${href}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PreloadResources; 