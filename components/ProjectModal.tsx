"use client";

import { useState, FormEvent, useEffect } from "react";
import { createPortal } from "react-dom";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  currency: "usd" | "ngn";
}

export default function ProjectModal({ isOpen, onClose, tier, currency }: ProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    websiteType: "",
    budget: "",
    description: "",
    contactMethod: "whatsapp",
    otherContactDetails: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        websiteType: "",
        budget: "",
        description: "",
        contactMethod: "whatsapp",
        otherContactDetails: ""
      });
    }
  }, [isOpen]);

  if (!mounted) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const compiledMessage = `
Package: ${tier}
Website Type: ${formData.websiteType}
Budget: ${currency === 'ngn' ? '₦' : '$'}${formData.budget}
Phone/WhatsApp: ${formData.phone}
Preferred Contact: ${formData.contactMethod === 'other' ? "Other (" + formData.otherContactDetails + ")" : formData.contactMethod}

Project Details:
${formData.description}
      `.trim();

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: compiledMessage
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
      } else {
        alert("Something went wrong. Please check your connection.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full py-3 px-5 rounded-[12px] border border-black/10 font-[inherit] text-[0.95rem] outline-none transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/15 bg-white text-black";

  const modalContent = (
    <div 
      className={`fixed inset-0 z-[9999] overflow-y-auto ${isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'} transition-all duration-300 ease-in-out`}
      data-lenis-prevent="true"
    >
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-brand-dark/80 backdrop-blur-[8px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      
      {/* Scrollable Container Wrapper */}
      <div className="flex min-h-full items-center justify-center p-4 py-12 text-center sm:p-0 relative z-10">
        {/* Modal Container */}
        <div 
          className={`bg-white rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] w-full max-w-[650px] text-left transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}
        >
          {!isSuccess ? (
            <>
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Let's Discuss Your Website</h3>
                  <p className="text-text-muted text-[0.95rem]">Fill out the details below to get started with the {tier}.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-gray-500 hover:text-black transition-colors self-start shrink-0"
                  disabled={isSubmitting}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Selected Package</label>
                <input type="text" readOnly className={`${inputClass} bg-gray-50/80 text-gray-500 cursor-not-allowed`} value={tier} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Full Name *</label>
                  <input type="text" required className={inputClass} placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address *</label>
                  <input type="email" required className={inputClass} placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Phone Number / WhatsApp *</label>
                <input type="text" required className={inputClass} placeholder={currency === 'ngn' ? "+234 800 000 0000" : "+1 234 567 8900"} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Website Type *</label>
                  <select required className={inputClass} value={formData.websiteType} onChange={(e) => setFormData({...formData, websiteType: e.target.value})}>
                    <option value="" disabled>Select type...</option>
                    <option value="Portfolio Website">Portfolio Website</option>
                    <option value="Business Website">Business Website</option>
                    <option value="Startup Website">Startup Website</option>
                    <option value="E-Commerce Store">E-Commerce Store</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Nonprofit Website">Nonprofit Website</option>
                    <option value="Booking Website">Booking Website</option>
                    <option value="Real Estate Website">Real Estate Website</option>
                    <option value="Hotel Website">Hotel Website</option>
                    <option value="Restaurant Website">Restaurant Website</option>
                    <option value="Educational / Course Platform">Educational / Course Platform</option>
                    <option value="Directory / Listing Site">Directory / Listing Site</option>
                    <option value="Custom Web Portal">Custom Web Portal</option>
                    <option value="SaaS Platform">SaaS Platform</option>
                    <option value="Not Sure Yet">Not Sure Yet</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Project Budget ({currency === 'ngn' ? '₦' : '$'}) *</label>
                  <input 
                    type="text" 
                    required 
                    className={inputClass} 
                    placeholder={currency === 'ngn' ? "e.g. 500,000" : "e.g. 2,000"} 
                    value={formData.budget} 
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      const formattedValue = numericValue ? Number(numericValue).toLocaleString('en-US') : '';
                      setFormData({...formData, budget: formattedValue});
                    }} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Briefly Describe Your Project *</label>
                <textarea required rows={4} className={`${inputClass} resize-none min-h-[120px]`} placeholder="Tell us about your goals, required features, or anything else..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 ml-1">Preferred Contact Method *</label>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-6 ml-1">
                    {['whatsapp', 'email', 'phone', 'other'].map(method => (
                      <label key={method} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.contactMethod === method ? 'border-accent-primary' : 'border-gray-300 group-hover:border-accent-primary'}`}>
                          {formData.contactMethod === method && <div className="w-2.5 h-2.5 bg-accent-primary rounded-full"></div>}
                        </div>
                        <input type="radio" name="contactMethod" value={method} checked={formData.contactMethod === method} onChange={(e) => setFormData({...formData, contactMethod: e.target.value})} className="hidden" />
                        <span className="text-gray-700 capitalize font-medium">{method === 'phone' ? 'Phone Call' : method}</span>
                      </label>
                    ))}
                  </div>
                  {formData.contactMethod === 'other' && (
                    <input 
                      type="text" 
                      required 
                      className={inputClass} 
                      placeholder="Add details of preferred contact method" 
                      value={formData.otherContactDetails} 
                      onChange={(e) => setFormData({...formData, otherContactDetails: e.target.value})} 
                    />
                  )}
                </div>
              </div>

              <div className="mt-4 pt-6 border-t border-black/[0.05] shrink-0">
                <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary flex justify-center items-center py-4 text-[1.1rem]">
                  {isSubmitting ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Details...
                    </span>
                  ) : "Start My Project"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mb-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="text-3xl font-bold mb-4">Thank You</h3>
            <p className="text-text-muted text-[1.05rem] mb-10 max-w-[400px] leading-relaxed">
              We've received your project details. We'll review your requirements and reach out within 24 hours to discuss the next steps.
            </p>
            <button onClick={onClose} className="w-full max-w-[300px] btn btn-secondary py-4 text-[1.05rem]">
              Return To Website
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
