'use client';
import { useRef } from 'react';

// 3D hover tilt with a moving glare. Disabled for touch pointers.
export default function TiltCard({ children, className = '', max = 7 }) {
  const ref = useRef(null);

  const move = (e) => {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - py) * max).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * max).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${(px * 100).toFixed(0)}%`);
    el.style.setProperty('--gy', `${(py * 100).toFixed(0)}%`);
  };
  const leave = () => {
    const el = ref.current;
    ['--rx', '--ry'].forEach((k) => el.style.setProperty(k, '0deg'));
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`group relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ transform: 'perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.28), transparent 55%)' }}
      />
    </div>
  );
}
