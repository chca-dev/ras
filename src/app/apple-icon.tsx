import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

const AppleIcon = () => {
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
          fontSize: 54,
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

export default AppleIcon
