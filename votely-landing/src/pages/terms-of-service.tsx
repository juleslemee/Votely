import React from 'react';
import Layout from '@/components/Layout';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="bg-votely-white">
        <main className="container-custom py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-votely-grape mb-6">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">1. Introduction</h2>
                <p className="text-gray-700">
                  Welcome to Votely. These Terms of Service ("Terms") govern your use of our platform. By accessing or using Votely, you agree to be bound by these Terms.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">2. Eligibility</h2>
                <p className="text-gray-700">
                  Votely is intended for users in the United States who are between the ages of 18 and 28. By using our platform, you represent that you meet these requirements.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">3. User Responsibilities</h2>
                <p className="text-gray-700 mb-4">As a user of Votely, you agree to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Provide accurate and complete information</li>
                  <li>Use the platform for lawful purposes only</li>
                  <li>Respect the rights of other users</li>
                  <li>Not attempt to interfere with the platform's operation</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">4. Intellectual Property</h2>
                <p className="text-gray-700">
                  All content on Votely, including text, graphics, logos, and software, is the property of Votely or its content suppliers and is protected by intellectual property laws.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">5. Disclaimer of Warranties</h2>
                <p className="text-gray-700">
                  Votely is provided "as is" without any warranties, express or implied. We do not guarantee that the platform will be error-free or uninterrupted.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">6. Limitation of Liability</h2>
                <p className="text-gray-700">
                  Votely and its operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">7. Changes to Terms</h2>
                <p className="text-gray-700">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes through the platform or via email.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">8. Contact Information</h2>
                <p className="text-gray-700">
                  For questions about these Terms, please contact:
                  <br />
                  <span className="font-medium">Jules Lemee</span>
                  <br />
                  Email: <a href="mailto:jules@getvotely.com" className="text-votely-grape hover:underline">jules@getvotely.com</a>
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default TermsOfService; 