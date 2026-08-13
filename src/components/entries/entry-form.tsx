'use client'

import { ArrowLeft, Check, Image as ImageIcon, Plus, Type, X } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useState } from 'react'

import {
  updateEntryAction,
  type UpdateEntryState,
} from '@/app/(journal)/journal/actions'

type EntryFormProps = {
  entry: {
    id: string
    title: string | null
    entryDate: string
    plainText: string
  }
}

const initialState: UpdateEntryState = {
  status: 'idle',
  message: 'Modifié',
}

type TextBlock = {
  id: string
  text: string
}

const createInitialBlocks = (plainText: string): TextBlock[] => {
  const passages = plainText ? plainText.split('\n\n') : ['']

  return passages.map((text, index) => ({
    id: `initial-${index}`,
    text,
  }))
}

export const EntryForm = ({ entry }: EntryFormProps) => {
  const updateEntryWithId = updateEntryAction.bind(null, entry.id)
  const [state, formAction, isPending] = useActionState(
    updateEntryWithId,
    initialState,
  )
  const titleError = state.fieldErrors?.title?.[0]
  const dateError = state.fieldErrors?.entryDate?.[0]
  const bodyError = state.fieldErrors?.body?.[0]
  const [blocks, setBlocks] = useState<TextBlock[]>(() =>
    createInitialBlocks(entry.plainText),
  )
  const [openInsertAfter, setOpenInsertAfter] = useState<string | null>(null)

  const updateBlock = (id: string, text: string) => {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, text } : block)),
    )
  }

  const insertTextAfter = (id: string) => {
    const block: TextBlock = {
      id: crypto.randomUUID(),
      text: '',
    }

    setBlocks((current) => {
      const index = current.findIndex((item) => item.id === id)
      const next = [...current]

      next.splice(index + 1, 0, block)
      return next
    })
    setOpenInsertAfter(null)
  }

  return (
    <form className='mx-auto max-w-[42rem]' action={formAction} noValidate>
      <div className='-mt-2 mb-5 flex items-center justify-between'>
        <Link className='inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 font-sans text-sm text-muted-foreground transition hover:text-foreground' href={`/journal/${entry.id}`}>
          <ArrowLeft aria-hidden='true' className='h-4 w-4' />
          Retour
        </Link>

        <div className='flex items-center gap-3'>
          <p
            className={`inline-flex items-center gap-1.5 font-sans text-xs ${state.status === 'error' ? 'text-destructive' : state.status === 'success' ? 'text-primary' : 'text-muted-foreground'}`}
            role={state.status === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            {isPending ? (
              'Enregistrement…'
            ) : state.status === 'success' ? (
              <><Check aria-hidden='true' className='h-3.5 w-3.5' /> Enregistré</>
            ) : (
              state.message
            )}
          </p>
          <button className='rounded-full bg-primary px-4 py-1.5 font-sans text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-60' type='submit' disabled={isPending}>
            Terminer
          </button>
        </div>
      </div>

      <header className='mb-6'>
        <div>
          <label className="sr-only" htmlFor="entry-date">Date</label>
          <input
            id="entry-date"
            name="entryDate"
            type="date"
            defaultValue={entry.entryDate}
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
          <label className="sr-only" htmlFor="entry-title">Titre facultatif</label>
          <input
            id="entry-title"
            name="title"
            type="text"
            defaultValue={entry.title ?? ''}
            maxLength={160}
            placeholder="Titre (facultatif)"
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

      <input type="hidden" name="body" value={blocks.map(({ text }) => text).join('\n\n')} />

      <div className='flex flex-col'>
        {blocks.map((block, index) => (
          <div key={block.id}>
            <label className="sr-only" htmlFor={`entry-block-${block.id}`}>
              Passage {index + 1}
            </label>
            <textarea
              id={`entry-block-${block.id}`}
              value={block.text}
              onChange={(event) => updateBlock(block.id, event.target.value)}
              placeholder="Vas-y, raconte."
              rows={Math.max(2, block.text.split('\n').length)}
              className='auto-grow-textarea min-h-[1.9rem] w-full resize-none overflow-hidden border-0 bg-transparent py-1.5 font-serif text-[1.15rem] leading-[1.75] text-foreground/90 outline-none placeholder:text-muted-foreground/50'
            />

            <div className={`group/insert relative flex items-center justify-center ${index === blocks.length - 1 ? 'py-4' : 'py-1.5'}`}>
              <span className='absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/60 opacity-0 transition group-hover/insert:opacity-100' aria-hidden='true' />
              {openInsertAfter === block.id ? (
                <div className='relative flex items-center gap-1 rounded-full border border-border bg-popover px-1.5 py-1 shadow-md animate-in fade-in zoom-in-95 duration-150'>
                  <button className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs text-foreground transition hover:bg-secondary' type='button' onClick={() => insertTextAfter(block.id)}>
                    <Type aria-hidden='true' className='h-3.5 w-3.5' />
                    Texte
                  </button>
                  <button className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs text-muted-foreground opacity-50' type='button' disabled title='Disponible avec l’ajout des photos'>
                    <ImageIcon aria-hidden='true' className='h-3.5 w-3.5' />
                    Photos
                  </button>
                  <button
                    className='ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary'
                    type="button"
                    onClick={() => setOpenInsertAfter(null)}
                    aria-label="Fermer"
                  >
                    <X aria-hidden='true' className='h-3.5 w-3.5' />
                  </button>
                </div>
              ) : (
                <button
                  className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary ${index === blocks.length - 1 ? 'opacity-100' : 'opacity-0 group-hover/insert:opacity-100'}`}
                  type="button"
                  onClick={() => setOpenInsertAfter(block.id)}
                  aria-label="Ajouter un bloc"
                >
                  <Plus aria-hidden='true' className='h-4 w-4' />
                </button>
              )}
            </div>
          </div>
        ))}

        {bodyError ? (
          <p id='entry-body-error' className='font-sans text-sm text-destructive'>
            {bodyError}
          </p>
        ) : null}
      </div>
      <p className='mt-8 text-center font-serif text-sm italic text-muted-foreground/70'>Écris, glisse une photo, écris encore. L&apos;ordre t&apos;appartient.</p>
    </form>
  )
}
