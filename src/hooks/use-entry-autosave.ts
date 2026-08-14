'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  updateEntryAction,
  type UpdateEntryState,
} from '@/app/(journal)/journal/actions'
import type { TiptapDocument } from '@/lib/tiptap/document'

type AutosaveStatus = 'saved' | 'dirty' | 'saving' | 'error' | 'conflict'

type EntryDraft = {
  title: string
  entryDate: string
  content: TiptapDocument
}

type UseEntryAutosaveOptions = {
  entryId: string
  initialRevision: number
  title: string
  entryDate: string
  content: TiptapDocument
  delay?: number
}

const serializeDraft = (draft: EntryDraft) => JSON.stringify(draft)

export const useEntryAutosave = ({
  entryId,
  initialRevision,
  title,
  entryDate,
  content,
  delay = 800,
}: UseEntryAutosaveOptions) => {
  const draft = { title, entryDate, content }
  const draftRef = useRef(draft)
  const lastSavedSnapshotRef = useRef(serializeDraft(draft))
  const revisionRef = useRef(initialRevision)
  const queueRef = useRef<Promise<boolean>>(Promise.resolve(true))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const conflictRef = useRef(false)
  const [status, setStatus] = useState<AutosaveStatus>('saved')
  const [result, setResult] = useState<UpdateEntryState | null>(null)
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() =>
    serializeDraft(draft),
  )

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const enqueueSave = useCallback(() => {
    const pendingSave = queueRef.current.then(async () => {
      if (conflictRef.current) return false

      const currentDraft = draftRef.current
      const snapshot = serializeDraft(currentDraft)

      if (snapshot === lastSavedSnapshotRef.current) return true

      setStatus('saving')
      setResult(null)

      try {
        const saveResult = await updateEntryAction(entryId, {
          ...currentDraft,
          content: JSON.stringify(currentDraft.content),
          revision: revisionRef.current,
        })

        setResult(saveResult)

        if (saveResult.status === 'success' && saveResult.revision) {
          revisionRef.current = saveResult.revision
          lastSavedSnapshotRef.current = snapshot
          setLastSavedSnapshot(snapshot)
          setStatus(
            serializeDraft(draftRef.current) === snapshot ? 'saved' : 'dirty',
          )
          return true
        }

        if (saveResult.status === 'conflict') {
          conflictRef.current = true
          setStatus('conflict')
          return false
        }

        setStatus('error')
        return false
      } catch {
        setResult({
          status: 'error',
          message: 'Impossible d’enregistrer pour le moment.',
        })
        setStatus('error')
        return false
      }
    })

    queueRef.current = pendingSave
    return pendingSave
  }, [entryId])

  const flush = useCallback(async () => {
    clearTimer()

    let saved = await enqueueSave()

    while (
      saved &&
      serializeDraft(draftRef.current) !== lastSavedSnapshotRef.current
    ) {
      saved = await enqueueSave()
    }

    return saved
  }, [clearTimer, enqueueSave])

  useEffect(() => {
    draftRef.current = { title, entryDate, content }
  }, [content, entryDate, title])

  useEffect(() => {
    const nextDraft = { title, entryDate, content }
    const snapshot = serializeDraft(nextDraft)

    if (snapshot === lastSavedSnapshotRef.current || conflictRef.current) {
      return
    }

    clearTimer()
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      void enqueueSave()
    }, delay)

    return clearTimer
  }, [clearTimer, content, delay, enqueueSave, entryDate, title])

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (
        serializeDraft(draftRef.current) === lastSavedSnapshotRef.current &&
        status === 'saved'
      ) {
        return
      }

      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [status])

  useEffect(() => clearTimer, [clearTimer])

  const displayedStatus =
    status === 'saved' &&
    serializeDraft({ title, entryDate, content }) !== lastSavedSnapshot
      ? 'dirty'
      : status

  return { status: displayedStatus, result, flush }
}
