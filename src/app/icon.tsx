import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 8,
          border: '2px solid #00f0ff',
        }}
      >
        <div
          style={{
            fontSize: 18,
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
