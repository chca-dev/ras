'use client'

import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  ChevronLeft,
  ChevronRight,
  Heading,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  MoreHorizontal,
  Plus,
  Quote,
  Ruler,
  Scissors,
  TextCursorInput,
  Trash2,
  Type,
  X,
} from 'lucide-react'
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react'

import type { PhotoGroupSelection } from '@/components/entries/photo-group-node-view'
import type { PhotoGroupItem, TiptapDocument } from '@/lib/tiptap/document'
import { uploadMedia, type UploadedMedia } from '@/lib/media/upload-client'
import { createPhotoGroupExtension } from '@/lib/tiptap/photo-group-extension'
import { cn } from '@/lib/utils'

type RichTextEditorProps = {
  entryId: string
  initialContent: TiptapDocument
  onChange: (content: TiptapDocument) => void
  toolbarActions: ReactNode
}

type UploadState = {
  status: 'idle' | 'uploading' | 'error'
  message?: string
}

type UploadTarget = {
  position: number
}

type ToolbarButtonProps = {
  active?: boolean
  destructive?: boolean
  disabled?: boolean
  icon: typeof Bold
  label: string
  onClick: () => void
}

const ToolbarButton = ({
  active = false,
  destructive = false,
  disabled = false,
  icon: Icon,
  label,
  onClick,
}: ToolbarButtonProps) => (
  <button
    type='button'
    aria-label={label}
    title={label}
    aria-pressed={active}
    disabled={disabled}
    onMouseDown={(event) => {
      event.preventDefault()
      onClick()
    }}
    className={cn(
      'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30',
      active && 'bg-secondary text-primary',
      destructive && 'text-destructive hover:bg-destructive/10 hover:text-destructive',
    )}
  >
    <Icon className='h-4 w-4' />
  </button>
)

const getDefaultPhotoSpan = (count: number): 2 | 3 | 6 => {
  if (count === 1) return 6
  if (count === 2 || count === 4) return 3
  return 2
}

const availablePhotoSpans = [2, 3, 4, 6] as const

export const RichTextEditor = ({
  entryId,
  initialContent,
  onChange,
  toolbarActions,
}: RichTextEditorProps) => {
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' })
  const [photoSelection, setPhotoSelection] = useState<PhotoGroupSelection | null>(null)
  const [captionEditorOpen, setCaptionEditorOpen] = useState(false)
  const [mobileToolsMenuOpen, setMobileToolsMenuOpen] = useState(false)
  const photoInputId = `entry-photo-input-${entryId}`
  const uploadTargetRef = useRef<UploadTarget | null>(null)
  const uploadControllersRef = useRef(new Set<AbortController>())
  const mountedRef = useRef(true)
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
      createPhotoGroupExtension({
        requestPhotoUpload: () => document.getElementById(photoInputId)?.click(),
        onSelectPhoto: (selection) => {
          setPhotoSelection(selection)
          setCaptionEditorOpen(false)
          setMobileToolsMenuOpen(false)
        },
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
    onSelectionUpdate: ({ editor: currentEditor }) => {
      if (!currentEditor.isActive('photoGroup')) {
        setPhotoSelection(null)
        setCaptionEditorOpen(false)
        setMobileToolsMenuOpen(false)
      }
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getJSON() as TiptapDocument),
  })

  useEffect(() => {
    const uploadControllers = uploadControllersRef.current
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      uploadControllers.forEach((controller) => controller.abort())
      uploadControllers.clear()
    }
  }, [])

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
      photoGroup: currentEditor?.isActive('photoGroup') ?? false,
    }),
  })

  if (!editor || !state) return null

  const selectedPhotoGroup = photoSelection
    ? editor.state.doc.nodeAt(photoSelection.position)
    : null
  const selectedPhotoItems = selectedPhotoGroup?.type.name === 'photoGroup'
    ? selectedPhotoGroup.attrs.items as PhotoGroupItem[]
    : []
  const selectedPhotoIndex = photoSelection
    ? Math.min(photoSelection.index, Math.max(selectedPhotoItems.length - 1, 0))
    : 0
  const selectedPhoto = selectedPhotoItems[selectedPhotoIndex]

  const updateSelectedPhotoItems = (
    nextItems: PhotoGroupItem[],
    nextIndex = selectedPhotoIndex,
  ) => {
    if (!photoSelection || selectedPhotoGroup?.type.name !== 'photoGroup') return false

    const wasUpdated = editor
      .chain()
      .command(({ tr }) => {
        const currentGroup = tr.doc.nodeAt(photoSelection.position)

        if (currentGroup?.type.name !== 'photoGroup') return false

        if (!nextItems.length) {
          tr.delete(
            photoSelection.position,
            photoSelection.position + currentGroup.nodeSize,
          )
          return true
        }

        tr.setNodeMarkup(photoSelection.position, undefined, {
          ...currentGroup.attrs,
          items: nextItems,
        })
        return true
      })
      .run()

    if (!wasUpdated) return false

    if (nextItems.length) {
      setPhotoSelection({
        position: photoSelection.position,
        index: Math.min(nextIndex, nextItems.length - 1),
      })
    } else {
      setPhotoSelection(null)
      setCaptionEditorOpen(false)
    }

    return true
  }

  const moveSelectedPhoto = (direction: -1 | 1) => {
    const targetIndex = selectedPhotoIndex + direction

    if (!selectedPhoto || targetIndex < 0 || targetIndex >= selectedPhotoItems.length) return

    const nextItems = [...selectedPhotoItems]
    nextItems[selectedPhotoIndex] = nextItems[targetIndex]
    nextItems[targetIndex] = selectedPhoto
    updateSelectedPhotoItems(nextItems, targetIndex)
  }

  const cycleSelectedPhotoSpan = () => {
    if (!selectedPhoto) return

    const currentSpanIndex = availablePhotoSpans.indexOf(selectedPhoto.span)
    const nextSpan = availablePhotoSpans[
      (currentSpanIndex + 1) % availablePhotoSpans.length
    ]
    const nextItems = [...selectedPhotoItems]
    nextItems[selectedPhotoIndex] = { ...selectedPhoto, span: nextSpan }
    updateSelectedPhotoItems(nextItems)
  }

  const updateSelectedPhotoCaption = (caption: string) => {
    if (!selectedPhoto) return

    const nextItems = [...selectedPhotoItems]
    nextItems[selectedPhotoIndex] = {
      ...selectedPhoto,
      caption: caption.slice(0, 500),
    }
    updateSelectedPhotoItems(nextItems)
  }

  const removeSelectedPhoto = () => {
    updateSelectedPhotoItems(
      selectedPhotoItems.filter((_, index) => index !== selectedPhotoIndex),
      Math.max(0, selectedPhotoIndex - 1),
    )
  }

  const splitSelectedPhotoGroup = () => {
    if (
      !photoSelection ||
      !selectedPhoto ||
      selectedPhotoGroup?.type.name !== 'photoGroup' ||
      selectedPhotoIndex >= selectedPhotoItems.length - 1
    ) {
      return
    }

    const firstGroup = selectedPhotoGroup.type.create({
      ...selectedPhotoGroup.attrs,
      items: selectedPhotoItems.slice(0, selectedPhotoIndex + 1),
    })
    const secondGroup = selectedPhotoGroup.type.create({
      ...selectedPhotoGroup.attrs,
      items: selectedPhotoItems.slice(selectedPhotoIndex + 1),
    })
    const paragraph = editor.schema.nodes.paragraph.create()
    const paragraphCursorPosition = photoSelection.position + firstGroup.nodeSize + 1
    const groupWasSplit = editor
      .chain()
      .command(({ tr }) => {
        tr.replaceWith(
          photoSelection.position,
          photoSelection.position + selectedPhotoGroup.nodeSize,
          [firstGroup, paragraph, secondGroup],
        )
        return true
      })
      .run()

    if (groupWasSplit) {
      setPhotoSelection(null)
      setCaptionEditorOpen(false)
      editor.commands.focus(paragraphCursorPosition)
    }
  }

  const captureUploadTarget = () => {
    const position = editor.state.selection.from
    const selectedNode = editor.state.doc.nodeAt(position)

    uploadTargetRef.current = selectedNode?.type.name === 'photoGroup'
      ? { position }
      : null
  }

  const getTargetItems = () => {
    const target = uploadTargetRef.current

    if (!target) return null

    const targetNode = editor.state.doc.nodeAt(target.position)

    return targetNode?.type.name === 'photoGroup'
      ? targetNode.attrs.items as PhotoGroupItem[]
      : null
  }

  const createNewPhotoGroup = (uploadedMedia: UploadedMedia[]) => {
    const span = getDefaultPhotoSpan(uploadedMedia.length)
    const selection = editor.state.selection
    const selectedNode = editor.state.doc.nodeAt(selection.from)
    const insertionPosition = selectedNode?.type.name === 'photoGroup'
      ? selection.to
      : selection.from
    const content = [
      {
        type: 'photoGroup',
        attrs: {
          items: uploadedMedia.map(({ mediaId }) => ({
            mediaId,
            span,
            ratio: 'natural',
          })),
        },
      },
      { type: 'paragraph' },
    ]

    editor
      .chain()
      .focus()
      .insertContentAt(insertionPosition, content)
      .run()
  }

  const addPhotosToTarget = (uploadedMedia: UploadedMedia[]) => {
    const target = uploadTargetRef.current
    const existingItems = getTargetItems()

    if (!target || !existingItems) return false

    const nextCount = existingItems.length + uploadedMedia.length

    if (nextCount > 6) return false

    const previousDefaultSpan = getDefaultPhotoSpan(existingItems.length)
    const nextDefaultSpan = getDefaultPhotoSpan(nextCount)
    const usesAutomaticLayout = existingItems.every(
      ({ span }) => span === previousDefaultSpan,
    )
    const nextItems = [
      ...existingItems.map((item) => (
        usesAutomaticLayout ? { ...item, span: nextDefaultSpan } : item
      )),
      ...uploadedMedia.map(({ mediaId }) => ({
        mediaId,
        span: nextDefaultSpan,
        ratio: 'natural' as const,
      })),
    ]

    return editor
      .chain()
      .command(({ tr }) => {
        const targetNode = tr.doc.nodeAt(target.position)

        if (targetNode?.type.name !== 'photoGroup') return false

        tr.setNodeMarkup(target.position, undefined, {
          ...targetNode.attrs,
          items: nextItems,
        })
        return true
      })
      .run()
  }

  const insertUploadedPhotos = (uploadedMedia: UploadedMedia[]) => {
    if (!addPhotosToTarget(uploadedMedia)) {
      createNewPhotoGroup(uploadedMedia)
    }

    uploadTargetRef.current = null
  }

  const uploadSelectedPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (!selectedFiles.length) return

    const targetItems = getTargetItems()

    if (uploadTargetRef.current && !targetItems) {
      uploadTargetRef.current = null
    }

    const availableSlots = targetItems ? 6 - targetItems.length : 6

    if (selectedFiles.length > availableSlots) {
      setUploadState({
        status: 'error',
        message: availableSlots
          ? `Encore ${availableSlots} photo${availableSlots > 1 ? 's' : ''} maximum dans ce groupe.`
          : 'Ce groupe contient déjà six photos.',
      })
      return
    }

    setUploadState({
      status: 'uploading',
      message: selectedFiles.length === 1
        ? 'Envoi de la photo…'
        : `Envoi de ${selectedFiles.length} photos…`,
    })

    const uploadedMedia = new Array<UploadedMedia | null>(selectedFiles.length).fill(null)
    const errors: string[] = []
    let nextFileIndex = 0

    const uploadNext = async (): Promise<void> => {
      const fileIndex = nextFileIndex
      nextFileIndex += 1

      if (fileIndex >= selectedFiles.length) return

      const controller = new AbortController()
      uploadControllersRef.current.add(controller)

      try {
        uploadedMedia[fileIndex] = await uploadMedia({
          entryId,
          file: selectedFiles[fileIndex],
          signal: controller.signal,
        })
      } catch (error) {
        if (!controller.signal.aborted) {
          errors.push(
            error instanceof Error
              ? error.message
              : 'Cette photo n’est pas passée.',
          )
        }
      } finally {
        uploadControllersRef.current.delete(controller)
      }

      await uploadNext()
    }

    await Promise.all(
      Array.from(
        { length: Math.min(2, selectedFiles.length) },
        () => uploadNext(),
      ),
    )

    if (!mountedRef.current) return

    const successfulUploads = uploadedMedia.filter(
      (media): media is UploadedMedia => media !== null,
    )

    if (successfulUploads.length) {
      insertUploadedPhotos(successfulUploads)
      setInsertMenuOpen(false)
    }

    setUploadState(
      errors.length
        ? {
            status: 'error',
            message: errors.length === 1
              ? errors[0]
              : `${errors.length} photos n’ont pas été envoyées.`,
          }
        : { status: 'idle' },
    )
  }

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
        className='sticky top-16 z-20 mb-4 flex max-w-full items-center rounded-full border border-border bg-popover/95 p-1.5 backdrop-blur'
      >
        <div className='relative min-w-0 flex-1'>
          <div className='flex items-center gap-0.5 px-1'>
            {selectedPhoto && captionEditorOpen ? (
              <>
                <input
                  autoFocus
                  value={selectedPhoto.caption ?? ''}
                  maxLength={500}
                  onChange={(event) => updateSelectedPhotoCaption(event.target.value)}
                  placeholder='Ajouter une légende…'
                  className='h-8 min-w-0 flex-1 rounded-full border border-border bg-card px-3 font-sans text-xs text-foreground outline-none focus:border-primary/40 md:max-w-72'
                />
                <ToolbarButton
                  icon={X}
                  label='Fermer la légende'
                  onClick={() => setCaptionEditorOpen(false)}
                />
              </>
            ) : selectedPhoto ? (
              <>
                <ToolbarButton
                  icon={ChevronLeft}
                  label='Déplacer la photo à gauche'
                  disabled={selectedPhotoIndex === 0}
                  onClick={() => moveSelectedPhoto(-1)}
                />
                <ToolbarButton
                  icon={ChevronRight}
                  label='Déplacer la photo à droite'
                  disabled={selectedPhotoIndex === selectedPhotoItems.length - 1}
                  onClick={() => moveSelectedPhoto(1)}
                />
                <ToolbarButton
                  icon={Plus}
                  label='Ajouter des photos au groupe'
                  disabled={selectedPhotoItems.length >= 6}
                  onClick={() => editor.commands.requestPhotoUpload()}
                />
                <ToolbarButton
                  icon={Ruler}
                  label={`Largeur ${selectedPhoto.span} colonnes`}
                  onClick={cycleSelectedPhotoSpan}
                />
                <div className='hidden items-center gap-0.5 min-[370px]:flex'>
                  <ToolbarButton
                    icon={Scissors}
                    label='Séparer le groupe après cette photo'
                    disabled={selectedPhotoIndex === selectedPhotoItems.length - 1}
                    onClick={splitSelectedPhotoGroup}
                  />
                  <ToolbarButton
                    icon={TextCursorInput}
                    label='Modifier la légende'
                    onClick={() => setCaptionEditorOpen(true)}
                  />
                  <ToolbarButton
                    destructive
                    icon={Trash2}
                    label='Supprimer la photo'
                    onClick={removeSelectedPhoto}
                  />
                </div>
              </>
            ) : (
              <>
                <ToolbarButton active={state.bold} icon={Bold} label='Gras' onClick={() => editor.chain().focus().toggleBold().run()} />
                <ToolbarButton active={state.italic} icon={Italic} label='Italique' onClick={() => editor.chain().focus().toggleItalic().run()} />
                <ToolbarButton active={state.link} icon={LinkIcon} label='Lien' onClick={setLink} />
                <ToolbarButton active={state.heading} icon={Heading} label='Titre' onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
                <div className='hidden items-center gap-0.5 min-[370px]:flex'>
                  <ToolbarButton active={state.bulletList} icon={List} label='Liste à puces' onClick={() => editor.chain().focus().toggleBulletList().run()} />
                  <ToolbarButton active={state.orderedList} icon={ListOrdered} label='Liste numérotée' onClick={() => editor.chain().focus().toggleOrderedList().run()} />
                  <ToolbarButton active={state.blockquote} icon={Quote} label='Citation' onClick={() => editor.chain().focus().toggleBlockquote().run()} />
                  <ToolbarButton icon={Type} label='Texte normal' onClick={() => editor.chain().focus().setParagraph().run()} />
                </div>
              </>
            )}

            {!captionEditorOpen ? (
              <button
                type='button'
                aria-label='Plus d’outils'
                title='Plus d’outils'
                aria-expanded={mobileToolsMenuOpen}
                onMouseDown={(event) => {
                  event.preventDefault()
                  setMobileToolsMenuOpen((open) => !open)
                }}
                className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground min-[370px]:hidden'
              >
                <MoreHorizontal className='h-4 w-4' />
              </button>
            ) : null}
          </div>

          {mobileToolsMenuOpen && !captionEditorOpen ? (
            <div className='absolute left-0 top-[calc(100%+0.75rem)] z-30 flex items-center gap-0.5 rounded-full border border-border bg-popover p-1.5 shadow-md min-[370px]:hidden'>
              {selectedPhoto ? (
                <>
                  <ToolbarButton
                    icon={Scissors}
                    label='Séparer le groupe après cette photo'
                    disabled={selectedPhotoIndex === selectedPhotoItems.length - 1}
                    onClick={() => {
                      splitSelectedPhotoGroup()
                      setMobileToolsMenuOpen(false)
                    }}
                  />
                  <ToolbarButton
                    icon={TextCursorInput}
                    label='Modifier la légende'
                    onClick={() => {
                      setCaptionEditorOpen(true)
                      setMobileToolsMenuOpen(false)
                    }}
                  />
                  <ToolbarButton
                    destructive
                    icon={Trash2}
                    label='Supprimer la photo'
                    onClick={() => {
                      removeSelectedPhoto()
                      setMobileToolsMenuOpen(false)
                    }}
                  />
                </>
              ) : (
                <>
                  <ToolbarButton active={state.bulletList} icon={List} label='Liste à puces' onClick={() => {
                    editor.chain().focus().toggleBulletList().run()
                    setMobileToolsMenuOpen(false)
                  }} />
                  <ToolbarButton active={state.orderedList} icon={ListOrdered} label='Liste numérotée' onClick={() => {
                    editor.chain().focus().toggleOrderedList().run()
                    setMobileToolsMenuOpen(false)
                  }} />
                  <ToolbarButton active={state.blockquote} icon={Quote} label='Citation' onClick={() => {
                    editor.chain().focus().toggleBlockquote().run()
                    setMobileToolsMenuOpen(false)
                  }} />
                  <ToolbarButton icon={Type} label='Texte normal' onClick={() => {
                    editor.chain().focus().setParagraph().run()
                    setMobileToolsMenuOpen(false)
                  }} />
                </>
              )}
            </div>
          ) : null}
        </div>
        <div className='ml-auto flex shrink-0 items-center gap-2 border-l border-border bg-popover/95 pl-2'>
          {toolbarActions}
        </div>
      </div>

      <EditorContent editor={editor} />

      <input
        id={photoInputId}
        type='file'
        multiple
        accept='image/jpeg,image/png,image/webp'
        className='sr-only'
        onClick={captureUploadTarget}
        onChange={uploadSelectedPhotos}
      />

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
              disabled={uploadState.status === 'uploading'}
              onClick={() => editor.commands.requestPhotoUpload()}
              className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs text-foreground transition hover:bg-secondary disabled:pointer-events-none disabled:opacity-50'
            >
              <ImageIcon className='h-3.5 w-3.5' />
              {uploadState.status === 'uploading'
                ? 'Envoi…'
                : state.photoGroup
                  ? 'Ajouter au groupe'
                  : 'Photos'}
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
      {uploadState.status === 'error' ? (
        <p
          className='-mt-2 text-center font-sans text-xs text-destructive'
          role='alert'
        >
          {uploadState.message}
        </p>
      ) : null}
    </div>
  )
}
