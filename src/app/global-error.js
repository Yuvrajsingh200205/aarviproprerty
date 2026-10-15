'use client';

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '4rem 1rem' }}>
        <h1>Something went wrong</h1>
        <p>Please try again in a moment.</p>
        <button onClick={reset} style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}>Try again</button>
      </body>
    </html>
  );
}
