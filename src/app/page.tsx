import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  redirect(session ? '/journal' : '/login')
}

export default Home
