'use client'

import { X } from 'lucide-react'
import { useRef } from 'react'

type PhotoLightboxProps = {
  mediaId: string
  caption?: string
}

export const PhotoLightbox = ({ mediaId, caption }: PhotoLightboxProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openLightbox = () => dialogRef.current?.showModal()
  const closeLightbox = () => dialogRef.current?.close()

  return (
    <>
      <button
        type='button'
        aria-label='Agrandir la photo'
        onClick={openLightbox}
        className='block w-full cursor-zoom-in'
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/media/${mediaId}/display`}
          alt={caption ?? ''}
          loading='lazy'
          className='block h-auto w-full'
        />
      </button>

      <dialog
        ref={dialogRef}
        aria-label='Photo agrandie'
        onClick={closeLightbox}
        className='m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-foreground/95 p-0 text-background'
      >
        <div
          className='relative flex h-full w-full items-center justify-center p-4 sm:p-8'
          onClick={(event) => event.stopPropagation()}
        >
          <form method='dialog' className='absolute top-4 right-4 z-10'>
            <button
              type='submit'
              aria-label='Fermer la photo'
              className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground transition hover:bg-background'
            >
              <X aria-hidden='true' className='h-5 w-5' />
            </button>
          </form>

          <figure className='flex max-h-full max-w-full flex-col items-center gap-3'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/media/${mediaId}/display`}
              alt={caption ?? 'Photo du journal'}
              className='max-h-[calc(100dvh-5rem)] max-w-full rounded-lg object-contain'
            />
            {caption ? (
              <figcaption className='max-w-2xl font-sans text-sm text-background/80'>
                {caption}
              </figcaption>
            ) : null}
          </figure>
        </div>
      </dialog>
    </>
  )
}
