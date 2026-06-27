import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Corstack',
  description: 'Terms and conditions for using Corstack web design and development services.',
};

export default function TermsOfServicePage() {
  return (
    <section className="legal-section">
      <h1>Terms of Service</h1>
      <p className="last-updated">Last Updated: May 23, 2026</p>

      <p>
        Welcome to Corstack. By accessing our website or purchasing our web design services, you agree to comply with and be bound by the following terms and conditions.
      </p>

      <h2>1. Services Rendered</h2>
      <p>
        Corstack provides custom web design, development, and maintenance services. The specific scope, timeline, and deliverables of each project are outlined in the pricing tier selected or the custom proposal provided to the client prior to checkout.
      </p>

      <h2>2. Payments and Refunds</h2>
      <ul>
        <li>
          <strong>Payments:</strong> For standard packages (Basic and Business), full payment is required upfront via our secure Paystack checkout. Custom enterprise projects require a 50% upfront deposit, with the remaining 50% due prior to the final website launch.
        </li>
        <li>
          <strong>Refunds:</strong> Because of the custom nature of web development, payments are non-refundable once the design and development phase has commenced. If you cancel a project before any work begins, a full refund will be issued.
        </li>
      </ul>

      <h2>3. Client Responsibilities</h2>
      <p>
        To ensure a timely launch, clients must provide all necessary assets (text content, logos, images) within the agreed-upon timeframe. Delays in providing content will result in proportional delays to the final launch date.
      </p>

      <h2>4. Revisions</h2>
      <p>
        Each package includes a specific number of revision rounds (e.g., 1 round for the Basic Package, 3 rounds for the Business Package). A "round" consists of a consolidated list of requested changes. Any major structural changes requested after the final approval of the design mockup may incur additional hourly billing.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        Upon final payment, the client assumes full ownership of the final website design, code, and graphics created specifically for the project. Corstack retains the right to display the completed website in our portfolio and marketing materials.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        Corstack builds websites using modern, secure practices. However, we are not liable for website downtime, security breaches, or data loss caused by third-party hosting providers, outdated plugins managed by the client, or external malicious attacks after the final handoff.
      </p>

      <h2>7. Contact</h2>
      <p>
        If you have any questions regarding these Terms of Service, please contact us at <a href="mailto:hello@corstack.com">hello@corstack.com</a>.
      </p>
    </section>
  );
}