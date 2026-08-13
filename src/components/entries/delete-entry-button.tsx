'use client'

import { Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useFormStatus } from 'react-dom'

import { deleteEntryAction } from '@/app/(journal)/journal/actions'

type DeleteEntryButtonProps = {
  entryId: string
}

function ConfirmationActions({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus()

  return (
    <div className="delete-entry-dialog-actions">
      <button
        className="delete-entry-cancel"
        type="button"
        onClick={onCancel}
        disabled={pending}
      >
        Annuler
      </button>
      <button
        className="delete-entry-confirm"
        type="submit"
        disabled={pending}
      >
        {pending ? 'Suppression…' : 'Supprimer'}
      </button>
    </div>
  )
}

export function DeleteEntryButton({ entryId }: DeleteEntryButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const deleteEntryWithId = deleteEntryAction.bind(null, entryId)

  return (
    <div className="delete-entry">
      <button
        className="delete-entry-trigger"
        type="button"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Trash2 aria-hidden="true" size={17} strokeWidth={1.75} />
        Supprimer l’entrée
      </button>

      <dialog
        ref={dialogRef}
        className="delete-entry-dialog"
        aria-labelledby="delete-entry-title"
        aria-describedby="delete-entry-description"
      >
        <form action={deleteEntryWithId}>
          <h2 id="delete-entry-title">Supprimer cette entrée ?</h2>
          <p id="delete-entry-description">Cette action est définitive.</p>
          <ConfirmationActions onCancel={() => dialogRef.current?.close()} />
        </form>
      </dialog>
    </div>
  )
}
