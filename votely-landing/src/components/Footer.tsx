const Footer = () => {
  return (
    <footer className="bg-votely-white py-12 border-t border-gray-200">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2">
              <img 
                src="/VotelyLogo.svg" 
                alt="Votely Logo" 
                className="w-10 h-10"
              />
              <span className="font-bold text-xl text-votely-grape">Votely</span>
            </a>
            <br></br>
            <p className="text-gray-600 max-w-xs">
            Discover where you stand and start making a difference in your community.
            </p>
          </div>
          
          {/* Quick Links & Legal side by side on xs+ */}
          <div className="col-span-2 w-full">
            <div className="footer-links-mobile flex flex-col gap-8">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/#features" className="text-gray-600 hover:text-votely-grape transition-colors">The Problem</a>
                  </li>
                  <li>
                    <a href="/#how-it-works" className="text-gray-600 hover:text-votely-grape transition-colors">Our Solution</a>
                  </li>
                  <li>
                    <a href="https://votelyquiz.juleslemee.com" target="_blank" rel="noopener noreferrer" className="text-votely-lavender hover:text-votely-grape transition-colors">Start Quiz</a>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/privacy-policy" className="text-gray-600 hover:text-votely-grape transition-colors">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/terms-of-service" className="text-gray-600 hover:text-votely-grape transition-colors">Terms of Service</a>
                  </li>
                  <li>
                    <a href="/cookie-policy" className="text-gray-600 hover:text-votely-grape transition-colors">Cookie Policy</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Votely. All rights reserved.
          </p>
          <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
            <span>Made with</span>
            <span role="img" aria-label="love" className="text-lg">💜</span>
            <span>in Brooklyn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;