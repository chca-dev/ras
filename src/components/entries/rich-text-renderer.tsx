import type { ReactNode } from 'react'

import type { TiptapMark, TiptapNode } from '@/lib/tiptap/document'

const applyMarks = (content: ReactNode, marks: TiptapMark[] = []) => marks.reduce<ReactNode>((markedContent, mark, index) => {
  if (mark.type === 'bold') return <strong key={index}>{markedContent}</strong>
  if (mark.type === 'italic') return <em key={index}>{markedContent}</em>
  if (mark.type === 'link' && mark.attrs?.href) {
    return <a key={index} href={mark.attrs.href} rel='noopener noreferrer'>{markedContent}</a>
  }

  return markedContent
}, content)

const renderNodes = (nodes: TiptapNode[] = []): ReactNode => nodes.map((node, index) => {
  const key = `${node.type}-${index}`

  if (node.type === 'text') return <span key={key}>{applyMarks(node.text ?? '', node.marks)}</span>
  if (node.type === 'hardBreak') return <br key={key} />

  const children = renderNodes(node.content)
  if (node.type === 'paragraph') return <p key={key}>{node.content?.length ? children : '\u00a0'}</p>
  if (node.type === 'heading') {
    const level = node.attrs?.level === 3 ? 3 : 2
    return level === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>
  }
  if (node.type === 'blockquote') return <blockquote key={key}>{children}</blockquote>
  if (node.type === 'bulletList') return <ul key={key}>{children}</ul>
  if (node.type === 'orderedList') return <ol key={key}>{children}</ol>
  if (node.type === 'listItem') return <li key={key}>{children}</li>
  if (node.type === 'doc') return <div key={key}>{children}</div>

  return null
})

export const RichTextRenderer = ({ content }: { content: TiptapNode[] }) => (
  <div className='journal-rich-text'>{renderNodes(content)}</div>
)
