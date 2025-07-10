import React from 'react';
import Layout from '@/components/Layout';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="bg-votely-white">
        <main className="container-custom py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-votely-grape mb-6">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Introduction</h2>
                <p className="text-gray-700">
                  Votely ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our civic engagement platform.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Information We Collect</h2>
                <p className="text-gray-700 mb-4">We collect the following types of information:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Email addresses for our waitlist</li>
                  <li>Quiz responses to personalize your experience</li>
                  <li>ZIP codes (after launch) for location-based features</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">We use your information to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Provide and improve our services</li>
                  <li>Personalize your experience</li>
                  <li>Communicate with you about our platform</li>
                  <li>Analyze usage patterns to improve our service</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Data Storage</h2>
                <p className="text-gray-700">
                  We store your data securely in Google Firestore (Firebase). We implement appropriate security measures to protect your information from unauthorized access, alteration, or disclosure.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Analytics</h2>
                <p className="mb-4">
                  We use Google Tag Manager to understand how users interact with our platform. This helps us improve our service and user experience.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Your Rights</h2>
                <p className="text-gray-700 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Access your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of communications</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, please contact:
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

export default PrivacyPolicy; 