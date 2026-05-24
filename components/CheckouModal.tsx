"use client";

import { useState, FormEvent } from "react";
import { toast } from "react-hot-toast";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  currency: string;
}

export default function CheckoutModal({ isOpen, onClose, tier, currency }: CheckoutModalProps) {
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, currency, email }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Payment gateway is currently down.");
        setIsProcessing(false);
        onClose();
      }
    } catch (error) {
      console.error("Checkout Request Failed:", error);
      toast.error("Connection failed. Please check your internet.");
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? "active" : ""}`}>
      <form className="modal-content" onSubmit={handleSubmit}>
        <h3>Enter your email</h3>
        <p>Where should we send your receipt and contact you for your project details?</p>
        
        <input
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isProcessing}
        />

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Proceed"}
          </button>
        </div>
      </form>
    </div>
  );
}