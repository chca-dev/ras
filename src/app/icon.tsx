import { ImageResponse } from 'next/og'

const iconSizes = {
  192: { width: 192, height: 192 },
  512: { width: 512, height: 512 },
} as const

export const generateImageMetadata = () => {
  return Object.entries(iconSizes).map(([id, size]) => ({
    id,
    size,
    contentType: 'image/png',
    alt: 'RAS.',
  }))
}

const Icon = async ({
  id,
}: {
  id: Promise<string | number>
}) => {
  const iconId = String(await id)
  const size = iconId === '192' ? iconSizes[192] : iconSizes[512]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '18%',
          background: '#F3F0E7',
          color: '#324C3D',
          fontFamily: 'Georgia, serif',
          fontSize: size.width * 0.3,
          fontWeight: 700,
          letterSpacing: '-0.06em',
        }}
      >
        <span>RAS</span>
        <span style={{ color: '#B96848' }}>.</span>
      </div>
    ),
    size,
  )
}

export default Icon
