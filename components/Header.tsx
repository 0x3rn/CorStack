"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  // Don't show the main header on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="site-header">
      <nav className="navbar">
        <div className="brand-logo">
          <Link href="/">
            <img src="/logo.png" alt="CorStack Logo" className="nav-logo-img" />
            <strong>CorStack.</strong>
          </Link>
        </div>
        <ul className="nav-links">
          <li><Link href="/#services">Services</Link></li>
          <li><Link href="/#process">Process</Link></li>
          <li><Link href="/#portfolio">Work</Link></li>
          <li><Link href="/#pricing">Pricing</Link></li>
          <li><Link href="/#contact" className="btn btn-primary">Let&apos;s Talk</Link></li>
        </ul>
      </nav>
    </header>
  );
}