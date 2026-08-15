import type { ReactNode } from 'react'

import { PhotoLightbox } from '@/components/entries/photo-lightbox'
import {
  parsePhotoGroupAttrs,
  type TiptapMark,
  type TiptapNode,
} from '@/lib/tiptap/document'

const applyMarks = (content: ReactNode, marks: TiptapMark[] = []) => marks.reduce<ReactNode>((markedContent, mark, index) => {
  if (mark.type === 'bold') return <strong key={index}>{markedContent}</strong>
  if (mark.type === 'italic') return <em key={index}>{markedContent}</em>
  if (mark.type === 'link' && mark.attrs?.href) {
    return <a key={index} href={mark.attrs.href} rel='noopener noreferrer'>{markedContent}</a>
  }

  return markedContent
}, content)

const renderPhotoGroup = (node: TiptapNode, key: string) => {
  const attrs = parsePhotoGroupAttrs(node.attrs)

  if (!attrs) return null

  return (
    <div key={key} className='photo-group-grid'>
      {attrs.items.map((item) => (
        <figure
          key={item.mediaId}
          style={{ gridColumn: `span ${item.span}` }}
          className='min-w-0'
        >
          <div className='photo-group-frame'>
            <PhotoLightbox
              mediaId={item.mediaId}
              caption={item.caption}
            />
          </div>
          {item.caption ? (
            <figcaption className='photo-group-caption'>
              {item.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  )
}

const renderNodes = (nodes: TiptapNode[] = []): ReactNode => nodes.map((node, index) => {
  const key = `${node.type}-${index}`

  if (node.type === 'text') return <span key={key}>{applyMarks(node.text ?? '', node.marks)}</span>
  if (node.type === 'hardBreak') return <br key={key} />
  if (node.type === 'photoGroup') return renderPhotoGroup(node, key)

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
