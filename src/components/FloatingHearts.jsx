const HEARTS = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 17 + 4) % 96}%`,
  delay: `${(index % 7) * -1.3}s`,
  duration: `${8 + (index % 5) * 1.2}s`,
  size: `${14 + (index % 4) * 7}px`,
  opacity: 0.12 + (index % 3) * 0.06,
}));

export function FloatingHearts({ celebration = false }) {
  return (
    <div className={`floating-hearts ${celebration ? 'is-celebrating' : ''}`} aria-hidden="true">
      {HEARTS.map((heart) => (
        <span
          key={heart.id}
          style={{
            '--heart-left': heart.left,
            '--heart-delay': heart.delay,
            '--heart-duration': heart.duration,
            '--heart-size': heart.size,
            '--heart-opacity': heart.opacity,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
