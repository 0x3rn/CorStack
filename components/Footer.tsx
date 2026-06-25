import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <h2 className="footer-logo">
          <img src="/logo.png" alt="CorStack Logo" className="footer-logo-img" />
          CorStack.
        </h2>
        <p>Reliable web design and development made for you.</p>
      </div>

      <div className="footer-links">
        <h4 className="footer-heading">Quick Links</h4>
        <ul>
          <li><Link href="/#home">Home</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/#portfolio">Work</Link></li>
          <li><Link href="/#pricing">Pricing</Link></li>
        </ul>
      </div>

      <div className="footer-contact">
        <h4 className="footer-heading">Contact</h4>
        <ul>
          <li>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            hello@corsack.dev
          </li>
          <li>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            (555) 123-4567
          </li>
        </ul>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CorStack. All rights reserved.</p>
        <ul className="footer-legal">
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/terms">Terms of Service</Link></li>
        </ul>
      </div>
    </footer>
  );
}