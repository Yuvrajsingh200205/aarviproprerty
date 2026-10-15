// Infinite horizontal scroller. Items are rendered twice; the copy is inert + hidden from assistive tech.
export default function Marquee({ children, reverse = false, className = '' }) {
  return (
    <div className={`group/marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] ${className}`}>
      <div className={`flex w-max gap-3 ${reverse ? 'animate-marquee-rev' : 'animate-marquee'} group-hover/marquee:[animation-play-state:paused]`}>
        <div className="flex shrink-0 gap-3">{children}</div>
        <div className="flex shrink-0 gap-3" aria-hidden="true" inert>{children}</div>
      </div>
    </div>
  );
}
