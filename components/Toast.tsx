"use client";

import { useState, useEffect } from "react";

export function showToast(message: string, type: "success" | "error" = "error") {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("show-toast", { detail: { message, type } });
    window.dispatchEvent(event);
  }
}

export default function Toast() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error">("error");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: "success" | "error" }>;
      
      setMessage(customEvent.detail.message);
      setType(customEvent.detail.type);
      setIsVisible(true);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    window.addEventListener("show-toast", handleShowToast);

    return () => {
      window.removeEventListener("show-toast", handleShowToast);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={`toast ${isVisible ? "show" : ""} ${type}`}>
      {message}
    </div>
  );
}