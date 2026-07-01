import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Corstack',
  description: 'Learn how Corstack collects, uses, and protects your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <section className="legal-section">
      <h1>Privacy Policy</h1>
      <p className="last-updated">Last Updated: May 23, 2026</p>

      <p>
        At Corstack, your privacy is a top priority. This Privacy Policy outlines how we collect, use, and protect your information when you visit our website or use our web design and development services.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We only collect information that is necessary to provide you with our services. This includes:</p>
      <ul>
        <li>
          <strong>Personal Data:</strong> Name, email address, phone number, and company details provided via our contact forms.
        </li>
        <li>
          <strong>Payment Data:</strong> Billing address and payment information. (Note: Credit card details are securely processed by Paystack and are not stored on our servers).
        </li>
        <li>
          <strong>Usage Data:</strong> Analytics data such as IP addresses, browser types, and pages visited, to help us improve our website.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the collected information for the following purposes:</p>
      <ul>
        <li>To communicate with you regarding your project inquiries.</li>
        <li>To process payments for our design and development packages.</li>
        <li>To deliver and maintain the websites we build for you.</li>
        <li>To send occasional administrative emails or project updates.</li>
      </ul>

      <h2>3. Cookies and Tracking</h2>
      <p>
        Our website uses basic cookies to ensure a smooth user experience and to analyze site traffic. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
      </p>

      <h2>4. Data Sharing and Security</h2>
      <p>
        We <strong>never</strong> sell, rent, or trade your personal information to third parties. We only share information with trusted third-party services (like Paystack for payments or Google Analytics) strictly to facilitate our business operations. We implement strict security protocols to protect your data from unauthorized access.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You have the right to request access to the personal data we hold about you, request corrections, or ask us to delete your data entirely. To exercise these rights, please contact us at <a href="mailto:hello@corstack.com">hello@corstack.com</a>.
      </p>
    </section>
  );
}