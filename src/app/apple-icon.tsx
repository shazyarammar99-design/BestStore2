import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a12 0%, #12121f 100%)',
          borderRadius: 36,
          border: '4px solid #00f0ff',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#00f0ff',
            letterSpacing: '-0.05em',
          }}
        >
          B
        </div>
      </div>
    ),
    { ...size }
  );
}
