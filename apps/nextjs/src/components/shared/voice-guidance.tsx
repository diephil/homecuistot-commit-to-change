"use client";

export function VoiceGuidance() {
  return (
    <div className="p-4 bg-blue-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded">
      <h3 className="text-lg font-black mb-3 flex items-center gap-2">
        <span className="text-xl">🎙️</span> Voice Input Examples
      </h3>
      <p className="text-sm font-medium mb-3">
        Update multiple ingredients at once using natural language:
      </p>
      <ul className="space-y-1.5 text-sm font-medium pl-4">
        <li className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black">
          &ldquo;I just bought milk and eggs&rdquo;
        </li>
        <li className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black">
          &ldquo;Running low on tomatoes&rdquo;
        </li>
        <li className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black">
          &ldquo;Ran out of cheese and onions&rdquo;
        </li>
        <li className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black">
          &ldquo;Have plenty of pasta&rdquo;
        </li>
      </ul>
    </div>
  );
}
