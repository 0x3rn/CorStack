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
            <img src="https://firebasestorage.googleapis.com/v0/b/corstack-dev.firebasestorage.app/o/logo.png?alt=media&token=22e02e00-1a2d-4c44-ab03-bf35af099509" alt="CorStack Logo" className="nav-logo-img" />
            <strong>corstack.</strong>
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