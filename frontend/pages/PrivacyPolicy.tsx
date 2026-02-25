import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-[#1A1A1A]">
      <h1 className="font-serif text-4xl mb-6 py-10">Privacy Policy</h1>

      <p className="text-sm text-gray-600 mb-10">
        Last updated: {new Date().getFullYear()}
      </p>

      <section className="space-y-6 text-sm leading-relaxed text-gray-700">
        <p>
          Mangalam Florist respects your privacy and is committed to protecting
          your personal information. This policy explains how we collect, use,
          and safeguard your data when you visit or make purchases from our
          website.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">
          Information We Collect
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>Name, phone number, email address</li>
          <li>Delivery and billing address</li>
          <li>Order history and preferences</li>
          <li>Payment details (processed securely via third parties)</li>
          <li>Device and browsing data</li>
        </ul>

        <h2 className="font-serif text-xl text-black mt-10">
          How We Use Your Information
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>Process and fulfill orders</li>
          <li>Provide customer support</li>
          <li>Improve our services</li>
          <li>Send order updates and promotional messages (optional)</li>
          <li>Prevent fraud and abuse</li>
        </ul>

        <h2 className="font-serif text-xl text-black mt-10">Data Protection</h2>

        <p>
          We implement appropriate security measures to protect your
          information. However, no system is completely secure and we cannot
          guarantee absolute protection.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">
          Third-Party Services
        </h2>

        <p>
          Payment processing and analytics may be handled by trusted third-party
          providers who comply with applicable privacy laws.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">Your Rights</h2>

        <p>
          You may request access, correction, or deletion of your personal data
          by contacting us directly.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">Contact Us</h2>

        <p>
          For privacy-related inquiries, please contact us at:
          <br />
          <strong>Email:</strong> support@mangalamflorist.com
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
