import { SettingsPanel } from '@/components/settings/settings-panel'
import { requireSession } from '@/lib/auth/require-session'

const SettingsModal = async () => {
  const session = await requireSession()

  return <SettingsPanel email={session.user.email} />
}

export default SettingsModal
