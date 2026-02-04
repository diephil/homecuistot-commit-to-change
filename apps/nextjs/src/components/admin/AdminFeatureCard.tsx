import Link from "next/link";

interface AdminFeatureCardProps {
  href: string;
  emoji: string;
  title: string;
  description: string;
}

export function AdminFeatureCard({
  href,
  emoji,
  title,
  description,
}: AdminFeatureCardProps) {
  return (
    <Link href={href}>
      <div className="border-4 md:border-6 border-black bg-gradient-to-br from-green-200 to-green-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{emoji}</div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-2">
              {title}
            </h2>
            <p className="text-base md:text-lg font-bold mb-4">
              {description}
            </p>
            <div className="inline-block bg-cyan-300 border-3 border-black px-4 py-2 font-black uppercase text-sm">
              → Open Feature
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
