import React from 'react';
import Layout from '@/components/Layout';

const CookiePolicy = () => {
  return (
    <Layout>
      <div className="bg-votely-white">
        <main className="container-custom py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-votely-grape mb-6">Cookie Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">What Are Cookies?</h2>
                <p className="text-gray-700">
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and allow us to understand how our platform is being used.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">How We Use Cookies</h2>
                <p className="text-gray-700 mb-4">We use cookies for the following purposes:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Analytics: To understand how users interact with our platform</li>
                  <li>Performance: To improve the speed and reliability of our service</li>
                  <li>Functionality: To remember your preferences and settings</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Types of Cookies We Use</h2>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-votely-grape">Essential Cookies</h3>
                  <p className="text-gray-700">
                    These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.
                  </p>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-votely-grape">Analytics Cookies</h3>
                  <p className="mb-4">
                    We use Google Tag Manager to understand how users interact with our platform. These cookies help us improve our service.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Managing Cookies</h2>
                <p className="text-gray-700">
                  Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may impact your experience on our platform.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Third-Party Cookies</h2>
                <p className="mb-4">
                  We use Google Tag Manager, which may set its own cookies. This service has its own privacy policy and cookie policy.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-votely-grape">Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about our use of cookies, please contact:
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

export default CookiePolicy; 