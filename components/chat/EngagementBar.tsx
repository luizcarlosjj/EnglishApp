'use client'

export function EngagementBar({ value }: { value: number }) {
  const color = value > 70 ? '#25D366' : value > 40 ? '#FFC107' : '#F44336'
  return (
    <div className="bg-wa-dark2 px-3.5 py-1.5 flex items-center gap-2.5 flex-shrink-0">
      <span className="text-xs text-wa-sub whitespace-nowrap">Fluência</span>
      <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-wa-sub min-w-[32px] text-right">{value}%</span>
    </div>
  )
}
