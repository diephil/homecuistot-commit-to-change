"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt || !isMobile) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowButton(false);
    }
    setDeferredPrompt(null);
  };

  const isDisabled = !isMobile || !showButton;

  return (
    <button
      onClick={handleInstall}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 font-bold border-2 border-black transition-all",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        isDisabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-pink-100 active:shadow-none active:translate-y-0.5"
      )}
      aria-label={isMobile ? "Add to home screen" : "Install app (mobile only)"}
      title={isMobile ? "Install app" : "Visit from mobile"}
    >
      <Download className="h-5 w-5" />
    </button>
  );
}
