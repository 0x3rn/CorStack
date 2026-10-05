'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="min-h-screen flex flex-col gap-6 items-center justify-center p-8 text-center">
    <h1 className="text-3xl font-bold">We couldn&apos;t load this page</h1>
    <p>Please try again in a moment, or email <a href="mailto:hello@corstack.dev">hello@corstack.dev</a>.</p>
    <button className="btn btn-primary" onClick={reset}>Try again</button><Link href="/">Return home</Link>
  </main>;
}
