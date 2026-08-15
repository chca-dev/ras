'use client'

import { ArrowLeft, Check, CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type SubmitEvent, useState } from 'react'

import { RichTextEditor } from '@/components/entries/rich-text-editor'
import { useEntryAutosave } from '@/hooks/use-entry-autosave'
import type { TiptapDocument } from '@/lib/tiptap/document'

type EntryFormProps = {
  entry: {
    id: string
    title: string | null
    entryDate: string
    revision: number
    content: TiptapDocument
  }
}

export const EntryForm = ({ entry }: EntryFormProps) => {
  const router = useRouter()
  const [title, setTitle] = useState(entry.title ?? '')
  const [entryDate, setEntryDate] = useState(entry.entryDate)
  const [content, setContent] = useState<TiptapDocument>(entry.content)
  const { status, result, flush } = useEntryAutosave({
    entryId: entry.id,
    initialRevision: entry.revision,
    title,
    entryDate,
    content,
  })
  const titleError = result?.fieldErrors?.title?.[0]
  const dateError = result?.fieldErrors?.entryDate?.[0]
  const contentError = result?.fieldErrors?.content?.[0]
  const isSaving = status === 'saving'
  const isError = status === 'error' || status === 'conflict'
  const statusLabel = {
    saved: 'Enregistré',
    dirty: 'Modifié',
    saving: 'Enregistrement…',
    error: result?.message ?? 'Erreur d’enregistrement',
    conflict: result?.message ?? 'Conflit de modification',
  }[status]

  const finishEditing = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (await flush()) {
      router.push(`/journal/${entry.id}`)
    }
  }

  const renderEditorActions = () => (
    <>
      <p
        className={`sr-only items-center gap-1.5 font-sans text-xs md:not-sr-only md:inline-flex ${isError ? 'text-destructive' : status === 'saved' ? 'text-primary' : 'text-muted-foreground'}`}
        role={isError ? 'alert' : 'status'}
        aria-live='polite'
        title={statusLabel}
      >
        {status === 'saved' ? (
          <><Check aria-hidden='true' className='h-3.5 w-3.5 shrink-0' /> <span className='truncate'>{statusLabel}</span></>
        ) : (
          <span className='truncate'>{statusLabel}</span>
        )}
      </p>
      {isError ? (
        <CircleAlert aria-hidden='true' className='h-4 w-4 shrink-0 text-destructive md:hidden' />
      ) : null}
      <button
        className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary font-sans text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-60 md:h-auto md:w-auto md:px-4 md:py-1.5'
        type='submit'
        disabled={isSaving || status === 'conflict'}
        aria-label='Terminer'
        title='Terminer'
      >
        <Check aria-hidden='true' className='h-4 w-4 md:hidden' />
        <span className='hidden md:inline'>Terminer</span>
      </button>
    </>
  )

  return (
    <form className='mx-auto max-w-2xl' onSubmit={finishEditing} noValidate>
      <div className='-mt-2 mb-5'>
        <Link className='inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 font-sans text-sm text-muted-foreground transition hover:text-foreground' href={`/journal/${entry.id}`}>
          <ArrowLeft aria-hidden='true' className='h-4 w-4' />
          Retour
        </Link>
      </div>

      <header className='mb-6'>
        <div>
          <label className='sr-only' htmlFor='entry-date'>Date</label>
          <input
            id='entry-date'
            name='entryDate'
            type='date'
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
            required
            aria-describedby={dateError ? 'entry-date-error' : undefined}
            className='mb-3 rounded-lg border border-transparent bg-secondary/60 px-2.5 py-1 font-sans text-sm text-muted-foreground outline-none transition hover:border-border focus:border-primary/40'
          />
          {dateError ? (
            <p id='entry-date-error' className='font-sans text-sm text-destructive'>
              {dateError}
            </p>
          ) : null}
        </div>

        <div>
          <label className='sr-only' htmlFor='entry-title'>Titre facultatif</label>
          <input
            id='entry-title'
            name='title'
            type='text'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            placeholder='Titre (facultatif)'
            aria-describedby={titleError ? 'entry-title-error' : undefined}
            className='w-full bg-transparent font-serif text-3xl font-medium leading-tight text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-4xl'
          />
          {titleError ? (
            <p id='entry-title-error' className='font-sans text-sm text-destructive'>
              {titleError}
            </p>
          ) : null}
        </div>
      </header>

      <RichTextEditor
        entryId={entry.id}
        initialContent={entry.content}
        onChange={setContent}
        toolbarActions={renderEditorActions()}
      />
      {contentError ? <p className='font-sans text-sm text-destructive'>{contentError}</p> : null}
    </form>
  )
}
