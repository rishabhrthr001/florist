import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-[#1A1A1A]">
      <h1 className="font-serif text-4xl mb-6 py-10">Terms of Service</h1>

      <p className="text-sm text-gray-600 mb-10">
        Last updated: {new Date().getFullYear()}
      </p>

      <section className="space-y-6 text-sm leading-relaxed text-gray-700">
        <p>
          By accessing or using Mangalam Florist, you agree to comply with and
          be bound by these Terms of Service.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">
          Orders & Payments
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>All prices are subject to change without notice</li>
          <li>Orders are confirmed after payment is received</li>
          <li>We reserve the right to refuse service</li>
        </ul>

        <h2 className="font-serif text-xl text-black mt-10">Delivery Policy</h2>

        <p>
          Delivery times are estimates. We are not responsible for delays caused
          by weather, incorrect addresses, or unforeseen events.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">
          Returns & Refunds
        </h2>

        <p>
          Perishable floral products may only be refunded or replaced in cases
          of damage or quality issues reported within 24 hours of delivery.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">
          Intellectual Property
        </h2>

        <p>
          All content, designs, logos, and images are owned by Mangalam Florist
          and may not be used without written permission.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">
          Limitation of Liability
        </h2>

        <p>
          Mangalam Florist shall not be liable for any indirect or consequential
          damages arising from the use of our services.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">Governing Law</h2>

        <p>These terms are governed by the laws of India.</p>

        <h2 className="font-serif text-xl text-black mt-10">Contact</h2>

        <p>
          Questions regarding these terms can be sent to:
          <br />
          <strong>Email:</strong> support@mangalamflorist.com
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
