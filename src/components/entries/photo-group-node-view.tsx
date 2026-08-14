'use client'

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { GripVertical } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { PhotoGroupItem } from '@/lib/tiptap/document'
import { cn } from '@/lib/utils'

export type PhotoGroupSelection = {
  position: number
  index: number
}

export const PhotoGroupNodeView = ({
  editor,
  extension,
  getPos,
  node,
  selected,
}: ReactNodeViewProps) => {
  const items = node.attrs.items as PhotoGroupItem[]
  const [selectedMediaId, setSelectedMediaId] = useState(items[0]?.mediaId)
  const selectedIndex = items.findIndex(({ mediaId }) => mediaId === selectedMediaId)
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0
  const activeItem = items[activeIndex]
  const hasActiveItem = Boolean(activeItem)
  const { onSelectPhoto } = extension.options as {
    onSelectPhoto: (selection: PhotoGroupSelection) => void
  }

  useEffect(() => {
    if (!selected || !hasActiveItem) return

    const position = getPos()

    if (typeof position === 'number') {
      onSelectPhoto({ position, index: activeIndex })
    }
  }, [activeIndex, getPos, hasActiveItem, onSelectPhoto, selected])

  const selectPhoto = (index: number) => {
    const position = getPos()

    if (typeof position === 'number') {
      editor.commands.setNodeSelection(position)
    }

    setSelectedMediaId(items[index]?.mediaId)
  }

  return (
    <NodeViewWrapper className='photo-group-node' contentEditable={false}>
      {selected ? (
        <span
          data-drag-handle
          title='Déplacer le groupe'
          className='photo-group-drag-handle'
        >
          <GripVertical className='h-4 w-4' />
        </span>
      ) : null}

      <div className='photo-group-grid'>
        {items.map((item, index) => (
          <figure
            key={item.mediaId}
            style={{ gridColumn: `span ${item.span}` }}
            className='min-w-0'
          >
            <button
              type='button'
              aria-label={`Sélectionner la photo ${index + 1}`}
              aria-pressed={selected && index === activeIndex}
              onClick={() => selectPhoto(index)}
              className={cn(
                'photo-group-frame w-full outline-none ring-offset-2 ring-offset-background transition',
                selected && index === activeIndex
                  ? 'ring-2 ring-primary'
                  : 'hover:opacity-95',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/${item.mediaId}/display`}
                alt={item.caption ?? ''}
                className='block h-auto w-full'
              />
            </button>
            {item.caption ? (
              <figcaption className='photo-group-caption'>{item.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </NodeViewWrapper>
  )
}
