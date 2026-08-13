'use client'

import { MoreHorizontal, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useFormStatus } from 'react-dom'

import { deleteEntryAction } from '@/app/(journal)/journal/actions'

type DeleteEntryButtonProps = {
  entryId: string
  compact?: boolean
}

const ConfirmationActions = ({ onCancel }: { onCancel: () => void }) => {
  const { pending } = useFormStatus()

  return (
    <div className='mt-5 flex justify-end gap-2'>
      <button
        className='rounded-full border border-border px-4 py-2 font-sans text-sm text-muted-foreground'
        type="button"
        onClick={onCancel}
        disabled={pending}
      >
        Annuler
      </button>
      <button
        className='rounded-full bg-destructive px-4 py-2 font-sans text-sm text-white'
        type="submit"
        disabled={pending}
      >
        {pending ? 'Suppression…' : 'Supprimer'}
      </button>
    </div>
  )
}

export const DeleteEntryButton = ({ entryId, compact = false }: DeleteEntryButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const deleteEntryWithId = deleteEntryAction.bind(null, entryId)

  return (
    <div>
      <button
        className={compact ? 'inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground' : 'inline-flex items-center gap-2 rounded-full px-3 py-2 font-sans text-sm text-destructive'}
        type="button"
        onClick={() => dialogRef.current?.showModal()}
      >
        {compact ? <MoreHorizontal aria-hidden='true' className='h-4 w-4' /> : <Trash2 aria-hidden='true' className='h-4 w-4' />}
        <span className={compact ? 'sr-only' : undefined}>Supprimer l’entrée</span>
      </button>

      <dialog
        ref={dialogRef}
        className='m-auto w-[min(90vw,24rem)] rounded-2xl border border-border bg-popover p-5 text-foreground shadow-2xl'
        aria-labelledby="delete-entry-title"
        aria-describedby="delete-entry-description"
      >
        <form action={deleteEntryWithId}>
          <h2 id='delete-entry-title' className='font-serif text-xl font-medium'>Supprimer cette entrée ?</h2>
          <p id='delete-entry-description' className='mt-2 font-sans text-sm text-muted-foreground'>Cette action est définitive.</p>
          <ConfirmationActions onCancel={() => dialogRef.current?.close()} />
        </form>
      </dialog>
    </div>
  )
}
