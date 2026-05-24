import Link from 'next/link';

export default function MessageSuccessPage() {
  return (
    <section className="hero-section" style={{ minHeight: '85vh' }}>
      
      <div 
        style={{ 
          background: 'rgba(0, 85, 204, 0.2)', 
          padding: '1.5rem', 
          borderRadius: '50%', 
          marginBottom: '2rem' 
        }}
      >
        <svg 
          width="64" 
          height="64" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          className="text-accent-secondary" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h1 
        className="hero-title" 
        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
      >
        Message Sent!
      </h1>
      <p className="hero-subtitle">
        Thank you for reaching out. We have received your message and our team will get back to you within 24 hours.
      </p>
      
      <div className="hero-actions">
        <Link href="/" className="btn btn-primary">
          Return to Homepage
        </Link>
      </div>
      
    </section>
  );
}