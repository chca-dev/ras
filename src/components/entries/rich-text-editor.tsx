'use client'

import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Plus, Quote, Type, X } from 'lucide-react'
import { useState } from 'react'

import type { TiptapDocument } from '@/lib/tiptap/document'
import { cn } from '@/lib/utils'

type RichTextEditorProps = {
  initialContent: TiptapDocument
  onChange: (content: TiptapDocument) => void
}

type ToolbarButtonProps = {
  active?: boolean
  icon: typeof Bold
  label: string
  onClick: () => void
}

const ToolbarButton = ({ active = false, icon: Icon, label, onClick }: ToolbarButtonProps) => (
  <button
    type='button'
    aria-label={label}
    title={label}
    aria-pressed={active}
    onMouseDown={(event) => {
      event.preventDefault()
      onClick()
    }}
    className={cn(
      'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground',
      active && 'bg-secondary text-primary',
    )}
  >
    <Icon className='h-4 w-4' />
  </button>
)

export const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        'aria-label': 'Contenu de l’entrée',
        'data-placeholder': 'Vas-y, raconte.',
      },
    },
    onFocus: () => setToolbarVisible(true),
    onBlur: () => setToolbarVisible(false),
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getJSON() as TiptapDocument),
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive('bold') ?? false,
      italic: currentEditor?.isActive('italic') ?? false,
      heading: currentEditor?.isActive('heading') ?? false,
      bulletList: currentEditor?.isActive('bulletList') ?? false,
      orderedList: currentEditor?.isActive('orderedList') ?? false,
      blockquote: currentEditor?.isActive('blockquote') ?? false,
      link: currentEditor?.isActive('link') ?? false,
    }),
  })

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Adresse du lien', previousUrl ?? 'https://')

    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div>
      <div
        className={cn(
          'sticky top-16 z-20 mb-4 overflow-x-auto rounded-full border bg-popover/95 backdrop-blur transition-all duration-300',
          toolbarVisible ? 'max-h-14 border-border opacity-100' : 'pointer-events-none max-h-0 border-transparent opacity-0',
        )}
      >
        <div className='flex min-w-max items-center gap-0.5 px-1.5 py-1.5'>
          <ToolbarButton active={state.bold} icon={Bold} label='Gras' onClick={() => editor.chain().focus().toggleBold().run()} />
          <ToolbarButton active={state.italic} icon={Italic} label='Italique' onClick={() => editor.chain().focus().toggleItalic().run()} />
          <ToolbarButton active={state.link} icon={LinkIcon} label='Lien' onClick={setLink} />
          <span className='mx-1 h-5 w-px bg-border' />
          <ToolbarButton active={state.heading} icon={Heading} label='Titre' onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <ToolbarButton active={state.bulletList} icon={List} label='Liste à puces' onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <ToolbarButton active={state.orderedList} icon={ListOrdered} label='Liste numérotée' onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <ToolbarButton active={state.blockquote} icon={Quote} label='Citation' onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <span className='mx-1 h-5 w-px bg-border' />
          <ToolbarButton icon={Type} label='Texte normal' onClick={() => editor.chain().focus().setParagraph().run()} />
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className='group/insert relative flex items-center justify-center py-4'>
        <span className='absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/60 opacity-0 transition group-hover/insert:opacity-100' aria-hidden='true' />
        {insertMenuOpen ? (
          <div className='relative flex items-center gap-1 rounded-full border border-border bg-popover px-1.5 py-1 shadow-md animate-in fade-in zoom-in-95 duration-150'>
            <button
              type='button'
              onClick={() => {
                editor.chain().focus('end').insertContent({ type: 'paragraph' }).run()
                setInsertMenuOpen(false)
              }}
              className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs text-foreground transition hover:bg-secondary'
            >
              <Type className='h-3.5 w-3.5' /> Texte
            </button>
            <button
              type='button'
              disabled
              title='Disponible avec l’ajout des photos'
              className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs text-muted-foreground opacity-50'
            >
              <ImageIcon className='h-3.5 w-3.5' /> Photos
            </button>
            <button
              type='button'
              aria-label='Fermer'
              onClick={() => setInsertMenuOpen(false)}
              className='ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>
        ) : (
          <button
            type='button'
            aria-label='Ajouter un bloc'
            onClick={() => setInsertMenuOpen(true)}
            className='relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary'
          >
            <Plus className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  )
}
