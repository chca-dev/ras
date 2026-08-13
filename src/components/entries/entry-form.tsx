'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'

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

export function EntryForm({ entry }: EntryFormProps) {
  const updateEntryWithId = updateEntryAction.bind(null, entry.id)
  const [state, formAction, isPending] = useActionState(
    updateEntryWithId,
    initialState,
  )
  const titleError = state.fieldErrors?.title?.[0]
  const dateError = state.fieldErrors?.entryDate?.[0]
  const bodyError = state.fieldErrors?.body?.[0]

  return (
    <form className="entry-form" action={formAction} noValidate>
      <Link className="entry-editor-back" href={`/journal/${entry.id}`}>
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        Lire l’entrée
      </Link>

      <header className="entry-form-heading">
        <div className="entry-date-field">
          <label htmlFor="entry-date">Date</label>
          <input
            id="entry-date"
            name="entryDate"
            type="date"
            defaultValue={entry.entryDate}
            required
            aria-describedby={dateError ? 'entry-date-error' : undefined}
          />
          {dateError ? (
            <p id="entry-date-error" className="entry-field-error">
              {dateError}
            </p>
          ) : null}
        </div>

        <div className="entry-title-field">
          <label htmlFor="entry-title">Titre facultatif</label>
          <input
            id="entry-title"
            name="title"
            type="text"
            defaultValue={entry.title ?? ''}
            maxLength={160}
            placeholder="Sans titre"
            aria-describedby={titleError ? 'entry-title-error' : undefined}
          />
          {titleError ? (
            <p id="entry-title-error" className="entry-field-error">
              {titleError}
            </p>
          ) : null}
        </div>
      </header>

      <div className="entry-body-field">
        <label htmlFor="entry-body">Texte</label>
        <textarea
          id="entry-body"
          name="body"
          defaultValue={entry.plainText}
          placeholder="Vas-y, raconte."
          aria-describedby={bodyError ? 'entry-body-error' : undefined}
        />
        {bodyError ? (
          <p id="entry-body-error" className="entry-field-error">
            {bodyError}
          </p>
        ) : null}
      </div>

      <footer className="entry-form-footer">
        <p
          className={`entry-save-status entry-save-status-${state.status}`}
          role={state.status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {isPending ? 'Enregistrement…' : state.message}
        </p>
        <button className="entry-save-button" type="submit" disabled={isPending}>
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </footer>
    </form>
  )
}
