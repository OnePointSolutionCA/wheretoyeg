"use client";

export function FloatingCube() {
  return (
    <div className="pointer-events-none flex items-center justify-center py-6" aria-hidden="true">
      <div className="cube-scene">
        <div className="cube">
          <div className="cube-face cube-front" />
          <div className="cube-face cube-back" />
          <div className="cube-face cube-right" />
          <div className="cube-face cube-left" />
          <div className="cube-face cube-top" />
          <div className="cube-face cube-bottom" />
        </div>
      </div>
      <style jsx>{`
        .cube-scene {
          width: 40px;
          height: 40px;
          perspective: 400px;
        }
        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: cube-spin 20s linear infinite;
        }
        .cube-face {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 1.5px solid var(--coral);
          border-radius: 6px;
          opacity: 0.25;
          background: linear-gradient(135deg, rgba(241,102,76,0.08), transparent);
        }
        .cube-front  { transform: rotateY(0deg) translateZ(20px); }
        .cube-back   { transform: rotateY(180deg) translateZ(20px); }
        .cube-right  { transform: rotateY(90deg) translateZ(20px); }
        .cube-left   { transform: rotateY(-90deg) translateZ(20px); }
        .cube-top    { transform: rotateX(90deg) translateZ(20px); }
        .cube-bottom { transform: rotateX(-90deg) translateZ(20px); }
        @keyframes cube-spin {
          from { transform: rotateX(15deg) rotateY(0deg); }
          to   { transform: rotateX(15deg) rotateY(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cube { animation: none; transform: rotateX(15deg) rotateY(45deg); }
        }
      `}</style>
    </div>
  );
}
