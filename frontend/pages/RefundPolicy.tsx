import React from "react";

const RefundPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-[#1A1A1A]">
      <h1 className="font-serif text-4xl mb-6 py-10">Refund & Cancellation Policy</h1>

      <p className="text-sm text-gray-600 mb-10">
        Last updated: {new Date().getFullYear()}
      </p>

      <section className="space-y-6 text-sm leading-relaxed text-gray-700">
        <p>
          At Mangalam Florist, we take pride in our floral arrangements and customer service. 
          As flowers are perishable items, our refund and cancellation policies are designed 
          to be fair to both our customers and our floral artisans.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">
          Cancellation Policy
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Same-Day Orders:</strong> Cancellations for same-day delivery orders are not accepted once the order has been prepared or dispatched.</li>
          <li><strong>Future Orders:</strong> Cancellations must be made at least 24 hours prior to the scheduled delivery date for a full refund.</li>
          <li><strong>Custom Bouquets:</strong> Orders for custom-designed bouquets or special floral requests cannot be cancelled once the flowers have been sourced specifically for your order.</li>
        </ul>

        <h2 className="font-serif text-xl text-black mt-10">
          Refund Policy
        </h2>

        <p>
          Refunds are considered on a case-by-case basis and are typically issued under the following circumstances:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Non-Delivery:</strong> If an order is not delivered due to an error on our part, you are entitled to a full refund or a redelivery.</li>
          <li><strong>Damaged Quality:</strong> If the flowers arrive in a damaged condition, please contact us within 4 hours of delivery with photographic evidence. We will offer a replacement or a partial/full refund based on the extent of damage.</li>
          <li><strong>Incorrect Item:</strong> If you receive a significantly different item than what was ordered, we will arrange for a replacement or issue a refund.</li>
        </ul>

        <h2 className="font-serif text-xl text-black mt-10">Return Process</h2>

        <p>
          Due to the perishable nature of flowers, we do not accept traditional returns. 
          If there is an issue with your order, please do not return the flowers, but contact our support team immediately.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">
          Refund Timeline
        </h2>

        <p>
          Once a refund is approved, it will be processed through the original payment method. 
          Please allow 5-7 business days for the credit to appear in your account, depending on your bank's processing time.
        </p>

        <h2 className="font-serif text-xl text-black mt-10">Contact Support</h2>

        <p>
          If you have any questions or would like to request a cancellation/refund, please reach out to us:
          <br />
          <strong>Email:</strong> mangalamflorist.support@gmail.com
          <br />
          <strong>Phone:</strong> +91 [Your Phone Number]
        </p>
      </section>
    </div>
  );
};

export default RefundPolicy;
