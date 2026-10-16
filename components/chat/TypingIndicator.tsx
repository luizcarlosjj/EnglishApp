export function TypingIndicator() {
  return (
    <div className="flex items-end gap-1.5 px-2.5 py-1">
      <div className="bg-white rounded-lg rounded-tl-none px-3.5 py-2.5 flex gap-1 items-center">
        {[0, 0.2, 0.4].map((delay, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-[#999] rounded-full"
            style={{ animation: `bounce3 1.2s ${delay}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}
