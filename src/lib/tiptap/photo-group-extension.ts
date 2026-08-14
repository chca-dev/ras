import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import {
  PhotoGroupNodeView,
  type PhotoGroupSelection,
} from '@/components/entries/photo-group-node-view'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    photoGroup: {
      requestPhotoUpload: () => ReturnType
    }
  }
}

export const createPhotoGroupExtension = (
  options: {
    requestPhotoUpload: () => void
    onSelectPhoto: (selection: PhotoGroupSelection) => void
  },
) => Node.create({
  name: 'photoGroup',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions: () => ({
    onSelectPhoto: options.onSelectPhoto,
  }),

  addAttributes: () => ({
    items: {
      default: [],
      rendered: false,
    },
  }),

  parseHTML: () => [{ tag: 'div[data-photo-group]' }],

  renderHTML: ({ HTMLAttributes }) => [
    'div',
    mergeAttributes(HTMLAttributes, { 'data-photo-group': '' }),
  ],

  addCommands: () => ({
    requestPhotoUpload: () => () => {
      options.requestPhotoUpload()
      return true
    },
  }),

  addNodeView: () => ReactNodeViewRenderer(PhotoGroupNodeView),
})
