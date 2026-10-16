export function EndedBanner({ onEvaluate }: { onEvaluate: () => void }) {
  return (
    <div className="bg-black/75 text-white text-center px-4 py-2.5 text-sm border-t border-white/10 flex-shrink-0">
      Conversa encerrada.
      <br />
      <button
        onClick={onEvaluate}
        className="bg-wa-green text-white px-5 py-2 rounded-2xl text-sm font-semibold mt-2 inline-block hover:bg-wa-teal transition-colors"
      >
        Ver minha avaliação →
      </button>
    </div>
  )
}
