"use client";

import { Button } from "@/components/retroui/Button";

export default function SayHelloButton() {
  const handleHelloClick = () => {
    fetch("/api/hello", { method: "POST" });
  };

  return (
    <Button onClick={handleHelloClick} size="lg" variant="default">
      Say Hello
    </Button>
  );
}
