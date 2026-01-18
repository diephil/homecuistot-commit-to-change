"use client";

export default function SayHelloButton() {
  const handleHelloClick = () => {
    fetch("/api/hello", { method: "POST" });
  };

  return (
    <button
      onClick={handleHelloClick}
      className="h-12 rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
    >
      Say Hello
    </button>
  );
}
