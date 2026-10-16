'use client'
import React from 'react'

type Block =
  | { t: 'h1' | 'h2' | 'h3'; text: string }
  | { t: 'hr' }
  | { t: 'list'; items: string[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'p'; text: string }

function parseCells(row: string): string[] {
  return row.split('|').map(c => c.trim()).filter(Boolean)
}

function isSeparatorRow(row: string): boolean {
  return /^\|[\s\-|]+\|$/.test(row)
}

function parseBlocks(md: string): Block[] {
  const lines = md.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('### ')) {
      blocks.push({ t: 'h3', text: trimmed.slice(4) })
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ t: 'h2', text: trimmed.slice(3) })
    } else if (trimmed.startsWith('# ')) {
      blocks.push({ t: 'h1', text: trimmed.slice(2) })
    } else if (trimmed === '---') {
      blocks.push({ t: 'hr' })
    } else if (trimmed.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ t: 'list', items })
      continue
    } else if (trimmed.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      if (tableLines.length >= 2) {
        const head = parseCells(tableLines[0])
        const rows: string[][] = []
        for (let r = 2; r < tableLines.length; r++) {
          if (!isSeparatorRow(tableLines[r])) rows.push(parseCells(tableLines[r]))
        }
        blocks.push({ t: 'table', head, rows })
      }
      continue
    } else if (trimmed !== '') {
      blocks.push({ t: 'p', text: trimmed })
    }

    i++
  }

  return blocks
}

// Render inline markdown: **bold**, *italic*, `code`
function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[2]) parts.push(<strong key={m.index} className="text-white font-semibold">{m[2]}</strong>)
    else if (m[3]) parts.push(<em key={m.index} className="italic">{m[3]}</em>)
    else if (m[4]) parts.push(<code key={m.index} className="bg-wa-dark3 text-wa-green px-1 py-0.5 rounded text-[0.8em] font-mono">{m[4]}</code>)
    last = m.index + m[0].length
  }

  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

export function MarkdownContent({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  return (
    <div className="text-sm text-[#c9d1d9] leading-relaxed">
      {blocks.map((block, i) => {
        switch (block.t) {
          case 'h1':
            return null // title already shown in header
          case 'h2':
            return (
              <h2 key={i} className="text-base font-bold text-white mt-5 mb-2 first:mt-0">
                <Inline text={block.text} />
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} className="text-sm font-semibold text-wa-green mt-4 mb-1.5">
                <Inline text={block.text} />
              </h3>
            )
          case 'hr':
            return <hr key={i} className="border-wa-border my-4" />
          case 'list':
            return (
              <ul key={i} className="space-y-1 mb-3 ml-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2 items-start">
                    <span className="text-wa-green mt-0.5 flex-shrink-0">·</span>
                    <span><Inline text={item} /></span>
                  </li>
                ))}
              </ul>
            )
          case 'table':
            return (
              <div key={i} className="overflow-x-auto mb-3 -mx-1">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      {block.head.map((h, j) => (
                        <th key={j} className="text-left px-2.5 py-1.5 bg-wa-dark3 text-wa-green font-semibold border border-wa-border first:rounded-tl-lg last:rounded-tr-lg">
                          <Inline text={h} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j} className={j % 2 === 0 ? 'bg-wa-dark2' : 'bg-wa-dark3/40'}>
                        {row.map((cell, k) => (
                          <td key={k} className="px-2.5 py-1.5 border border-wa-border">
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'p':
            return (
              <p key={i} className="mb-2 text-[#8b949e]">
                <Inline text={block.text} />
              </p>
            )
        }
      })}
    </div>
  )
}
