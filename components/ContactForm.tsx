"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function ContactForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "contact" }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Message sent successfully!");
        router.push("/message-success");
      } else {
        toast.error("Something went wrong. Please check your connection.");
        setIsSending(false);
      }
    } catch (error) {
      toast.error("Error connecting to server.");
      setIsSending(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Your Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={isSending}
      />
      <input
        type="email"
        placeholder="Your Email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={isSending}
      />
      <textarea
        placeholder="Tell us about your business and goals..."
        rows={5}
        required
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        disabled={isSending}
      ></textarea>
      
      <button type="submit" className="btn btn-white block-btn" disabled={isSending}>
        {isSending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}