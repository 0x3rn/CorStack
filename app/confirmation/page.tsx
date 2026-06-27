"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const isProject = type === "project";

  const heading = isProject ? "Thank You" : "Message Sent";
  const content = isProject 
    ? "We've received your project details. We'll review your requirements and reach out within 24 hours to discuss the next steps."
    : "We've received your message and we will contact you within 24 hours.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light p-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] max-w-[500px] w-full flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mb-8">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">{heading}</h1>
        <p className="text-text-muted text-[1.05rem] mb-10 leading-relaxed">
          {content}
        </p>
        <Link href="/" className="w-full">
          <button className="w-full btn btn-secondary py-4 text-[1.05rem]">
            Return to homepage
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
