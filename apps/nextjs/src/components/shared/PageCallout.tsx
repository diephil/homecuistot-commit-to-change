interface PageCalloutProps {
  emoji: string
  title: string
  description: string
  bgColor?: 'cyan' | 'pink' | 'yellow' | 'orange'
}

export function PageCallout({
  emoji,
  title,
  description,
  bgColor = 'cyan'
}: PageCalloutProps) {
  const bgColorClass = {
    cyan: 'bg-cyan-50',
    pink: 'bg-pink-50',
    yellow: 'bg-yellow-50',
    orange: 'bg-orange-50'
  }[bgColor]

  return (
    <div className={`${bgColorClass} border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
      <p className="text-base font-semibold text-black/80">
        {emoji} {title}
      </p>
      <p className="text-sm text-black/60 mt-1">
        {description}
      </p>
    </div>
  )
}
