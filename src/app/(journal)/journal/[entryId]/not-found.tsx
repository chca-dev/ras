import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const EntryNotFound = () => {
  return (
    <main className="shell-page entry-not-found">
      <p className="shell-page-kicker">Introuvable</p>
      <h1>Cette entrée n’est pas ici.</h1>
      <p>
        Elle n’existe pas, ou elle ne t’appartient pas. On ne donnera pas plus
        de détails.
      </p>
      <Link href="/journal">
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        Retour au journal
      </Link>
    </main>
  )
}

export default EntryNotFound
